import { ChannelList } from '@/components/ChannelList'
import { LanguageSelector } from '@/components/LanguageSelector'
import { useI18n } from '@/lib/i18n'

export default function DemoPage() {
  const { t } = useI18n()

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t('channels.title')}</h1>
        <LanguageSelector />
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">API Demo</h2>
        <p className="mb-2">
          This demo showcases different API requests:
        </p>
        <ul className="list-disc list-inside mb-4">
          <li>GET /api/admin/channels - Fetch all channels</li>
          <li>POST /api/admin/channels - Create a new channel</li>
          <li>DELETE /api/admin/channels/:id - Delete a channel</li>
        </ul>
        <p>
          The component below demonstrates these API calls and also uses the internationalization system.
        </p>
      </div>

      <ChannelList />
    </div>
  )
} 