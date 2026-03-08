import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AvatarsList from './avatars-list'
import { validImageUrl } from '@/lib/utils/images'

export default async function AvatarsListPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: avatars } = await supabase
    .from('avatars')
    .select('id, name, slug, tagline, anchor_image_url, is_published, session_count')
    .eq('creator_id', user.id)
    .order('created_at', { ascending: false })

  const cleaned = (avatars || []).map(a => ({
    ...a,
    anchor_image_url: validImageUrl(a.anchor_image_url),
  }))

  return <AvatarsList avatars={cleaned} />
}
