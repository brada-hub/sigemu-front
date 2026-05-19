import client from './client'

export const reportesApi = {
  resumen:            (festividadId: number | string) => client.get(`festividades/${festividadId}/reportes/resumen`),
  exportarFestividad: (festividadId: number | string, desde?: string | null, hasta?: string | null) =>
    client.get(`festividades/${festividadId}/exportar`, {
      params: { desde, hasta },
      responseType: 'blob',
    }),
  exportarPorBloque:    (festividadId: number | string) =>
    client.get(`festividades/${festividadId}/reportes/por-bloque`),
  exportarPorFecha:    (festividadId: number | string, desde?: string, hasta?: string) =>
    client.get(`festividades/${festividadId}/reportes/por-fecha`, { params: { desde, hasta } }),
}
