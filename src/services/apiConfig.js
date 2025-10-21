const rawValue = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_API_URL : ''

function normalizeBaseUrl(value) {
  if (typeof value !== 'string') {
    return ''
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return ''
  }

  return trimmed.replace(/\/+$/, '')
}

export const API_URL = normalizeBaseUrl(rawValue)

export function createApiUrl(path = '') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${API_URL}${normalizedPath}`
}