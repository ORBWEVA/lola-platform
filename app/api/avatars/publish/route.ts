import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { avatarId, caption } = await request.json()

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

  // Save caption
  if (caption) {
    await supabase.from('avatars').update({ social_caption: caption }).eq('id', avatarId)
  }

  const hasBlotatoKey = !!avatar.social_links?.blotato_api_key
  const n8nBase = process.env.N8N_WEBHOOK_BASE

  // Path A: Blotato auto-publish via n8n
  if (hasBlotatoKey && n8nBase) {
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
          caption: caption || avatar.tagline,
          social_links: avatar.social_links,
          blotato_api_key: avatar.social_links.blotato_api_key,
        }),
      })

      const data = await res.json()
      return NextResponse.json({ success: true, autoPublished: true, post: data })
    } catch (e) {
      console.error('Blotato publish failed:', e)
      // Fall through to manual path
      return NextResponse.json({ success: true, autoPublished: false, slug: avatar.slug })
    }
  }

  // Path B: Manual share (no Blotato) — avatar is saved, user shares from published page
  return NextResponse.json({ success: true, autoPublished: false, slug: avatar.slug })
}
