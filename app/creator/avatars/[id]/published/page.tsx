import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import PublishedActions from './actions'
import { validImageUrl, filterExpiredUrls } from '@/lib/utils/images'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PublishedPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: avatar } = await supabase
    .from('avatars')
    .select('*')
    .eq('id', id)
    .eq('creator_id', user.id)
    .single()

  if (!avatar) notFound()

  const profileUrl = `/avatar/${avatar.slug}`
  const sessionUrl = `/session/${avatar.slug}`

  return (
    <div className="max-w-lg mx-auto space-y-8 py-8 text-center">
      {/* Success animation */}
      <div className="space-y-4">
        <div className="w-20 h-20 rounded-full gradient-btn flex items-center justify-center mx-auto animate-pulse">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold">{avatar.name} is live!</h1>
        <p className="text-sm text-muted">Your avatar is published and ready for conversations.</p>
      </div>

      {/* Avatar preview */}
      {validImageUrl(avatar.anchor_image_url) ? (
        <div className="w-32 h-32 rounded-2xl overflow-hidden mx-auto">
          <img src={validImageUrl(avatar.anchor_image_url)!} alt={avatar.name} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-indigo-900 to-emerald-900 flex items-center justify-center mx-auto">
          <span className="text-4xl font-bold text-white/30">{avatar.name?.charAt(0)}</span>
        </div>
      )}

      {/* Social preview + scene picker + actions (client component) */}
      <PublishedActions
        profileUrl={profileUrl}
        sessionUrl={sessionUrl}
        caption={avatar.social_caption || avatar.tagline || ''}
        anchorImageUrl={validImageUrl(avatar.anchor_image_url)}
        sceneImages={filterExpiredUrls(avatar.scene_images || [])}
        avatarName={avatar.name}
        instagramHandle={avatar.social_links?.instagram || null}
      />

      {/* Next steps */}
      <div className="glass rounded-xl p-4 text-left space-y-2">
        <p className="text-xs font-medium text-indigo-300">What you can do now:</p>
        <ul className="text-xs text-muted space-y-1.5">
          <li className="flex items-start gap-2">
            <span className="text-indigo-400 mt-0.5">1.</span>
            <span><strong>Test your avatar</strong> — have a voice conversation and see how it adapts to you</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-400 mt-0.5">2.</span>
            <span><strong>Share the profile link</strong> — anyone with the link can start talking to your avatar</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-400 mt-0.5">3.</span>
            <span><strong>Check your dashboard</strong> — track sessions, ratings, and engagement</span>
          </li>
        </ul>
      </div>

      <Link
        href="/creator"
        className="inline-block text-sm text-muted hover:text-foreground transition-colors"
      >
        Back to Creator Dashboard
      </Link>
    </div>
  )
}
