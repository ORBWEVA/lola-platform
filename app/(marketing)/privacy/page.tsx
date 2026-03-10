import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata')
  return {
    title: t('privacyTitle'),
    description: t('privacyDescription'),
  }
}

export default async function PrivacyPage() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-4xl md:text-5xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-[var(--muted)] mb-12">Last updated: March 10, 2026</p>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-bold">1. Introduction</h2>
        <p className="text-[var(--muted)] leading-relaxed">
          ORBWEVA (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates the LoLA platform (&quot;the Platform&quot;). This Privacy Policy explains what data we collect, how we use it, and your rights regarding your personal information. By using the Platform, you consent to the practices described in this policy.
        </p>
      </section>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-bold">2. Data We Collect</h2>
        <p className="text-[var(--muted)] leading-relaxed">
          <strong className="text-[var(--foreground)]">Account data:</strong> Email address, display name, and profile picture provided through Google OAuth or email magic link sign-in.
        </p>
        <p className="text-[var(--muted)] leading-relaxed">
          <strong className="text-[var(--foreground)]">Session data:</strong> Voice conversation transcripts, session duration, credit usage, and feedback ratings you provide after sessions.
        </p>
        <p className="text-[var(--muted)] leading-relaxed">
          <strong className="text-[var(--foreground)]">Payment data:</strong> Payment method and transaction details are processed and stored by Stripe. We do not store your full credit card number on our servers.
        </p>
        <p className="text-[var(--muted)] leading-relaxed">
          <strong className="text-[var(--foreground)]">Creator data:</strong> Avatar configurations including name, personality, domain, images, voice settings, and social media handles.
        </p>
        <p className="text-[var(--muted)] leading-relaxed">
          <strong className="text-[var(--foreground)]">Usage data:</strong> Browser type, device information, IP address, pages visited, and interaction patterns collected automatically through server logs and analytics.
        </p>
      </section>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-bold">3. How We Use Your Data</h2>
        <p className="text-[var(--muted)] leading-relaxed">
          We use your data to: (a) provide and maintain the Platform; (b) process credit purchases and track usage; (c) generate AI voice responses during sessions; (d) improve session quality through cross-session continuity (recent session notes are used to personalize subsequent conversations); (e) provide creators with analytics about their avatar performance; (f) send essential service communications; and (g) detect and prevent fraud or abuse.
        </p>
      </section>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-bold">4. Third-Party Services</h2>
        <p className="text-[var(--muted)] leading-relaxed">
          The Platform integrates with the following third-party services that may process your data according to their own privacy policies:
        </p>
        <ul className="space-y-2 text-[var(--muted)]">
          <li><strong className="text-[var(--foreground)]">Supabase</strong> — Authentication, database, and file storage. Stores account data, session records, and avatar images.</li>
          <li><strong className="text-[var(--foreground)]">OpenAI</strong> — Real-time voice AI. Processes audio input during voice sessions to generate responses. Audio data is sent to OpenAI&apos;s Realtime API for processing.</li>
          <li><strong className="text-[var(--foreground)]">Stripe</strong> — Payment processing. Handles credit card information and transaction records.</li>
          <li><strong className="text-[var(--foreground)]">Vercel</strong> — Hosting and deployment. Processes HTTP requests and may collect server logs including IP addresses.</li>
          <li><strong className="text-[var(--foreground)]">Together AI</strong> — Image generation. Processes text prompts to generate avatar images via FLUX Kontext Pro.</li>
        </ul>
      </section>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-bold">5. Cookies and Local Storage</h2>
        <p className="text-[var(--muted)] leading-relaxed">
          The Platform uses minimal cookies and local storage: (a) <code className="text-[var(--foreground)] text-sm">NEXT_LOCALE</code> cookie to remember your preferred language (English, Japanese, or Korean); (b) Supabase authentication tokens to maintain your login session; (c) essential cookies required for the Platform to function. We do not use third-party advertising or tracking cookies.
        </p>
      </section>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-bold">6. Data Retention</h2>
        <p className="text-[var(--muted)] leading-relaxed">
          Account data is retained for as long as your account is active. Session transcripts and feedback are retained to provide cross-session continuity and creator analytics. Payment records are retained as required by applicable financial regulations. If you delete your account, we will remove your personal data within 30 days, except where retention is required by law. Anonymized, aggregated data may be retained indefinitely for analytics purposes.
        </p>
      </section>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-bold">7. Your Rights</h2>
        <p className="text-[var(--muted)] leading-relaxed">
          Depending on your jurisdiction, you may have the right to: (a) access the personal data we hold about you; (b) request correction of inaccurate data; (c) request deletion of your data; (d) object to or restrict processing of your data; (e) request data portability; and (f) withdraw consent at any time. To exercise any of these rights, contact us at the email address below.
        </p>
      </section>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-bold">8. Data Security</h2>
        <p className="text-[var(--muted)] leading-relaxed">
          We implement industry-standard security measures to protect your data, including encryption in transit (TLS/HTTPS), secure authentication via Supabase, and row-level security policies on our database. However, no method of electronic transmission or storage is 100% secure, and we cannot guarantee absolute security.
        </p>
      </section>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-bold">9. Children&apos;s Privacy</h2>
        <p className="text-[var(--muted)] leading-relaxed">
          The Platform is not intended for children under 16 years of age. We do not knowingly collect personal data from children under 16. If we become aware that we have collected data from a child under 16, we will take steps to delete it promptly.
        </p>
      </section>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-bold">10. Changes to This Policy</h2>
        <p className="text-[var(--muted)] leading-relaxed">
          We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy on this page with a revised &quot;Last updated&quot; date. Continued use of the Platform after changes constitutes acceptance of the updated policy.
        </p>
      </section>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-bold">11. Contact</h2>
        <p className="text-[var(--muted)] leading-relaxed">
          For questions about this Privacy Policy or to exercise your data rights, contact us at{' '}
          <a href="mailto:hello@orbweva.com" className="text-[var(--foreground)] underline hover:opacity-80">
            hello@orbweva.com
          </a>.
        </p>
      </section>
    </div>
  )
}
