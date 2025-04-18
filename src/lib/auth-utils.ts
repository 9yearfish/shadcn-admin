import { redirect } from '@tanstack/react-router'
import { checkIsAuthenticated } from './auth'

/**
 * 重定向到认证路由或登录页面
 * 此函数应在路由的 beforeLoad 中调用
 */
export function redirectBasedOnAuth() {
  if (checkIsAuthenticated()) {
    // 已登录，重定向到仪表盘
    window.location.href = '/_authenticated/'
    return null
  } else {
    // 未登录，重定向到登录页面
    window.location.href = '/sign-in'
    return null
  }
} 