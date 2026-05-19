import { defineStore } from 'pinia'
import { ref } from 'vue'
import client from 'src/api/client'
import { useNotificacion } from 'src/composables/useNotificacion'

export const useUsuariosStore = defineStore('usuarios', () => {
  const usuarios = ref<any[]>([])
  const roles = ref<any[]>([])
  const cargando = ref(false)
  const { notificar } = useNotificacion()

  async function cargar() {
    cargando.value = true
    try {
      const { data } = await client.get('usuarios')
      usuarios.value = data
    } finally {
      cargando.value = false
    }
  }

  async function cargarRoles() {
    const { data } = await client.get('roles')
    roles.value = data
  }

  async function registrar(form: any) {
    cargando.value = true
    try {
      const { data } = await client.post('usuarios', form)
      usuarios.value.push(data)
      notificar('Usuario creado correctamente', 'positive')
      return data
    } finally {
      cargando.value = false
    }
  }

  async function actualizar(id: number, form: any) {
    cargando.value = true
    try {
      const { data } = await client.put(`usuarios/${id}`, form)
      const index = usuarios.value.findIndex(u => u.id_user === id)
      if (index !== -1) usuarios.value[index] = data
      notificar('Usuario actualizado correctamente', 'positive')
      return data
    } finally {
      cargando.value = false
    }
  }

  async function eliminar(id: number) {
    try {
      await client.delete(`usuarios/${id}`)
      const index = usuarios.value.findIndex(u => u.id_user === id)
      if (index !== -1) usuarios.value[index].activo = false
      notificar('Usuario desactivado', 'warning')
    } catch (e) {
      // Error manejado por interceptor
    }
  }

  return {
    usuarios, roles, cargando,
    cargar, cargarRoles, registrar, actualizar, eliminar
  }
})
