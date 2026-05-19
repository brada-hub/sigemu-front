import client from './client'

export const bloquesApi = {
  listar: () => client.get('bloques'),
  ver: (id: number | string) => client.get(`bloques/${id}`),
  crear: (datos: Record<string, unknown>) => client.post('bloques', datos),
  actualizar: (id: number | string, datos: Record<string, unknown>) => client.put(`bloques/${id}`, datos),
  eliminar: (id: number | string) => client.delete(`bloques/${id}`),
  listarFraternidades: () => client.get('fraternidades'),
}
