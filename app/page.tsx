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

  let userInfo: { name: string; role: string } | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, role')
      .eq('id', user.id)
      .single()
    if (profile) {
      userInfo = {
        name: profile.display_name || user.email?.split('@')[0] || 'there',
        role: profile.role || 'learner',
      }
    }
  }

  return <LandingHero isLoggedIn={!!user} userInfo={userInfo} />
}
