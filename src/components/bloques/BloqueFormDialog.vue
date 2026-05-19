<template>
  <q-dialog :model-value="modelValue" @update:model-value="actualizarValor" persistent>
    <q-card style="width: 400px; border-radius: 12px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-weight-bold">{{ bloque ? 'Editar Bloque' : 'Nuevo Bloque' }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-md">
        <q-form @submit="guardar" class="q-gutter-md">
          <q-input 
            v-model="form.nombre" 
            label="Nombre del Bloque *" 
            outlined dense 
            input-style="text-transform: uppercase"
            @update:model-value="(v: any) => form.nombre = String(v).toUpperCase()"
            :rules="[(v: string) => !!v || 'Requerido']" 
          />

          <q-select 
            v-model="form.id_fraternidad" 
            :options="fraternidades" 
            option-value="id_fraternidad" 
            option-label="nombre" 
            emit-value map-options 
            label="Fraternidad *" 
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
import { bloquesApi } from 'src/api/bloques.api'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  bloque: { type: Object as () => Record<string, any> | null, default: null },
})

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  guardado: []
}>()

interface Fraternidad {
  id_fraternidad: number
  nombre: string
}

const cargando = ref(false)
const fraternidades = ref<Fraternidad[]>([])

const form = reactive({
  nombre: '',
  id_fraternidad: null as number | null,
})

const esEdicion = computed(() => !!props.bloque)

watch(() => props.modelValue, async (isOpen) => {
  if (isOpen) {
    await cargarFraternidades()
    if (props.bloque) {
      form.nombre = props.bloque.nombre || ''
      form.id_fraternidad = props.bloque.id_fraternidad || null
    } else {
      const primera = fraternidades.value[0]
      form.nombre = ''
      form.id_fraternidad = primera ? primera.id_fraternidad : null
    }
  }
})

async function cargarFraternidades() {
  try {
    const { data } = await bloquesApi.listarFraternidades()
    fraternidades.value = data.data ?? data
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
      await bloquesApi.actualizar(props.bloque!.id_bloque, form)
    } else {
      await bloquesApi.crear(form)
    }
    emit('guardado')
    actualizarValor(false)
  } finally {
    cargando.value = false
  }
}
</script>
