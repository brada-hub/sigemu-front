import { defineStore } from 'pinia'
import { ref } from 'vue'
import { pagosApi } from 'src/api/pagos.api'
import { useNotificacion } from 'src/composables/useNotificacion'

interface FiltrosPagos {
  buscar: string
  metodo_pago: string | null
  id_bloque: number | null
  fecha_inicio: string | null
  fecha_fin: string | null
}

export const usePagosStore = defineStore('pagos', () => {
  const { notificar } = useNotificacion()

  const pagos      = ref<Record<string, unknown>[]>([])
  const paginacion = ref({ page: 1, rowsPerPage: 15, rowsNumber: 0 })
  const cargando   = ref(false)
  const filtros    = ref<FiltrosPagos>({
    buscar: '',
    metodo_pago: null,
    id_bloque: null,
    fecha_inicio: null,
    fecha_fin: null
  })

  async function cargar(inscripcionId: number | string) {
    cargando.value = true
    try {
      const { data } = await pagosApi.listar(inscripcionId)
      pagos.value = data.data
    } finally {
      cargando.value = false
    }
  }

  async function cargarGlobal() {
    cargando.value = true
    try {
      const { data } = await pagosApi.listarGlobal({
        page: paginacion.value.page,
        per_page: paginacion.value.rowsPerPage,
        ...filtros.value
      })
      pagos.value = data.data
      paginacion.value.rowsNumber = data.meta?.total || data.total
    } finally {
      cargando.value = false
    }
  }

  async function registrar(inscripcionId: number | string, datos: Record<string, unknown>) {
    const { data } = await pagosApi.registrar(inscripcionId, datos)
    notificar(`Pago de Bs ${String(datos.monto)} registrado`, 'positive')
    await cargar(inscripcionId)
    return data.data
  }

  async function eliminar(inscripcionId: number | string, pagoId: number | string) {
    await pagosApi.eliminar(inscripcionId, pagoId)
    notificar('Pago eliminado y saldo recalculado', 'warning')
  }

  return { 
    pagos, paginacion, cargando, filtros,
    cargar, cargarGlobal, registrar, eliminar 
  }
})
