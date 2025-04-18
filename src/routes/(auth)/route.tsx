import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { checkIsAuthenticated } from '@/lib/auth'

export const Route = createFileRoute('/(auth)')({
  beforeLoad: () => {
    // 如果已登录，重定向到主页
    if (checkIsAuthenticated()) {
      throw redirect({
        to: '/',
        replace: true,
      })
    }
  },
  component: AuthLayout,
})

function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Outlet />
    </div>
  )
} 