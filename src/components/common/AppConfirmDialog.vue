<template>
  <q-dialog :model-value="modelValue" @update:model-value="actualizarValor" persistent>
    <q-card style="min-width: 350px; border-radius: 12px">
      <q-card-section class="row items-center q-pb-none">
        <q-avatar :icon="icon" :color="iconColor" text-color="white" size="42px" class="q-mr-md" />
        <div class="text-h6">{{ title }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section>
        <p class="text-body1 q-mb-none">{{ message }}</p>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancelar" v-close-popup />
        <q-btn flat :label="confirmLabel" :color="confirmColor" @click="$emit('confirmar')" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: 'Confirmar' },
  message: { type: String, default: '¿Está seguro de realizar esta acción?' },
  icon: { type: String, default: 'warning' },
  iconColor: { type: String, default: 'warning' },
  confirmLabel: { type: String, default: 'Sí, continuar' },
  confirmColor: { type: String, default: 'negative' },
})

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  confirmar: []
}>()

function actualizarValor(val: boolean) {
  emit('update:modelValue', val)
}
</script>
