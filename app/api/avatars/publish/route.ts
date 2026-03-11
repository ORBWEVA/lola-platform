import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import type { PlatformId } from '@/lib/social/platforms'

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase service role env vars not configured')
  return createClient(url, key)
}

export async function POST(request: Request) {
  const supabase = await createServerClient()
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

  // Path C: Direct publish via social_connections
  const admin = getSupabaseAdmin()
  const { data: connections } = await admin
    .from('social_connections')
    .select('platform, access_token, refresh_token, platform_username')
    .eq('creator_id', user.id)

  if (connections && connections.length > 0) {
    const { publishToAll } = await import('@/lib/social/publish')
    const { decrypt } = await import('@/lib/crypto')

    const decrypted = connections.map(c => ({
      platform: c.platform as PlatformId,
      access_token: decrypt(c.access_token),
      refresh_token: c.refresh_token ? decrypt(c.refresh_token) : undefined,
      platform_username: c.platform_username || undefined,
    }))

    const imageUrl = avatar.anchor_image_url || avatar.scene_images?.[0]
    const results = await publishToAll(decrypted, caption || avatar.tagline || '', imageUrl)

    return NextResponse.json({ success: true, directPublish: true, results })
  }

  // Path B: Manual share (no Blotato, no connections) — avatar is saved, user shares from published page
  return NextResponse.json({ success: true, autoPublished: false, slug: avatar.slug })
}
