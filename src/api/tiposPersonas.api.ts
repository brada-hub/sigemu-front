import client from './client'

export const tiposPersonasApi = {
  listar: () => client.get('tipos-personas'),
}
