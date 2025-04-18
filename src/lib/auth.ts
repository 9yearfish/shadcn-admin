import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  isAuthenticated: boolean
  token: string | null
  setAuth: (token: string) => void
  clearAuth: () => void
  checkAuth: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      token: null,
      
      setAuth: (token: string) => {
        localStorage.setItem('wa_token', token)
        set({ token, isAuthenticated: true })
      },
      
      clearAuth: () => {
        localStorage.removeItem('wa_token')
        set({ token: null, isAuthenticated: false })
      },
      
      checkAuth: () => {
        const token = localStorage.getItem('wa_token')
        const isAuthenticated = !!token
        
        set({ token, isAuthenticated })
        return isAuthenticated
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
)

// 提供一个函数检查是否已认证（可以在组件外使用）
export const checkIsAuthenticated = (): boolean => {
  const token = localStorage.getItem('wa_token')
  return !!token
} 