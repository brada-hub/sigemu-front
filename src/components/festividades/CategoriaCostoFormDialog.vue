<template>
  <q-dialog :model-value="modelValue" @update:model-value="actualizarValor" persistent>
    <q-card style="width: 400px; border-radius: 12px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-weight-bold">{{ categoria ? 'Editar Categoría' : 'Nueva Categoría' }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-md">
        <q-form @submit="guardar" class="q-gutter-md">
          <q-input 
            v-model="form.nombre" 
            label="Nombre de la Categoría *" 
            placeholder="Ej: Cuota Completa"
            outlined dense 
            input-style="text-transform: uppercase"
            @update:model-value="(v: any) => form.nombre = String(v).toUpperCase()"
            :rules="[(v: string) => !!v || 'Requerido']" 
          />

          <q-select 
            v-model="form.id_tipo_fraterno" 
            :options="tiposFraternos" 
            option-value="id_tipo_fraterno" 
            option-label="nombre" 
            emit-value map-options 
            label="Tipo de Fraterno *" 
            outlined dense 
            :rules="[(v: any) => !!v || 'Requerido']" 
          />

          <q-input 
            v-model.number="form.monto_total" 
            label="Monto Total (Bs) *" 
            type="number" 
            outlined dense 
            prefix="Bs."
            :rules="[(v: any) => !!v || 'Requerido']" 
          />

          <div class="row justify-end q-mt-lg q-gutter-sm">
            <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
            <q-btn type="submit" unelevated color="primary" icon="save" label="Guardar" :loading="cargando" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, computed } from 'vue'
import { festividadesApi } from 'src/api/festividades.api'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  categoria: { type: Object as () => Record<string, any> | null, default: null },
  festividadId: { type: [String, Number], required: true },
})

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  guardado: []
}>()

const cargando = ref(false)
const tiposFraternos = ref([])

const form = reactive({
  nombre: '',
  id_tipo_fraterno: null as number | null,
  monto_total: 0,
})

const esEdicion = computed(() => !!props.categoria)

watch(() => props.modelValue, async (isOpen) => {
  if (isOpen) {
    await cargarTipos()
    if (props.categoria) {
      const c = props.categoria
      form.nombre = c.nombre || ''
      form.id_tipo_fraterno = c.id_tipo_fraterno || null
      form.monto_total = c.monto_total || 0
    } else {
      Object.assign(form, { nombre: '', id_tipo_fraterno: null, monto_total: 0 })
    }
  }
})

async function cargarTipos() {
  try {
    const { data } = await festividadesApi.listarTiposFraternos()
    tiposFraternos.value = data.data || data
  } catch (e) {
    console.error(e)
  }
}

function actualizarValor(val: boolean) {
  emit('update:modelValue', val)
}

async function guardar() {
  cargando.value = true
  try {
    if (esEdicion.value) {
      await festividadesApi.actualizarCategoria(props.categoria!.id_categoria_costo, { ...form })
    } else {
      await festividadesApi.crearCategoria(props.festividadId, { ...form })
    }
    emit('guardado')
    actualizarValor(false)
  } catch (e) {
    console.error(e)
  } finally {
    cargando.value = false
  }
}
</script>
