<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-caption text-grey">{{ label }}</div>
      <div class="text-h5 text-weight-bold" :class="color ? `text-${color}` : ''">{{ valor }}</div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
defineProps({
  label: { type: String, required: true },
  valor: { type: [String, Number], required: true },
  color: { type: String, default: '' },
})
</script>
