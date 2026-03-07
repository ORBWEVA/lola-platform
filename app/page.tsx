import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import LandingHero from './landing-client'

export const metadata: Metadata = {
  title: 'LoLA — AI Avatars That Coach, Sell & Grow',
  description: 'Build a photorealistic AI avatar that posts to social media and has real-time voice conversations with anyone who clicks.',
  openGraph: {
    title: 'LoLA — AI Avatars That Coach, Sell & Grow',
    description: 'Build a photorealistic AI avatar that posts to social media and has real-time voice conversations with anyone who clicks.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LoLA — AI Avatars That Coach, Sell & Grow',
    description: 'Build a photorealistic AI avatar that posts to social media and has real-time voice conversations.',
    images: ['/og-image.png'],
  },
}

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return <LandingHero isLoggedIn={!!user} />
}
