'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

interface Props {
  isLoggedIn?: boolean
}

const menuItems = [
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
]

export default function SlideMenu({ isLoggedIn }: Props) {
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const stored = localStorage.getItem('lola-theme') as 'dark' | 'light' | null
    if (stored) {
      setTheme(stored)
      document.documentElement.setAttribute('data-theme', stored)
    }
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('lola-theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  const allItems = [
    ...menuItems,
    isLoggedIn
      ? { label: 'Dashboard', href: '/dashboard' }
      : { label: 'Sign In', href: '/login' },
    { label: 'Get Started', href: '/signup' },
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
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
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
        {/* Close button */}
        <div className="flex justify-end p-4">
          <button
            onClick={close}
            className="p-2 text-white/60 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
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

        {/* Theme toggle */}
        <div className="px-6 pb-8">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 py-3 px-4 text-sm rounded-lg w-full transition-colors text-white/70 hover:text-white hover:bg-white/5"
          >
            <div className="relative w-10 h-5 rounded-full bg-white/10 border border-white/10 flex-shrink-0">
              <div
                className="absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200"
                style={{
                  left: theme === 'dark' ? '2px' : '18px',
                  background: theme === 'dark' ? '#4cc9f0' : '#ffd166',
                }}
              />
            </div>
            {theme === 'dark' ? (
              <span className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
                Dark
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                Light
              </span>
            )}
          </button>
        </div>
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
