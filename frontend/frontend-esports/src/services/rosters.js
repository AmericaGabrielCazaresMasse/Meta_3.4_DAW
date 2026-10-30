import { request } from './api'

export function listarRosters (f = {}) {
  const params = new URLSearchParams()
  if (f.tipo) params.set('tipo', f.tipo)
  if (f.temporada?.trim()) params.set('temporada', f.temporada.trim())
  const qs = params.toString()
  return request(`/rosters${qs ? `?${qs}` : ''}`)
}

export const obtenerRoster = (id) => request(`/rosters/${id}`)

export const crearRoster = (data) =>
  request('/rosters', { method: 'POST', body: data })

export const actualizarRoster = (id, data) =>
  request(`/rosters/${id}`, { method: 'PUT', body: data })

export const eliminarRoster = (id) =>
  request(`/rosters/${id}`, { method: 'DELETE' })

export const obtenerTipos = () => request('/tipos-roster')

// Asignaciones
export const asignarJugador = (idRoster, data) =>
  request(`/rosters/${idRoster}/jugadores`, { method: 'POST', body: data })

export const cambiarRolEnRoster = (idRoster, idJugador, rol_en_roster) =>
  request(`/rosters/${idRoster}/jugadores/${idJugador}`, {
    method: 'PUT',
    body: { rol_en_roster },
  })

export const quitarJugador = (idRoster, idJugador) =>
  request(`/rosters/${idRoster}/jugadores/${idJugador}`, { method: 'DELETE' })