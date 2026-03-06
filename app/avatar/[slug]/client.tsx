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
    <div className="min-h-screen pb-20">
      {/* Hero */}
      <div className="relative h-[50vh] min-h-[300px]">
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
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <h1 className="text-3xl font-bold">{avatar.name}</h1>
          <p className="text-muted mt-1">{avatar.tagline || preset.label}</p>
        </div>
      </div>

      <div className="px-6 -mt-2 space-y-6">
        {/* Social proof + multilingual */}
        <div className="flex items-center gap-4 text-sm text-muted flex-wrap">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-medium">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A8.966 8.966 0 013 12c0-1.97.633-3.794 1.708-5.278" />
            </svg>
            Multilingual
          </span>
          <span>{avatar.session_count} sessions</span>
          <span className="text-amber-400">{'★'.repeat(Math.round(avatar.rating))} {avatar.rating}</span>
        </div>

        {/* CTA */}
        <Link
          href={sessionUrl}
          className="block w-full py-4 rounded-2xl gradient-btn text-center text-lg font-semibold"
        >
          Talk to Me
        </Link>
        <p className="text-center text-xs text-muted -mt-3">Free — no credit card needed</p>

        {/* Scene gallery */}
        {avatar.scene_images?.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-muted mb-3">Gallery</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-none">
              {avatar.scene_images.map((img, i) => (
                <div key={i} className="flex-shrink-0 w-32 h-32 rounded-xl overflow-hidden">
                  <Image
                    src={img}
                    alt={`${avatar.name} scene ${i + 1}`}
                    width={128}
                    height={128}
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
            <h3 className="text-sm font-medium text-muted mb-3">Products</h3>
            <div className="grid grid-cols-2 gap-3">
              {products.map(product => (
                <a
                  key={product.id}
                  href={product.checkout_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass rounded-2xl p-4 hover:bg-white/10 transition-colors"
                >
                  {product.image_url && (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      width={200}
                      height={120}
                      className="w-full h-24 object-cover rounded-xl mb-2"
                    />
                  )}
                  <p className="font-medium text-sm">{product.name}</p>
                  {product.price && (
                    <p className="text-emerald-400 text-sm mt-1">
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
          <div className="flex justify-center gap-4">
            {Object.entries(avatar.social_links).map(([platform, url]) => (
              url && (
                <a
                  key={platform}
                  href={url as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors text-sm uppercase"
                >
                  {platform.slice(0, 2)}
                </a>
              )
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-4 pb-8 border-t border-glass-border">
          <Link href="/" className="text-sm text-muted hover:text-indigo-400 transition-colors">
            Powered by <span className="gradient-text font-semibold">LoLA</span> — Create your own
          </Link>
        </div>
      </div>
    </div>
  )
}
