import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LoLA — AI Avatars That Coach, Sell & Grow',
  description: 'Build a photorealistic AI avatar that posts to social media and has real-time voice conversations with anyone who clicks.',
  openGraph: {
    title: 'LoLA — AI Avatars That Coach, Sell & Grow',
    description: 'Build a photorealistic AI avatar that posts to social media and has real-time voice conversations with anyone who clicks.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LoLA — AI Avatars That Coach, Sell & Grow',
    description: 'Build a photorealistic AI avatar that posts to social media and has real-time voice conversations.',
    images: ['/og-image.png'],
  },
}

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: avatars } = await supabase
    .from('avatars')
    .select('id, name, slug, tagline, domain, anchor_image_url, session_count')
    .eq('is_published', true)
    .order('session_count', { ascending: false })
    .limit(6)

  return (
    <div className="min-h-screen relative noise">
      {/* Animated background */}
      <div className="mesh-bg" />

      {/* Nav */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-4 glass-strong sticky top-0">
        <span className="text-xl font-bold gradient-text-vivid">LoLA</span>
        <div className="flex items-center gap-4">
          {user ? (
            <Link href="/dashboard" className="text-sm px-5 py-2.5 rounded-xl gradient-btn font-medium">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm text-muted hover:text-foreground transition-colors">
                Sign In
              </Link>
              <Link href="/signup" className="text-sm px-5 py-2.5 rounded-xl gradient-btn font-medium">
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 px-6 pt-20 pb-16 max-w-5xl mx-auto">
        {/* Orbs */}
        <div className="orb orb-indigo w-[400px] h-[400px] -top-20 -left-40" />
        <div className="orb orb-emerald w-[300px] h-[300px] top-40 -right-20" style={{ animationDelay: '5s' }} />

        <div className="text-center fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-strong text-xs text-muted mb-8 shimmer">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Powered by OpenAI Realtime + FLUX AI
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight">
            AI avatars that<br />
            <span className="gradient-text-vivid">coach, sell & grow</span>
            <br />
            <span className="text-muted/60">autonomously</span>
          </h1>

          <p className="text-lg md:text-xl text-muted mt-8 max-w-2xl mx-auto leading-relaxed fade-in-up delay-200">
            Build a photorealistic AI avatar that posts to social media and has
            real-time voice conversations with anyone who clicks.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10 fade-in-up delay-300">
            <Link
              href="/signup"
              className="px-8 py-4 rounded-2xl gradient-btn-lg text-lg font-semibold pulse-glow"
            >
              Create Your Avatar — Free
            </Link>
            {avatars && avatars.length > 0 && (
              <a
                href="#avatars"
                className="px-8 py-4 rounded-2xl glass-strong text-lg font-medium hover:bg-white/10 transition-all"
              >
                Try a Demo
              </a>
            )}
          </div>
        </div>

        {/* Avatar preview strip */}
        {avatars && avatars.length > 0 && (
          <div className="flex justify-center gap-4 mt-16 fade-in-up delay-500">
            {avatars.slice(0, 4).map((avatar, i) => (
              <Link
                key={avatar.id}
                href={`/avatar/${avatar.slug}`}
                className="relative group"
                style={{ animationDelay: `${400 + i * 100}ms` }}
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden ring-2 ring-white/10 group-hover:ring-indigo-500/50 transition-all duration-300 group-hover:scale-110">
                  {avatar.anchor_image_url ? (
                    <Image
                      src={avatar.anchor_image_url}
                      alt={avatar.name}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-emerald-600" />
                  )}
                </div>
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity text-xs text-muted">
                  {avatar.name}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="relative z-10 px-6 py-20 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-indigo-400 mb-3 uppercase tracking-wider">How it works</p>
          <h2 className="text-3xl md:text-4xl font-bold">Three steps to your AI avatar</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: '1',
              title: 'Create Avatar',
              desc: 'Describe your avatar. AI generates photorealistic images in seconds.',
              icon: (
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                </svg>
              ),
            },
            {
              step: '2',
              title: 'Auto-Post to Social',
              desc: 'One click publishes to 9 platforms. AI writes the captions.',
              icon: (
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                </svg>
              ),
            },
            {
              step: '3',
              title: 'Users Engage',
              desc: 'Anyone who clicks gets a real-time adaptive voice conversation.',
              icon: (
                <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
              ),
            },
          ].map((item, i) => (
            <div key={item.step} className={`glow-card rounded-2xl p-8 text-center fade-in-up delay-${(i + 1) * 100}`}>
              <div className="feature-icon mx-auto">
                {item.icon}
              </div>
              <div className="mt-4 mb-1 text-xs font-medium text-muted uppercase tracking-wider">Step {item.step}</div>
              <h3 className="font-semibold text-lg">{item.title}</h3>
              <p className="text-sm text-muted mt-2 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo Avatars */}
      {avatars && avatars.length > 0 && (
        <section id="avatars" className="relative z-10 px-6 py-20 max-w-5xl mx-auto">
          <div className="orb orb-violet w-[350px] h-[350px] -left-40 top-20" style={{ animationDelay: '8s' }} />

          <div className="text-center mb-16">
            <p className="text-sm font-medium text-emerald-400 mb-3 uppercase tracking-wider">Live demos</p>
            <h2 className="text-3xl md:text-4xl font-bold">Talk to an AI avatar now</h2>
            <p className="text-muted mt-3 max-w-lg mx-auto">Each avatar adapts to you in real-time. Try a conversation — it&apos;s free.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {avatars.map((avatar, i) => (
              <Link
                key={avatar.id}
                href={`/avatar/${avatar.slug}`}
                className={`avatar-card glass rounded-2xl overflow-hidden group fade-in-up delay-${(i + 1) * 100}`}
              >
                <div className="h-52 relative overflow-hidden">
                  {avatar.anchor_image_url ? (
                    <Image
                      src={avatar.anchor_image_url}
                      alt={avatar.name}
                      fill
                      className="object-cover avatar-card-image"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-emerald-900" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">{avatar.name}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-medium backdrop-blur-sm border border-indigo-500/20">
                        Multilingual
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-muted line-clamp-2">{avatar.tagline}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-muted">{avatar.session_count} sessions</span>
                    <span className="text-xs px-3 py-1.5 rounded-full gradient-btn font-medium group-hover:shadow-lg group-hover:shadow-indigo-500/20 transition-shadow">
                      Talk Now
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Features */}
      <section className="relative z-10 px-6 py-20 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-violet-400 mb-3 uppercase tracking-wider">Platform</p>
          <h2 className="text-3xl md:text-4xl font-bold">Built for scale</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: '🧠', title: 'Adaptive Coaching Engine', desc: '12 evidence-based principles personalize every conversation to the individual.' },
            { icon: '📱', title: 'Social Media Pipeline', desc: 'AI-generated content published to 9 platforms automatically via Blotato.' },
            { icon: '💳', title: 'Credit System', desc: 'Per-minute billing. Users buy credits. Creators earn revenue.' },
            { icon: '🌐', title: 'Multi-Domain', desc: 'Language coaching, fitness, sales, mentoring, support — one platform.' },
            { icon: '🎨', title: 'Character Consistency', desc: 'FLUX Kontext Pro ensures your avatar looks the same everywhere.' },
            { icon: '🎙', title: 'Real-Time Voice', desc: 'OpenAI Realtime API with WebRTC. Sub-second latency.' },
          ].map((f, i) => (
            <div key={f.title} className={`glow-card rounded-2xl p-6 fade-in-up delay-${(i % 3 + 1) * 100}`}>
              <div className="flex items-start gap-4">
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <h3 className="font-semibold text-sm">{f.title}</h3>
                  <p className="text-xs text-muted mt-1.5 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="relative z-10 px-6 py-20 max-w-4xl mx-auto">
        <div className="orb orb-indigo w-[300px] h-[300px] -right-40 top-0" style={{ animationDelay: '12s' }} />

        <div className="text-center mb-16">
          <p className="text-sm font-medium text-indigo-400 mb-3 uppercase tracking-wider">Pricing</p>
          <h2 className="text-3xl md:text-4xl font-bold">Start free, scale as you grow</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: 'Free', price: '$0', period: 'forever', features: ['1 avatar', '50 sessions/mo', 'Basic analytics', 'LoLA branding'] },
            { name: 'Creator', price: '$29', period: '/mo', features: ['5 avatars', 'Unlimited sessions', 'Social publishing', 'Custom branding', 'Priority support'], popular: true },
            { name: 'Pro', price: '$99', period: '/mo', features: ['Unlimited avatars', 'Unlimited sessions', 'API access', 'White-label', 'Team accounts', 'Advanced analytics'] },
          ].map((plan, i) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-6 fade-in-up delay-${(i + 1) * 100} ${
                plan.popular ? 'pricing-popular glass-strong relative' : 'glass'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="text-xs font-medium px-3 py-1 rounded-full gradient-btn">Most Popular</span>
                </div>
              )}
              <h3 className="text-lg font-bold mt-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mt-3">
                <p className="text-4xl font-bold">{plan.price}</p>
                <span className="text-sm text-muted">{plan.period}</span>
              </div>
              <ul className="mt-6 space-y-3">
                {plan.features.map(f => (
                  <li key={f} className="text-sm text-muted flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={`block w-full mt-8 py-3 rounded-xl text-center font-medium transition-all ${
                  plan.popular ? 'gradient-btn-lg' : 'glass-strong hover:bg-white/10'
                }`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 text-center border-t border-glass-border">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-lg font-bold gradient-text-vivid">LoLA</span>
        </div>
        <p className="text-sm text-muted">
          Built for educators, coaches, and creators.
        </p>
        <p className="text-xs text-muted/50 mt-2">Sabrina/Marcin AI Hackathon 2026</p>
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'LoLA',
          description: 'AI avatars that coach, sell & grow',
          url: 'https://lola-platform.vercel.app',
        }) }}
      />
    </div>
  )
}
