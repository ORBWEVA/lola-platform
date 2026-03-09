import Link from 'next/link'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata')
  return {
    title: t('pricingTitle'),
    description: t('pricingDescription'),
  }
}

export default async function PricingPage() {
  const t = await getTranslations('pricing')

  const plans = [
    {
      name: t('free'),
      price: '$0',
      period: t('forever'),
      features: [
        t('features.oneAvatar'),
        t('features.fiftySessions'),
        t('features.basicAnalytics'),
        t('features.lolaBranding'),
      ],
      popular: false,
    },
    {
      name: t('creator'),
      price: '$29',
      period: t('perMonth'),
      features: [
        t('features.fiveAvatars'),
        t('features.unlimitedSessions'),
        t('features.socialPublishing'),
        t('features.customBranding'),
        t('features.prioritySupport'),
      ],
      popular: true,
    },
    {
      name: t('pro'),
      price: '$99',
      period: t('perMonth'),
      features: [
        t('features.unlimitedAvatars'),
        t('features.unlimitedSessions'),
        t('features.apiAccess'),
        t('features.whiteLabel'),
        t('features.teamAccounts'),
        t('features.advancedAnalytics'),
      ],
      popular: false,
    },
  ]

  return (
    <div>
      <div className="text-center mb-16">
        <p className="text-sm font-medium text-[var(--muted)] mb-3 uppercase tracking-wider">{t('label')}</p>
        <h1 className="text-4xl md:text-5xl font-bold">{t('title')}</h1>
        <p className="text-[var(--muted)] mt-4 max-w-xl mx-auto">{t('subtitle')}</p>
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
                  {t('mostPopular')}
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
              {t('getStarted')}
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
