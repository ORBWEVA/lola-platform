import Link from 'next/link'
import SignOutButton from '@/components/SignOutButton'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative monochrome">
      <nav className="flex items-center justify-between px-6 py-4 glass-strong sticky top-0 z-50">
        <Link href="/" className="text-xl font-bold gradient-text-vivid">LoLA</Link>
        <div className="flex items-center gap-1 text-sm">
          <Link href="/dashboard" className="px-3 py-2 rounded-lg text-foreground bg-white/5 font-medium">Learner</Link>
          <Link href="/creator" className="px-3 py-2 rounded-lg text-muted hover:text-foreground hover:bg-white/5 transition-all">Creator</Link>
          <div className="w-px h-5 bg-glass-border mx-1" />
          <SignOutButton />
        </div>
      </nav>
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}
