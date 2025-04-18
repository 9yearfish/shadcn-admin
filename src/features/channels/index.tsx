import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ChannelList } from '@/components/ChannelList'
import { LanguageSelector } from '@/components/LanguageSelector'
import { useI18n } from '@/lib/i18n'

export default function Channel() {
  const { t } = useI18n()

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <LanguageSelector />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>{t('channels.title')}</h2>
            <p className='text-muted-foreground'>
              Manage your channels and webhooks
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* 这里可以添加主要操作按钮，如创建频道等 */}
          </div>
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <ChannelList />
        </div>
      </Main>
    </>
  )
} 