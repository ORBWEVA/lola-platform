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
    <div className="min-h-screen">
      <nav className="flex items-center justify-between px-4 sm:px-6 py-4 glass sticky top-0 z-50">
        <Link href="/" className="text-xl font-bold gradient-text">LoLA</Link>
        <div className="flex items-center gap-2 sm:gap-4 text-sm">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`transition-colors ${
                isActive(item)
                  ? 'text-indigo-400 font-medium'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <SignOutButton />
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  )
}
