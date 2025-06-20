export function logEvent(message) {
  const timestamp = new Date().toISOString()
  const token = localStorage.getItem('token')

  const logPayload = {
    message: `${timestamp} - ${message}`,
  }

  fetch("/api/logs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` })
    },
    body: JSON.stringify(logPayload)
  }).catch(err => {
    console.error("❌ Lokitus epäonnistui:", err)
  })

  if (import.meta.env.DEV) {
    console.log(logPayload.message)
  }
}
