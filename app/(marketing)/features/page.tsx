import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Features — LoLA',
  description: 'Adaptive coaching, social media automation, real-time voice, credit billing, and more. Everything you need to build and scale AI avatars.',
}

const features = [
  {
    title: 'Adaptive Coaching Engine',
    desc: '12 evidence-based principles personalize every conversation to the individual. The engine adapts in real-time based on learner responses, energy, and progress.',
  },
  {
    title: 'Social Media Pipeline',
    desc: 'AI-generated content published to 9 platforms automatically via Blotato. Contextual captions, optimal timing, and consistent voice across every channel.',
  },
  {
    title: 'Credit System',
    desc: 'Per-minute billing keeps it simple. Users buy credits to talk, creators earn revenue from every conversation. Transparent pricing for everyone.',
  },
  {
    title: 'Multi-Domain',
    desc: 'Language coaching, fitness, sales, mentoring, support — one platform handles it all. Domain-agnostic architecture means your avatar works in any vertical.',
  },
  {
    title: 'Character Consistency',
    desc: 'FLUX Kontext Pro ensures your avatar looks the same everywhere — across social posts, profile images, and marketing materials. One identity, every surface.',
  },
  {
    title: 'Real-Time Voice',
    desc: 'OpenAI Realtime API with WebRTC delivers sub-second latency. Natural, fluid conversations that feel human — not like talking to a chatbot.',
  },
]

export default function FeaturesPage() {
  return (
    <div>
      <div className="text-center mb-16">
        <p className="text-sm font-medium text-[var(--muted)] mb-3 uppercase tracking-wider">Platform</p>
        <h1 className="text-4xl md:text-5xl font-bold">Built for scale</h1>
        <p className="text-[var(--muted)] mt-4 max-w-xl mx-auto">Everything you need to create, deploy, and monetize AI avatars.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {features.map((f) => (
          <div key={f.title} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 animated-border">
            <h2 className="font-semibold mb-2">{f.title}</h2>
            <p className="text-sm text-[var(--muted)] leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
