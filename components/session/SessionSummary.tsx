'use client'

import Link from 'next/link'

interface Props {
  avatarName: string
  avatarSlug: string
  duration: number
  creditsUsed: number
  transcriptCount: number
}

export default function SessionSummary({ avatarName, avatarSlug, duration, creditsUsed, transcriptCount }: Props) {
  const minutes = Math.floor(duration / 60)
  const seconds = duration % 60

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div>
          <h2 className="text-xl font-bold">Session Complete</h2>
          <p className="text-muted mt-1">with {avatarName}</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="glass rounded-2xl p-3">
            <p className="text-lg font-bold">{minutes}:{seconds.toString().padStart(2, '0')}</p>
            <p className="text-xs text-muted">Duration</p>
          </div>
          <div className="glass rounded-2xl p-3">
            <p className="text-lg font-bold">{creditsUsed}</p>
            <p className="text-xs text-muted">Credits</p>
          </div>
          <div className="glass rounded-2xl p-3">
            <p className="text-lg font-bold">{transcriptCount}</p>
            <p className="text-xs text-muted">Messages</p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <Link
            href={`/avatar/${avatarSlug}`}
            className="block w-full px-4 py-3 rounded-xl gradient-btn text-center font-medium"
          >
            Back to {avatarName}
          </Link>
          <Link
            href="/dashboard"
            className="block w-full px-4 py-3 rounded-xl glass text-center font-medium hover:bg-white/10 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
