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
        <p className="text-sm font-medium text-[var(--muted)] mb-3 uppercase tracking-wider">Pricing</p>
        <h1 className="text-4xl md:text-5xl font-bold">Start free, scale as you grow</h1>
        <p className="text-[var(--muted)] mt-4 max-w-xl mx-auto">No credit card required. Upgrade when you need more.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl p-6 relative animated-border ${
              plan.popular
                ? 'border-2 border-[var(--foreground)]/20 bg-[var(--card)]'
                : 'border border-[var(--border)] bg-[var(--card)]'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-[var(--foreground)] text-[var(--background)]">
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
                  <span className="w-1 h-1 rounded-full bg-[var(--foreground)]/40 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className={`block w-full mt-8 py-3 rounded-xl text-center font-medium transition-all ${
                plan.popular
                  ? 'bg-[var(--foreground)] text-[var(--background)] hover:opacity-90'
                  : 'border border-[var(--border)] hover:bg-[var(--foreground)]/5'
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
