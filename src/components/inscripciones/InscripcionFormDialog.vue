<template>
  <q-dialog :model-value="modelValue" @update:model-value="actualizarValor" persistent>
    <q-card style="width: 500px; border-radius: 12px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-weight-bold">{{ modoEdicion ? 'Editar Inscripción' : 'Inscribir Fraterno' }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-md">
        <q-form @submit="guardar" class="q-gutter-md">
          <q-select
            v-model="form.persona_id"
            :options="personasOpciones"
            option-value="id_persona"
            :option-label="(opt: any) => `${opt.nombres} ${opt.primer_apellido || ''} ${opt.segundo_apellido || ''}`.trim()"
            emit-value map-options
            label="Buscar Fraterno *"
            outlined dense
            use-input
            :readonly="modoEdicion"
            :hint="modoEdicion ? 'El fraterno no se puede cambiar en modo edición' : ''"
            @filter="filtrarPersonas"
            :rules="[(v: unknown) => !!v || 'Seleccione una persona']"
          />

          <q-select
            v-model="form.id_tipo_fraterno"
            :options="tiposFraterno"
            option-value="id_tipo_fraterno"
            option-label="nombre"
            emit-value map-options
            label="Tipo de Fraterno *"
            outlined dense
            :rules="[(v: unknown) => !!v || 'Seleccione un tipo']"
          />

          <q-select
            v-model="form.id_bloque"
            :options="bloques"
            option-value="id_bloque"
            option-label="nombre"
            emit-value map-options
            label="Bloque *"
            outlined dense
            :loading="cargandoBloques"
            :rules="[(v: unknown) => !!v || 'Seleccione un bloque']"
          />

          <q-select
            v-if="categoriasFiltradas.length > 1"
            v-model="form.categoria_costo_id"
            :options="categoriasFiltradas"
            option-value="id_categoria_costo"
            option-label="nombre"
            emit-value map-options
            label="Categoría de Costo *"
            outlined dense
            :loading="cargandoCategorias"
            :rules="[(v: unknown) => !!v || 'Seleccione una categoría']"
            hint="Seleccione la categoría de costo"
          >
             <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.nombre }}</q-item-label>
                  <q-item-label caption>Costo: Bs {{ scope.opt.monto_total }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <q-input 
            v-else-if="categoriasFiltradas.length === 1"
            :model-value="categoriasFiltradas[0]?.nombre || ''"
            label="Categoría de Costo" 
            outlined dense readonly 
            hint="Categoría asignada automáticamente por Tipo de Fraterno"
          />

          <q-input 
            v-if="categoriaSeleccionada"
            :model-value="categoriaSeleccionada.monto_total"
            label="Monto Asignado (Bs)" 
            outlined dense readonly 
          />

          <div class="row justify-end q-mt-lg q-gutter-sm">
            <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
            <q-btn type="submit" unelevated color="primary" :icon="modoEdicion ? 'save' : 'person_add'" :label="modoEdicion ? 'Guardar Cambios' : 'Inscribir'" :loading="cargando" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useInscripcionesStore } from 'src/stores/inscripciones.store'
import { usePersonasStore } from 'src/stores/personas.store'
import client from 'src/api/client'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  festividadId: { type: Number, required: true },
  inscripcionAEditar: { type: Object as () => Record<string, any> | null, default: null }
})

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  guardado: []
}>()

const modoEdicion = computed(() => !!props.inscripcionAEditar)

const inscStore = useInscripcionesStore()
const persStore = usePersonasStore()

const cargando = ref(false)
const cargandoBloques = ref(false)
const cargandoCategorias = ref(false)

const personasOpciones = ref<Record<string, unknown>[]>([])
let todasLasPersonas: Record<string, unknown>[] = []

const bloques = ref<Record<string, any>[]>([])
const categorias = ref<Record<string, any>[]>([])

const tiposFraterno = ref<Record<string, any>[]>([])

const form = reactive({
  persona_id: null as number | null,
  id_tipo_fraterno: null as number | null,
  id_bloque: null as number | null,
  categoria_costo_id: null as number | null,
})

const categoriasFiltradas = computed(() => {
  if (!form.id_tipo_fraterno) return []
  return categorias.value.filter(c => c.id_tipo_fraterno === form.id_tipo_fraterno)
})

// Autoseleccionar categoría si hay solo una para el tipo elegido
watch(() => form.id_tipo_fraterno, (val) => {
  if (val) {
    const filtradas = (categorias.value as any[]).filter(c => c.id_tipo_fraterno === val)
    if (filtradas.length === 1 && filtradas[0]) {
      form.categoria_costo_id = filtradas[0].id_categoria_costo
    } else {
      form.categoria_costo_id = null
    }
  } else {
    form.categoria_costo_id = null
  }
})

const categoriaSeleccionada = computed(() => {
  return categorias.value.find(c => c.id_categoria_costo === form.categoria_costo_id)
})

onMounted(async () => {
  await persStore.cargar({ 
    per_page: 999,
    excluir_festividad: props.festividadId 
  })
  todasLasPersonas = persStore.personas
  personasOpciones.value = todasLasPersonas
  
  cargarConfiguracion()
})

async function cargarConfiguracion() {
  cargandoBloques.value = true
  cargandoCategorias.value = true
  try {
    const resTipos = await client.get('/tipos-fraternos')
    tiposFraterno.value = resTipos.data.data || resTipos.data

    const resBloques = await client.get('/bloques')
    bloques.value = resBloques.data.data || resBloques.data

    const resCat = await client.get(`/festividades/${props.festividadId}/categorias-costo`)
    categorias.value = resCat.data.data || resCat.data
  } finally {
    cargandoBloques.value = false
    cargandoCategorias.value = false
  }
}

function filtrarPersonas(val: string, update: (fn: () => void) => void) {
  if (val === '') {
    update(() => { personasOpciones.value = todasLasPersonas })
    return
  }
  update(() => {
    const needle = val.toLowerCase()
    personasOpciones.value = todasLasPersonas.filter((v: any) => {
      const nombre = (`${v.nombres} ${v.primer_apellido || ''} ${v.segundo_apellido || ''}`).trim().toLowerCase()
      const ci = (v.ci as string || '')
      return nombre.indexOf(needle) > -1 || ci.indexOf(needle) > -1
    })
  })
}

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    if (modoEdicion.value && props.inscripcionAEditar) {
      const inc = props.inscripcionAEditar
      // Asegurar que la persona exista en la lista (si viene paginada, la agregamos manualmente al select para que se vea su nombre)
      if (inc.persona && !personasOpciones.value.some((p: any) => p.id_persona === inc.persona.id_persona)) {
        personasOpciones.value.push(inc.persona)
      }
      form.persona_id = inc.persona_id
      form.id_tipo_fraterno = inc.id_tipo_fraterno
      form.id_bloque = inc.id_bloque
      // Le damos un pequeño delay para que las categorias se filtren automáticamente por el watcher de tipo_fraterno, y luego seteamos la original
      setTimeout(() => {
        form.categoria_costo_id = inc.categoria_costo_id
      }, 100)
    } else {
      form.persona_id = null
      form.id_tipo_fraterno = null
      form.id_bloque = null
      form.categoria_costo_id = null
    }
  }
})

function actualizarValor(val: boolean) {
  emit('update:modelValue', val)
}

async function guardar() {
  cargando.value = true
  try {
    const payload = {
      persona_id: form.persona_id,
      id_tipo_fraterno: form.id_tipo_fraterno,
      id_bloque: form.id_bloque,
      categoria_costo_id: form.categoria_costo_id,
      monto_asignado: categoriaSeleccionada.value?.monto_total || 0,
    }

    if (modoEdicion.value && props.inscripcionAEditar) {
      await inscStore.actualizarInscripcion(props.inscripcionAEditar.id_inscripcion, payload)
    } else {
      await inscStore.inscribir(props.festividadId, payload)
    }
    emit('guardado')
    actualizarValor(false)
  } finally {
    cargando.value = false
  }
}
</script>
