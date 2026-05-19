import axios from 'axios'

const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'sigemu.xpertiaplus.com') {
      return 'https://api.sigemu.xpertiaplus.com/api';
    }
  }
  return (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000/api';
};

const client = axios.create({
  baseURL: getBaseURL(),
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
})

// Request: inyectar token Sanctum y realizar method spoofing para evitar bloqueos de hostings
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`

  // Convertir PUT/PATCH/DELETE a POST con parámetro _method
  const method = config.method?.toLowerCase()
  if (method === 'put' || method === 'patch' || method === 'delete') {
    config.method = 'post'
    const separator = config.url?.includes('?') ? '&' : '?'
    config.url = `${config.url}${separator}_method=${method.toUpperCase()}`
  }

  return config
})

// Response: manejar 401 globalmente
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error instanceof Error ? error : new Error(String(error)))
  }
)

export default client
