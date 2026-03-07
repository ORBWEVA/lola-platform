import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How It Works — LoLA',
  description: 'Three steps to your AI avatar: create, publish, engage. Build a photorealistic AI avatar that posts to social media and coaches in real-time.',
}

const steps = [
  {
    step: '1',
    title: 'Create Avatar',
    desc: "Describe your avatar's personality, expertise, and visual appearance. Our AI generates photorealistic images in seconds using FLUX Kontext Pro, ensuring character consistency across all content.",
    icon: (
      <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
    ),
    color: 'indigo',
  },
  {
    step: '2',
    title: 'Auto-Post to Social',
    desc: 'One click publishes AI-generated content to 9 platforms via Blotato. AI writes contextual captions, selects optimal posting times, and maintains your avatar\'s unique voice across channels.',
    icon: (
      <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
      </svg>
    ),
    color: 'emerald',
  },
  {
    step: '3',
    title: 'Users Engage',
    desc: "Anyone who clicks gets a real-time adaptive voice conversation powered by OpenAI's Realtime API. Your avatar coaches, sells, and supports — adapting to each individual in real-time.",
    icon: (
      <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
      </svg>
    ),
    color: 'violet',
  },
]

export default function HowItWorksPage() {
  return (
    <div>
      <div className="text-center mb-16">
        <p className="text-sm font-medium text-indigo-400 mb-3 uppercase tracking-wider">How it works</p>
        <h1 className="text-4xl md:text-5xl font-bold">Three steps to your AI avatar</h1>
      </div>

      <div className="space-y-8">
        {steps.map((item) => (
          <div key={item.step} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 flex gap-6 items-start animated-border">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center">
              {item.icon}
            </div>
            <div>
              <div className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-1">Step {item.step}</div>
              <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
              <p className="text-[var(--muted)] leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
