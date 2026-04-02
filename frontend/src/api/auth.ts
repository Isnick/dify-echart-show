import axios from 'axios'
import { getToken, removeToken } from '../utils/auth'
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
})

api.interceptors.request.use(config => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      removeToken()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const register = (data: RegisterRequest) =>
  api.post<AuthResponse>('/api/auth/register', data)

export const login = (data: LoginRequest) =>
  api.post<AuthResponse>('/api/auth/login', data)

export default api
