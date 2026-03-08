import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildSystemInstruction } from '@/lib/coaching/instructions'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { avatarId } = await request.json()

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

  if (!profile || profile.credits <= 0) {
    return NextResponse.json({ error: 'No credits remaining' }, { status: 402 })
  }

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
    }
  )

  // Create session record
  const { data: session } = await supabase
    .from('sessions')
    .insert({
      user_id: user.id,
      avatar_id: avatarId,
      profile_data: profile.profile_data || {},
    })
    .select('id')
    .single()

  // Get ephemeral token from OpenAI
  const openaiRes = await fetch('https://api.openai.com/v1/realtime/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-realtime-preview',
      voice: avatar.voice_id || 'shimmer',
      instructions: instruction,
      temperature: 0.7,
    }),
  })

  if (!openaiRes.ok) {
    const err = await openaiRes.text()
    console.error('OpenAI session error:', err)
    return NextResponse.json({ error: 'Failed to create voice session' }, { status: 500 })
  }

  const openaiData = await openaiRes.json()

  return NextResponse.json({
    sessionId: session?.id,
    ephemeralKey: openaiData.client_secret?.value,
    avatarName: avatar.name,
    voiceId: avatar.voice_id || 'shimmer',
    sceneImages: avatar.scene_images || [],
    anchorImage: avatar.anchor_image_url,
    domain: avatar.domain,
  })
}
