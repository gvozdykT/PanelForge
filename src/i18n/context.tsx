import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { MESSAGES } from './locales'
import { createTranslator, detectInitialLocale } from './translate'
import type { Locale, MessageParams, TFunction } from './types'

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: TFunction
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const initial = detectInitialLocale()
    document.documentElement.lang = initial
    return initial
  })

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    localStorage.setItem('shield-locale', next)
    document.documentElement.lang = next
  }, [])

  const t = useMemo(() => createTranslator(MESSAGES[locale]), [locale])

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}

import { localizedTag } from './catalog'

export function useTagLabel(kind: 'load' | 'system', key: string): string {
  const { t } = useI18n()
  return localizedTag(t, kind, key)
}

export { type Locale, type TFunction, type MessageParams }
