import {
  createIncident,
  setIncidentLocation,
  setIncidentPhoto,
  setIncidentSoundCheck,
  addTimelineEvent,
} from '../firebase/firestore'

export function getLocationOnce(timeout = 8000) {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) return resolve(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        timestamp: Date.now(),
      }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout, maximumAge: 0 }
    )
  })
}

// One still frame from the front camera, downsized and compressed to a
// small base64 JPEG (no Blob, no Storage upload — it's written straight
// onto the incident document). Fails soft: denied/missing camera -> null.
export async function capturePhotoThumbnail() {
  if (!navigator.mediaDevices?.getUserMedia) return null
  let stream
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
    const video = document.createElement('video')
    video.srcObject = stream
    video.muted = true
    video.playsInline = true
    await video.play()
    await new Promise((r) => setTimeout(r, 350)) // let exposure/focus settle
    const canvas = document.createElement('canvas')
    canvas.width = 240
    canvas.height = 180
    canvas.getContext('2d').drawImage(video, 0, 0, 240, 180)
    return canvas.toDataURL('image/jpeg', 0.5) // ~20-60KB typical
  } catch {
    return null
  } finally {
    stream?.getTracks().forEach((t) => t.stop())
  }
}

// Opens the mic for a few seconds to read peak loudness, then closes it.
// Nothing is recorded or kept — only the resulting number is saved.
export function listenForLoudSound(durationMs = 4000) {
  return new Promise((resolve) => {
    if (!navigator.mediaDevices?.getUserMedia) return resolve(null)
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        try {
          const AudioCtx = window.AudioContext || window.webkitAudioContext
          const ctx = new AudioCtx()
          const source = ctx.createMediaStreamSource(stream)
          const analyser = ctx.createAnalyser()
          analyser.fftSize = 2048
          source.connect(analyser)
          const data = new Float32Array(analyser.fftSize)
          let peak = 0

          const sampler = setInterval(() => {
            analyser.getFloatTimeDomainData(data)
            for (let i = 0; i < data.length; i++) {
              const abs = Math.abs(data[i])
              if (abs > peak) peak = abs
            }
          }, 100)

          setTimeout(() => {
            clearInterval(sampler)
            stream.getTracks().forEach((t) => t.stop())
            ctx.close()
            const THRESHOLD = 0.35 // empirical: normal speech/room tone stays well below this
            resolve({ detected: peak > THRESHOLD, peak: Math.round(peak * 100) / 100 })
          }, durationMs)
        } catch {
          stream.getTracks().forEach((t) => t.stop())
          resolve(null)
        }
      })
      .catch(() => resolve(null))
  })
}

// What separates the four codes, end to end:
//   concern    — location only, one ping
//   assistance — + a one-time ambient loudness check (mic), + repeat pings for 2 min
//   danger     — + a photo snapshot (camera), + repeat pings for 5 min
//   critical   — same evidence as danger, + repeat pings for 10 min (closest
//                thing to live tracking a Storage-free, Spark-plan app can do)
const EVIDENCE_CONFIG = {
  concern: { sound: false, photo: false },
  assistance: { sound: true, photo: false },
  danger: { sound: true, photo: true },
  critical: { sound: true, photo: true },
}

const TRACKING_CONFIG = {
  concern: { pings: 1, intervalMs: 0, label: 'one-time location' },
  assistance: { pings: 4, intervalMs: 30000, label: 'location updates for 2 minutes' },
  danger: { pings: 15, intervalMs: 20000, label: 'location updates for 5 minutes' },
  critical: { pings: 60, intervalMs: 10000, label: 'live location for 10 minutes' },
}

function startTracking(incidentId, config) {
  if (config.pings <= 1) return
  let count = 1
  const timer = setInterval(async () => {
    if (count >= config.pings) {
      clearInterval(timer)
      return
    }
    const coords = await getLocationOnce()
    if (coords) await setIncidentLocation(incidentId, coords)
    count++
  }, config.intervalMs)
}

/**
 * Runs the emergency mode pipeline: creates the incident record, captures
 * an initial location plus whatever evidence that severity level calls
 * for (ambient sound check, photo snapshot), then — depending on severity
 * — keeps updating location on an interval for as long as the app stays
 * open. Designed to fail soft: a denied permission should not throw, it
 * should just skip that piece and continue.
 */
export async function triggerEmergencyMode(userId, level) {
  try {
    const incidentId = await createIncident(userId, level)
    const tracking = TRACKING_CONFIG[level] || TRACKING_CONFIG.concern
    const evidence = EVIDENCE_CONFIG[level] || EVIDENCE_CONFIG.concern

    const jobs = [getLocationOnce().then((coords) => coords && setIncidentLocation(incidentId, coords))]

    if (evidence.sound) {
      jobs.push(listenForLoudSound().then((result) => result && setIncidentSoundCheck(incidentId, result)))
    }
    if (evidence.photo) {
      jobs.push(capturePhotoThumbnail().then((photo) => photo && setIncidentPhoto(incidentId, photo)))
    }

    await Promise.allSettled(jobs)

    if (tracking.pings > 1) {
      await addTimelineEvent(incidentId, 'tracking', `Tracking enabled: ${tracking.label}`)
      startTracking(incidentId, tracking)
    }

    return incidentId
  } catch (err) {
    console.error('Emergency mode error:', err)
    return null
  }
}
