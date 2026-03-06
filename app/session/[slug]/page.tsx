import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import VoiceSession from '@/components/session/VoiceSession'

export default async function SessionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  // Check auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/login?next=/session/${slug}`)
  }

  // Load avatar by slug
  const { data: avatar } = await supabase
    .from('avatars')
    .select('id, name, slug')
    .eq('slug', slug)
    .single()

  if (!avatar) {
    redirect('/')
  }

  return <VoiceSession avatarId={avatar.id} avatarName={avatar.name} avatarSlug={avatar.slug} />
}
