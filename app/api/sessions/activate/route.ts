import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logSessionEvent } from '@/lib/events'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { sessionId } = await request.json()

  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('sessions')
    .update({ status: 'active', started_at: new Date().toISOString() })
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .eq('status', 'pending')

  if (error) {
    console.error('[sessions/activate] Error:', error)
    return NextResponse.json({ error: 'Failed to activate session' }, { status: 500 })
  }

  logSessionEvent(supabase, {
    sessionId,
    userId: user.id,
    eventType: 'session.activated',
  })

  return NextResponse.json({ success: true })
}
