<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <div class="col">
        <p class="text-h6 q-mb-none">Gestión de Bloques</p>
        <p class="text-caption text-grey">Administración de bloques de la fraternidad</p>
      </div>
      <div class="col-auto">
        <q-btn unelevated color="primary" icon="add" label="Nuevo Bloque" @click="abrirDialogo()" />
      </div>
    </div>

    <q-table
      :rows="store.bloques"
      :columns="(columnas as QTableColumn[])"
      row-key="id_bloque"
      flat bordered
      :loading="store.cargando"
    >
      <template #body-cell-fraternidad="props">
        <q-td :props="props">
          {{ props.row.fraternidad?.nombre }}
        </q-td>
      </template>

      <template #body-cell-acciones="props">
        <q-td :props="props" auto-width class="q-gutter-xs">
          <q-btn flat round icon="edit" size="sm" color="orange" @click="abrirDialogo(props.row)">
            <q-tooltip>Editar Bloque</q-tooltip>
          </q-btn>
          <q-btn flat round icon="delete" size="sm" color="negative" @click="confirmarEliminar(props.row)">
            <q-tooltip>Eliminar Bloque</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <BloqueFormDialog 
      v-model="dialogo.abierto" 
      :bloque="dialogo.item" 
      @guardado="store.cargar()" 
    />
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { useBloquesStore } from 'src/stores/bloques.store'
import { useQuasar, type QTableColumn } from 'quasar'
import BloqueFormDialog from 'src/components/bloques/BloqueFormDialog.vue'

const store = useBloquesStore()
const $q = useQuasar()

const dialogo = reactive({
  abierto: false,
  item: null as any
})

const columnas = [
  { name: 'nombre',      label: 'Nombre del Bloque', field: 'nombre',      align: 'left' as const, sortable: true },
  { name: 'fraternidad', label: 'Fraternidad',      field: 'fraternidad', align: 'left' as const },
  { name: 'acciones',    label: 'Acciones',         field: 'acciones',    align: 'center' as const },
]

onMounted(() => store.cargar())

function abrirDialogo(item = null) {
  dialogo.item = item
  dialogo.abierto = true
}

function confirmarEliminar(item: any) {
  $q.dialog({
    title: 'Eliminar Bloque',
    message: `¿Estás seguro de eliminar el bloque "${item.nombre}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await store.eliminar(item.id_bloque)
    } catch (e) {
      console.error(e)
    }
  })
}
</script>
