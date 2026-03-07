import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing — LoLA',
  description: 'Start free with 1 avatar and 50 sessions/month. Scale to Creator ($29/mo) or Pro ($99/mo) for unlimited avatars, social publishing, and API access.',
}

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: ['1 avatar', '50 sessions/mo', 'Basic analytics', 'LoLA branding'],
    popular: false,
  },
  {
    name: 'Creator',
    price: '$29',
    period: '/mo',
    features: ['5 avatars', 'Unlimited sessions', 'Social publishing', 'Custom branding', 'Priority support'],
    popular: true,
  },
  {
    name: 'Pro',
    price: '$99',
    period: '/mo',
    features: ['Unlimited avatars', 'Unlimited sessions', 'API access', 'White-label', 'Team accounts', 'Advanced analytics'],
    popular: false,
  },
]

export default function PricingPage() {
  return (
    <div>
      <div className="text-center mb-16">
        <p className="text-sm font-medium text-indigo-400 mb-3 uppercase tracking-wider">Pricing</p>
        <h1 className="text-4xl md:text-5xl font-bold">Start free, scale as you grow</h1>
        <p className="text-[var(--muted)] mt-4 max-w-xl mx-auto">No credit card required. Upgrade when you need more.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl p-6 relative ${
              plan.popular
                ? 'border-2 border-indigo-500/50 bg-white/[0.05]'
                : 'border border-white/10 bg-white/[0.03]'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 text-white">
                  Most Popular
                </span>
              </div>
            )}
            <h2 className="text-lg font-bold mt-1">{plan.name}</h2>
            <div className="flex items-baseline gap-1 mt-3">
              <p className="text-4xl font-bold">{plan.price}</p>
              <span className="text-sm text-[var(--muted)]">{plan.period}</span>
            </div>
            <ul className="mt-6 space-y-3">
              {plan.features.map((f) => (
                <li key={f} className="text-sm text-[var(--muted)] flex items-center gap-2.5">
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
                plan.popular
                  ? 'bg-gradient-to-r from-indigo-500 to-emerald-500 text-white hover:opacity-90'
                  : 'border border-white/10 bg-white/[0.05] hover:bg-white/10'
              }`}
            >
              Get Started
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
