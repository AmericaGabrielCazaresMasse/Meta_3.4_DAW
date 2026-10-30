import { request } from './api'

export function listarJugadores (f = {}) {
  const params = new URLSearchParams()
  if (f.rol) params.set('rol', f.rol)
  if (f.estado) params.set('estado', f.estado)
  if (f.search?.trim()) params.set('search', f.search.trim())
  const qs = params.toString()
  return request(`/jugadores${qs ? `?${qs}` : ''}`)
}

export const crearJugador = (data) =>
  request('/jugadores', { method: 'POST', body: data })

export const actualizarJugador = (id, data) =>
  request(`/jugadores/${id}`, { method: 'PUT', body: data })

export const eliminarJugador = (id) =>
  request(`/jugadores/${id}`, { method: 'DELETE' })

export const obtenerRoles = () => request('/roles')
export const obtenerEstados = () => request('/estados')