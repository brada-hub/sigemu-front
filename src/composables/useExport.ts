import { useNotificacion } from './useNotificacion'
import type { AxiosResponse } from 'axios'

export function useExport() {
  const { notificar } = useNotificacion()

  function descargarBlob(blob: Blob, nombreArchivo: string) {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', nombreArchivo)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }

  async function exportarFestividad(
    apiFn: (id: number | string, desde?: string | null, hasta?: string | null) => Promise<AxiosResponse>,
    festividadId: number | string,
    desde?: string | null,
    hasta?: string | null
  ) {
    try {
      const response = await apiFn(festividadId, desde, hasta)
      const nombre = `reporte_festividad_${festividadId}_${Date.now()}.xlsx`
      descargarBlob(response.data as Blob, nombre)
      notificar('Reporte descargado correctamente', 'positive')
    } catch {
      notificar('Error al exportar el reporte', 'negative')
    }
  }

  async function exportarPersona(
    apiFn: (id: number | string) => Promise<AxiosResponse>,
    personaId: number | string,
    ci: string
  ) {
    try {
      const response = await apiFn(personaId)
      descargarBlob(response.data as Blob, `historial_${ci}.xlsx`)
      notificar('Historial descargado', 'positive')
    } catch {
      notificar('Error al exportar', 'negative')
    }
  }

  return { exportarFestividad, exportarPersona }
}
