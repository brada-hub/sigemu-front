<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <q-btn flat round icon="arrow_back" color="primary" class="q-mr-sm" @click="router.push('/festividades')" />
      <div>
        <div class="text-h6 q-mb-none">Detalles de la Festividad</div>
      </div>
    </div>

    <AppLoadingSpinner v-if="cargando" />

    <template v-else-if="festividad">
      <q-card flat bordered class="q-mb-md bg-blue-1">
        <q-card-section>
          <div class="text-h5 text-weight-bold text-primary">{{ festividad.nombre }}</div>
          <div class="text-subtitle1 text-grey-8">Inicio: {{ festividad.fecha_inicio || 'No definida' }}</div>
          <q-chip :color="festividad.estado === 'Activa' ? 'positive' : 'grey'" text-color="white" class="q-mt-sm">
            {{ (festividad.estado as string).toUpperCase() }}
          </q-chip>
        </q-card-section>
      </q-card>

      <div class="row items-center justify-between q-mb-sm">
        <div class="text-subtitle1 text-weight-bold">Categorías de Costo</div>
        <q-btn unelevated color="primary" icon="add" label="Nueva Categoría" size="sm" @click="abrirDialogoCat()" />
      </div>

      <q-table
        :rows="categorias"
        :columns="(columnasCategorias as QTableColumn[])"
        row-key="id_categoria_costo"
        flat bordered
        hide-pagination
      >
        <template #body-cell-monto="props">
          <q-td :props="props">
            Bs. {{ Number(props.row.monto_total).toFixed(2) }}
          </q-td>
        </template>

        <template #body-cell-acciones="props">
          <q-td :props="props" auto-width class="q-gutter-xs">
            <q-btn flat round icon="edit" size="sm" color="orange" @click="abrirDialogoCat(props.row)">
              <q-tooltip>Editar Categoría</q-tooltip>
            </q-btn>
            <q-btn flat round icon="delete" size="sm" color="negative" @click="confirmarEliminarCat(props.row)">
              <q-tooltip>Eliminar Categoría</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>

      <CategoriaCostoFormDialog 
        v-model="dialogoCat.abierto" 
        :categoria="dialogoCat.item" 
        :festividad-id="route.params.id as string"
        @guardado="cargarDetalles(route.params.id as string)" 
      />
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { festividadesApi } from 'src/api/festividades.api'
import AppLoadingSpinner from 'src/components/common/AppLoadingSpinner.vue'
import CategoriaCostoFormDialog from 'src/components/festividades/CategoriaCostoFormDialog.vue'
import { useQuasar } from 'quasar'
import type { QTableColumn } from 'quasar'

interface Festividad {
  nombre: string
  fecha_inicio: string
  estado: string
}

const $q = useQuasar()
const route = useRoute()
const router = useRouter()

const festividad = ref<Festividad | null>(null)
const categorias = ref<Record<string, any>[]>([])
const cargando = ref(false)

const dialogoCat = reactive({
  abierto: false,
  item: null as any
})

const columnasCategorias = [
  { name: 'nombre',      label: 'Categoría',  field: 'nombre',      align: 'left' as const, sortable: true },
  { name: 'tipo',        label: 'Tipo Fraterno', field: (row: any) => row.tipo_fraterno?.nombre || '', align: 'left' as const },
  { name: 'monto',       label: 'Monto Total (Bs)', field: 'monto_total',       align: 'left' as const, sortable: true },
  { name: 'acciones',    label: 'Acciones',   field: 'acciones',    align: 'center' as const },
]

onMounted(() => {
  cargarDetalles(route.params.id as string)
})

async function cargarDetalles(id: string | number) {
  cargando.value = true
  try {
    const res = await festividadesApi.ver(id)
    festividad.value = res.data.data || res.data
    const resCat = await festividadesApi.listarCategorias(id)
    categorias.value = resCat.data.data || resCat.data
  } finally {
    cargando.value = false
  }
}

function abrirDialogoCat(item = null) {
  dialogoCat.item = item
  dialogoCat.abierto = true
}

function confirmarEliminarCat(item: any) {
  $q.dialog({
    title: 'Eliminar Categoría',
    message: `¿Estás seguro de eliminar la categoría "${item.nombre}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await festividadesApi.eliminarCategoria(item.id_categoria_costo)
      await cargarDetalles(route.params.id as string)
    } catch (e) {
      console.error(e)
    }
  })
}
</script>
