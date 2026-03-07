'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import SignOutButton from '@/components/SignOutButton'

const NAV_ITEMS = [
  { href: '/', label: 'Browse', exact: true },
  { href: '/dashboard', label: 'Dashboard', exact: true },
  { href: '/creator', label: 'Creator', exact: true },
  { href: '/creator/avatars', label: 'Avatars' },
  { href: '/creator/products', label: 'Products' },
]

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const isActive = (item: typeof NAV_ITEMS[number]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)

  return (
    <div className="min-h-screen relative">
      <nav className="flex items-center justify-between px-4 sm:px-6 py-4 glass-strong sticky top-0 z-50">
        <Link href="/" className="text-xl font-bold gradient-text-vivid">LoLA</Link>
        <div className="flex items-center gap-1 text-sm">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 rounded-lg transition-all ${
                isActive(item)
                  ? 'text-foreground bg-white/5 font-medium'
                  : 'text-muted hover:text-foreground hover:bg-white/5'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="w-px h-5 bg-glass-border mx-1" />
          <SignOutButton />
        </div>
      </nav>
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  )
}
