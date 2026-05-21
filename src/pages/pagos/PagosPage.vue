<template>
  <q-page padding>
    <div class="row items-center q-mb-md print-hide">
      <q-btn flat round icon="arrow_back" color="primary" class="q-mr-sm" @click="router.push('/inscripciones')" v-if="inscripcionId" />
      <div class="col">
        <p class="text-h6 q-mb-none">{{ inscripcionId ? 'Historial de Pago' : 'Libro de Caja (Pagos Globales)' }}</p>
        <p class="text-caption text-grey">
          {{ inscripcionId ? 'Aportes realizados por el fraterno' : 'Listado general de todos los ingresos registrados' }}
        </p>
      </div>
      <div class="col-auto" v-if="inscripcionId && inscripcionObjeto && inscripcionObjeto.saldo_pendiente > 0">
        <q-btn
          v-if="auth.puedeVerPagos"
          label="Registrar Pago"
          icon="add_card"
          color="positive"
          unelevated
          @click="dialogAbierto = true"
        />
      </div>
    </div>

    <!-- Filtros Globales (Solo si no es vista de fraterno específico) -->
    <q-card flat bordered class="q-mb-lg bg-grey-1 print-hide" v-if="!inscripcionId">
      <q-card-section>
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-sm-3">
            <q-input
              v-model="store.filtros.buscar"
              placeholder="Buscar por fraterno o CI..."
              outlined dense
              bg-color="white"
              clearable
              @update:model-value="onSearch"
            >
              <template v-slot:prepend><q-icon name="search" color="primary" /></template>
            </q-input>
          </div>
          <div class="col-12 col-sm-2">
            <q-select
              v-model="store.filtros.metodo_pago"
              :options="['Efectivo', 'Transferencia', 'QR', 'Otro']"
              label="Método de Pago"
              outlined dense
              bg-color="white"
              clearable
              @update:model-value="cargarData"
            />
          </div>
          <div class="col-12 col-sm-3">
            <q-select
              v-model="store.filtros.id_bloque"
              :options="bloquesStore.bloques"
              option-value="id_bloque"
              option-label="nombre"
              emit-value
              map-options
              label="Bloque"
              outlined dense
              bg-color="white"
              clearable
              @update:model-value="cargarData"
            />
          </div>
          <div class="col-12 col-sm-4 row q-gutter-x-sm no-wrap items-center">
            <q-input v-model="store.filtros.fecha_inicio" label="Desde" type="date" outlined dense bg-color="white" @update:model-value="cargarData" />
            <q-input v-model="store.filtros.fecha_fin" label="Hasta" type="date" outlined dense bg-color="white" @update:model-value="cargarData" />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Información de la Inscripción (Solo si hay ID) -->
    <q-card flat bordered class="q-mb-md bg-blue-1 print-hide" v-if="inscripcionObjeto">
      <q-card-section class="row items-center">
        <q-icon name="person" size="md" color="primary" class="q-mr-md" />
        <div>
          <div class="text-subtitle1 text-weight-bold">
            {{ `${(inscripcionObjeto as any).persona?.nombres} ${(inscripcionObjeto as any).persona?.primer_apellido || ''}` }}
          </div>
          <div class="text-caption text-grey-8">Festividad: {{ (inscripcionObjeto as any).festividad?.nombre }}</div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Tabla de Pagos -->
    <q-table
      class="print-hide"
      :rows="store.pagos"
      :columns="(columnas as QTableColumn[])"
      :loading="store.cargando"
      row-key="id_pagos"
      flat bordered
      :pagination="store.paginacion"
      @request="onRequest"
    >
      <template #body-cell-fecha_pago="props">
        <q-td :props="props">
          <div>{{ props.row.fecha_pago }}</div>
          <div class="text-caption text-grey">{{ props.row.hora_pago }} hrs</div>
        </q-td>
      </template>

      <template #body-cell-fraterno="props">
        <q-td :props="props">
          <div class="text-weight-medium">
            {{ `${(props.row.inscripcion as any)?.persona?.nombres} ${(props.row.inscripcion as any)?.persona?.primer_apellido || ''}`.trim() }}
          </div>
          <div class="text-caption text-grey">Festividad: {{ (props.row.inscripcion as any)?.festividad?.nombre }}</div>
        </q-td>
      </template>

      <template #body-cell-monto="props">
        <q-td :props="props" class="text-weight-bold text-positive text-right">
          Bs. {{ props.row.monto_pagado }}
        </q-td>
      </template>

      <template #body-cell-acciones="props">
        <q-td :props="props" auto-width>
          <q-btn flat round icon="print" color="primary" size="sm" title="Imprimir Recibo"
            @click="imprimirRecibo(props.row)" />
          <q-btn flat round icon="delete" color="negative" size="sm" title="Eliminar"
            @click="confirmarEliminar(props.row)"
            v-if="auth.esAdmin" />
        </q-td>
      </template>
    </q-table>

    <PagoFormDialog
      class="print-hide"
      v-model="dialogAbierto"
      :inscripcion="inscripcionObjeto"
      @guardado="cargarData"
    />

    <TicketImpresion v-if="pagoAImprimir" :pago="pagoAImprimir" :inscripcion-prop="inscripcionObjeto" />
  </q-page>
</template>

<script setup lang="ts">

import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { debounce } from 'quasar'
import { useAuthStore } from 'src/stores/auth.store'
import { usePagosStore } from 'src/stores/pagos.store'
import { useNotificacion } from 'src/composables/useNotificacion'
import TicketImpresion from 'src/components/pagos/TicketImpresion.vue'

import { useInscripcionesStore } from 'src/stores/inscripciones.store'
import { useBloquesStore } from 'src/stores/bloques.store'
import { inscripcionesApi } from 'src/api/inscripciones.api'
import PagoFormDialog from 'src/components/pagos/PagoFormDialog.vue'
import type { QTableColumn } from 'quasar'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const store = usePagosStore()
const inscStore = useInscripcionesStore()
const bloquesStore = useBloquesStore()
const { confirmar } = useNotificacion()

const dialogAbierto = ref(false)

const inscripcionId = computed((): number | null => {
  const id = route.query.inscripcion_id
  if (Array.isArray(id)) return id[0] ? parseInt(id[0]) : null
  return id ? parseInt(id) : null
})

const inscripcionObjeto = ref<any>(null)

const columnas = computed(() => {
  const cols = [
    { name: 'fecha_pago', label: 'Fecha', field: 'fecha_pago', align: 'left' as const, sortable: true },
    { name: 'monto', label: 'Monto Registrado', field: 'monto_pagado', align: 'right' as const, sortable: true },
    { name: 'metodo', label: 'Método', field: 'metodo_pago', align: 'left' as const },
    { name: 'comprobante', label: 'Nro Comprobante', field: 'nro_comprobante', align: 'left' as const },
    { name: 'registrado_por', label: 'Recibido por', field: (row: Record<string, any>) => {
      const u = row.registrado_por as Record<string, any>
      if (u?.persona?.nombres) {
        return `${u.persona.nombres} ${u.persona.primer_apellido || ''}`.trim()
      }
      return u?.username
    }, align: 'left' as const },
    { name: 'acciones', label: '', field: 'acciones', align: 'center' as const },
  ]
  
  if (!inscripcionId.value) {
    cols.splice(1, 0, { name: 'fraterno', label: 'Fraterno / Festividad', field: 'fraterno', align: 'left' as const })
  }
  
  return cols
})

onMounted(() => {
  cargarData()
  bloquesStore.cargar()
})

watch(() => route.query.inscripcion_id, () => cargarData())

function cargarData() {
  if (inscripcionId.value) {
    store.cargar(inscripcionId.value)
    inscripcionesApi.obtener(inscripcionId.value).then(res => {
      inscripcionObjeto.value = res.data.data || res.data
    }).catch(e => console.error(e))
  } else {
    store.cargarGlobal()
  }
}

const onSearch = debounce(() => {
  store.paginacion.page = 1
  cargarData()
}, 500)

async function confirmarEliminar(pago: Record<string, any>) {
  const ok = await confirmar(`¿Está seguro de anular este pago de Bs ${String(pago.monto_pagado || 0)}?`)
  if (ok) {
    const idIns = pago.inscripcion_id || inscripcionId.value
    await store.eliminar(idIns, pago.id_pagos as number)
    cargarData()
  }
}

const pagoAImprimir = ref<any>(null)

async function imprimirRecibo(pago: any) {
  // Wait for the component to render
  pagoAImprimir.value = pago
  await nextTick()
  setTimeout(() => {
    window.print()
    pagoAImprimir.value = null // hide it again after printing to prevent layout issues
  }, 300)
}

function onRequest({ pagination }: { pagination: any }) {
  store.paginacion = pagination
  cargarData()
}
</script>
