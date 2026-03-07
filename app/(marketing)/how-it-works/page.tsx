import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How It Works — LoLA',
  description: 'Three steps to your AI avatar: create, publish, engage. Build a photorealistic AI avatar that posts to social media and coaches in real-time.',
}

const steps = [
  {
    step: '01',
    title: 'Create Avatar',
    desc: "Describe your avatar's personality, expertise, and visual appearance. Our AI generates photorealistic images in seconds using FLUX Kontext Pro, ensuring character consistency across all content.",
  },
  {
    step: '02',
    title: 'Auto-Post to Social',
    desc: 'One click publishes AI-generated content to 9 platforms via Blotato. AI writes contextual captions, selects optimal posting times, and maintains your avatar\'s unique voice across channels.',
  },
  {
    step: '03',
    title: 'Users Engage',
    desc: "Anyone who clicks gets a real-time adaptive voice conversation powered by OpenAI's Realtime API. Your avatar coaches, sells, and supports — adapting to each individual in real-time.",
  },
]

export default function HowItWorksPage() {
  return (
    <div>
      <div className="text-center mb-16">
        <p className="text-sm font-medium text-[var(--muted)] mb-3 uppercase tracking-wider">How it works</p>
        <h1 className="text-4xl md:text-5xl font-bold">Three steps to your AI avatar</h1>
      </div>

      <div className="space-y-6">
        {steps.map((item) => (
          <div key={item.step} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 animated-border">
            <div className="flex items-baseline gap-4 mb-3">
              <span className="text-3xl font-bold text-[var(--muted)]/30" style={{ fontFamily: 'var(--font-space-mono)' }}>{item.step}</span>
              <h2 className="text-xl font-semibold">{item.title}</h2>
            </div>
            <p className="text-[var(--muted)] leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
