import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'

const RATING_LABELS: Record<number, string> = {
  1: 'Not great',
  3: 'Okay',
  5: 'Loved it',
}

export default async function CreatorAnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get all avatars for this creator
  const { data: avatars } = await supabase
    .from('avatars')
    .select('id, name, slug, anchor_image_url, domain')
    .eq('creator_id', user.id)
    .order('created_at', { ascending: false })

  if (!avatars || avatars.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <p className="text-muted">Create an avatar first to see analytics.</p>
      </div>
    )
  }

  const avatarIds = avatars.map(a => a.id)

  // Get all completed sessions for these avatars
  const { data: sessions } = await supabase
    .from('sessions')
    .select('avatar_id, duration_seconds, feedback_rating, feedback_text, session_notes, ended_at')
    .in('avatar_id', avatarIds)
    .eq('status', 'completed')
    .order('ended_at', { ascending: false })

  // Aggregate per avatar
  const statsMap: Record<string, {
    sessionCount: number
    totalMinutes: number
    ratings: number[]
    recentFeedback: { rating: number; text: string | null; date: string }[]
    recentNotes: string[]
  }> = {}

  for (const a of avatars) {
    statsMap[a.id] = { sessionCount: 0, totalMinutes: 0, ratings: [], recentFeedback: [], recentNotes: [] }
  }

  for (const s of sessions || []) {
    const stats = statsMap[s.avatar_id]
    if (!stats) continue
    stats.sessionCount++
    stats.totalMinutes += Math.floor((s.duration_seconds || 0) / 60)
    if (s.feedback_rating) {
      stats.ratings.push(s.feedback_rating)
      if (stats.recentFeedback.length < 5) {
        stats.recentFeedback.push({
          rating: s.feedback_rating,
          text: s.feedback_text,
          date: s.ended_at,
        })
      }
    }
    if (s.session_notes && stats.recentNotes.length < 3) {
      stats.recentNotes.push(s.session_notes)
    }
  }

  return (
    <div className="space-y-6">
      {avatars.map(avatar => {
        const stats = statsMap[avatar.id]
        const avgRating = stats.ratings.length > 0
          ? Math.round((stats.ratings.reduce((s, r) => s + r, 0) / stats.ratings.length) * 10) / 10
          : null

        return (
          <div key={avatar.id} className="glass rounded-2xl p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                {avatar.anchor_image_url ? (
                  <Image src={avatar.anchor_image_url} alt={avatar.name} width={40} height={40} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-emerald-600" />
                )}
              </div>
              <div>
                <h3 className="font-semibold">{avatar.name}</h3>
                <p className="text-xs text-muted">{avatar.domain}</p>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="stat-card rounded-xl p-3">
                <p className="text-xl font-bold">{stats.sessionCount}</p>
                <p className="text-xs text-muted">Sessions</p>
              </div>
              <div className="stat-card rounded-xl p-3">
                <p className="text-xl font-bold">{stats.totalMinutes}</p>
                <p className="text-xs text-muted">Minutes</p>
              </div>
              <div className="stat-card rounded-xl p-3">
                <p className="text-xl font-bold">{avgRating ?? '—'}</p>
                <p className="text-xs text-muted">Avg Rating</p>
              </div>
            </div>

            {/* Rating distribution */}
            {stats.ratings.length > 0 && (
              <div>
                <p className="text-xs text-muted mb-2">Rating Distribution</p>
                <div className="flex gap-2">
                  {[1, 3, 5].map(r => {
                    const count = stats.ratings.filter(v => v === r).length
                    const pct = Math.round((count / stats.ratings.length) * 100)
                    return (
                      <div key={r} className="flex-1">
                        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${r === 1 ? 'bg-red-400' : r === 3 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted mt-1 text-center">{RATING_LABELS[r]} ({count})</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Recent feedback */}
            {stats.recentFeedback.length > 0 && (
              <div>
                <p className="text-xs text-muted mb-2">Recent Feedback</p>
                <div className="space-y-2">
                  {stats.recentFeedback.map((f, i) => (
                    <div key={i} className="text-sm flex items-start gap-2">
                      <span className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
                        f.rating === 5 ? 'bg-emerald-500/15 text-emerald-400' :
                        f.rating === 3 ? 'bg-amber-500/15 text-amber-400' :
                        'bg-red-500/15 text-red-400'
                      }`}>
                        {RATING_LABELS[f.rating]}
                      </span>
                      <span className="text-muted truncate">{f.text || '(no comment)'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Session summaries */}
            {stats.recentNotes.length > 0 && (
              <div>
                <p className="text-xs text-muted mb-2">Session Summaries</p>
                <div className="space-y-1.5">
                  {stats.recentNotes.map((note, i) => {
                    let displayText = note
                    try {
                      const parsed = JSON.parse(note)
                      if (parsed.summary) displayText = parsed.summary
                    } catch { /* plain text */ }
                    return <p key={i} className="text-sm text-muted/80 truncate">{displayText}</p>
                  })}
                </div>
              </div>
            )}

            {/* Empty state */}
            {stats.sessionCount === 0 && (
              <p className="text-sm text-muted text-center py-2">No sessions yet for this avatar.</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
