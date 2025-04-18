import { createContext, useContext, useState, ReactNode } from 'react'
import Cookies from 'js-cookie'
import en from './locales/en'
import zh from './locales/zh'

// Define available languages
export const languages = {
  en: 'English',
  zh: 'Chinese',
} as const

export type LanguageKey = keyof typeof languages

// Define translations
const translations = {
  en,
  zh,
} as const

// Create a context for the language
type I18nContextType = {
  language: LanguageKey
  setLanguage: (language: LanguageKey) => void
  t: (key: string) => string
}

const defaultLanguage = (Cookies.get('language') as LanguageKey) || 'en'

export const I18nContext = createContext<I18nContextType>({
  language: defaultLanguage,
  setLanguage: () => {},
  t: (key) => key,
})

// Provider component
export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<LanguageKey>(defaultLanguage)

  const changeLanguage = (newLanguage: LanguageKey) => {
    setLanguage(newLanguage)
    Cookies.set('language', newLanguage, { expires: 365 })
  }

  // Translation function
  const t = (key: string): string => {
    const keys = key.split('.')
    let value: any = translations[language]
    
    for (const k of keys) {
      if (value === undefined) return key
      value = value[k]
    }
    
    return value || key
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </I18nContext.Provider>
  )
}

// Hook to use the i18n context
export const useI18n = () => {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
} 