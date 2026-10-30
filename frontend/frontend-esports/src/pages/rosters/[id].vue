<script setup>
  import { computed, onMounted, reactive, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import { ApiError } from '@/services/api'
  import { listarJugadores } from '@/services/jugadores'
  import {
    asignarJugador,
    cambiarRolEnRoster,
    obtenerRoster,
    quitarJugador,
  } from '@/services/rosters'

  const route = useRoute()
  const idRoster = Number(route.params.id)

  const headers = [
    { title: 'Nickname', key: 'nickname' },
    { title: 'Rol de juego', key: 'rol' },
    { title: 'En el roster', key: 'rol_en_roster' },
    { title: 'Acciones', key: 'acciones', sortable: false, align: 'end' },
  ]

  const roster = ref(null)
  const todosLosJugadores = ref([])
  const cargando = ref(false)
  const noEncontrado = ref(false)

  const aviso = reactive({ visible: false, texto: '', color: 'success' })
  function mostrar (texto, color = 'success') {
    aviso.texto = texto
    aviso.color = color
    aviso.visible = true
  }
  function mensajeError (e) {
    return e instanceof ApiError ? e.message : 'Ocurrió un error inesperado'
  }

  const titulares = computed(
    () => roster.value?.jugadores.filter((j) => j.rol_en_roster === 'Titular').length ?? 0,
  )

  // Jugadores que todavía no están en este roster
  const disponibles = computed(() => {
    const asignados = new Set(roster.value?.jugadores.map((j) => j.id) ?? [])
    return todosLosJugadores.value
      .filter((j) => !asignados.has(j.id))
      .map((j) => ({ title: `${j.nickname} (${j.rol})`, value: j.id }))
  })

  async function cargar () {
    cargando.value = true
    try {
      roster.value = await obtenerRoster(idRoster)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) noEncontrado.value = true
      else mostrar(mensajeError(e), 'error')
    } finally {
      cargando.value = false
    }
  }

  onMounted(async () => {
    await cargar()
    try {
      todosLosJugadores.value = await listarJugadores()
    } catch (e) {
      mostrar(mensajeError(e), 'error')
    }
  })

  // ---- Asignar ----
  const dialogo = ref(false)
  const guardando = ref(false)
  const asignacion = reactive({ id_jugador: null, rol_en_roster: 'Titular' })
  const errorAsignar = ref('')

  function abrirAsignar () {
    asignacion.id_jugador = null
    asignacion.rol_en_roster = 'Titular'
    errorAsignar.value = ''
    dialogo.value = true
  }

  async function asignar () {
    if (!asignacion.id_jugador) {
      errorAsignar.value = 'Selecciona un jugador'
      return
    }
    guardando.value = true
    errorAsignar.value = ''
    try {
      await asignarJugador(idRoster, { ...asignacion })
      dialogo.value = false
      mostrar('Jugador asignado')
      await cargar()
    } catch (e) {
      // 409: 5 titulares, rol repetido o jugador ya asignado. El diálogo sigue abierto
      errorAsignar.value = mensajeError(e)
    } finally {
      guardando.value = false
    }
  }

  // ---- Cambiar Titular / Suplente ----
  async function alternarRol (j) {
    const nuevo = j.rol_en_roster === 'Titular' ? 'Suplente' : 'Titular'
    try {
      await cambiarRolEnRoster(idRoster, j.id, nuevo)
      mostrar(`${j.nickname} ahora es ${nuevo}`)
      await cargar()
    } catch (e) {
      mostrar(mensajeError(e), 'error')
    }
  }

  // ---- Quitar con confirmación ----
  const dialogoQuitar = ref(false)
  const porQuitar = ref(null)

  function pedirQuitar (j) {
    porQuitar.value = j
    dialogoQuitar.value = true
  }

  async function confirmarQuitar () {
    if (!porQuitar.value) return
    try {
      await quitarJugador(idRoster, porQuitar.value.id)
      mostrar('Jugador quitado del roster')
      await cargar()
    } catch (e) {
      mostrar(mensajeError(e), 'error')
    } finally {
      dialogoQuitar.value = false
      porQuitar.value = null
    }
  }
</script>

<template>
  <v-container class="py-6">
    <v-btn class="mb-4" prepend-icon="mdi-arrow-left" to="/rosters" variant="text">
      Volver a rosters
    </v-btn>

    <v-alert v-if="noEncontrado" type="warning" variant="tonal">
      El roster no existe.
    </v-alert>

    <template v-else-if="roster">
      <div class="d-flex align-center flex-wrap mb-2">
        <h1 class="text-h5">{{ roster.nombre }}</h1>
        <v-chip class="ml-3" size="small">{{ roster.tipo }}</v-chip>
        <v-chip class="ml-2" size="small">{{ roster.temporada }}</v-chip>
        <v-spacer />
        <v-btn color="primary" prepend-icon="mdi-account-plus" @click="abrirAsignar">
          Asignar jugador
        </v-btn>
      </div>
      <p class="text-medium-emphasis mb-4">
        {{ roster.juego }} · Titulares: {{ titulares }}/5
      </p>

      <v-data-table
        :headers="headers"
        :items="roster.jugadores"
        :loading="cargando"
        no-data-text="Este roster todavía no tiene jugadores"
      >
        <template #item.rol_en_roster="{ item }">
          <v-chip :color="item.rol_en_roster === 'Titular' ? 'success' : 'grey'" size="small">
            {{ item.rol_en_roster }}
          </v-chip>
        </template>
        <template #item.acciones="{ item }">
          <v-btn size="small" variant="tonal" @click="alternarRol(item)">
            Pasar a {{ item.rol_en_roster === 'Titular' ? 'Suplente' : 'Titular' }}
          </v-btn>
          <v-btn
            aria-label="Quitar del roster"
            class="ml-1"
            color="error"
            icon="mdi-account-remove"
            size="small"
            variant="text"
            @click="pedirQuitar(item)"
          />
        </template>
      </v-data-table>
    </template>

    <!-- Asignar jugador -->
    <v-dialog v-model="dialogo" max-width="460" persistent>
      <v-card title="Asignar jugador">
        <v-card-text>
          <v-select
            v-model="asignacion.id_jugador"
            :items="disponibles"
            label="Jugador *"
            no-data-text="No hay jugadores disponibles"
          />
          <v-radio-group v-model="asignacion.rol_en_roster" inline label="Rol en el roster">
            <v-radio label="Titular" value="Titular" />
            <v-radio label="Suplente" value="Suplente" />
          </v-radio-group>
          <v-alert v-if="errorAsignar" density="compact" type="error" variant="tonal">
            {{ errorAsignar }}
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn :disabled="guardando" @click="dialogo = false">Cancelar</v-btn>
          <v-btn color="primary" :loading="guardando" variant="elevated" @click="asignar">
            Asignar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirmar quitar -->
    <v-dialog v-model="dialogoQuitar" max-width="420">
      <v-card title="Quitar del roster">
        <v-card-text>
          ¿Quitar a <strong>{{ porQuitar?.nickname }}</strong> de este roster?
          El jugador no se elimina del sistema.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="dialogoQuitar = false">Cancelar</v-btn>
          <v-btn color="error" variant="elevated" @click="confirmarQuitar">Quitar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="aviso.visible" :color="aviso.color" timeout="4000">
      {{ aviso.texto }}
    </v-snackbar>
  </v-container>
</template>