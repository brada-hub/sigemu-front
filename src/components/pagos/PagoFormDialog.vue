<template>
  <q-dialog :model-value="modelValue" @update:model-value="actualizarValor" persistent>
    <q-card style="width: 400px; border-radius: 12px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-weight-bold">Registrar Pago</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-md" v-if="inscripcion">
        <div class="bg-blue-1 q-pa-sm rounded-borders q-mb-md">
          <div class="text-caption text-grey-8">Fraterno:</div>
          <div class="text-weight-bold text-primary">
            {{ `${inscripcion?.persona?.nombres} ${inscripcion?.persona?.primer_apellido || ''}`.trim() }}
          </div>
          <div class="row q-mt-xs">
            <div class="col">
              <div class="text-caption text-grey-8">Saldo Pendiente:</div>
              <div class="text-weight-bold text-negative">Bs. {{ inscripcion?.saldo_pendiente }}</div>
            </div>
            <div class="col">
              <div class="text-caption text-grey-8">Total de la Categoría:</div>
              <div class="text-weight-bold">Bs. {{ inscripcion?.monto_asignado }}</div>
            </div>
          </div>
        </div>

        <q-form @submit="guardar" class="q-gutter-md">
          <div class="row q-col-gutter-sm">
            <q-input 
              class="col-12 col-sm-6"
              v-model.number="form.monto_pagado" 
              label="Monto a Pagar (Bs) *" 
              type="number" 
              :max="inscripcion?.saldo_pendiente"
              outlined dense 
              prefix="Bs."
              @keypress="(e: any) => { if (['-', '+', 'e', 'E'].includes(e.key)) e.preventDefault() }"
              @update:model-value="onMontoChange"
              :rules="[
                (v: any) => !!v || 'Requerido',
                (v: any) => v > 0 || 'Debe ser mayor a 0',
                (v: any) => v <= Number(inscripcion?.saldo_pendiente || 0) || 'No puede exceder el saldo'
              ]" 
            />

            <q-select
              class="col-12 col-sm-6"
              v-model="form.metodo_pago"
              :options="['Efectivo', 'Transferencia', 'QR']"
              label="Método de Pago *"
              outlined dense
              :rules="[(v: string) => !!v || 'Requerido']"
            />
          </div>

          <div class="row q-col-gutter-sm">
            <q-input 
              class="col-12"
              v-model="form.nro_comprobante" 
              label="Nro. Comprobante" 
              outlined dense 
              input-style="text-transform: uppercase"
              @update:model-value="(v: any) => form.nro_comprobante = String(v).toUpperCase()"
            />
          </div>

          <q-input 
            v-model="form.observaciones" 
            label="Observaciones" 
            outlined dense 
            type="textarea"
            rows="2"
            input-style="text-transform: uppercase"
            @update:model-value="(v: any) => form.observaciones = String(v).toUpperCase()"
          />

          <div class="row justify-end q-mt-lg q-gutter-sm">
            <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
            <q-btn type="submit" unelevated color="positive" icon="payments" label="Registrar Pago" :loading="cargando" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { pagosApi } from 'src/api/pagos.api'
import { useQuasar } from 'quasar'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  inscripcion: { type: Object as () => Record<string, any> | null, default: null },
})

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  guardado: []
}>()

const $q = useQuasar()
const cargando = ref(false)

const form = reactive({
  monto_pagado: 0,
  metodo_pago: 'Efectivo',
  fecha_pago: new Date().toISOString().split('T')[0],
  nro_comprobante: '',
  observaciones: '',
})

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    Object.assign(form, {
      monto_pagado: props.inscripcion?.saldo_pendiente || 0,
      metodo_pago: 'Efectivo',
      fecha_pago: new Date().toISOString().split('T')[0],
      nro_comprobante: '',
      observaciones: '',
    })
  }
})

function actualizarValor(val: boolean) {
  emit('update:modelValue', val)
}

async function guardar() {
  if (!props.inscripcion) return
  
  cargando.value = true
  try {
    await pagosApi.registrar(props.inscripcion.id_inscripcion, form)
    $q.notify({ message: 'Pago registrado con éxito', color: 'positive', icon: 'check' })
    emit('guardado')
    actualizarValor(false)
  } catch (e) {
    console.error(e)
  } finally {
    cargando.value = false
  }
}

function onMontoChange(val: any) {
  const max = Number(props.inscripcion?.saldo_pendiente || 0)
  if (val > max) {
    setTimeout(() => {
      form.monto_pagado = max
    }, 0)
  }
}
</script>
