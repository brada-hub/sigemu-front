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

// Request: inyectar token Sanctum en cada request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
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
