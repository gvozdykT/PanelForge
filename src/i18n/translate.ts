import type { LocaleMessages, MessageParams, TFunction } from './types'

function getNested(messages: LocaleMessages, key: string): string | undefined {
  const value = key.split('.').reduce<unknown>((node, part) => {
    if (node && typeof node === 'object' && part in (node as LocaleMessages)) {
      return (node as LocaleMessages)[part]
    }
    return undefined
  }, messages)
  return typeof value === 'string' ? value : undefined
}

function interpolate(template: string, params?: MessageParams): string {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(params[key] ?? `{${key}}`))
}

export function createTranslator(messages: LocaleMessages): TFunction {
  return (key, params, fallback) => {
    const found = getNested(messages, key)
    if (found !== undefined) return interpolate(found, params)
    if (fallback !== undefined) {
      return typeof fallback === 'string' && params ? interpolate(fallback, params) : String(fallback)
    }
    return key
  }
}

export function detectInitialLocale(): import('./types').Locale {
  const saved = localStorage.getItem('shield-locale')
  if (saved === 'uk' || saved === 'en' || saved === 'de' || saved === 'pl') return saved

  const lang = navigator.language.slice(0, 2).toLowerCase()
  if (lang === 'uk' || lang === 'en' || lang === 'de' || lang === 'pl') return lang
  return 'uk'
}
