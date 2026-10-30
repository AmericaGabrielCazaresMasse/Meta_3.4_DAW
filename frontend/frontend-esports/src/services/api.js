const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'

export class ApiError extends Error {
  constructor (status, message) {
    super(message)
    this.status = status
  }
}

let csrfToken = null
export const setCsrf = (token) => { csrfToken = token }

// Se llama cuando una petición normal responde 401 (sesión expirada)
let onUnauthorized = null
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn }

export async function request (path, { method = 'GET', body } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (method !== 'GET' && csrfToken) headers['x-csrf-token'] = csrfToken

  let res
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      credentials: 'include', // envía y recibe las cookies de sesión
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor')
  }

  if (res.status === 204) return null
  const data = await res.json().catch(() => null)

  if (!res.ok) {
    if (res.status === 401 && !path.startsWith('/auth/')) onUnauthorized?.()
    throw new ApiError(res.status, data?.error ?? 'Error del servidor')
  }
  return data
}