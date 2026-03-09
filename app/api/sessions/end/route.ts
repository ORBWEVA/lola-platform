import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logSessionEvent } from '@/lib/events'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // sendBeacon sends as text/plain — parse manually
  let body: { sessionId?: string; transcript?: { role: string; content: string }[] }
  try {
    const text = await request.text()
    body = JSON.parse(text)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { sessionId, transcript } = body

  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId required' }, { status: 400 })
  }

  // Read session to get started_at and avatar_id
  const { data: session } = await supabase
    .from('sessions')
    .select('started_at, avatar_id')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  // Server-side duration and credit computation
  const now = new Date()
  const startedAt = session.started_at ? new Date(session.started_at) : now
  const serverDuration = Math.floor((now.getTime() - startedAt.getTime()) / 1000)
  const creditsUsed = Math.max(Math.ceil(serverDuration / 60), 1)

  // Update session
  await supabase
    .from('sessions')
    .update({
      status: 'completed',
      duration_seconds: serverDuration,
      credits_used: creditsUsed,
      ended_at: now.toISOString(),
    })
    .eq('id', sessionId)
    .eq('user_id', user.id)

  // Save transcript entries
  if (transcript && transcript.length > 0) {
    await supabase.from('transcript_entries').insert(
      transcript.map((entry, i) => ({
        session_id: sessionId,
        role: entry.role,
        content: entry.content,
        seq: i,
      }))
    )
  }

  // Deduct credits
  if (creditsUsed > 0) {
    await supabase.rpc('deduct_credits', {
      p_user_id: user.id,
      p_amount: creditsUsed,
    })
  }

  // Increment avatar session count
  if (session.avatar_id) {
    await supabase.rpc('increment_session_count', {
      p_avatar_id: session.avatar_id,
    })
  }

  logSessionEvent(supabase, {
    sessionId,
    userId: user.id,
    eventType: 'session.transcript_saved',
    metadata: { transcriptLength: transcript?.length ?? 0, via: 'sendBeacon' },
  })

  return NextResponse.json({ success: true })
}
