import { defineStore } from 'pinia'
import { ref } from 'vue'
import { bloquesApi } from 'src/api/bloques.api'

export const useBloquesStore = defineStore('bloques', () => {
  const bloques = ref<Record<string, any>[]>([])
  const cargando = ref(false)

  async function cargar() {
    cargando.value = true
    try {
      const { data } = await bloquesApi.listar()
      bloques.value = data.data ?? data
    } finally {
      cargando.value = false
    }
  }

  async function crear(datos: Record<string, unknown>) {
    await bloquesApi.crear(datos)
    await cargar()
  }

  async function actualizar(id: number | string, datos: Record<string, unknown>) {
    await bloquesApi.actualizar(id, datos)
    await cargar()
  }

  async function eliminar(id: number | string) {
    await bloquesApi.eliminar(id)
    await cargar()
  }

  return { bloques, cargando, cargar, crear, actualizar, eliminar }
})
