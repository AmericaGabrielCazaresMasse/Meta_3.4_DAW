import { reactive } from 'vue'
import { request, setCsrf } from './api'

// Estado global de la sesión (sin necesidad de Pinia)
export const auth = reactive({
  usuario: null,
  listo: false, // true cuando ya se consultó si hay sesión activa
})

export async function login (username, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: { username, password },
  })
  setCsrf(data.csrfToken)
  auth.usuario = data.usuario
}

// Al recargar la página el token CSRF se pierde de memoria: /auth/verify lo recupera
export async function recuperarSesion () {
  try {
    const data = await request('/auth/verify')
    setCsrf(data.csrfToken)
    auth.usuario = data.usuario
  } catch {
    setCsrf(null)
    auth.usuario = null
  } finally {
    auth.listo = true
  }
}

export async function logout () {
  try {
    await request('/auth/logout', { method: 'POST' })
  } finally {
    setCsrf(null)
    auth.usuario = null
  }
}