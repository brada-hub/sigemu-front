import client from './client'

export const authApi = {
  login:  (credenciales: Record<string, string>) => client.post('auth/login', credenciales),
  logout: () => client.post('auth/logout'),
  me:     () => client.get('auth/me'),
}
