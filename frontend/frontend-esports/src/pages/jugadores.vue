<script setup>
  import { onMounted, reactive, ref, watch } from 'vue'
  import { ApiError } from '@/services/api'
  import {
    actualizarJugador,
    crearJugador,
    eliminarJugador,
    listarJugadores,
    obtenerEstados,
    obtenerRoles,
  } from '@/services/jugadores'

  const headers = [
    { title: 'Nickname', key: 'nickname' },
    { title: 'Nombre real', key: 'nombre_real' },
    { title: 'País', key: 'pais' },
    { title: 'Rol', key: 'rol' },
    { title: 'Estado', key: 'estado' },
    { title: 'Acciones', key: 'acciones', sortable: false, align: 'end' },
  ]

  const jugadores = ref([])
  const roles = ref([])
  const estados = ref([])
  const cargando = ref(false)

  const filtros = reactive({ rol: null, estado: null, search: '' })

  // Aviso (snackbar)
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
      jugadores.value = await listarJugadores(filtros)
    } catch (e) {
      mostrar(mensajeError(e), 'error')
    } finally {
      cargando.value = false
    }
  }

  onMounted(async () => {
    try {
      [roles.value, estados.value] = await Promise.all([obtenerRoles(), obtenerEstados()])
    } catch (e) {
      mostrar(mensajeError(e), 'error')
    }
    await cargar()
  })

  // Filtros: rol y estado recargan al instante; la búsqueda espera a que se deje de escribir
  watch(() => [filtros.rol, filtros.estado], cargar)
  let temporizador
  watch(() => filtros.search, () => {
    clearTimeout(temporizador)
    temporizador = setTimeout(cargar, 350)
  })

  // ---- Crear / editar ----
  const dialogo = ref(false)
  const editandoId = ref(null)
  const guardando = ref(false)
  const formulario = ref(null)
  const datos = reactive({ nickname: '', nombre_real: '', pais: '', rol: '', estado: 'activo' })

  const reglaNickname = [(v) => !!v?.trim() || 'El nickname es obligatorio']
  const reglaRol = [(v) => !!v || 'Selecciona un rol']

  function nuevo () {
    editandoId.value = null
    Object.assign(datos, { nickname: '', nombre_real: '', pais: '', rol: '', estado: 'activo' })
    dialogo.value = true
  }

  function editar (j) {
    editandoId.value = j.id
    Object.assign(datos, {
      nickname: j.nickname,
      nombre_real: j.nombre_real ?? '',
      pais: j.pais ?? '',
      rol: j.rol,
      estado: j.estado,
    })
    dialogo.value = true
  }

  async function guardar () {
    const resultado = await formulario.value?.validate()
    if (!resultado?.valid) return

    const payload = {
      nickname: datos.nickname.trim(),
      nombre_real: datos.nombre_real.trim() || null,
      pais: datos.pais.trim() || null,
      rol: datos.rol,
      estado: datos.estado,
    }

    guardando.value = true
    try {
      if (editandoId.value === null) {
        await crearJugador(payload)
        mostrar('Jugador creado')
      } else {
        await actualizarJugador(editandoId.value, payload)
        mostrar('Jugador actualizado')
      }
      dialogo.value = false
      await cargar()
    } catch (e) {
      // Aquí aparece, por ejemplo, el 409 de nickname repetido
      mostrar(mensajeError(e), 'error')
    } finally {
      guardando.value = false
    }
  }

  // ---- Eliminar con confirmación ----
  const dialogoEliminar = ref(false)
  const porEliminar = ref(null)

  function pedirEliminar (j) {
    porEliminar.value = j
    dialogoEliminar.value = true
  }

  async function confirmarEliminar () {
    if (!porEliminar.value) return
    try {
      await eliminarJugador(porEliminar.value.id)
      mostrar('Jugador eliminado')
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
      <h1 class="text-h5">Jugadores</h1>
      <v-spacer />
      <v-btn color="primary" prepend-icon="mdi-plus" @click="nuevo">Nuevo jugador</v-btn>
    </div>

    <!-- Filtros -->
    <v-row dense>
      <v-col cols="12" md="5">
        <v-text-field
          v-model="filtros.search"
          clearable
          density="compact"
          hide-details
          label="Buscar por nickname"
          prepend-inner-icon="mdi-magnify"
        />
      </v-col>
      <v-col cols="6" md="3">
        <v-select
          v-model="filtros.rol"
          clearable
          density="compact"
          hide-details
          :items="roles"
          label="Rol"
        />
      </v-col>
      <v-col cols="6" md="3">
        <v-select
          v-model="filtros.estado"
          clearable
          density="compact"
          hide-details
          :items="estados"
          label="Estado"
        />
      </v-col>
    </v-row>

    <!-- Tabla -->
    <v-data-table
      class="mt-4"
      :headers="headers"
      :items="jugadores"
      :loading="cargando"
      no-data-text="No hay jugadores"
    >
      <template #item.estado="{ item }">
        <v-chip :color="item.estado === 'activo' ? 'success' : 'grey'" size="small">
          {{ item.estado }}
        </v-chip>
      </template>
      <template #item.acciones="{ item }">
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
      <v-card :title="editandoId === null ? 'Nuevo jugador' : 'Editar jugador'">
        <v-card-text>
          <v-form ref="formulario" @submit.prevent="guardar">
            <v-text-field v-model="datos.nickname" label="Nickname *" :rules="reglaNickname" />
            <v-text-field v-model="datos.nombre_real" label="Nombre real" />
            <v-text-field v-model="datos.pais" label="País" />
            <v-select v-model="datos.rol" :items="roles" label="Rol *" :rules="reglaRol" />
            <v-select v-model="datos.estado" :items="estados" label="Estado" />
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
      <v-card title="Eliminar jugador">
        <v-card-text>
          ¿Seguro que quieres eliminar a <strong>{{ porEliminar?.nickname }}</strong>?
          También se quitará de los rosters donde esté asignado.
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