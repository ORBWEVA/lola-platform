import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import VoiceSession from '@/components/session/VoiceSession'

export default async function SessionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  // Check auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/login?next=/session/${slug}`)
  }

  // Load user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  const userRole = profile?.role || 'learner'

  // Load avatar by slug
  const { data: avatar } = await supabase
    .from('avatars')
    .select('id, name, slug')
    .eq('slug', slug)
    .single()

  if (!avatar) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 monochrome">
        <div className="glass rounded-2xl p-8 max-w-sm text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-[var(--surface-2)] flex items-center justify-center mx-auto">
            <svg className="w-7 h-7 text-[var(--muted)]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold">Avatar Not Found</h2>
          <p className="text-sm text-muted">This avatar doesn&apos;t exist or may have been unpublished. Try browsing available avatars instead.</p>
          <Link href="/" className="block w-full py-3 rounded-xl gradient-btn font-medium text-center">
            Browse Avatars
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="monochrome">
      <VoiceSession avatarId={avatar.id} avatarName={avatar.name} avatarSlug={avatar.slug} userRole={userRole} />
    </div>
  )
}
