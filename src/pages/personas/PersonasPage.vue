<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <div class="col">
        <p class="text-h6 q-mb-none">Personas</p>
        <p class="text-caption text-grey">Gestión de fraternos</p>
      </div>
      <q-btn unelevated color="primary" icon="person_add" label="Nuevo" @click="abrirDialogo(null)" v-if="auth.esAdmin" />
    </div>

    <div class="row q-col-gutter-md q-mb-md items-center">
      <div class="col-auto">
        <q-input
          v-model="store.filtros.buscar"
          placeholder="Buscar por nombre o CI..."
          outlined dense clearable
          style="min-width: 240px"
          @update:model-value="() => store.cargar()"
        >
          <template #prepend><q-icon name="search" /></template>
        </q-input>
      </div>
      <div class="col-auto">
        <q-select
          v-model="store.filtros.id_tipo_persona"
          :options="tiposPersonas"
          option-value="id_tipo_persona"
          option-label="nombre"
          emit-value map-options
          clearable
          label="Tipo de Persona"
          outlined dense
          style="min-width: 200px"
          @update:model-value="() => store.cargar()"
        >
          <template #prepend><q-icon name="badge" /></template>
        </q-select>
      </div>
    </div>

    <q-table
      :rows="store.personas"
      :columns="(columnas as QTableColumn[])"
      :loading="store.cargando"
      row-key="id_persona"
      flat bordered
      :pagination="store.paginacion"
      @request="onRequest"
    >
      <template #body-cell-acciones="props">
        <q-td :props="props" auto-width>
          <q-btn flat round icon="visibility" size="sm" color="primary" @click="irADetalle(props.row.id_persona)" />
          <q-btn flat round icon="edit" size="sm" color="secondary" @click="abrirDialogo(props.row)" v-if="auth.esAdmin" />
          <q-btn flat round icon="delete" size="sm" color="negative" @click="confirmarEliminar(props.row)" v-if="auth.esAdmin" />
        </q-td>
      </template>
    </q-table>

    <PersonaFormDialog
      v-model="dialogAbierto"
      :persona="personaSeleccionada"
      @guardado="store.cargar"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { tiposPersonasApi } from 'src/api/tiposPersonas.api'
import { useRouter } from 'vue-router'
import { usePersonasStore } from 'src/stores/personas.store'
import { useAuthStore } from 'src/stores/auth.store'
import { useNotificacion } from 'src/composables/useNotificacion'
import PersonaFormDialog from 'src/components/personas/PersonaFormDialog.vue'
import type { QTableColumn } from 'quasar'

const router = useRouter()
const store = usePersonasStore()
const auth = useAuthStore()
const { confirmar } = useNotificacion()

const dialogAbierto = ref(false)
const personaSeleccionada = ref<Record<string, unknown> | null>(null)
const tiposPersonas = ref<Record<string, unknown>[]>([])

const columnas = [
  { 
    name: 'nombre_completo', 
    label: 'Nombre Completo', 
    field: (row: Record<string, any>) => `${row.nombres || ''} ${row.primer_apellido || ''} ${row.segundo_apellido || ''}`.trim(), 
    align: 'left' as const, 
    sortable: true 
  },
  { name: 'ci', label: 'CI', field: 'ci', align: 'left' as const },
  { name: 'sexo', label: 'Sexo', field: (row: Record<string, unknown>) => (row.sexo as Record<string, unknown>)?.sexo, align: 'left' as const },
  { name: 'tipo_persona', label: 'Tipo', field: (row: Record<string, unknown>) => (row.tipo_persona as Record<string, unknown>)?.nombre || 'Sin asignar', align: 'left' as const },
  { name: 'celular', label: 'Celular', field: 'celular', align: 'left' as const },
  { name: 'acciones', label: '', field: 'acciones', align: 'center' as const },
]

onMounted(async () => {
  store.cargar()
  try {
    const { data } = await tiposPersonasApi.listar()
    tiposPersonas.value = data
  } catch (e) {
    console.error('Error cargando tipos de persona', e)
  }
})

function abrirDialogo(persona: Record<string, unknown> | null) {
  personaSeleccionada.value = persona
  dialogAbierto.value = true
}

function irADetalle(id: number | string) {
  router.push({ name: 'persona-detalle', params: { id } })
}

async function confirmarEliminar(persona: Record<string, any>) {
  const nombre = `${persona.nombres || ''} ${persona.primer_apellido || ''}`.trim()
  const ok = await confirmar(`¿Eliminar a ${nombre}?`)
  if (ok) await store.eliminar(persona.id_persona as number)
}

function onRequest({ pagination }: { pagination: Record<string, unknown> }) {
  store.paginacion = pagination as typeof store.paginacion
  store.cargar()
}
</script>
