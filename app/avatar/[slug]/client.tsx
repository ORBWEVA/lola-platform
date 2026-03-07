'use client'

import Link from 'next/link'
import Image from 'next/image'
import { getDomainPreset } from '@/lib/coaching/domains'

interface Avatar {
  id: string
  name: string
  slug: string
  tagline: string | null
  domain: string
  anchor_image_url: string | null
  scene_images: string[]
  session_count: number
  rating: number
  social_links: Record<string, string> | null
}

interface Product {
  id: string
  name: string
  description: string | null
  price: number | null
  currency: string
  checkout_url: string
  image_url: string | null
}

interface Props {
  avatar: Avatar
  products: Product[]
  isLoggedIn: boolean
}

export default function AvatarProfileClient({ avatar, products, isLoggedIn }: Props) {
  const preset = getDomainPreset(avatar.domain)
  const sessionUrl = isLoggedIn ? `/session/${avatar.slug}` : `/login?next=/session/${avatar.slug}`

  return (
    <div className="min-h-screen pb-20 noise monochrome">
      <div className="mesh-bg" />

      {/* Hero */}
      <div className="relative h-[55vh] min-h-[360px]">
        {avatar.anchor_image_url ? (
          <Image
            src={avatar.anchor_image_url}
            alt={avatar.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-emerald-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-black/20" />

        {/* Back nav */}
        <Link
          href="/"
          className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-2 rounded-xl glass-strong text-sm text-white/80 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Browse
        </Link>

        <div className="absolute bottom-8 left-6 right-6 z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-medium backdrop-blur-sm border border-indigo-500/20">
              {preset.label}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-white/70 font-medium backdrop-blur-sm border border-white/10">
              Multilingual
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">{avatar.name}</h1>
          <p className="text-muted text-lg mt-2">{avatar.tagline || preset.label}</p>
        </div>
      </div>

      <div className="relative z-10 px-6 -mt-2 space-y-8 max-w-2xl mx-auto">
        {/* Social proof */}
        <div className="flex items-center gap-5 text-sm text-muted">
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400 text-base">{'★'.repeat(Math.round(avatar.rating))}</span>
            <span className="font-medium text-foreground">{avatar.rating}</span>
          </div>
          <div className="w-px h-4 bg-glass-border" />
          <span className="font-medium text-foreground">{avatar.session_count}</span>
          <span className="-ml-4">sessions</span>
        </div>

        {/* CTA */}
        <Link
          href={sessionUrl}
          className="block w-full py-4 rounded-2xl gradient-btn-lg text-center text-lg font-semibold pulse-glow"
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
            Talk to {avatar.name}
          </span>
        </Link>
        <p className="text-center text-xs text-muted -mt-5">Free — no credit card needed</p>

        {/* Scene gallery */}
        {avatar.scene_images?.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-muted mb-4 uppercase tracking-wider">Gallery</h3>
            <div className="flex gap-3 overflow-x-auto pb-3 -mx-6 px-6 scrollbar-none">
              {avatar.scene_images.map((img, i) => (
                <div key={i} className="flex-shrink-0 w-36 h-36 rounded-xl overflow-hidden ring-1 ring-white/10 hover:ring-indigo-500/30 transition-all hover:scale-105 duration-300">
                  <Image
                    src={img}
                    alt={`${avatar.name} scene ${i + 1}`}
                    width={144}
                    height={144}
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Products */}
        {products.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-muted mb-4 uppercase tracking-wider">Products</h3>
            <div className="grid grid-cols-2 gap-3">
              {products.map(product => (
                <a
                  key={product.id}
                  href={product.checkout_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glow-card rounded-2xl p-4"
                >
                  {product.image_url && (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      width={200}
                      height={120}
                      className="w-full h-24 object-cover rounded-xl mb-3"
                    />
                  )}
                  <p className="font-medium text-sm">{product.name}</p>
                  {product.description && (
                    <p className="text-xs text-muted mt-1 line-clamp-2">{product.description}</p>
                  )}
                  {product.price && (
                    <p className="text-emerald-400 font-semibold text-sm mt-2">
                      {product.currency === 'USD' ? '$' : product.currency}{product.price}
                    </p>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Social links */}
        {avatar.social_links && Object.keys(avatar.social_links).length > 0 && (
          <div className="flex justify-center gap-3">
            {Object.entries(avatar.social_links).map(([platform, url]) => (
              url && (
                <a
                  key={platform}
                  href={url as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full glass-strong flex items-center justify-center hover:bg-white/10 transition-all hover:scale-110 text-sm uppercase text-muted hover:text-foreground"
                >
                  {platform.slice(0, 2)}
                </a>
              )
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-6 pb-8 border-t border-glass-border">
          <Link href="/" className="text-sm text-muted hover:text-indigo-400 transition-colors">
            Powered by <span className="gradient-text font-semibold">LoLA</span> — Create your own
          </Link>
        </div>
      </div>
    </div>
  )
}
