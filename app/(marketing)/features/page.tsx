import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Features — LoLA',
  description: 'Adaptive coaching, social media automation, real-time voice, credit billing, and more. Everything you need to build and scale AI avatars.',
}

const features = [
  {
    icon: (
      <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
    title: 'Adaptive Coaching Engine',
    desc: '12 evidence-based principles personalize every conversation to the individual. The engine adapts in real-time based on learner responses, energy, and progress.',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
      </svg>
    ),
    title: 'Social Media Pipeline',
    desc: 'AI-generated content published to 9 platforms automatically via Blotato. Contextual captions, optimal timing, and consistent voice across every channel.',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
    title: 'Credit System',
    desc: 'Per-minute billing keeps it simple. Users buy credits to talk, creators earn revenue from every conversation. Transparent pricing for everyone.',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A8.966 8.966 0 013 12c0-1.264.26-2.467.732-3.558" />
      </svg>
    ),
    title: 'Multi-Domain',
    desc: 'Language coaching, fitness, sales, mentoring, support — one platform handles it all. Domain-agnostic architecture means your avatar works in any vertical.',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
    title: 'Character Consistency',
    desc: 'FLUX Kontext Pro ensures your avatar looks the same everywhere — across social posts, profile images, and marketing materials. One identity, every surface.',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
      </svg>
    ),
    title: 'Real-Time Voice',
    desc: 'OpenAI Realtime API with WebRTC delivers sub-second latency. Natural, fluid conversations that feel human — not like talking to a chatbot.',
  },
]

export default function FeaturesPage() {
  return (
    <div>
      <div className="text-center mb-16">
        <p className="text-sm font-medium text-violet-400 mb-3 uppercase tracking-wider">Platform</p>
        <h1 className="text-4xl md:text-5xl font-bold">Built for scale</h1>
        <p className="text-[var(--muted)] mt-4 max-w-xl mx-auto">Everything you need to create, deploy, and monetize AI avatars.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {features.map((f) => (
          <div key={f.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center mb-4">
              {f.icon}
            </div>
            <h2 className="font-semibold mb-2">{f.title}</h2>
            <p className="text-sm text-[var(--muted)] leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
