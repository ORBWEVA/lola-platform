import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { logSessionEvent } from '@/lib/events'

const RATING_LABELS: Record<number, string> = {
  1: 'Not great',
  3: 'Okay',
  5: 'Loved it',
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default async function TranscriptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: session }, { data: entries }] = await Promise.all([
    supabase
      .from('sessions')
      .select('*, avatars(name, slug)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('transcript_entries')
      .select('*')
      .eq('session_id', id)
      .order('seq'),
  ])

  if (!session) notFound()

  const avatar = session.avatars as { name: string; slug: string } | null

  // Log transcript view event (non-blocking)
  logSessionEvent(supabase, {
    sessionId: id,
    userId: user.id,
    eventType: 'transcript.viewed',
  })

  // Parse structured report if session_notes is JSON
  let report: { summary?: string; topics?: string[]; keyMoment?: string; nextFocus?: string } | null = null
  if (session.session_notes) {
    try {
      const parsed = JSON.parse(session.session_notes)
      if (parsed.summary) report = parsed
    } catch {
      // Plain text summary — use as-is
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <Link href="/dashboard/sessions" className="text-sm text-muted hover:text-foreground transition-colors">
          ← Session History
        </Link>
        <h1 className="text-xl font-bold mt-2">Session with {avatar?.name ?? 'Unknown'}</h1>
        <p className="text-sm text-muted">
          {new Date(session.started_at).toLocaleString()}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="glass rounded-2xl p-3">
          <p className="text-lg font-bold">{formatDuration(session.duration_seconds)}</p>
          <p className="text-xs text-muted">Duration</p>
        </div>
        <div className="glass rounded-2xl p-3">
          <p className="text-lg font-bold">{session.credits_used ?? 0}</p>
          <p className="text-xs text-muted">Credits</p>
        </div>
        <div className="glass rounded-2xl p-3">
          <p className="text-lg font-bold">{entries?.length ?? 0}</p>
          <p className="text-xs text-muted">Messages</p>
        </div>
      </div>

      {/* Feedback rating */}
      {session.feedback_rating && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted">Your rating:</span>
          <span className={`font-medium px-2.5 py-0.5 rounded-full ${
            session.feedback_rating === 5 ? 'bg-emerald-500/15 text-emerald-400' :
            session.feedback_rating === 3 ? 'bg-amber-500/15 text-amber-400' :
            'bg-red-500/15 text-red-400'
          }`}>
            {RATING_LABELS[session.feedback_rating]}
          </span>
        </div>
      )}

      {/* Session report card OR plain summary */}
      {report ? (
        <div className="glass rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted">Session Report</h3>
          <p className="text-sm">{report.summary}</p>

          {report.topics && report.topics.length > 0 && (
            <div>
              <p className="text-xs text-muted mb-2">Topics Covered</p>
              <div className="flex flex-wrap gap-2">
                {report.topics.map((topic, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-300">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {report.keyMoment && (
            <div>
              <p className="text-xs text-muted mb-1">Key Moment</p>
              <p className="text-sm text-emerald-300">{report.keyMoment}</p>
            </div>
          )}

          {report.nextFocus && (
            <div>
              <p className="text-xs text-muted mb-1">Suggested Next Focus</p>
              <p className="text-sm text-indigo-300">{report.nextFocus}</p>
            </div>
          )}
        </div>
      ) : session.session_notes ? (
        <div className="glass rounded-2xl p-5">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted mb-2">Summary</h3>
          <p className="text-sm">{session.session_notes}</p>
        </div>
      ) : null}

      {/* Transcript */}
      <div>
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted mb-3">Transcript</h3>
        <div className="space-y-3">
          {entries?.map(entry => (
            <div
              key={entry.id}
              className={`flex ${
                entry.role === 'system' ? 'justify-center' :
                entry.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {entry.role === 'system' ? (
                <p className="text-xs text-muted italic">{entry.content}</p>
              ) : (
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                  entry.role === 'user'
                    ? 'bg-indigo-600/30 text-indigo-100 rounded-br-md'
                    : 'glass rounded-bl-md'
                }`}>
                  <span className="text-xs text-muted block mb-1">
                    {entry.role === 'user' ? 'You' : avatar?.name ?? 'Avatar'}
                  </span>
                  {entry.content}
                </div>
              )}
            </div>
          ))}
          {(!entries || entries.length === 0) && (
            <p className="text-muted text-sm text-center py-4">No transcript available for this session.</p>
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      {avatar?.slug && (
        <div className="pt-2">
          <Link
            href={`/session/${avatar.slug}`}
            className="block w-full py-3 rounded-xl gradient-btn text-center font-medium"
          >
            Talk to {avatar.name} Again
          </Link>
        </div>
      )}
    </div>
  )
}
