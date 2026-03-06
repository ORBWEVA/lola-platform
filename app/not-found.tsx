import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold gradient-text">404</h1>
        <p className="text-lg text-muted">This page doesn't exist.</p>
        <div className="flex gap-3 justify-center mt-6">
          <Link href="/" className="px-6 py-3 rounded-xl glass hover:bg-white/10 transition-colors text-sm font-medium">
            Home
          </Link>
          <Link href="/dashboard" className="px-6 py-3 rounded-xl gradient-btn text-sm font-medium">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
