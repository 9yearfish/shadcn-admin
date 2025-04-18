import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'

// 判断当前环境
const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

// 设置基础 URL
let baseURL = import.meta.env.VITE_API_BASE_URL || ''

// 在非本地环境下，强制使用特定的 API 域名
if (!isLocalDev) {
  baseURL = 'https://app.watchwa.com' // 请替换为您的实际 API 域名
}

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
})

// Request interceptor for adding auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('wa_token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // 清除token并跳转到登录页
      localStorage.removeItem('wa_token')
      window.location.href = '/sign-in'
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
    const response: AxiosResponse<T> = await axiosInstance({
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
const apiService = {
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