import { defineStore } from 'pinia'
import { ref } from 'vue'
import { festividadesApi } from 'src/api/festividades.api'

export const useFestividadesStore = defineStore('festividades', () => {
  const festividades = ref<Record<string, unknown>[]>([])
  const cargando = ref(false)

  async function cargar() {
    cargando.value = true
    try {
      const { data } = await festividadesApi.listar()
      const result = data.data ?? data
      festividades.value = Array.isArray(result) ? result : []
    } finally {
      cargando.value = false
    }
  }

  async function crear(datos: Record<string, unknown>) {
    await festividadesApi.crear(datos)
    await cargar()
  }

  async function actualizar(id: number | string, datos: Record<string, unknown>) {
    await festividadesApi.actualizar(id, datos)
    await cargar()
  }

  async function eliminar(id: number | string) {
    await festividadesApi.eliminar(id)
    await cargar()
  }

  return { festividades, cargando, cargar, crear, actualizar, eliminar }
})
