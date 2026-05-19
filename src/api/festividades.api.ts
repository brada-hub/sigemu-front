import client from './client'

export const festividadesApi = {
  listar:            () => client.get('festividades'),
  ver:               (id: number | string) => client.get(`festividades/${id}`),
  crear:             (datos: Record<string, unknown>) => client.post('festividades', datos),
  actualizar:        (id: number | string, datos: Record<string, unknown>) => client.put(`festividades/${id}`, datos),
  eliminar:          (id: number | string) => client.delete(`festividades/${id}`),
  listarCategorias:  (festividadId: number | string) => client.get(`festividades/${festividadId}/categorias-costo`),
  crearCategoria:    (festividadId: number | string, datos: Record<string, unknown>) => client.post(`festividades/${festividadId}/categorias-costo`, datos),
  actualizarCategoria: (catId: number | string, datos: Record<string, unknown>) => client.put(`categorias-costo/${catId}`, datos),
  eliminarCategoria: (catId: number | string) => client.delete(`categorias-costo/${catId}`),
  listarTiposFraternos: () => client.get('tipos-fraternos'),
}
