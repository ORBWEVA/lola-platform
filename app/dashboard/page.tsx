import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import { BuyCreditsButton } from './buy-credits-button'

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-8 w-64 bg-white/5 rounded-lg" />

      {/* Stats skeleton */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="glass rounded-2xl p-5 text-center space-y-2">
            <div className="h-9 w-12 bg-white/5 rounded-lg mx-auto" />
            <div className="h-4 w-16 bg-white/5 rounded mx-auto" />
          </div>
        ))}
      </div>

      {/* Button skeleton */}
      <div className="h-12 bg-white/5 rounded-xl" />

      {/* Sessions skeleton */}
      <div className="space-y-3">
        <div className="h-6 w-40 bg-white/5 rounded-lg" />
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-4 glass rounded-2xl p-4">
            <div className="w-12 h-12 rounded-full bg-white/5 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-white/5 rounded" />
              <div className="h-3 w-24 bg-white/5 rounded" />
            </div>
            <div className="h-3 w-16 bg-white/5 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

async function DashboardContent({ purchased }: { purchased?: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: sessions } = await supabase
    .from('sessions')
    .select('*, avatars(name, slug, anchor_image_url)')
    .eq('user_id', user.id)
    .order('started_at', { ascending: false })
    .limit(10)

  const totalMinutes = sessions?.reduce((sum, s) => sum + Math.floor((s.duration_seconds || 0) / 60), 0) ?? 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {profile?.display_name || 'there'}</h1>
      </div>

      {/* Purchase confirmation */}
      {purchased && (
        <div className="glass no-trace rounded-2xl p-4 border border-emerald-500/30 bg-emerald-500/5">
          <p className="text-emerald-400 font-medium">+{purchased} credits added to your account!</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card rounded-2xl p-5 text-center">
          <p className="text-3xl font-bold text-emerald-400">{profile?.credits ?? 0}</p>
          <p className="text-xs text-muted mt-1.5 uppercase tracking-wider">Credits</p>
        </div>
        <div className="stat-card rounded-2xl p-5 text-center">
          <p className="text-3xl font-bold">{sessions?.length ?? 0}</p>
          <p className="text-xs text-muted mt-1.5 uppercase tracking-wider">Sessions</p>
        </div>
        <div className="stat-card rounded-2xl p-5 text-center">
          <p className="text-3xl font-bold">{totalMinutes}</p>
          <p className="text-xs text-muted mt-1.5 uppercase tracking-wider">Minutes</p>
        </div>
      </div>

      {/* Buy Credits */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Buy Credits</h2>
        <div className="grid grid-cols-3 gap-3">
          <BuyCreditsButton pack="starter" credits={30} price="$4.99" />
          <BuyCreditsButton pack="popular" credits={100} price="$12.99" label="Popular" />
          <BuyCreditsButton pack="pro" credits={300} price="$29.99" label="Best Value" />
        </div>
      </div>

      {/* Quiz prompt */}
      {!profile?.onboarding_complete && (
        <div className="glass rounded-2xl p-5">
          <h3 className="font-semibold">Want better coaching?</h3>
          <p className="text-sm text-muted mt-1">Take a 30-second quiz to personalize your experience.</p>
          <Link href="/dashboard/quiz" className="inline-block mt-3 text-sm text-indigo-400 hover:underline">
            Take the quiz →
          </Link>
        </div>
      )}

      {/* Recent sessions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Sessions</h2>
        {(!sessions || sessions.length === 0) ? (
          <p className="text-muted text-sm">No sessions yet. Try talking to an avatar!</p>
        ) : (
          <div className="space-y-3">
            {sessions.map(session => {
              const avatar = session.avatars as { name: string; slug: string; anchor_image_url: string | null } | null
              return (
                <Link
                  key={session.id}
                  href={`/dashboard/transcripts/${session.id}`}
                  className="flex items-center gap-4 glass rounded-2xl p-4 hover:bg-white/10 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                    {avatar?.anchor_image_url ? (
                      <Image src={avatar.anchor_image_url} alt={avatar.name} width={48} height={48} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-emerald-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{avatar?.name ?? 'Unknown'}</p>
                    <p className="text-xs text-muted">
                      {Math.floor((session.duration_seconds || 0) / 60)}m —{' '}
                      {new Date(session.started_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs text-muted">{session.credits_used} credits</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ purchased?: string }> }) {
  const params = await searchParams
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent purchased={params.purchased} />
    </Suspense>
  )
}
