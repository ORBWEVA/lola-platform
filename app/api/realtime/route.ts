import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildSystemInstruction } from '@/lib/coaching/instructions'
import { logSessionEvent } from '@/lib/events'

export async function POST(request: Request) {
  try {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { avatarId, sessionId: existingSessionId } = await request.json()

  // --- Stale session cleanup ---
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()

  // Expire stale pending sessions (older than 5 min)
  await supabase
    .from('sessions')
    .update({ status: 'expired', ended_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .lt('created_at', fiveMinAgo)

  // Expire stale active sessions (older than 2 hours) and deduct credits
  const { data: staleSessions } = await supabase
    .from('sessions')
    .select('id, started_at, avatar_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .lt('created_at', twoHoursAgo)

  if (staleSessions && staleSessions.length > 0) {
    const now = new Date()
    for (const stale of staleSessions) {
      const startedAt = stale.started_at ? new Date(stale.started_at) : new Date(twoHoursAgo)
      const duration = Math.floor((now.getTime() - startedAt.getTime()) / 1000)
      const credits = Math.max(Math.ceil(duration / 60), 1)

      await supabase
        .from('sessions')
        .update({
          status: 'expired',
          ended_at: now.toISOString(),
          duration_seconds: duration,
          credits_used: credits,
        })
        .eq('id', stale.id)

      await supabase.rpc('deduct_credits', {
        p_user_id: user.id,
        p_amount: credits,
      })
    }
  }

  // --- Reconnection: reuse existing session if valid ---
  let sessionId: string | undefined
  if (existingSessionId) {
    const { data: existing } = await supabase
      .from('sessions')
      .select('id, avatar_id')
      .eq('id', existingSessionId)
      .eq('user_id', user.id)
      .in('status', ['pending', 'active'])
      .single()

    if (existing) {
      sessionId = existing.id
    }
  }

  // Load avatar
  const { data: avatar } = await supabase
    .from('avatars')
    .select('*')
    .eq('id', avatarId)
    .single()

  if (!avatar) {
    console.error('Avatar not found for id:', avatarId)
    return NextResponse.json({ error: 'Avatar not found' }, { status: 404 })
  }

  console.log('[realtime] Avatar loaded:', { id: avatar.id, name: avatar.name, slug: avatar.slug, voice_id: avatar.voice_id })

  // Load user profile for coaching weights
  const { data: profile } = await supabase
    .from('profiles')
    .select('profile_data, credits')
    .eq('id', user.id)
    .single()

  console.log('[realtime] profile:', { credits: profile?.credits, hasProfile: !!profile })

  if (!profile || profile.credits <= 0) {
    return NextResponse.json({ error: 'No credits remaining' }, { status: 402 })
  }

  console.log('[realtime] step: history query')
  // Query session history for this user+avatar pair
  const [{ count: totalSessionCount }, { data: recentSessions }] = await Promise.all([
    supabase
      .from('sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('avatar_id', avatarId)
      .eq('status', 'completed'),
    supabase
      .from('sessions')
      .select('session_notes')
      .eq('user_id', user.id)
      .eq('avatar_id', avatarId)
      .eq('status', 'completed')
      .not('session_notes', 'is', null)
      .order('ended_at', { ascending: false })
      .limit(3),
  ])

  const previousSessionCount = totalSessionCount ?? 0
  const previousNotes = (recentSessions || [])
    .map(s => s.session_notes)
    .filter((n): n is string => !!n)

  console.log('[realtime] step: build instruction')
  // Build system instruction
  const instruction = buildSystemInstruction(
    {
      name: avatar.name,
      domain: avatar.domain,
      personalityTraits: avatar.personality_traits || '',
      tagline: avatar.tagline || '',
      conversationMode: avatar.conversation_mode || 'coaching',
      knowledgeBase: avatar.knowledge_base?.summary,
      systemInstructionOverride: avatar.system_instruction_override,
    },
    {
      profileWeights: profile.profile_data?.weights,
      nativeLanguage: profile.profile_data?.nativeLanguage,
      sessionContext: {
        isFirstSession: previousSessionCount === 0,
        previousSessionCount,
        userName: profile.profile_data?.name,
        previousNotes: previousNotes.length > 0 ? previousNotes : undefined,
      },
    }
  )

  // Create session record (unless reusing an existing one)
  if (!sessionId) {
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        user_id: user.id,
        avatar_id: avatarId,
        profile_data: profile.profile_data || {},
      })
      .select('id')
      .single()

    if (sessionError) {
      console.error('[realtime] Session insert error:', sessionError)
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
    }

    sessionId = session?.id
  }

  console.log('[realtime] step: openai token, key exists:', !!process.env.OPENAI_API_KEY, 'key prefix:', process.env.OPENAI_API_KEY?.slice(0, 7))
  // Get ephemeral token from OpenAI
  const openaiBody = {
    model: 'gpt-4o-realtime-preview-2024-12-17',
    voice: avatar.voice_id || 'shimmer',
    instructions: instruction,
    temperature: 0.7,
  }
  const openaiRes = await fetch('https://api.openai.com/v1/realtime/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(openaiBody),
  })

  console.log('[realtime] openai status:', openaiRes.status)

  if (!openaiRes.ok) {
    const err = await openaiRes.text()
    console.error('[realtime] OPENAI ERR:', err.slice(0, 300))
    return NextResponse.json({ error: 'Failed to create voice session', openaiStatus: openaiRes.status, detail: err.slice(0, 500) }, { status: 500 })
  }

  const openaiData = await openaiRes.json()

  // Log session init event
  logSessionEvent(supabase, {
    sessionId,
    userId: user.id,
    eventType: 'session.init',
    metadata: {
      avatarId,
      isReconnect: !!existingSessionId,
      previousSessionCount,
    },
  })

  return NextResponse.json({
    sessionId,
    ephemeralKey: openaiData.client_secret?.value,
    avatarName: avatar.name,
    voiceId: avatar.voice_id || 'shimmer',
    sceneImages: avatar.scene_images || [],
    anchorImage: avatar.anchor_image_url,
    domain: avatar.domain,
  })
  } catch (err) {
    console.error('[realtime] Unhandled error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
