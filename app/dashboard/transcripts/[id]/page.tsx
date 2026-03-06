import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

export default async function TranscriptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: session } = await supabase
    .from('sessions')
    .select('*, avatars(name)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!session) notFound()

  const { data: entries } = await supabase
    .from('transcript_entries')
    .select('*')
    .eq('session_id', id)
    .order('seq')

  const avatar = session.avatars as { name: string } | null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="text-sm text-muted hover:text-foreground transition-colors">← Back</Link>
          <h1 className="text-xl font-bold mt-2">Session with {avatar?.name ?? 'Unknown'}</h1>
          <p className="text-sm text-muted">
            {new Date(session.started_at).toLocaleString()} — {Math.floor((session.duration_seconds || 0) / 60)} minutes
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {entries?.map(entry => (
          <div
            key={entry.id}
            className={`flex ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
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
          </div>
        ))}
        {(!entries || entries.length === 0) && (
          <p className="text-muted text-sm text-center">No transcript available for this session.</p>
        )}
      </div>
    </div>
  )
}
