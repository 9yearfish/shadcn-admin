import apiService from '@/lib/api'

// Define types for system configuration
export interface WebhookDomain {
  domain: string
  weight: number
}

export interface SystemConfig {
  webhook_domain: WebhookDomain[]
  // 可以在此处添加更多系统配置项
}

// API service for system configurations
const systemService = {
  // Get system configuration
  getSystemConfig: () => 
    apiService.get<SystemConfig>('/api/admin/system/config'),
    
  // 未来可以添加更多系统配置相关的API
}

export default systemService 