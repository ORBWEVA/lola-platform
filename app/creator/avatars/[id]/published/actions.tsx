'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Props {
  profileUrl: string
  sessionUrl: string
  caption: string
  anchorImageUrl: string | null
  sceneImages: string[]
  avatarName: string
  instagramHandle: string | null
}

export default function PublishedActions({ profileUrl, sessionUrl, caption, anchorImageUrl, sceneImages, avatarName, instagramHandle }: Props) {
  const allImages = [anchorImageUrl, ...sceneImages].filter(Boolean) as string[]
  const [selectedImage, setSelectedImage] = useState(anchorImageUrl || allImages[0] || null)
  const [copied, setCopied] = useState<'link' | 'caption' | null>(null)

  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${profileUrl}` : profileUrl
  const handle = avatarName.toLowerCase().replace(/\s+/g, '')

  const copyLink = async () => {
    await navigator.clipboard.writeText(fullUrl)
    setCopied('link')
    setTimeout(() => setCopied(null), 2000)
  }

  const copyCaption = async () => {
    await navigator.clipboard.writeText(caption)
    setCopied('caption')
    setTimeout(() => setCopied(null), 2000)
  }

  const downloadImage = async () => {
    if (!selectedImage) return
    try {
      // Proxy through our API to avoid CORS on external URLs
      const res = await fetch(`/api/avatars/download?url=${encodeURIComponent(selectedImage)}`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'avatar-post.jpg'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      window.open(selectedImage, '_blank')
    }
  }

  const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

  const shareToInstagram = async () => {
    if (isMobile && navigator.share && selectedImage) {
      try {
        const res = await fetch(selectedImage)
        const blob = await res.blob()
        const file = new File([blob], 'avatar-post.jpg', { type: blob.type })
        await navigator.share({ text: caption, files: [file] })
        return
      } catch { /* fallback below */ }
    }
    await navigator.clipboard.writeText(caption)
    setCopied('caption')
    setTimeout(() => setCopied(null), 2000)
    window.open('https://instagram.com', '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Social preview card */}
      {selectedImage && (
        <div className="glass rounded-2xl overflow-hidden max-w-sm mx-auto">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-glass-border">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-sky-400 flex items-center justify-center text-xs font-bold">
              {avatarName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold truncate">{handle}</p>
              <p className="text-[10px] text-muted">Instagram</p>
            </div>
            <span className="text-[10px] text-muted px-2 py-0.5 rounded-full border border-glass-border">Preview</span>
          </div>
          <div className="aspect-square bg-card">
            <img src={selectedImage} alt={avatarName} className="w-full h-full object-cover" width={400} height={400} />
          </div>
          <div className="px-4 py-3 text-left">
            <p className="text-sm leading-relaxed">
              <span className="font-semibold mr-1">{handle}</span>
              {caption}
            </p>
          </div>
          <div className="px-4 pb-3 text-left">
            <p className="text-[10px] text-muted">Talk to {avatarName} — link in bio</p>
          </div>
        </div>
      )}

      {/* Scene picker */}
      {allImages.length > 1 && (
        <div className="text-left">
          <p className="text-xs font-medium text-muted mb-2">Choose post image</p>
          <div className="grid grid-cols-4 gap-2">
            {allImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(img)}
                className={`rounded-lg overflow-hidden aspect-square ring-2 transition-all cursor-pointer ${
                  selectedImage === img ? 'ring-indigo-500 scale-105' : 'ring-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Option ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="space-y-3">
        <Link
          href={sessionUrl}
          className="block w-full py-4 rounded-xl gradient-btn text-lg font-semibold"
        >
          Test Your Avatar
        </Link>

        <Link
          href={profileUrl}
          className="block w-full py-3 rounded-xl glass font-medium hover:bg-white/10 transition-colors"
        >
          View Profile Page
        </Link>

        {/* Instagram share section */}
        {selectedImage && (
          <div className="glass rounded-xl p-4 space-y-3">
            <p className="text-xs font-medium text-indigo-300">Share to Instagram</p>

            {isMobile ? (
              <button
                onClick={shareToInstagram}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 font-medium text-white"
              >
                Share to Instagram
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={downloadImage}
                  className="w-full py-3 rounded-xl glass font-medium hover:bg-white/10 transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V3" />
                  </svg>
                  Download Post Image
                </button>
                <button
                  onClick={copyCaption}
                  className="w-full py-3 rounded-xl glass font-medium hover:bg-white/10 transition-colors text-sm"
                >
                  {copied === 'caption' ? 'Caption Copied!' : 'Copy Caption'}
                </button>
                <button
                  onClick={shareToInstagram}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 font-medium text-white text-sm"
                >
                  Open Instagram
                </button>
              </div>
            )}
          </div>
        )}

        {/* Copy share link */}
        <button
          onClick={copyLink}
          className="w-full py-3 rounded-xl glass font-medium hover:bg-white/10 transition-colors text-sm"
        >
          {copied === 'link' ? 'Link Copied!' : 'Copy Bio Link'}
        </button>
      </div>
    </div>
  )
}
