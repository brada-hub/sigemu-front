<template>
  <div class="column items-center q-pa-xl text-center text-grey-6">
    <q-icon :name="icon" size="64px" class="q-mb-md" />
    <div class="text-h6 text-grey-8 q-mb-sm">{{ title }}</div>
    <div class="text-body2">{{ message }}</div>
    <q-btn v-if="actionLabel" flat color="primary" :label="actionLabel" class="q-mt-md" @click="$emit('action')" />
  </div>
</template>

<script setup lang="ts">
defineProps({
  icon: { type: String, default: 'inbox' },
  title: { type: String, default: 'No hay datos' },
  message: { type: String, default: '' },
  actionLabel: { type: String, default: '' },
})

defineEmits<{ action: [] }>()
</script>
