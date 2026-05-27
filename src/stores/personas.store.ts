import { defineStore } from 'pinia'
import { ref } from 'vue'
import { personasApi } from 'src/api/personas.api'
import { useNotificacion } from 'src/composables/useNotificacion'

export const usePersonasStore = defineStore('personas', () => {
  const { notificar, notificarError } = useNotificacion()

  const personas    = ref<Record<string, unknown>[]>([])
  const persona     = ref<Record<string, unknown> | null>(null)
  const paginacion  = ref({ page: 1, rowsPerPage: 15, rowsNumber: 0 })
  const cargando    = ref(false)
  const filtros     = ref<{ buscar: string; id_sexo: number | null; id_tipo_persona: number | null }>({ buscar: '', id_sexo: null, id_tipo_persona: null })

  async function cargar(opts: Record<string, unknown> = {}) {
    cargando.value = true
    try {
      const { data } = await personasApi.listar({
        page: paginacion.value.page,
        per_page: paginacion.value.rowsPerPage,
        ...filtros.value,
        ...opts,
      })
      personas.value  = data.data
      paginacion.value.rowsNumber = data.total
    } finally {
      cargando.value = false
    }
  }

  async function cargarUna(id: number | string) {
    try {
      const { data } = await personasApi.ver(id)
      persona.value = data
    } catch (e) {
      notificarError(e)
    }
  }

  async function crear(datos: Record<string, unknown>) {
    try {
      const { data } = await personasApi.crear(datos)
      notificar('Persona registrada correctamente', 'positive')
      await cargar()
      return data
    } catch (e) {
      notificarError(e)
      throw e
    }
  }

  async function actualizar(id: number | string, datos: Record<string, unknown>) {
    try {
      const { data } = await personasApi.actualizar(id, datos)
      notificar('Persona actualizada', 'positive')
      await cargar()
      return data
    } catch (e) {
      notificarError(e)
      throw e
    }
  }

  async function eliminar(id: number | string) {
    try {
      await personasApi.eliminar(id)
      notificar('Persona eliminada', 'positive')
      await cargar()
    } catch (e) {
      notificarError(e)
    }
  }

  return {
    personas, persona, paginacion, cargando, filtros,
    cargar, cargarUna, crear, actualizar, eliminar,
  }
})
