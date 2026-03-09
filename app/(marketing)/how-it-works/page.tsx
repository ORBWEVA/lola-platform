import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata')
  return {
    title: t('howItWorksTitle'),
    description: t('howItWorksDescription'),
  }
}

export default async function HowItWorksPage() {
  const t = await getTranslations('howItWorks')

  const steps = [
    { step: '01', title: t('step1Title'), desc: t('step1Desc') },
    { step: '02', title: t('step2Title'), desc: t('step2Desc') },
    { step: '03', title: t('step3Title'), desc: t('step3Desc') },
  ]

  return (
    <div>
      <div className="text-center mb-16">
        <p className="text-sm font-medium text-[var(--muted)] mb-3 uppercase tracking-wider">{t('label')}</p>
        <h1 className="text-4xl md:text-5xl font-bold">{t('title')}</h1>
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
