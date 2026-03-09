'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import SignOutButton from '@/components/SignOutButton'

const TABS = [
  { href: '/creator', label: 'Overview', exact: true },
  { href: '/creator/avatars', label: 'Avatars' },
  { href: '/creator/analytics', label: 'Analytics' },
  { href: '/creator/products', label: 'Products' },
]

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const isActive = (item: typeof TABS[number]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)

  return (
    <div className="min-h-screen relative monochrome">
      <nav className="flex items-center justify-between px-4 sm:px-6 py-4 glass-strong sticky top-0 z-50">
        <Link href="/" className="text-xl font-bold gradient-text-vivid">LoLA</Link>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(prev => !prev)}
            className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-white/5 transition-colors"
            aria-label="Menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              {menuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <circle cx="12" cy="5" r="1" fill="currentColor" />
                  <circle cx="12" cy="12" r="1" fill="currentColor" />
                  <circle cx="12" cy="19" r="1" fill="currentColor" />
                </>
              )}
            </svg>
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl glass p-1.5 z-50 shadow-xl text-sm">
                <Link
                  href="/"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-muted hover:text-foreground hover:bg-white/5 transition-colors"
                >
                  Home
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-muted hover:text-foreground hover:bg-white/5 transition-colors"
                >
                  Learner Dashboard
                </Link>
                <div className="border-t border-glass-border my-1.5" />
                <div className="px-1">
                  <SignOutButton />
                </div>
              </div>
            </>
          )}
        </div>
      </nav>
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold mb-4">Creator Dashboard</h1>
        <div className="flex items-center gap-1 text-sm mb-6 border-b border-glass-border pb-3">
          {TABS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 rounded-full transition-all ${
                isActive(item)
                  ? 'text-foreground bg-white/5 font-medium border border-glass-border'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
        {children}
      </main>
    </div>
  )
}
