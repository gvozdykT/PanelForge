import { uk } from './uk'
import { en } from './en'
import { de } from './de'
import { pl } from './pl'
import type { Locale, LocaleMessages } from '../types'

export const MESSAGES: Record<Locale, LocaleMessages> = { uk, en, de, pl }
