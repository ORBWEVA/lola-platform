'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

interface Props {
  isLoggedIn?: boolean
}

const locales = [
  { code: 'en', flag: '🇬🇧', label: 'EN' },
  { code: 'ja', flag: '🇯🇵', label: '日本語' },
  { code: 'ko', flag: '🇰🇷', label: '한국어' },
] as const

export default function SlideMenu({ isLoggedIn }: Props) {
  const t = useTranslations('nav')
  const tc = useTranslations('common')
  const [open, setOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [currentLocale, setCurrentLocale] = useState('en')

  useEffect(() => {
    const stored = localStorage.getItem('lola-theme') as 'dark' | 'light' | null
    if (stored) {
      setTheme(stored)
      document.documentElement.setAttribute('data-theme', stored)
    }
    const match = document.cookie.match(/NEXT_LOCALE=(\w+)/)
    if (match) setCurrentLocale(match[1])
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('lola-theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  const close = useCallback(() => { setOpen(false); setLangOpen(false) }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  const switchLocale = (locale: string) => {
    document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000`
    window.location.reload()
  }

  const menuItems = [
    { label: t('howItWorks'), href: '/how-it-works' },
    { label: t('features'), href: '/features' },
    { label: t('pricing'), href: '/pricing' },
  ]

  const allItems = [
    ...menuItems,
    ...(isLoggedIn
      ? [
          { label: t('createAvatar'), href: '/creator/avatars/new' },
          { label: t('dashboard'), href: '/dashboard' },
        ]
      : [{ label: tc('signIn'), href: '/login' }]),
  ]

  return (
    <>
      {/* Plus button */}
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-full text-white/80 hover:text-white transition-colors"
        aria-label="Open menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={close}
        />
      )}

      {/* Panel — always dark */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-72 backdrop-blur-xl border-l border-white/[0.08] transition-transform duration-300 ease-out flex flex-col ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ background: 'rgba(10, 10, 26, 0.95)' }}
      >
        {/* Top bar: theme toggle (left) + lang + close (right) */}
        <div className="flex items-center justify-between p-4">
          <button
            onClick={toggleTheme}
            className="p-2 text-white/50 hover:text-white transition-colors"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
          <div className="flex items-center gap-1">
            {/* Language — flag + chevron dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 p-2 text-white/60 hover:text-white transition-colors"
                aria-label="Change language"
              >
                <span className="text-base leading-none">{locales.find(l => l.code === currentLocale)?.flag ?? '🇬🇧'}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${langOpen ? 'rotate-180' : ''}`}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 py-1 rounded-lg border border-white/[0.08] min-w-[120px]" style={{ background: 'rgba(10, 10, 26, 0.95)' }}>
                  {locales.map((loc) => (
                    <button
                      key={loc.code}
                      onClick={() => { setLangOpen(false); switchLocale(loc.code) }}
                      className={`flex items-center gap-2.5 w-full px-3 py-2 text-xs transition-colors ${
                        currentLocale === loc.code
                          ? 'text-white bg-white/10'
                          : 'text-white/50 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span className="text-sm leading-none">{loc.flag}</span>
                      <span>{loc.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={close}
              className="p-2 text-white/50 hover:text-white transition-colors"
              aria-label="Close menu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-6 py-4">
          <ul className="space-y-2">
            {allItems.map((item, i) => (
              <li
                key={item.href}
                className={open ? 'animate-[slideIn_0.6s_cubic-bezier(0.16,1,0.3,1)_both]' : 'opacity-0'}
                style={{ animationDelay: open ? `${150 + i * 80}ms` : '0ms' }}
              >
                <Link
                  href={item.href}
                  onClick={close}
                  className="block py-3 px-4 text-lg font-light text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

        </nav>

      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  )
}
