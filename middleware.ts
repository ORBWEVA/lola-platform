import { updateSession } from '@/lib/supabase/middleware'
import { type NextRequest } from 'next/server'

const SUPPORTED_LOCALES = ['en', 'ja', 'ko']

function detectLocale(request: NextRequest): string {
  const acceptLang = request.headers.get('accept-language') || ''
  const preferred = acceptLang
    .split(',')
    .map(part => {
      const [lang, q] = part.trim().split(';q=')
      return { lang: lang.trim().split('-')[0].toLowerCase(), q: q ? parseFloat(q) : 1 }
    })
    .sort((a, b) => b.q - a.q)

  for (const { lang } of preferred) {
    if (SUPPORTED_LOCALES.includes(lang)) return lang
  }
  return 'en'
}

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)

  // Set locale cookie if not present
  if (!request.cookies.get('NEXT_LOCALE')) {
    const locale = detectLocale(request)
    response.cookies.set('NEXT_LOCALE', locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    })
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
