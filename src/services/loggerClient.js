// loggerClient.js

import { createApiUrl } from './apiConfig'

/**
 * Lähettää lokiviestin palvelimelle ja kehitysympäristössä myös konsoliin.
 * @param {string} message - Lokitettava viesti
 */
export function logEvent(message) {
  const timestamp = new Date().toISOString()
  const token = localStorage.getItem('token')

  const logPayload = {
    message: `${timestamp} - ${message}`,
  }

 if (token) {
    fetch(createApiUrl('/api/logs'), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(logPayload)
    }).catch(err => {
      console.error("❌ Lokituksen POST-pyyntö epäonnistui:", err)
    })
  }

  // Kehitysympäristössä tulostetaan konsoliin
  if (import.meta.env.DEV) {
    console.log(logPayload.message)
  }
}
