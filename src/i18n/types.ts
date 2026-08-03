export type Locale = 'uk' | 'en' | 'de' | 'pl'

export const SUPPORTED_LOCALES: Locale[] = ['uk', 'en', 'de', 'pl']

export const LOCALE_LABELS: Record<Locale, string> = {
  uk: 'Українська',
  en: 'English',
  de: 'Deutsch',
  pl: 'Polski',
}

export type MessageParams = Record<string, string | number>

export type TFunction = (key: string, params?: MessageParams, fallback?: string) => string

export interface LocaleMessages {
  [key: string]: string | LocaleMessages
}
