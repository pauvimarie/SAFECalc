import { createIncident, setIncidentLocation, addTimelineEvent } from '../firebase/firestore'

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

const MODE_ACTIONS = {
  concern: ['location'],
  assistance: ['location'],
  danger: ['location'],
  critical: ['location', 'tracking'],
}

/**
 * Runs the emergency mode pipeline: creates the incident record,
 * captures location if available, and marks critical incidents for
 * live tracking. Returns the incidentId.
 * Designed to fail soft — a denied location permission should not
 * throw, it should just skip that piece and continue.
 */
export async function triggerEmergencyMode(userId, level) {
  const incidentId = await createIncident(userId, level)
  const actions = MODE_ACTIONS[level] || []

  if (actions.includes('location')) {
    const coords = await getLocationOnce()
    if (coords) await setIncidentLocation(incidentId, coords)
  }

  if (actions.includes('tracking')) {
    await addTimelineEvent(incidentId, 'tracking', 'Live tracking enabled')
  }

  return incidentId
}
