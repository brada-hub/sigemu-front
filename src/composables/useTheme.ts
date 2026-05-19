import { ref, watch } from 'vue'
import { Dark } from 'quasar'

const STORAGE_KEY = 'sigemu_theme'

// Singleton state — shared across all components
const isDark = ref(false)

function loadTheme() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'dark') {
    isDark.value = true
  } else if (saved === 'light') {
    isDark.value = false
  } else {
    // Default: check system preference
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  applyTheme()
}

function applyTheme() {
  Dark.set(isDark.value)
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
}

function toggleTheme() {
  isDark.value = !isDark.value
  localStorage.setItem(STORAGE_KEY, isDark.value ? 'dark' : 'light')
  applyTheme()
}

// Watch for external changes
watch(isDark, () => applyTheme())

export function useTheme() {
  return { isDark, loadTheme, toggleTheme }
}
