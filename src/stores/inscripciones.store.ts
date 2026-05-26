import { defineStore } from 'pinia'
import { ref } from 'vue'
import { inscripcionesApi } from 'src/api/inscripciones.api'
import { useNotificacion } from 'src/composables/useNotificacion'

interface FiltrosInscripcion {
  id_tipo_fraterno: number | null
  estado_pago: string | null
  id_bloque: number | null
  buscar: string
}

export const useInscripcionesStore = defineStore('inscripciones', () => {
  const { notificar } = useNotificacion()

  const inscripciones = ref<Record<string, unknown>[]>([])
  const paginacion    = ref({ page: 1, rowsPerPage: 15, rowsNumber: 0 })
  const cargando      = ref(false)
  const filtros       = ref<FiltrosInscripcion>({ 
    id_tipo_fraterno: null, 
    estado_pago: null, 
    id_bloque: null,
    buscar: '' 
  })

  async function cargar(festividadId: number | string) {
    cargando.value = true
    try {
      const { data } = await inscripcionesApi.listar(festividadId, {
        page: paginacion.value.page,
        per_page: paginacion.value.rowsPerPage,
        ...filtros.value,
      })
      inscripciones.value = data.data
      paginacion.value.rowsNumber = data.meta?.total || data.total
    } finally {
      cargando.value = false
    }
  }

  async function inscribir(festividadId: number | string, datos: Record<string, unknown>) {
    const { data } = await inscripcionesApi.crear(festividadId, {
      ...datos,
      festividad_id: festividadId
    })
    notificar('Fraterno inscrito correctamente', 'positive')
    return data.data || data
  }

  async function retirar(id: number | string) {
    try {
      await inscripcionesApi.retirar(id)
      notificar('Fraterno retirado correctamente', 'positive')
    } catch (error: any) {
      notificar(error.response?.data?.message || 'Error al retirar el fraterno', 'negative')
      throw error
    }
  }
  async function actualizarInscripcion(id: number | string, datos: Record<string, unknown>) {
    cargando.value = true
    try {
      const { data } = await inscripcionesApi.actualizar(id, datos)
      notificar('Inscripción actualizada correctamente', 'positive')
      return data.data || data
    } finally {
      cargando.value = false
    }
  }

  return {
    inscripciones, paginacion, cargando, filtros,
    cargar, inscribir, retirar, actualizarInscripcion
  }
})
