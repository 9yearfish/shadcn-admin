import apiService from '@/lib/api'

// Define types for your API responses
export interface Channel {
  primary_key_id: number
  id: string
  user_id: number
  name: string
  phone: string
  token: string
  mode: string
  active_till: string
  project_id: string
  created_at: string
  updated_at: string
}

export interface ChannelStatus {
  channel_id: string
  status: string
  user?: {
    id: string
    name: string
    pushname: string
    is_business: boolean
    avatar: string
  }
}

export interface ChannelWebhook {
  channel_id: string
  webhook_url: string
}

export interface PaginatedResponse<T> {
  current_page: number
  data: T[]
  first_page_url: string
  from: number
  last_page: number
  last_page_url: string
  links: Array<{
    url: string | null
    label: string
    active: boolean
  }>
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number
  total: number
}

export interface CreateChannelDto {
  name: string
  description: string
}

export interface UpdateChannelDto {
  name?: string
  description?: string
}

export interface SetWebhookDto {
  webhook_url: string
}

export interface AddDaysDto {
  days: number
  comment: string
}

export interface AddDaysResponse {
  channel_id: string
  days: number
  comment: string
  active_till: string
}

// API service for channels
const channelService = {
  // Get all channels
  getChannels: () => 
    apiService.get<PaginatedResponse<Channel>>('/api/admin/channels').then(response => response.data),
  
  // Get a single channel by ID
  getChannelById: (id: string) => 
    apiService.get<Channel>(`/api/admin/channels/${id}`),
  
  // Get channel status
  getChannelStatus: (channelId: string) => 
    apiService.get<ChannelStatus>(`/api/admin/channels/${channelId}/status`),
  
  // Get channel webhook
  getChannelWebhook: (channelId: string) => 
    apiService.get<ChannelWebhook>(`/api/admin/channels/${channelId}/webhook`),
  
  // Set channel webhook
  setChannelWebhook: (channelId: string, data: SetWebhookDto) => 
    apiService.post<ChannelWebhook>(`/api/admin/channels/${channelId}/webhook`, data),
  
  // Add days to channel
  addDays: (channelId: string, data: AddDaysDto) => 
    apiService.post<AddDaysResponse>(`/api/admin/channels/${channelId}/days`, data),
  
  // Create a new channel
  createChannel: (data: CreateChannelDto) => 
    apiService.post<Channel>('/api/admin/channels', data),
  
  // Update a channel
  updateChannel: (id: string, data: UpdateChannelDto) => 
    apiService.put<Channel>(`/api/admin/channels/${id}`, data),
  
  // Partially update a channel
  patchChannel: (id: string, data: Partial<UpdateChannelDto>) => 
    apiService.patch<Channel>(`/api/admin/channels/${id}`, data),
  
  // Delete a channel
  deleteChannel: (id: string) => 
    apiService.delete<void>(`/api/admin/channels/${id}`),
}

export default channelService 