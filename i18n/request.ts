import { getRequestConfig } from 'next-intl/server'
import { cookies, headers } from 'next/headers'

export const locales = ['en', 'ja', 'ko'] as const
export type Locale = (typeof locales)[number]

function parseAcceptLanguage(header: string): Locale {
  const preferred = header
    .split(',')
    .map(part => {
      const [lang, q] = part.trim().split(';q=')
      return { lang: lang.trim().split('-')[0].toLowerCase(), q: q ? parseFloat(q) : 1 }
    })
    .sort((a, b) => b.q - a.q)

  for (const { lang } of preferred) {
    if (locales.includes(lang as Locale)) return lang as Locale
  }
  return 'en'
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const headerStore = await headers()

  let locale: Locale = 'en'

  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value
  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    locale = cookieLocale as Locale
  } else {
    const acceptLang = headerStore.get('accept-language')
    if (acceptLang) {
      locale = parseAcceptLanguage(acceptLang)
    }
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
