import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const darkMode       = ref(localStorage.getItem('dark_mode') === 'true')
  const sidebarAbierto = ref(true)

  function toggleDark() {
    darkMode.value = !darkMode.value
    localStorage.setItem('dark_mode', String(darkMode.value))
  }

  function toggleSidebar() {
    sidebarAbierto.value = !sidebarAbierto.value
  }

  return { darkMode, sidebarAbierto, toggleDark, toggleSidebar }
})
