import { useState, useEffect } from 'react'
import { useI18n } from '@/lib/i18n/index.tsx'
import channelService, { Channel, ChannelStatus, ChannelWebhook, SetWebhookDto, AddDaysDto } from '@/services/channelService'
import systemService, { WebhookDomain } from '@/services/systemService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ReloadIcon, CheckCircledIcon, CrossCircledIcon, ExternalLinkIcon, GearIcon, PlusIcon, CalendarIcon } from '@radix-ui/react-icons'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"

export function ChannelList() {
  const { t } = useI18n()
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(false)
  const [newChannel, setNewChannel] = useState({ name: '', description: '' })
  const [channelStatuses, setChannelStatuses] = useState<Record<string, { 
    status: string; 
    loading: boolean; 
    error: boolean;
  }>>({})
  const [webhooks, setWebhooks] = useState<Record<string, {
    url: string;
    loading: boolean;
    error: boolean;
  }>>({})
  const [webhookDomains, setWebhookDomains] = useState<WebhookDomain[]>([])
  const [configLoading, setConfigLoading] = useState(false)
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [addDaysDialogOpen, setAddDaysDialogOpen] = useState(false)
  const [addDaysData, setAddDaysData] = useState({ days: 7, comment: '' })
  const [submittingDays, setSubmittingDays] = useState(false)
  
  // Fetch channels on component mount
  useEffect(() => {
    fetchChannels()
    fetchSystemConfig()
  }, [])
  
  // Check if a date is before yesterday
  const isBeforeYesterday = (dateStr: string): boolean => {
    const date = new Date(dateStr)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0) // Start of yesterday
    return date < yesterday
  }
  
  // GET - Fetch system configuration
  const fetchSystemConfig = async () => {
    setConfigLoading(true)
    try {
      const config = await systemService.getSystemConfig()
      setWebhookDomains(config.webhook_domain || [])
    } catch (error) {
      console.error('Error fetching system config:', error)
      toast.error('Failed to load system configuration')
    } finally {
      setConfigLoading(false)
    }
  }
  
  // GET example - Fetch all channels
  const fetchChannels = async () => {
    setLoading(true)
    try {
      const data = await channelService.getChannels()
      setChannels(data)
      
      // Initialize status loading for all channels
      const initialStatuses: Record<string, { status: string; loading: boolean; error: boolean }> = {}
      data.forEach(channel => {
        // Only fetch status for channels that are not expired (active_till >= yesterday)
        if (!isBeforeYesterday(channel.active_till)) {
          initialStatuses[channel.id] = { status: 'loading', loading: true, error: false }
          fetchChannelStatus(channel.id)
        } else {
          // Set expired status for channels with active_till before yesterday
          initialStatuses[channel.id] = { status: 'expired', loading: false, error: false }
        }
      })
      setChannelStatuses(initialStatuses)
    } catch (error) {
      console.error('Error fetching channels:', error)
      toast.error(t('errors.somethingWentWrong'))
    } finally {
      setLoading(false)
    }
  }
  
  // Fetch status for a specific channel
  const fetchChannelStatus = async (channelId: string) => {
    // Get the channel
    const channel = channels.find(c => c.id === channelId)
    
    // Don't fetch if channel is expired
    if (channel && isBeforeYesterday(channel.active_till)) {
      return
    }
    
    if (channelStatuses[channelId]?.loading === false && 
        channelStatuses[channelId]?.error === false) {
      return // Don't refetch if already loaded successfully
    }
    
    setChannelStatuses(prev => ({
      ...prev,
      [channelId]: { ...prev[channelId], loading: true, error: false }
    }))
    
    try {
      const status = await channelService.getChannelStatus(channelId)
      setChannelStatuses(prev => ({
        ...prev,
        [channelId]: { status: status.status, loading: false, error: false }
      }))

      // If channel is online, fetch webhook info
      if (status.status === 'online' || status.status === 'waiting_login') {
        fetchChannelWebhook(channelId)
      }
    } catch (error) {
      console.error(`Error fetching status for channel ${channelId}:`, error)
      setChannelStatuses(prev => ({
        ...prev,
        [channelId]: { status: 'error', loading: false, error: true }
      }))
    }
  }

  // Fetch webhook for a specific channel
  const fetchChannelWebhook = async (channelId: string) => {
    // Don't refetch if already loaded successfully
    if (webhooks[channelId]?.loading === false && webhooks[channelId]?.error === false) {
      return
    }
    
    setWebhooks(prev => ({
      ...prev,
      [channelId]: { url: '', loading: true, error: false }
    }))
    
    try {
      const webhook = await channelService.getChannelWebhook(channelId)
      setWebhooks(prev => ({
        ...prev,
        [channelId]: { 
          url: webhook.webhook_url, 
          loading: false, 
          error: false 
        }
      }))
    } catch (error) {
      console.error(`Error fetching webhook for channel ${channelId}:`, error)
      setWebhooks(prev => ({
        ...prev,
        [channelId]: { url: '', loading: false, error: true }
      }))
    }
  }
  
  // Set webhook for a channel
  const setChannelWebhook = async (channelId: string, domain: string) => {
    setDialogOpen(false)
    setSelectedChannel(null)
    
    if (!channelId || !domain) return
    
    setWebhooks(prev => ({
      ...prev,
      [channelId]: { 
        ...(prev[channelId] || { url: '' }), 
        loading: true, 
        error: false 
      }
    }))
    
    try {
      const data: SetWebhookDto = { webhook_url: domain }
      const result = await channelService.setChannelWebhook(channelId, data)
      
      setWebhooks(prev => ({
        ...prev,
        [channelId]: { 
          url: result.webhook_url, 
          loading: false, 
          error: false 
        }
      }))
      
      toast.success(`Webhook set successfully for channel ${channelId}`)
    } catch (error) {
      console.error(`Error setting webhook for channel ${channelId}:`, error)
      setWebhooks(prev => ({
        ...prev,
        [channelId]: { 
          ...(prev[channelId] || { url: '' }), 
          loading: false, 
          error: true 
        }
      }))
      toast.error(`Failed to set webhook for channel ${channelId}`)
    }
  }
  
  // POST example - Create a new channel
  const handleCreateChannel = async () => {
    try {
      const data = await channelService.createChannel(newChannel)
      setChannels([...channels, data])
      setNewChannel({ name: '', description: '' })
      toast.success(t('channels.channelCreated'))
    } catch (error) {
      console.error('Error creating channel:', error)
      toast.error(t('errors.somethingWentWrong'))
    }
  }
  
  // DELETE example - Delete a channel
  const handleDeleteChannel = async (id: string) => {
    try {
      await channelService.deleteChannel(id)
      setChannels(channels.filter(channel => channel.id !== id))
      toast.success(t('channels.channelDeleted'))
    } catch (error) {
      console.error('Error deleting channel:', error)
      toast.error(t('errors.somethingWentWrong'))
    }
  }
  
  // Format date for better display - only show date without time
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toISOString().split('T')[0]  // YYYY-MM-DD format
  }

  // Open webhook dialog for a channel
  const openWebhookDialog = (channelId: string) => {
    setSelectedChannel(channelId)
    setDialogOpen(true)
  }

  // Check if domain is the current webhook URL
  const isCurrentWebhook = (channelId: string, domain: string): boolean => {
    if (!channelId || !webhooks[channelId]) return false
    return webhooks[channelId].url === domain
  }

  // Render status cell content
  const renderStatus = (channelId: string) => {
    const channelStatus = channelStatuses[channelId]
    
    if (!channelStatus) {
      return <div className="flex items-center justify-center">-</div>
    }
    
    if (channelStatus.loading) {
      return (
        <div className="flex items-center justify-center">
          <ReloadIcon className="h-4 w-4 animate-spin" />
        </div>
      )
    }
    
    if (channelStatus.error) {
      return (
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-0 h-6 text-destructive" 
          onClick={() => fetchChannelStatus(channelId)}
        >
          <CrossCircledIcon className="h-4 w-4 mr-1" />
          <span className="text-xs">Error - Retry</span>
        </Button>
      )
    }
    
    if (channelStatus.status === 'expired') {
      return (
        <div className="flex items-center text-muted-foreground">
          <CrossCircledIcon className="h-4 w-4 mr-1 opacity-70" />
          <span className="text-xs">Expired</span>
        </div>
      )
    }
    
    if (channelStatus.status === 'online' || channelStatus.status === 'waiting_login') {
      const webhook = webhooks[channelId]
      const isOnline = channelStatus.status === 'online'
      
      return (
        <div className="flex flex-col">
          <div className={`flex items-center ${isOnline ? 'text-green-600' : 'text-amber-500'}`}>
            {isOnline ? (
              <CheckCircledIcon className="h-4 w-4 mr-1" />
            ) : (
              <ReloadIcon className="h-3 w-3 mr-1" />
            )}
            <span className="text-xs">
              {isOnline ? 'Online' : 'Waiting Login'}
            </span>
          </div>
          
          {webhook && (
            <div className="mt-1">
              {webhook.loading ? (
                <span className="text-xs flex items-center">
                  <ReloadIcon className="h-3 w-3 animate-spin mr-1" />
                  Loading webhook...
                </span>
              ) : webhook.error ? (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-0 h-5 text-destructive text-xs" 
                  onClick={() => fetchChannelWebhook(channelId)}
                >
                  <CrossCircledIcon className="h-3 w-3 mr-1" />
                  <span className="text-xs">Webhook error</span>
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center text-xs text-muted-foreground cursor-pointer truncate max-w-[100px]">
                          <span className="truncate">
                            {webhook.url ? webhook.url : 'No webhook URL'}
                          </span>
                          {/* {webhook.url && <ExternalLinkIcon className="h-3 w-3 ml-1 shrink-0" />} */}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>{webhook.url || 'No webhook URL configured'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  {webhookDomains.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="p-0 h-5 text-muted-foreground" 
                      onClick={() => openWebhookDialog(channelId)}
                    >
                      <GearIcon className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )
    }
    
    return <span className="text-xs">{channelStatus.status}</span>
  }
  
  // Add days to a channel
  const addDaysToChannel = async (channelId: string) => {
    if (!channelId) return
    
    setSubmittingDays(true)
    
    try {
      // Ensure comment is 'no' if empty
      const data: AddDaysDto = { 
        days: addDaysData.days, 
        comment: addDaysData.comment.trim() || 'no'
      }
      
      const result = await channelService.addDays(channelId, data)
      
      // Update the channel in the list
      setChannels(prev => prev.map(channel => 
        channel.id === channelId
          ? { ...channel, active_till: result.active_till }
          : channel
      ))
      
      toast.success(`Added ${data.days} days to channel ${channelId}`)
      setAddDaysDialogOpen(false)
      setSelectedChannel(null)
      setAddDaysData({ days: 7, comment: '' }) // Reset form
    } catch (error) {
      console.error(`Error adding days to channel ${channelId}:`, error)
      toast.error(`Failed to add days to channel ${channelId}`)
    } finally {
      setSubmittingDays(false)
    }
  }
  
  // Open add days dialog for a channel
  const openAddDaysDialog = (channelId: string) => {
    setSelectedChannel(channelId)
    setAddDaysData({ days: 7, comment: '' }) // Reset to default values
    setAddDaysDialogOpen(true)
  }
  
  return (
    <div className="space-y-4">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Set Webhook Domain</DialogTitle>
            <DialogDescription>
              Select a domain to use for this channel's webhook.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            {webhookDomains.map((domain) => (
              <div key={domain.domain} className="flex items-center justify-between border rounded-md p-3 hover:bg-accent/5">
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="font-medium">{domain.domain}</span>
                    {domain.weight > 1 && (
                      <span className="text-xs text-muted-foreground ml-2">
                        Priority {domain.weight}
                      </span>
                    )}
                  </div>
                  {selectedChannel && isCurrentWebhook(selectedChannel, domain.domain) && (
                    <div className="text-xs text-green-600 mt-1">Current address</div>
                  )}
                </div>
                <Button 
                  size="sm"
                  className="h-7 text-xs px-2"
                  onClick={() => selectedChannel && setChannelWebhook(selectedChannel, domain.domain)}
                  variant={selectedChannel && isCurrentWebhook(selectedChannel, domain.domain) ? "outline" : "default"}
                  disabled={!!(selectedChannel && isCurrentWebhook(selectedChannel, domain.domain))}
                >
                  {selectedChannel && isCurrentWebhook(selectedChannel, domain.domain) 
                    ? "Current" 
                    : "Set as new address"}
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={addDaysDialogOpen} onOpenChange={setAddDaysDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Days to Channel</DialogTitle>
            <DialogDescription>
              Enter the number of days to add and an optional comment.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="days" className="text-right">
                Days
              </Label>
              <Input
                id="days"
                type="number"
                min="1"
                className="col-span-3"
                value={addDaysData.days}
                onChange={(e) => setAddDaysData({ ...addDaysData, days: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="comment" className="text-right">
                Comment
              </Label>
              <Input
                id="comment"
                className="col-span-3"
                placeholder="Optional comment (defaults to 'no')"
                value={addDaysData.comment}
                onChange={(e) => setAddDaysData({ ...addDaysData, comment: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={submittingDays || addDaysData.days < 1}
              onClick={() => selectedChannel && addDaysToChannel(selectedChannel)}
            >
              {submittingDays && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
              Add Days
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>{t('channels.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="channelName">{t('channels.channelName')}</Label>
              <Input
                id="channelName"
                value={newChannel.name}
                onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="channelDescription">{t('channels.channelDescription')}</Label>
              <Input
                id="channelDescription"
                value={newChannel.description}
                onChange={(e) => setNewChannel({ ...newChannel, description: e.target.value })}
              />
            </div>
          </div>
          <Button onClick={handleCreateChannel}>{t('channels.createChannel')}</Button>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center">{t('common.loading')}</div>
      ) : channels.length === 0 ? (
        <div className="text-center">{t('common.noData')}</div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Channel List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Channel ID / Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Token / Project ID</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Active Till</TableHead>
                    <TableHead>Status / Webhook</TableHead>
                    {/* <TableHead>Created At</TableHead> */}
                    {/* <TableHead>Updated At</TableHead> */}
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {channels.map((channel) => (
                    <TableRow key={channel.primary_key_id}>
                      <TableCell>{channel.primary_key_id}</TableCell>
                      <TableCell>{channel.user_id}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium" title={channel.id}>
                            {channel.id}
                          </span>
                          <span className="text-xs text-muted-foreground" title={channel.name}>
                            {channel.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{channel.phone || '-'}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs truncate" title={channel.token}>
                            {channel.token}
                          </span>
                          <span className="text-xs text-muted-foreground truncate" title={channel.project_id}>
                            {channel.project_id}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {channel.mode === 'premium' ? (
                          <Badge variant="default" className="bg-gray-800 hover:bg-gray-900">
                            Premium
                          </Badge>
                        ) : (
                          <span>{channel.mode}</span>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(channel.active_till)}</TableCell>
                      <TableCell>
                        {renderStatus(channel.id)}
                      </TableCell>
                      {/* <TableCell>{formatDate(channel.created_at)}</TableCell> */}
                      {/* <TableCell>{formatDate(channel.updated_at)}</TableCell> */}
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => openAddDaysDialog(channel.id)}
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <CalendarIcon className="h-4 w-4" />
                              </TooltipTrigger>
                              <TooltipContent side="left">
                                <p>Add Days</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 