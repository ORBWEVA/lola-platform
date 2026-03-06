import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'

export default async function LandingPage() {
  const supabase = await createClient()

  const { data: avatars } = await supabase
    .from('avatars')
    .select('id, name, slug, tagline, domain, anchor_image_url, session_count')
    .eq('is_published', true)
    .order('session_count', { ascending: false })
    .limit(6)

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 glass sticky top-0 z-50">
        <span className="text-xl font-bold gradient-text">LoLA</span>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-muted hover:text-foreground transition-colors">
            Sign In
          </Link>
          <Link href="/signup" className="text-sm px-4 py-2 rounded-xl gradient-btn font-medium">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-20 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          AI avatars that{' '}
          <span className="gradient-text">coach, sell & grow</span>
          {' '}— autonomously
        </h1>
        <p className="text-lg text-muted mt-6 max-w-xl mx-auto">
          Build a photorealistic AI avatar that posts to social media and has real-time voice conversations with anyone who clicks.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link href="/signup" className="px-8 py-4 rounded-2xl gradient-btn text-lg font-semibold">
            Create Your First Avatar — Free
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-12">How it works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '1', title: 'Create Avatar', desc: 'Describe your avatar. AI generates photorealistic images in seconds.' },
            { step: '2', title: 'Auto-Post to Social', desc: 'One click publishes to 9 platforms. AI writes the captions.' },
            { step: '3', title: 'Users Engage', desc: 'Anyone who clicks gets a real-time adaptive voice conversation.' },
          ].map(item => (
            <div key={item.step} className="glass rounded-2xl p-6 text-center">
              <div className="w-12 h-12 rounded-full gradient-btn flex items-center justify-center text-xl font-bold mx-auto">
                {item.step}
              </div>
              <h3 className="font-semibold mt-4">{item.title}</h3>
              <p className="text-sm text-muted mt-2">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo Avatars */}
      {avatars && avatars.length > 0 && (
        <section className="px-6 py-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-4">Try a conversation</h2>
          <p className="text-muted text-center mb-12">Meet our demo avatars — each one adapts to you</p>
          <div className="grid md:grid-cols-3 gap-6">
            {avatars.map(avatar => (
              <Link
                key={avatar.id}
                href={`/avatar/${avatar.slug}`}
                className="glass rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all group"
              >
                <div className="h-48 relative">
                  {avatar.anchor_image_url ? (
                    <Image
                      src={avatar.anchor_image_url}
                      alt={avatar.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-emerald-900" />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{avatar.name}</h3>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 font-medium">Multilingual</span>
                  </div>
                  <p className="text-sm text-muted">{avatar.tagline}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-muted">{avatar.session_count} sessions</span>
                    <span className="text-xs px-3 py-1 rounded-full gradient-btn">Try Now</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Feature grid */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-12">Built for scale</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { title: 'Adaptive Coaching Engine', desc: '12 evidence-based principles personalize every conversation to the individual.' },
            { title: 'Social Media Pipeline', desc: 'AI-generated content published to 9 platforms automatically via Blotato.' },
            { title: 'Credit System', desc: 'Per-minute billing. Users buy credits. Creators earn revenue.' },
            { title: 'Multi-Domain', desc: 'Language coaching, fitness, sales, mentoring, support — one platform.' },
            { title: 'Character Consistency', desc: 'FLUX Kontext Pro ensures your avatar looks the same everywhere.' },
            { title: 'Real-Time Voice', desc: 'OpenAI Realtime API with WebRTC. Sub-second latency.' },
          ].map(f => (
            <div key={f.title} className="glass rounded-2xl p-5">
              <h3 className="font-semibold text-sm">{f.title}</h3>
              <p className="text-xs text-muted mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-12">Pricing</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: 'Free', price: '$0', features: ['1 avatar', '50 sessions/mo', 'Basic analytics', 'LoLA branding'] },
            { name: 'Creator', price: '$29/mo', features: ['5 avatars', 'Unlimited sessions', 'Social publishing', 'Custom branding', 'Priority support'], popular: true },
            { name: 'Pro', price: '$99/mo', features: ['Unlimited avatars', 'Unlimited sessions', 'API access', 'White-label', 'Team accounts', 'Advanced analytics'] },
          ].map(plan => (
            <div key={plan.name} className={`glass rounded-2xl p-6 ${plan.popular ? 'border-indigo-500/50 ring-1 ring-indigo-500/20' : ''}`}>
              {plan.popular && <p className="text-xs text-indigo-400 font-medium mb-2">Most Popular</p>}
              <h3 className="text-lg font-bold">{plan.name}</h3>
              <p className="text-3xl font-bold mt-2">{plan.price}</p>
              <ul className="mt-4 space-y-2">
                {plan.features.map(f => (
                  <li key={f} className="text-sm text-muted flex items-center gap-2">
                    <span className="text-emerald-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={`block w-full mt-6 py-3 rounded-xl text-center font-medium ${
                  plan.popular ? 'gradient-btn' : 'glass hover:bg-white/10 transition-colors'
                }`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 text-center border-t border-glass-border">
        <p className="text-sm text-muted">
          Built for educators, coaches, and creators.{' '}
          <span className="gradient-text font-semibold">LoLA</span> — Sabrina/Marcin AI Hackathon 2026
        </p>
      </footer>
    </div>
  )
}
