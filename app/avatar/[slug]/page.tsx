import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getDomainPreset } from '@/lib/coaching/domains'
import AvatarProfileClient from './client'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: avatar } = await supabase
    .from('avatars')
    .select('name, tagline, anchor_image_url, domain')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!avatar) return { title: 'Avatar Not Found' }

  return {
    title: `${avatar.name} — LoLA`,
    description: avatar.tagline || `Talk to ${avatar.name} on LoLA`,
    openGraph: {
      title: avatar.name,
      description: avatar.tagline || `Talk to ${avatar.name}`,
      images: avatar.anchor_image_url ? [{ url: avatar.anchor_image_url }] : [],
    },
  }
}

export default async function AvatarProfilePage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: avatar } = await supabase
    .from('avatars')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!avatar) notFound()

  const { data: products } = await supabase
    .from('creator_products')
    .select('*')
    .eq('avatar_id', avatar.id)
    .eq('is_active', true)
    .order('sort_order')

  const { data: { user } } = await supabase.auth.getUser()

  const preset = getDomainPreset(avatar.domain)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: avatar.name,
    description: avatar.tagline,
    image: avatar.anchor_image_url,
    url: `https://lola-platform.vercel.app/avatar/${slug}`,
    jobTitle: preset.label,
    knowsLanguage: ['en', 'ja', 'ko', 'es', 'de', 'fr'],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AvatarProfileClient
        avatar={avatar}
        products={products || []}
        isLoggedIn={!!user}
      />
    </>
  )
}
