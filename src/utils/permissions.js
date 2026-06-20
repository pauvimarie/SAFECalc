// Browser permission helpers. Pure client-side, no Firebase Storage,
// no billing impact. Camera/microphone are primed (stream opened then
// immediately stopped) so the OS permission prompt fires up front —
// nothing is recorded or uploaded.

export async function requestLocationPermission(timeout = 8000) {
  return new Promise((resolve) => {
    if (!("geolocation" in navigator)) return resolve("unsupported");

    navigator.geolocation.getCurrentPosition(
      () => resolve("granted"),
      (err) => resolve(err.code === 1 ? "denied" : "error"),
      {
        enableHighAccuracy: true,
        timeout,
        maximumAge: 0,
      }
    );
  });
}

export async function requestCameraPermission() {
  if (!navigator.mediaDevices?.getUserMedia) return "unsupported";

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });

    stream.getTracks().forEach((track) => track.stop());

    return "granted";
  } catch {
    return "denied";
  }
}

export async function requestMicrophonePermission() {
  if (!navigator.mediaDevices?.getUserMedia) return "unsupported";

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    stream.getTracks().forEach((track) => track.stop());

    return "granted";
  } catch {
    return "denied";
  }
}

export async function requestNotificationPermission() {
  if (!("Notification" in window)) return "unsupported";

  if (Notification.permission === "granted") {
    return "granted";
  }

  if (Notification.permission === "denied") {
    return "denied";
  }

  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
}

// Best-effort read of current status without triggering prompts.
export async function readPermissionStatuses() {
  const out = {
    location: "unknown",
    camera: "unknown",
    microphone: "unknown",
    notification: "unknown",
  };

  if (navigator.permissions?.query) {
    try {
      out.location = (
        await navigator.permissions.query({
          name: "geolocation",
        })
      ).state;
    } catch {}

    try {
      out.camera = (
        await navigator.permissions.query({
          name: "camera",
        })
      ).state;
    } catch {}

    try {
      out.microphone = (
        await navigator.permissions.query({
          name: "microphone",
        })
      ).state;
    } catch {}
  }

  out.notification =
    "Notification" in window
      ? Notification.permission
      : "unsupported";

  return out;
}

// Added for GuardianDashboard compatibility.
export async function readNotificationStatus() {
  if (!("Notification" in window)) {
    return "unsupported";
  }

  return Notification.permission;
}

export async function requestAllPermissions() {
  const [
    location,
    camera,
    microphone,
    notification,
  ] = await Promise.all([
    requestLocationPermission(),
    requestCameraPermission(),
    requestMicrophonePermission(),
    requestNotificationPermission(),
  ]);

  return {
    location,
    camera,
    microphone,
    notification,
  };
}