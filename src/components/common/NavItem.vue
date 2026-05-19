<template>
  <q-item
    clickable
    v-ripple
    :to="to"
    class="nav-item q-mx-sm q-my-xs"
    :class="[dark ? 'nav-item--dark' : 'nav-item--light']"
    active-class="nav-item--active"
  >
    <q-item-section avatar>
      <q-icon :name="icon" size="20px" />
    </q-item-section>
    <q-item-section>
      <q-item-label class="text-weight-medium" style="font-size: 0.88rem">{{ label }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
defineProps({
  to:    { type: String, required: true },
  icon:  { type: String, required: true },
  label: { type: String, required: true },
  dark:  { type: Boolean, default: false },
})
</script>

<style scoped>
.nav-item {
  transition: all 0.2s ease;
  min-height: 42px;
  border-radius: 10px !important;
}

/* ── DARK MODE ── */
.nav-item--dark {
  color: rgba(255, 255, 255, 0.6) !important;
}
.nav-item--dark:hover {
  background: rgba(79, 39, 137, 0.3) !important;
  color: rgba(255, 255, 255, 0.95) !important;
}
.nav-item--dark.nav-item--active {
  background: linear-gradient(135deg, rgba(79,39,137,0.55), rgba(0,194,203,0.35)) !important;
  color: #fff !important;
  font-weight: 700;
  box-shadow: 0 2px 12px rgba(79, 39, 137, 0.35);
}
.nav-item--dark.nav-item--active .q-icon {
  color: #00c2cb !important;
}

/* ── LIGHT MODE (gradient sidebar = white text) ── */
.nav-item--light {
  color: rgba(255, 255, 255, 0.7) !important;
}
.nav-item--light:hover {
  background: rgba(255, 255, 255, 0.15) !important;
  color: #fff !important;
}
.nav-item--light.nav-item--active {
  background: rgba(255, 255, 255, 0.2) !important;
  color: #fff !important;
  font-weight: 700;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(4px);
}
.nav-item--light.nav-item--active .q-icon {
  color: #fff !important;
}
</style>
