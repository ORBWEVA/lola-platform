import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logSessionEvent } from '@/lib/events'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { sessionId, reason } = await request.json()

  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('sessions')
    .update({
      status: 'failed',
      ended_at: new Date().toISOString(),
      session_notes: reason || null,
    })
    .eq('id', sessionId)
    .eq('user_id', user.id)

  if (error) {
    console.error('[sessions/fail] Error:', error)
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 })
  }

  logSessionEvent(supabase, {
    sessionId,
    userId: user.id,
    eventType: 'session.failed',
    metadata: { reason: reason || 'unknown' },
  })

  return NextResponse.json({ success: true })
}
