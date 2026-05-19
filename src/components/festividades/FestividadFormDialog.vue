<template>
  <q-dialog :model-value="modelValue" @update:model-value="actualizarValor" persistent>
    <q-card style="width: 450px; border-radius: 12px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-weight-bold">{{ festividad ? 'Editar Festividad' : 'Nueva Festividad' }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-md">
        <q-form @submit="guardar" class="q-gutter-md">
          <q-input 
            v-model="form.nombre" 
            label="Nombre de la Festividad *" 
            outlined dense 
            input-style="text-transform: uppercase"
            @update:model-value="(v: any) => form.nombre = String(v).toUpperCase()"
            :rules="[(v: string) => !!v || 'Requerido']" 
          />

          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-input v-model="form.fecha_inicio" label="Fecha Inicio *" outlined dense type="date" :rules="[(v: string) => !!v || 'Requerido']" />
            </div>
            <div class="col-6">
              <q-input v-model="form.fecha_fin" label="Fecha Fin *" outlined dense type="date" :rules="[(v: string) => !!v || 'Requerido']" />
            </div>
          </div>

          <q-select 
            v-model="form.estado" 
            :options="['Activa', 'Inactiva', 'Finalizada']" 
            label="Estado *" 
            outlined dense 
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
import { ref, reactive, watch, computed } from 'vue'
import { useFestividadesStore } from 'src/stores/festividades.store'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  festividad: { type: Object as () => Record<string, any> | null, default: null },
})

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  guardado: []
}>()

const store = useFestividadesStore()
const cargando = ref(false)

const form = reactive({
  nombre: '',
  fecha_inicio: '',
  fecha_fin: '',
  estado: 'Activa',
})

const esEdicion = computed(() => !!props.festividad)

watch(() => props.modelValue, (isOpen) => {
  if (isOpen && props.festividad) {
    const f = props.festividad
    form.nombre = f.nombre || ''
    form.fecha_inicio = f.fecha_inicio || ''
    form.fecha_fin = f.fecha_fin || ''
    form.estado = f.estado || 'Activa'
  } else if (isOpen) {
    Object.assign(form, { nombre: '', fecha_inicio: '', fecha_fin: '', estado: 'Activa' })
  }
})

function actualizarValor(val: boolean) {
  emit('update:modelValue', val)
}

async function guardar() {
  cargando.value = true
  try {
    if (esEdicion.value) {
      await store.actualizar((props.festividad as any).id_festividad, { ...form })
    } else {
      await store.crear({ ...form })
    }
    emit('guardado')
    actualizarValor(false)
  } finally {
    cargando.value = false
  }
}
</script>
