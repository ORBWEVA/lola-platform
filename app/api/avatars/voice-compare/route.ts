import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDomainPreset, getLocalizedOpener } from '@/lib/coaching/domains'

const REALTIME_VOICES = ['alloy', 'ash', 'ballad', 'coral', 'echo', 'sage', 'shimmer', 'verse', 'marin', 'cedar'] as const

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { avatarId, voices, locale } = await request.json()

  // Allow filtering to specific voices, or generate all
  const targetVoices = voices?.length ? voices : REALTIME_VOICES

  const { data: avatar } = await supabase
    .from('avatars')
    .select('id, name, domain, tagline')
    .eq('id', avatarId)
    .eq('creator_id', user.id)
    .single()

  if (!avatar) {
    return NextResponse.json({ error: 'Avatar not found' }, { status: 404 })
  }

  const preset = getDomainPreset(avatar.domain)
  const greeting = getLocalizedOpener(preset, locale || 'en').replace('{name}', avatar.name)
  const sampleText = greeting.split(/[.!?]/)[0] + '!'

  // Generate TTS for each voice in parallel
  const results = await Promise.allSettled(
    targetVoices.map(async (voice: string) => {
      const ttsRes = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1-hd',
          voice,
          input: sampleText,
          response_format: 'mp3',
        }),
      })

      if (!ttsRes.ok) {
        throw new Error(`TTS failed for ${voice}: ${ttsRes.status}`)
      }

      const audioBuffer = await ttsRes.arrayBuffer()
      const storagePath = `voice-compare/${avatarId}/${voice}.mp3`

      await supabase.storage
        .from('avatars')
        .upload(storagePath, audioBuffer, {
          contentType: 'audio/mpeg',
          upsert: true,
        })

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(storagePath)

      return { voice, url: publicUrl }
    })
  )

  const samples = results
    .filter((r): r is PromiseFulfilledResult<{ voice: string; url: string }> => r.status === 'fulfilled')
    .map(r => r.value)

  const errors = results
    .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
    .map(r => r.reason?.message)

  return NextResponse.json({ samples, errors: errors.length ? errors : undefined })
}
