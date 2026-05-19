import client from './client'

export const rolesApi = {
  listar() {
    return client.get('/roles')
  },
  listarPermisos() {
    return client.get('/permisos')
  },
  actualizarPermisos(id: number, data: { permisos: number[] }) {
    return client.put(`/roles/${id}`, data)
  },
  crear(data: { nombre: string }) {
    return client.post('/roles', data)
  },
  eliminar(id: number) {
    return client.delete(`/roles/${id}`)
  }
}
