import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDomainPreset } from '@/lib/coaching/domains'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { avatarId } = await request.json()

  // Load avatar (must be owned by this user)
  const { data: avatar } = await supabase
    .from('avatars')
    .select('id, name, domain, voice_id, tagline')
    .eq('id', avatarId)
    .eq('creator_id', user.id)
    .single()

  if (!avatar) {
    return NextResponse.json({ error: 'Avatar not found' }, { status: 404 })
  }

  // Build greeting text
  const preset = getDomainPreset(avatar.domain)
  const greeting = preset.defaultOpener.replace('{name}', avatar.name)
  // Use first sentence only for a short sample
  const sampleText = greeting.split(/[.!?]/)[0] + '!'

  // Generate TTS via OpenAI
  const ttsRes = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1',
      voice: avatar.voice_id || 'shimmer',
      input: sampleText,
      response_format: 'mp3',
    }),
  })

  if (!ttsRes.ok) {
    const err = await ttsRes.text()
    console.error('[voice-sample] TTS error:', err)
    return NextResponse.json({ error: 'TTS generation failed' }, { status: 500 })
  }

  // Upload to Supabase Storage
  const audioBuffer = await ttsRes.arrayBuffer()
  const storagePath = `voice-samples/${avatarId}.mp3`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(storagePath, audioBuffer, {
      contentType: 'audio/mpeg',
      upsert: true,
    })

  if (uploadError) {
    console.error('[voice-sample] Storage upload error:', uploadError)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(storagePath)

  // Save URL on avatar
  await supabase
    .from('avatars')
    .update({ voice_sample_url: publicUrl })
    .eq('id', avatarId)

  return NextResponse.json({ voiceSampleUrl: publicUrl })
}
