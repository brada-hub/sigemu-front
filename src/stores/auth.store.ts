import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from 'src/api/auth.api'

interface Usuario {
  id_user: number
  username: string
  rol: string
  activo: boolean
}

export const useAuthStore = defineStore('auth', () => {
  const usuario  = ref<Usuario | null>(null)
  const token    = ref<string | null>(localStorage.getItem('auth_token') ?? null)
  const cargando = ref(false)

  const estaAutenticado = computed(() => !!token.value)
  const rol             = computed(() => {
    if (!usuario.value?.rol) return null
    if (typeof usuario.value.rol === 'object') {
      return (usuario.value.rol as any).nombre?.toLowerCase() ?? null
    }
    return usuario.value.rol.toLowerCase()
  })

  const esAdmin         = computed(() => rol.value === 'admin')
  const esTesorero      = computed(() => rol.value === 'tesorero')
  const puedeVerPagos   = computed(() => ['admin', 'tesorero'].includes(rol.value ?? ''))
  const puedeInscribir  = computed(() => ['admin', 'secretario'].includes(rol.value ?? ''))

  async function login(credenciales: Record<string, string>) {
    cargando.value = true
    try {
      const { data } = await authApi.login(credenciales)
      token.value   = data.token
      usuario.value = data.usuario
      localStorage.setItem('auth_token', data.token)
    } finally {
      cargando.value = false
    }
  }

  async function cargarUsuario() {
    if (!token.value) return
    const { data } = await authApi.me()
    usuario.value = data
  }

  async function logout() {
    await authApi.logout()
    token.value   = null
    usuario.value = null
    localStorage.removeItem('auth_token')
  }

  return {
    usuario, token, cargando,
    estaAutenticado, rol, esAdmin, esTesorero, puedeVerPagos, puedeInscribir,
    login, logout, cargarUsuario,
  }
})
