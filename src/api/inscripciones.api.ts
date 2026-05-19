import client from './client'

export const inscripcionesApi = {
  listar:  (festividadId: number | string, params: Record<string, unknown>) => client.get(`festividades/${festividadId}/inscripciones`, { params }),
  crear:   (festividadId: number | string, datos: Record<string, unknown>) => client.post(`festividades/${festividadId}/inscripciones`, datos),
  obtener: (id: number | string) => client.get(`inscripciones/${id}`),
}
