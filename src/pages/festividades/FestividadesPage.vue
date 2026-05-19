<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <div class="col">
        <p class="text-h6 q-mb-none">Festividades</p>
        <p class="text-caption text-grey">Gestión de eventos y gestiones</p>
      </div>
      <div class="col-auto">
        <q-btn unelevated color="primary" icon="add" label="Nueva Festividad" @click="abrirDialogo()" />
      </div>
    </div>

    <q-table
      :rows="store.festividades"
      :columns="(columnas as QTableColumn[])"
      :loading="store.cargando"
      row-key="id_festividad"
      flat bordered
      hide-pagination
    >
      <template #body-cell-estado="props">
        <q-td :props="props">
          <q-chip :color="props.row.estado === 'Activa' ? 'positive' : 'grey'" text-color="white" size="sm">
            {{ props.row.estado?.toUpperCase() }}
          </q-chip>
        </q-td>
      </template>

      <template #body-cell-acciones="props">
        <q-td :props="props" auto-width class="q-gutter-xs">
          <q-btn flat round icon="visibility" size="sm" color="primary"
            @click="router.push(`/festividades/${props.row.id_festividad}`)">
            <q-tooltip>Ver Detalles</q-tooltip>
          </q-btn>
          <q-btn flat round icon="edit" size="sm" color="orange"
            @click="abrirDialogo(props.row)">
            <q-tooltip>Editar</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <FestividadFormDialog 
      v-model="dialogo.abierto" 
      :festividad="dialogo.item" 
      @guardado="store.cargar()" 
    />
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth.store'
import { useFestividadesStore } from 'src/stores/festividades.store'
import type { QTableColumn } from 'quasar'
import FestividadFormDialog from 'src/components/festividades/FestividadFormDialog.vue'

const router = useRouter()
const auth = useAuthStore()
const store = useFestividadesStore()

const dialogo = reactive({
  abierto: false,
  item: null as any
})

const columnas = [
  { name: 'nombre',  label: 'Nombre',  field: 'nombre',  align: 'left' as const, sortable: true },
  { name: 'fecha_inicio', label: 'Inicio', field: 'fecha_inicio', align: 'left' as const, sortable: true },
  { name: 'fecha_fin', label: 'Fin', field: 'fecha_fin', align: 'left' as const, sortable: true },
  { name: 'estado',  label: 'Estado',  field: 'estado',  align: 'center' as const },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' as const },
]

function abrirDialogo(item = null) {
  dialogo.item = item
  dialogo.abierto = true
}

onMounted(() => store.cargar())
</script>
