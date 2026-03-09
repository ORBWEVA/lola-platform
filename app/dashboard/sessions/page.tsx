import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const RATING_LABELS: Record<number, string> = {
  1: 'Not great',
  3: 'Okay',
  5: 'Loved it',
}

const STATUS_STYLES: Record<string, string> = {
  completed: 'bg-emerald-500/15 text-emerald-400',
  failed: 'bg-red-500/15 text-red-400',
  expired: 'bg-amber-500/15 text-amber-400',
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default async function SessionHistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: sessions } = await supabase
    .from('sessions')
    .select('id, avatar_id, status, duration_seconds, credits_used, feedback_rating, session_notes, started_at, ended_at, avatars(name, slug)')
    .eq('user_id', user.id)
    .in('status', ['completed', 'failed', 'expired'])
    .order('started_at', { ascending: false })
    .limit(50)

  // Get transcript counts per session
  const sessionIds = sessions?.map(s => s.id) ?? []
  let transcriptCounts: Record<string, number> = {}

  if (sessionIds.length > 0) {
    const { data: counts } = await supabase
      .from('transcript_entries')
      .select('session_id')
      .in('session_id', sessionIds)

    if (counts) {
      for (const entry of counts) {
        transcriptCounts[entry.session_id] = (transcriptCounts[entry.session_id] || 0) + 1
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-muted hover:text-foreground transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold">Session History</h1>
      </div>

      {(!sessions || sessions.length === 0) ? (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-muted">No sessions yet. Start a conversation with an avatar!</p>
          <Link href="/" className="inline-block mt-4 gradient-btn px-5 py-2.5 font-medium">
            Browse Avatars
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map(session => {
            const avatar = session.avatars as unknown as { name: string; slug: string } | null
            const msgCount = transcriptCounts[session.id] ?? 0
            const status = session.status as string

            return (
              <div key={session.id} className="glass rounded-2xl p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {avatar?.slug ? (
                      <Link href={`/avatar/${avatar.slug}`} className="font-semibold hover:underline">
                        {avatar.name}
                      </Link>
                    ) : (
                      <span className="font-semibold">Unknown Avatar</span>
                    )}
                    <p className="text-sm text-muted mt-0.5">
                      {formatDate(session.started_at)}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${STATUS_STYLES[status] ?? 'bg-white/10 text-muted'}`}>
                    {status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-sm font-bold">{formatDuration(session.duration_seconds)}</p>
                    <p className="text-xs text-muted">Duration</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold">{session.credits_used ?? 0}</p>
                    <p className="text-xs text-muted">Credits</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold">{msgCount}</p>
                    <p className="text-xs text-muted">Messages</p>
                  </div>
                </div>

                {(session.feedback_rating || session.session_notes || msgCount > 0) && (
                  <div className="border-t border-[var(--glass-border)] pt-3 space-y-1">
                    {session.feedback_rating && (
                      <p className="text-sm">
                        <span className="text-muted">Rating:</span>{' '}
                        {RATING_LABELS[session.feedback_rating] ?? session.feedback_rating}
                      </p>
                    )}
                    {session.session_notes && (() => {
                      let displayText = session.session_notes
                      try {
                        const parsed = JSON.parse(session.session_notes)
                        if (parsed.summary) displayText = parsed.summary
                      } catch { /* plain text */ }
                      return (
                        <p className="text-sm text-muted truncate">
                          {displayText.length > 100 ? `${displayText.slice(0, 100)}...` : displayText}
                        </p>
                      )
                    })()}
                    {msgCount > 0 && (
                      <Link
                        href={`/dashboard/transcripts/${session.id}`}
                        className="inline-block text-xs text-indigo-400 hover:underline mt-1"
                      >
                        View transcript →
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
