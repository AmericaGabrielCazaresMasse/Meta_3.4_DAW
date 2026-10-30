<template>
  <v-container class="py-8" style="max-width: 800px;">
    <h1 class="text-h4 mb-6">Panel de administración</h1>
    <v-row>
      <v-col cols="12" sm="6">
        <v-card to="/jugadores" title="Jugadores" subtitle="Crear, editar y eliminar jugadores" />
      </v-col>
      <v-col cols="12" sm="6">
        <v-card to="/rosters" title="Rosters" subtitle="Armar rosters y asignar jugadores" />
      </v-col>
    </v-row>
  </v-container>
</template>