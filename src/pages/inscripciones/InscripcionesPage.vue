<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <div class="col">
        <p class="text-h6 q-mb-none">Inscripciones</p>
        <p class="text-caption text-grey">Control de fraternos inscritos</p>
      </div>
      <q-btn
        unelevated color="primary" icon="person_add" label="Inscribir"
        @click="dialogAbierto = true"
        v-if="festividadActiva && auth.puedeInscribir"
      />
    </div>

    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-4">
        <q-select
          v-model="festividadActiva"
          :options="festividadesStore.festividades"
          option-value="id_festividad"
          option-label="nombre"
          emit-value map-options
          label="Filtrar por Festividad"
          outlined dense
          @update:model-value="cargarData"
        >
          <template v-slot:prepend>
            <q-icon name="celebration" color="primary" />
          </template>
        </q-select>
      </div>

      <div class="col-12 col-sm-6">
        <q-input
          v-model="store.filtros.buscar"
          placeholder="Buscar fraterno por nombre, apellido o CI..."
          outlined dense
          clearable
          @update:model-value="onSearch"
        >
          <template v-slot:prepend>
            <q-icon name="search" color="primary" />
          </template>
        </q-input>
      </div>
    </div>

    <q-table
      v-if="festividadActiva"
      :rows="store.inscripciones"
      :columns="(columnas as QTableColumn[])"
      :loading="store.cargando"
      row-key="id_inscripcion"
      flat bordered
      :pagination="store.paginacion"
      @request="onRequest"
    >
      <template #body-cell-persona="props">
        <q-td :props="props">
          <div class="text-weight-medium">
            {{ `${props.row.persona?.nombres} ${props.row.persona?.primer_apellido || ''} ${props.row.persona?.segundo_apellido || ''}`.trim() }}
          </div>
          <div class="text-caption text-grey">CI: {{ props.row.persona?.ci }}</div>
        </q-td>
      </template>

      <template #body-cell-estado="props">
        <q-td :props="props">
          <q-chip
            :color="props.row.estado_pago === 'Pagado' ? 'positive' : (props.row.estado_pago === 'Parcial' ? 'warning' : 'negative')"
            text-color="white" size="sm"
          >
            {{ props.row.estado_pago }}
          </q-chip>
        </q-td>
      </template>

      <template #body-cell-acciones="props">
        <q-td :props="props" auto-width class="q-gutter-xs">
          <q-btn flat round icon="add_card" color="positive" size="sm"
            @click="abrirPago(props.row)"
            v-if="auth.puedeVerPagos && props.row.saldo_pendiente > 0">
            <q-tooltip>Registrar Pago</q-tooltip>
          </q-btn>
          <q-btn flat round icon="visibility" color="primary" size="sm"
            @click="router.push({ name: 'pagos', query: { inscripcion_id: props.row.id_inscripcion }})"
            v-if="auth.puedeVerPagos">
            <q-tooltip>Ver Historial de Pagos</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <InscripcionFormDialog
      v-if="festividadActiva"
      v-model="dialogAbierto"
      :festividad-id="festividadActiva"
      @guardado="cargarData"
    />

    <PagoFormDialog 
      v-model="pagoDialog.abierto"
      :inscripcion="pagoDialog.item"
      @guardado="cargarData"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { debounce } from 'quasar'
import { useAuthStore } from 'src/stores/auth.store'
import { useInscripcionesStore } from 'src/stores/inscripciones.store'
import { useFestividadesStore } from 'src/stores/festividades.store'
import InscripcionFormDialog from 'src/components/inscripciones/InscripcionFormDialog.vue'
import PagoFormDialog from 'src/components/pagos/PagoFormDialog.vue'
import type { QTableColumn } from 'quasar'

const router = useRouter()
const auth = useAuthStore()
const store = useInscripcionesStore()
const festividadesStore = useFestividadesStore()

const dialogAbierto = ref(false)
const festividadActiva = ref<number | null>(null)

const pagoDialog = reactive({
  abierto: false,
  item: null as any
})

const columnas = [
  { name: 'persona', label: 'Fraterno', field: 'persona', align: 'left' as const },
  { name: 'tipo', label: 'Tipo', field: (row: Record<string, any>) => (row.tipo_fraterno as Record<string, any>)?.nombre || '', align: 'center' as const },
  { name: 'bloque', label: 'Bloque', field: (row: Record<string, any>) => (row.bloque as Record<string, any>)?.nombre || 'Sin bloque', align: 'left' as const },
  { name: 'total_pagado', label: 'Pagado', field: 'total_pagado', align: 'center' as const },
  { name: 'saldo', label: 'Saldo', field: 'saldo_pendiente', align: 'center' as const },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' as const },
  { name: 'acciones', label: '', field: 'acciones', align: 'center' as const },
]

onMounted(async () => {
  await festividadesStore.cargar()
  if (festividadesStore.festividades.length > 0) {
    festividadActiva.value = festividadesStore.festividades[0]?.id_festividad as number
    cargarData()
  }
})

function cargarData() {
  if (festividadActiva.value) {
    store.cargar(festividadActiva.value)
  }
}

const onSearch = debounce(() => {
  store.paginacion.page = 1
  cargarData()
}, 500)

function abrirPago(item: any) {
  pagoDialog.item = item
  pagoDialog.abierto = true
}

function onRequest({ pagination }: { pagination: any }) {
  store.paginacion = pagination
  cargarData()
}
</script>
