import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata')
  return {
    title: t('featuresTitle'),
    description: t('featuresDescription'),
  }
}

export default async function FeaturesPage() {
  const t = await getTranslations('features')

  const features = [
    { title: t('adaptiveCoaching'), desc: t('adaptiveCoachingDesc') },
    { title: t('socialPipeline'), desc: t('socialPipelineDesc') },
    { title: t('creditSystem'), desc: t('creditSystemDesc') },
    { title: t('multiDomain'), desc: t('multiDomainDesc') },
    { title: t('characterConsistency'), desc: t('characterConsistencyDesc') },
    { title: t('realtimeVoice'), desc: t('realtimeVoiceDesc') },
  ]

  return (
    <div>
      <div className="text-center mb-16">
        <p className="text-sm font-medium text-[var(--muted)] mb-3 uppercase tracking-wider">{t('label')}</p>
        <h1 className="text-4xl md:text-5xl font-bold">{t('title')}</h1>
        <p className="text-[var(--muted)] mt-4 max-w-xl mx-auto">{t('subtitle')}</p>
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
