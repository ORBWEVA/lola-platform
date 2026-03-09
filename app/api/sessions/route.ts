import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logSessionEvent } from '@/lib/events'

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { sessionId, transcript } = await request.json()

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
  if (session.avatar_id) {
    await supabase.rpc('increment_session_count', {
      p_avatar_id: session.avatar_id,
    })
  }

  // Log event
  logSessionEvent(supabase, {
    sessionId,
    userId: user.id,
    eventType: 'session.ended',
    metadata: { serverDuration, creditsUsed, transcriptLength: transcript?.length ?? 0 },
  })

  // Generate session summary in background (non-blocking)
  if (transcript?.length > 2) {
    summarizeSession(supabase, sessionId, transcript).catch(e =>
      console.error('[sessions] Summary generation failed:', e)
    )
  }

  return NextResponse.json({ success: true })
}

const summarizeSession = async (
  supabase: Awaited<ReturnType<typeof createClient>>,
  sessionId: string,
  transcript: { role: string; content: string }[]
) => {
  const condensed = transcript
    .filter(e => e.role !== 'system')
    .map(e => `${e.role === 'user' ? 'User' : 'Avatar'}: ${e.content}`)
    .join('\n')
    .slice(0, 2000)

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Analyze this voice session and return a JSON object with these fields:
- "summary": 2-3 sentence summary of what was discussed and any progress made
- "topics": array of 2-5 specific topics or skills covered (short phrases)
- "keyMoment": one standout moment where the user made progress or showed engagement (1 sentence, or null if none)
- "nextFocus": one suggested area to focus on in the next session (1 sentence, or null if unclear)

Return ONLY valid JSON, no markdown fencing.`,
        },
        { role: 'user', content: condensed },
      ],
      max_tokens: 300,
      response_format: { type: 'json_object' },
    }),
  })

  if (!res.ok) return

  const data = await res.json()
  const summary = data.choices?.[0]?.message?.content

  if (summary) {
    await supabase
      .from('sessions')
      .update({ session_notes: summary })
      .eq('id', sessionId)
  }
}
