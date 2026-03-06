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

  // Load avatar by slug
  const { data: avatar } = await supabase
    .from('avatars')
    .select('id, name, slug')
    .eq('slug', slug)
    .single()

  if (!avatar) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="glass rounded-2xl p-8 max-w-sm text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
            <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
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
    <div>
      {/* Mic permission info banner — shown briefly before session takes over */}
      <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <div className="glass mx-4 mt-4 rounded-xl p-3 flex items-center gap-3 animate-pulse pointer-events-auto"
          style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
        >
          <svg className="w-5 h-5 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M12 1a3 3 0 00-3 3v4a3 3 0 006 0V4a3 3 0 00-3-3z" />
          </svg>
          <p className="text-xs text-muted">Your browser will ask for microphone access. Please allow it to talk with {avatar.name}.</p>
        </div>
      </div>
      <VoiceSession avatarId={avatar.id} avatarName={avatar.name} avatarSlug={avatar.slug} />
    </div>
  )
}
