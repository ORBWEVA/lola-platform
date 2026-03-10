import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata')
  return {
    title: t('termsTitle'),
    description: t('termsDescription'),
  }
}

export default async function TermsPage() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-4xl md:text-5xl font-bold mb-2">Terms of Service</h1>
      <p className="text-[var(--muted)] mb-12">Last updated: March 10, 2026</p>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-bold">1. Acceptance of Terms</h2>
        <p className="text-[var(--muted)] leading-relaxed">
          By accessing or using LoLA (&quot;the Platform&quot;), operated by ORBWEVA (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Platform. We may update these terms at any time by posting the revised version on this page. Continued use of the Platform after changes constitutes acceptance of the updated terms.
        </p>
      </section>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-bold">2. Account Registration</h2>
        <p className="text-[var(--muted)] leading-relaxed">
          To use certain features of the Platform, you must create an account using Google OAuth or email magic link authentication via Supabase. You are responsible for maintaining the security of your account credentials and for all activity that occurs under your account. You must be at least 16 years old to create an account. You agree to provide accurate, current information during registration.
        </p>
      </section>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-bold">3. Credits and Payments</h2>
        <p className="text-[var(--muted)] leading-relaxed">
          The Platform uses a credit-based system for voice sessions. One credit equals one minute of conversation. Credits are available in the following packages: 30 credits for $4.99, 100 credits for $12.99, and 300 credits for $29.99. All payments are processed securely through Stripe. Credits are non-refundable and do not expire. Prices are in US dollars and may be subject to applicable taxes. We reserve the right to change pricing with reasonable notice.
        </p>
      </section>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-bold">4. Acceptable Use</h2>
        <p className="text-[var(--muted)] leading-relaxed">
          You agree not to use the Platform to: (a) violate any applicable law or regulation; (b) harass, abuse, or harm another person; (c) generate or distribute harmful, illegal, or offensive content; (d) attempt to reverse-engineer, hack, or compromise Platform security; (e) use automated scripts or bots to interact with the Platform without authorization; (f) impersonate any person or entity; or (g) interfere with or disrupt the Platform&apos;s infrastructure.
        </p>
      </section>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-bold">5. AI-Generated Content</h2>
        <p className="text-[var(--muted)] leading-relaxed">
          The Platform uses artificial intelligence to generate avatar images, voice responses, and other content. AI-generated content may not always be accurate, complete, or appropriate. We do not guarantee the accuracy of any AI-generated output. You acknowledge that avatar conversations are powered by AI language models and should not be relied upon for professional medical, legal, financial, or other expert advice. Creators are responsible for configuring their avatars appropriately and monitoring interactions.
        </p>
      </section>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-bold">6. Intellectual Property</h2>
        <p className="text-[var(--muted)] leading-relaxed">
          The Platform, including its design, code, and branding, is owned by ORBWEVA. Creators retain ownership of the content they configure for their avatars (personality descriptions, domain settings, uploaded images). AI-generated images and content produced through the Platform are licensed to the creator for use on and off the Platform. You grant us a non-exclusive license to display and distribute your avatar content as part of the Platform&apos;s normal operation.
        </p>
      </section>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-bold">7. Limitation of Liability</h2>
        <p className="text-[var(--muted)] leading-relaxed">
          THE PLATFORM IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. TO THE MAXIMUM EXTENT PERMITTED BY LAW, ORBWEVA SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE PLATFORM. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU HAVE PAID US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM. This limitation applies regardless of the legal theory on which the claim is based.
        </p>
      </section>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-bold">8. Termination</h2>
        <p className="text-[var(--muted)] leading-relaxed">
          We may suspend or terminate your account at any time for violation of these terms or for any other reason at our sole discretion, with or without notice. You may delete your account at any time by contacting us. Upon termination, your right to use the Platform ceases immediately. Unused credits are forfeited upon account termination for cause. Sections regarding intellectual property, limitation of liability, and governing law survive termination.
        </p>
      </section>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-bold">9. Governing Law</h2>
        <p className="text-[var(--muted)] leading-relaxed">
          These terms are governed by and construed in accordance with the laws of Australia. Any disputes arising from these terms or your use of the Platform shall be resolved in the courts of Australia. If any provision of these terms is found to be unenforceable, the remaining provisions shall remain in full force and effect.
        </p>
      </section>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-bold">10. Contact</h2>
        <p className="text-[var(--muted)] leading-relaxed">
          For questions about these Terms of Service, contact us at{' '}
          <a href="mailto:hello@orbweva.com" className="text-[var(--foreground)] underline hover:opacity-80">
            hello@orbweva.com
          </a>.
        </p>
      </section>
    </div>
  )
}
