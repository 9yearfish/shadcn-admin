import { useI18n, languages, LanguageKey } from '@/lib/i18n/index.tsx'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { GlobeIcon } from 'lucide-react'

export function LanguageSelector() {
  const { language, setLanguage, t } = useI18n()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <GlobeIcon className="h-4 w-4" />
          <span className="sr-only">{t('settings.language')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(Object.keys(languages) as LanguageKey[]).map((key) => (
          <DropdownMenuItem
            key={key}
            onClick={() => setLanguage(key)}
            className={language === key ? 'bg-accent' : ''}
          >
            {languages[key]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 