import Link from 'next/link'

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <nav className="flex items-center justify-between px-6 py-4 glass sticky top-0 z-50">
        <Link href="/" className="text-xl font-bold gradient-text">LoLA</Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/dashboard" className="text-muted hover:text-foreground transition-colors">Dashboard</Link>
          <Link href="/creator" className="text-foreground hover:text-indigo-400 transition-colors">Creator</Link>
          <Link href="/creator/avatars" className="text-muted hover:text-foreground transition-colors">Avatars</Link>
          <Link href="/creator/products" className="text-muted hover:text-foreground transition-colors">Products</Link>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}
