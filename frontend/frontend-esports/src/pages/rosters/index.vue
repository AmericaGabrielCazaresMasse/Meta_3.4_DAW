<script setup>
  import { onMounted, reactive, ref, watch } from 'vue'
  import { ApiError } from '@/services/api'
  import {
    actualizarRoster,
    crearRoster,
    eliminarRoster,
    listarRosters,
    obtenerTipos,
  } from '@/services/rosters'

  const headers = [
    { title: 'Nombre', key: 'nombre' },
    { title: 'Juego', key: 'juego' },
    { title: 'Tipo', key: 'tipo' },
    { title: 'Temporada', key: 'temporada' },
    { title: 'Jugadores', key: 'cantidad_jugadores' },
    { title: 'Acciones', key: 'acciones', sortable: false, align: 'end' },
  ]

  const rosters = ref([])
  const tipos = ref([])
  const cargando = ref(false)
  const filtros = reactive({ tipo: null, temporada: '' })

  const aviso = reactive({ visible: false, texto: '', color: 'success' })
  function mostrar (texto, color = 'success') {
    aviso.texto = texto
    aviso.color = color
    aviso.visible = true
  }
  function mensajeError (e) {
    return e instanceof ApiError ? e.message : 'Ocurrió un error inesperado'
  }

  async function cargar () {
    cargando.value = true
    try {
      rosters.value = await listarRosters(filtros)
    } catch (e) {
      mostrar(mensajeError(e), 'error')
    } finally {
      cargando.value = false
    }
  }

  onMounted(async () => {
    try {
      tipos.value = await obtenerTipos()
    } catch (e) {
      mostrar(mensajeError(e), 'error')
    }
    await cargar()
  })

  watch(() => filtros.tipo, cargar)
  let temporizador
  watch(() => filtros.temporada, () => {
    clearTimeout(temporizador)
    temporizador = setTimeout(cargar, 350)
  })

  // ---- Crear / editar ----
  const dialogo = ref(false)
  const editandoId = ref(null)
  const guardando = ref(false)
  const formulario = ref(null)
  const datos = reactive({ nombre: '', juego: 'League of Legends', tipo: '', temporada: '' })

  const reglaNombre = [(v) => !!v?.trim() || 'El nombre es obligatorio']
  const reglaTipo = [(v) => !!v || 'Selecciona un tipo']
  const reglaTemporada = [(v) => !!v?.trim() || 'La temporada es obligatoria']

  function nuevo () {
    editandoId.value = null
    Object.assign(datos, { nombre: '', juego: 'League of Legends', tipo: '', temporada: '' })
    dialogo.value = true
  }

  function editar (r) {
    editandoId.value = r.id
    Object.assign(datos, {
      nombre: r.nombre,
      juego: r.juego,
      tipo: r.tipo,
      temporada: r.temporada,
    })
    dialogo.value = true
  }

  async function guardar () {
    const resultado = await formulario.value?.validate()
    if (!resultado?.valid) return

    const payload = {
      nombre: datos.nombre.trim(),
      juego: datos.juego.trim() || 'League of Legends',
      tipo: datos.tipo,
      temporada: datos.temporada.trim(),
    }

    guardando.value = true
    try {
      if (editandoId.value === null) {
        await crearRoster(payload)
        mostrar('Roster creado')
      } else {
        await actualizarRoster(editandoId.value, payload)
        mostrar('Roster actualizado')
      }
      dialogo.value = false
      await cargar()
    } catch (e) {
      mostrar(mensajeError(e), 'error')
    } finally {
      guardando.value = false
    }
  }

  // ---- Eliminar con confirmación ----
  const dialogoEliminar = ref(false)
  const porEliminar = ref(null)

  function pedirEliminar (r) {
    porEliminar.value = r
    dialogoEliminar.value = true
  }

  async function confirmarEliminar () {
    if (!porEliminar.value) return
    try {
      await eliminarRoster(porEliminar.value.id)
      mostrar('Roster eliminado')
      await cargar()
    } catch (e) {
      mostrar(mensajeError(e), 'error')
    } finally {
      dialogoEliminar.value = false
      porEliminar.value = null
    }
  }
</script>

<template>
  <v-container class="py-6">
    <div class="d-flex align-center mb-4">
      <h1 class="text-h5">Rosters</h1>
      <v-spacer />
      <v-btn color="primary" prepend-icon="mdi-plus" @click="nuevo">Nuevo roster</v-btn>
    </div>

    <!-- Filtros -->
    <v-row dense>
      <v-col cols="6" md="3">
        <v-select
          v-model="filtros.tipo"
          clearable
          density="compact"
          hide-details
          :items="tipos"
          label="Tipo"
        />
      </v-col>
      <v-col cols="6" md="3">
        <v-text-field
          v-model="filtros.temporada"
          clearable
          density="compact"
          hide-details
          label="Temporada"
        />
      </v-col>
    </v-row>

    <!-- Tabla -->
    <v-data-table
      class="mt-4"
      :headers="headers"
      :items="rosters"
      :loading="cargando"
      no-data-text="No hay rosters"
    >
      <template #item.tipo="{ item }">
        <v-chip :color="item.tipo === 'Principal' ? 'primary' : 'secondary'" size="small">
          {{ item.tipo }}
        </v-chip>
      </template>
      <template #item.acciones="{ item }">
        <v-btn
          aria-label="Gestionar jugadores"
          icon="mdi-account-group"
          size="small"
          :to="`/rosters/${item.id}`"
          variant="text"
        />
        <v-btn aria-label="Editar" icon="mdi-pencil" size="small" variant="text" @click="editar(item)" />
        <v-btn
          aria-label="Eliminar"
          color="error"
          icon="mdi-delete"
          size="small"
          variant="text"
          @click="pedirEliminar(item)"
        />
      </template>
    </v-data-table>

    <!-- Crear / editar -->
    <v-dialog v-model="dialogo" max-width="480" persistent>
      <v-card :title="editandoId === null ? 'Nuevo roster' : 'Editar roster'">
        <v-card-text>
          <v-form ref="formulario" @submit.prevent="guardar">
            <v-text-field v-model="datos.nombre" label="Nombre *" :rules="reglaNombre" />
            <v-text-field v-model="datos.juego" label="Juego" />
            <v-select v-model="datos.tipo" :items="tipos" label="Tipo *" :rules="reglaTipo" />
            <v-text-field v-model="datos.temporada" label="Temporada * (ej. 2026)" :rules="reglaTemporada" />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn :disabled="guardando" @click="dialogo = false">Cancelar</v-btn>
          <v-btn color="primary" :loading="guardando" variant="elevated" @click="guardar">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirmación de eliminación -->
    <v-dialog v-model="dialogoEliminar" max-width="420">
      <v-card title="Eliminar roster">
        <v-card-text>
          ¿Seguro que quieres eliminar el roster <strong>{{ porEliminar?.nombre }}</strong>?
          Los jugadores no se eliminan, solo dejan de estar asignados a este roster.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="dialogoEliminar = false">Cancelar</v-btn>
          <v-btn color="error" variant="elevated" @click="confirmarEliminar">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="aviso.visible" :color="aviso.color" timeout="4000">
      {{ aviso.texto }}
    </v-snackbar>
  </v-container>
</template>