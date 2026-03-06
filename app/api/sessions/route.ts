import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { sessionId, durationSeconds, creditsUsed, transcript } = await request.json()

  // Update session
  await supabase
    .from('sessions')
    .update({
      duration_seconds: durationSeconds,
      credits_used: creditsUsed,
      ended_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .eq('user_id', user.id)

  // Save transcript entries
  if (transcript?.length > 0) {
    await supabase.from('transcript_entries').insert(
      transcript.map((entry: { role: string; content: string }, i: number) => ({
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
  const { data: session } = await supabase
    .from('sessions')
    .select('avatar_id')
    .eq('id', sessionId)
    .single()

  if (session?.avatar_id) {
    await supabase.rpc('increment_session_count', {
      p_avatar_id: session.avatar_id,
    })
  }

  return NextResponse.json({ success: true })
}
