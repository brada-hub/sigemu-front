import client from './client'

export const personasApi = {
  listar:      (params: Record<string, unknown>) => client.get('personas', { params }),
  ver:         (id: number | string) => client.get(`personas/${id}`),
  crear:       (datos: Record<string, unknown>) => client.post('personas', datos),
  actualizar:  (id: number | string, datos: Record<string, unknown>) => client.put(`personas/${id}`, datos),
  eliminar:    (id: number | string) => client.delete(`personas/${id}`),
  historial:   (id: number | string) => client.get(`personas/${id}/historial`),
  exportar:    (id: number | string) => client.get(`personas/${id}/exportar`, { responseType: 'blob' }),
}
