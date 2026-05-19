import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from 'src/api/auth.api'

interface Usuario {
  id_user: number
  username: string
  rol: string | Record<string, any>
  activo: boolean
  permisos?: string[]
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

  const tienePermiso = (slug: string): boolean => {
    if (!usuario.value) return false
    if (rol.value === 'admin') return true
    return usuario.value.permisos?.includes(slug) ?? false
  }

  const esAdmin         = computed(() => rol.value === 'admin' || tienePermiso('usuarios.gestionar') || tienePermiso('roles.asignar'))
  const esTesorero      = computed(() => rol.value === 'tesorero' || tienePermiso('pagos.registrar'))
  const puedeVerPagos   = computed(() => esAdmin.value || esTesorero.value || tienePermiso('pagos.ver') || tienePermiso('reportes.ver'))
  const puedeInscribir  = computed(() => esAdmin.value || rol.value === 'secretario' || tienePermiso('inscripciones.crear'))

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
    estaAutenticado, rol, esAdmin, esTesorero, puedeVerPagos, puedeInscribir, tienePermiso,
    login, logout, cargarUsuario,
  }
})
