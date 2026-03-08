'use client'

interface SocialPreviewCardProps {
  avatarName: string
  avatarImage: string | null
  caption: string
  platform?: 'instagram' | 'tiktok' | 'x'
}

export default function SocialPreviewCard({ avatarName, avatarImage, caption, platform = 'instagram' }: SocialPreviewCardProps) {
  const platformLabels = {
    instagram: 'Instagram',
    tiktok: 'TikTok',
    x: 'X (Twitter)',
  }

  return (
    <div className="glass rounded-2xl overflow-hidden max-w-sm mx-auto">
      {/* Platform header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-glass-border">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-sky-400 flex items-center justify-center text-xs font-bold">
          {avatarName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{avatarName.toLowerCase().replace(/\s+/g, '')}</p>
          <p className="text-[10px] text-muted">{platformLabels[platform]}</p>
        </div>
        <span className="text-[10px] text-muted px-2 py-0.5 rounded-full border border-glass-border">Preview</span>
      </div>

      {/* Image */}
      {avatarImage && (
        <div className="aspect-square relative bg-card">
          <img src={avatarImage} alt={avatarName} className="w-full h-full object-cover" loading="eager" width={400} height={400} />
        </div>
      )}

      {/* Caption */}
      <div className="px-4 py-3">
        <p className="text-sm leading-relaxed">
          <span className="font-semibold mr-1">{avatarName.toLowerCase().replace(/\s+/g, '')}</span>
          {caption}
        </p>
      </div>

      {/* Footer */}
      <div className="px-4 pb-3">
        <p className="text-[10px] text-muted">Talk to {avatarName} — link in bio</p>
      </div>
    </div>
  )
}
