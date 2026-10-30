/**
 * router/index.ts
 *
 * Automatic routes for ./src/pages/*.vue
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
import { auth, recuperarSesion } from '@/services/auth'
import { setUnauthorizedHandler } from '@/services/api'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Guarda: solo el Admin con sesión entra a las pantallas; /login es la única pública
router.beforeEach(async (to) => {
  if (!auth.listo) await recuperarSesion()

  if (to.path === '/login') {
    return auth.usuario ? '/' : true
  }
  return auth.usuario ? true : '/login'
})

// Si la sesión expira mientras se usa la app, volver al login
setUnauthorizedHandler(() => {
  auth.usuario = null
  router.push('/login')
})

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (localStorage.getItem('vuetify:dynamic-reload')) {
      console.error('Dynamic import error, reloading page did not fix it', err)
    } else {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router