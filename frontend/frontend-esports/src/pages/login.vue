<script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { login } from '@/services/auth'
  import { ApiError } from '@/services/api'

  const router = useRouter()

  const form = ref(null)
  const username = ref('')
  const password = ref('')
  const cargando = ref(false)
  const error = ref('')

  const reglaUsuario = [(v) => !!v?.trim() || 'Debes ingresar tu usuario']
  const reglaPassword = [(v) => !!v || 'Debes ingresar tu contraseña']

  async function entrar () {
    error.value = ''
    const resultado = await form.value?.validate()
    if (!resultado?.valid) return

    cargando.value = true
    try {
      await login(username.value.trim(), password.value)
      router.push('/')
    } catch (e) {
      if (e instanceof ApiError) {
        error.value = e.status === 401 ? 'Usuario o contraseña incorrectos' : e.message
      } else {
        error.value = 'Ocurrió un error inesperado'
      }
    } finally {
      cargando.value = false
    }
  }
</script>

<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card class="mx-auto" width="400">
      <v-img color="#a9a9a9" height="200" cover />

      <v-divider vertical class="mx-3" opacity="0" style="margin-top: -100px;">
        <v-avatar color="#a9a9a9" image="@/assets/account-circle.svg" size="100" />
      </v-divider>

      <v-divider vertical class="mx-3" opacity="0" style="margin-top: 40px;">
        <v-card-text>
          <div class="text-headline-small text-center mb-8 font-weight-medium">
            Inicia sesión
          </div>
        </v-card-text>
      </v-divider>

      <v-sheet class="mx-auto" width="300">
        <v-form ref="form" style="margin-top: -60px;" @submit.prevent="entrar">
          <v-text-field
            v-model="username"
            autocomplete="username"
            label="Usuario"
            :rules="reglaUsuario"
          />

          <v-text-field
            v-model="password"
            autocomplete="current-password"
            label="Contraseña"
            :rules="reglaPassword"
            type="password"
          />

          <v-alert
            v-if="error"
            class="mb-2"
            density="compact"
            type="error"
            variant="tonal"
          >
            {{ error }}
          </v-alert>

          <v-btn
            block
            class="mt-2"
            :loading="cargando"
            style="margin-bottom: 50px;"
            type="submit"
          >
            Entrar
          </v-btn>
        </v-form>
      </v-sheet>
    </v-card>
  </v-container>
</template>