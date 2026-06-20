import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from './config'

// ---------- Incidents ----------

export async function createIncident(userId, level) {
  const ref = await addDoc(collection(db, 'incidents'), {
    userId,
    level, // 'concern' | 'assistance' | 'danger' | 'critical'
    status: 'active',
    location: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  await addTimelineEvent(ref.id, 'created', `${levelLabel(level)} triggered`)
  return ref.id
}

export function levelLabel(level) {
  return { concern: 'Concern', assistance: 'Assistance', danger: 'Danger', critical: 'Critical' }[level] || level
}

export async function updateIncidentLevel(incidentId, level) {
  await updateDoc(doc(db, 'incidents', incidentId), { level, updatedAt: serverTimestamp() })
  await addTimelineEvent(incidentId, 'escalated', `Escalated to ${levelLabel(level)}`)
}

export async function resolveIncident(incidentId) {
  await updateDoc(doc(db, 'incidents', incidentId), { status: 'resolved', updatedAt: serverTimestamp() })
  await addTimelineEvent(incidentId, 'resolved', 'Incident marked resolved')
}

export async function cancelIncident(incidentId) {
  await updateDoc(doc(db, 'incidents', incidentId), { status: 'cancelled', updatedAt: serverTimestamp() })
  await addTimelineEvent(incidentId, 'cancelled', 'Cancelled by user (000)')
}

export async function acknowledgeIncident(incidentId) {
  await updateDoc(doc(db, 'incidents', incidentId), {
    acknowledged: true,
    acknowledgedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  await addTimelineEvent(incidentId, 'acknowledged', 'Guardian received alert')
}

export async function setIncidentLocation(incidentId, coords) {
  await updateDoc(doc(db, 'incidents', incidentId), {
    location: coords,
    updatedAt: serverTimestamp(),
  })
  await addTimelineEvent(incidentId, 'location', 'Location captured')
}

// Stored as a small base64 JPEG directly on the incident doc — no Firebase
// Storage, no billing. Keep captures under ~150KB (see capturePhotoThumbnail)
// so this stays well inside Firestore's 1MiB document limit.
export async function setIncidentPhoto(incidentId, dataUrl) {
  await updateDoc(doc(db, 'incidents', incidentId), { photo: dataUrl, updatedAt: serverTimestamp() })
  await addTimelineEvent(incidentId, 'photo', 'Photo captured')
}

// The microphone is used for a one-time ambient loudness check, not
// recording — only the peak number is ever written, never audio.
export async function setIncidentSoundCheck(incidentId, result) {
  await updateDoc(doc(db, 'incidents', incidentId), { soundCheck: result, updatedAt: serverTimestamp() })
  await addTimelineEvent(
    incidentId,
    'sound',
    result.detected ? `Loud sound detected nearby (peak ${result.peak})` : 'Ambient check: quiet'
  )
}

// ---------- Timeline (subcollection) ----------

export async function addTimelineEvent(incidentId, type, message) {
  await addDoc(collection(db, 'incidents', incidentId, 'timeline'), {
    type,
    message,
    timestamp: serverTimestamp(),
  })
}

export function listenTimeline(incidentId, callback) {
  const q = query(collection(db, 'incidents', incidentId, 'timeline'), orderBy('timestamp', 'asc'))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}

// ---------- Single incident ----------

export function listenIncident(incidentId, callback) {
  return onSnapshot(doc(db, 'incidents', incidentId), (snap) => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() })
  })
}

// ---------- Guardian invites ----------

function randomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

export async function createGuardianInvite(userId, name, relation, email) {
  const code = randomCode()
  await setDoc(doc(db, 'guardianInvites', code), {
    code,
    userId,
    name,
    relation, // 'Parent' | 'Friend' | 'Partner' | 'Guardian'
    email: email || null,
    status: 'pending',
    createdAt: serverTimestamp(),
  })
  return code
}

export function listenUserInvites(userId, callback) {
  const q = query(collection(db, 'guardianInvites'), where('userId', '==', userId))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}

export async function acceptGuardianInvite(code, guardianUid, guardianEmail) {
  const inviteRef = doc(db, 'guardianInvites', code.toUpperCase().trim())
  const snap = await getDoc(inviteRef)
  if (!snap.exists()) throw new Error('Invite code not found.')
  const invite = snap.data()
  if (invite.status === 'accepted' && invite.guardianUid && invite.guardianUid !== guardianUid) {
    throw new Error('This invite code was already used.')
  }
  await updateDoc(inviteRef, { status: 'accepted', guardianUid, guardianEmail })
  await setDoc(doc(db, 'links', `${guardianUid}_${invite.userId}`), {
    guardianUid,
    userId: invite.userId,
    name: invite.name,
    relation: invite.relation,
    createdAt: serverTimestamp(),
  })
  return invite.userId
}

export async function getGuardianLinks(guardianUid) {
  const q = query(collection(db, 'links'), where('guardianUid', '==', guardianUid))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// ---------- Live incident feed for a guardian ----------

export function tsMillis(ts) {
  if (!ts) return Date.now()
  if (ts.seconds) return ts.seconds * 1000 + (ts.nanoseconds || 0) / 1e6
  return Date.now()
}

export function listenIncidentsForUsers(userIds, callback) {
  if (!userIds.length) {
    callback([])
    return () => {}
  }
  // Firestore 'in' supports up to 30 values, fine for a hackathon-scale guardian list.
  const q = query(collection(db, 'incidents'), where('userId', 'in', userIds.slice(0, 30)))
  return onSnapshot(
    q,
    (snap) => {
      const incidents = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      incidents.sort((a, b) => tsMillis(b.createdAt) - tsMillis(a.createdAt))
      callback(incidents)
    },
    (err) => console.error('Incident feed error:', err)
  )
}

export function tsToDate(ts) {
  if (!ts) return null
  if (ts instanceof Timestamp) return ts.toDate()
  if (ts.seconds) return new Date(ts.seconds * 1000)
  return null
}

// ---------- Permission status ----------

export async function savePermissionStatus(userId, status) {
  await setDoc(
    doc(db, 'users', userId),
    { permissions: status, updatedAt: serverTimestamp() },
    { merge: true }
  )
}

export function listenPermissionStatus(userId, callback) {
  return onSnapshot(doc(db, 'users', userId), (snap) => {
    callback(snap.exists() ? snap.data().permissions || null : null)
  })
}
