import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global errors here (like 401 Unauthorized)
    if (error.response?.status === 401) {
      // Redirect to login or refresh token
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Generic request function
const request = async <T>(
  method: string,
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await api({
      method,
      url,
      data,
      ...config,
    })
    return response.data
  } catch (error) {
    throw error
  }
}

// Typed request methods
export const apiService = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    request<T>('get', url, undefined, config),
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    request<T>('post', url, data, config),
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    request<T>('put', url, data, config),
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    request<T>('patch', url, data, config),
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    request<T>('delete', url, undefined, config),
}

export default apiService 