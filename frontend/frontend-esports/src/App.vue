<template>
  <v-app>
    <v-app-bar v-if="auth.usuario" title="Rosters eSports · Admin">
      <v-btn to="/jugadores">Jugadores</v-btn>
      <v-btn to="/rosters">Rosters</v-btn>
      <v-spacer />
      <span class="mr-4 text-body-2">{{ auth.usuario.username }}</span>
      <v-btn variant="outlined" class="mr-2" @click="salir">Salir</v-btn>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
  import { useRouter } from 'vue-router'
  import { auth, logout } from '@/services/auth'

  const router = useRouter()

  async function salir () {
    await logout()
    router.push('/login')
  }
</script>