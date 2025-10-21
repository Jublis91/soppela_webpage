import { API_URL } from "./apiConfig"

function hasProtocol(path) {
  return /^(https?:)?\/\//i.test(path) || /^data:/i.test(path)
}

export function resolveImageUrl(path) {
  if (!path) {
    return ""
  }

  if (hasProtocol(path)) {
    return path
  }

  if (API_URL && path.startsWith(API_URL)) {
    return path
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`

  if (!API_URL) {
    return normalizedPath
  }

  return `${API_URL}${normalizedPath}`
}
