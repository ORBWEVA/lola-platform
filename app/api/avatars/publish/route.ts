import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    .eq('creator_id', user.id)
    .single()

  if (!avatar) {
    return NextResponse.json({ error: 'Avatar not found' }, { status: 404 })
  }

  const n8nBase = process.env.N8N_WEBHOOK_BASE
  if (!n8nBase) {
    return NextResponse.json({ error: 'n8n not configured' }, { status: 500 })
  }

  // Trigger social publish via n8n
  try {
    const res = await fetch(`${n8nBase}/publish-content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        avatar_id: avatar.id,
        avatar_name: avatar.name,
        tagline: avatar.tagline,
        domain: avatar.domain,
        personality: avatar.personality_traits,
        anchor_image_url: avatar.anchor_image_url,
        scene_images: avatar.scene_images,
        profile_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://lola-platform.vercel.app'}/avatar/${avatar.slug}`,
      }),
    })

    const data = await res.json()
    return NextResponse.json({ success: true, post: data })
  } catch (e) {
    console.error('Publish failed:', e)
    return NextResponse.json({ error: 'Publish failed' }, { status: 500 })
  }
}
