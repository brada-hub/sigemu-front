<template>
  <div class="column items-center q-pa-xl text-center">
    <q-spinner-dots color="primary" size="50px" />
    <div class="text-body2 text-grey q-mt-md">{{ message }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  message: { type: String, default: 'Cargando...' }
})
</script>
