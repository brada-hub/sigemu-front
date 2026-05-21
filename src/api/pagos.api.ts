import client from './client'

export const pagosApi = {
  listarGlobal: (params: Record<string, unknown>) => client.get('pagos', { params }),
  listar:    (inscripcionId: number | string) => client.get(`inscripciones/${inscripcionId}/pagos`),
  registrar: (inscripcionId: number | string, datos: Record<string, unknown>) => client.post(`inscripciones/${inscripcionId}/pagos`, datos),
  eliminar:  (inscripcionId: number | string, pagoId: number | string) => client.delete(`inscripciones/${inscripcionId}/pagos/${pagoId}`),
  ticket:    (inscripcionId: number | string, pagoId: number | string) => client.get(`inscripciones/${inscripcionId}/pagos/${pagoId}/ticket`, { responseType: 'blob' }),
}
