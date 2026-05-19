<template>
  <q-dialog :model-value="modelValue" @update:model-value="actualizarValor" persistent>
    <q-card style="width: 500px; border-radius: 12px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-weight-bold">{{ persona ? 'Editar Persona' : 'Nueva Persona' }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-md">
        <q-form @submit="guardar" class="q-gutter-md">
          <q-input 
            v-model="form.nombres" 
            label="Nombres *" 
            outlined dense 
            input-style="text-transform: uppercase"
            @update:model-value="(v: any) => form.nombres = String(v).replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, '').toUpperCase()"
            :rules="[
              (v: string) => !!v || 'Requerido'
            ]" 
          />
          <q-input 
            v-model="form.primer_apellido" 
            label="Primer Apellido *" 
            outlined dense 
            input-style="text-transform: uppercase"
            @update:model-value="(v: any) => form.primer_apellido = String(v).replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, '').toUpperCase()"
            :rules="[(v: string) => !!v || 'Requerido']"
          />
          <q-input 
            v-model="form.segundo_apellido" 
            label="Segundo Apellido" 
            outlined dense 
            input-style="text-transform: uppercase"
            @update:model-value="(v: any) => form.segundo_apellido = String(v).replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, '').toUpperCase()"
          />
          <q-input 
            v-model="form.ci" 
            label="Carnet de Identidad *" 
            outlined dense 
            input-style="text-transform: uppercase"
            @update:model-value="(v: any) => form.ci = String(v).replace(/[^a-zA-Z0-9-]/g, '').toUpperCase()"
            :rules="[
              (v: string) => !!v || 'Requerido'
            ]" 
          />
          <q-input 
            v-model="form.celular" 
            label="Celular *" 
            outlined dense 
            mask="########"
            placeholder="7XXXXXXX"
            @update:model-value="(v: any) => {
              if (v && v.length > 0 && !['6', '7'].includes(v[0])) {
                form.celular = ''
              } else {
                form.celular = v
              }
            }"
            :rules="[
              (v: string) => !!v || 'Requerido',
              (v: string) => !v || v.length === 8 || 'Debe tener 8 dígitos'
            ]"
          />
          
          <div>
            <q-input 
              v-model="form.correo_personal" 
              label="Correo Electrónico *" 
              type="email" 
              outlined dense 
              :rules="[
                (v: string) => !!v || 'Requerido',
                (v: string) => /.+@.+\..+/.test(v) || 'Correo inválido'
              ]"
            />
            <div class="row q-gutter-xs q-mt-xs">
              <q-btn 
                v-for="domain in ['@unitepc.edu.bo', '@gmail.com', '@outlook.com']" 
                :key="domain"
                size="xs" 
                outline 
                color="grey-7" 
                :label="domain"
                @click="completarEmail(domain)"
                tabindex="-1"
              />
            </div>
          </div>

          <q-select 
            v-model="form.id_sexo" 
            :options="sexos" 
            option-value="id_sexo" 
            option-label="sexo" 
            emit-value map-options 
            label="Sexo *" 
            outlined dense 
            :rules="[(v: any) => !!v || 'El sexo es requerido']" 
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
import { usePersonasStore } from 'src/stores/personas.store'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  persona: { type: Object as () => Record<string, unknown> | null, default: null },
})

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  guardado: []
}>()

const store = usePersonasStore()
const cargando = ref(false)

const sexos = ref([
  { id_sexo: 1, sexo: 'Masculino' },
  { id_sexo: 2, sexo: 'Femenino' }
])

const form = reactive({
  nombres: '',
  primer_apellido: '',
  segundo_apellido: '',
  ci: '',
  celular: '',
  correo_personal: '',
  id_sexo: null as number | null,
})

const esEdicion = computed(() => !!props.persona)

watch(() => props.modelValue, (isOpen) => {
  if (isOpen && props.persona) {
    const p = props.persona as Record<string, any>
    form.nombres = (p.nombres || '').toUpperCase()
    form.primer_apellido = (p.primer_apellido || '').toUpperCase()
    form.segundo_apellido = (p.segundo_apellido || '').toUpperCase()
    form.ci = (p.ci || '').toUpperCase()
    form.celular = p.celular || ''
    form.correo_personal = p.correo_personal || ''
    form.id_sexo = p.id_sexo || null
  } else if (isOpen) {
    Object.assign(form, { nombres: '', primer_apellido: '', segundo_apellido: '', ci: '', celular: '', correo_personal: '', id_sexo: null })
  }
})

function actualizarValor(val: boolean) {
  emit('update:modelValue', val)
}

function completarEmail(dominio: string) {
  if (!form.correo_personal.includes('@')) {
    form.correo_personal += dominio
  } else {
    // Si ya tiene un @, reemplazamos lo que sigue del @
    const [user] = form.correo_personal.split('@')
    form.correo_personal = user + dominio
  }
}

async function guardar() {
  cargando.value = true
  try {
    // Normalizar a uppercase antes de enviar por si acaso
    const payload = {
      ...form,
      nombres: form.nombres.toUpperCase().trim(),
      primer_apellido: form.primer_apellido.toUpperCase().trim(),
      segundo_apellido: form.segundo_apellido.toUpperCase().trim(),
      ci: form.ci.toUpperCase().trim(),
    }

    if (esEdicion.value) {
      await store.actualizar((props.persona as Record<string, unknown>).id_persona as number, payload)
    } else {
      await store.crear(payload)
    }
    emit('guardado')
    actualizarValor(false)
  } finally {
    cargando.value = false
  }
}
</script>
