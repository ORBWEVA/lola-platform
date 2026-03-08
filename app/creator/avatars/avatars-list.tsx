'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'

interface Avatar {
  id: string
  name: string
  slug: string
  tagline: string | null
  anchor_image_url: string | null
  is_published: boolean
  session_count: number | null
}

export default function AvatarsList({ avatars: initial }: { avatars: Avatar[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [avatars, setAvatars] = useState(initial)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const selectMode = selected.size > 0

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const deleteSelected = async () => {
    setDeleting(true)
    const ids = Array.from(selected)
    const { error } = await supabase
      .from('avatars')
      .delete()
      .in('id', ids)

    if (!error) {
      setAvatars(prev => prev.filter(a => !selected.has(a.id)))
      setSelected(new Set())
      setConfirmDelete(false)
      router.refresh()
    }
    setDeleting(false)
  }

  if (avatars.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Avatars</h1>
          <Link href="/creator/avatars/new" className="px-4 py-2 rounded-xl gradient-btn text-sm font-medium">
            + New Avatar
          </Link>
        </div>
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-muted">No avatars yet.</p>
          <Link href="/creator/avatars/new" className="inline-block mt-4 text-indigo-400 hover:underline">
            Create your first avatar →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Avatars</h1>
        <div className="flex items-center gap-2">
          {selectMode && (
            <>
              <button
                onClick={() => setSelected(new Set())}
                className="px-3 py-2 rounded-xl glass text-xs font-medium hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="px-3 py-2 rounded-xl bg-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/30 transition-colors"
              >
                Delete {selected.size}
              </button>
            </>
          )}
          <Link href="/creator/avatars/new" className="px-4 py-2 rounded-xl gradient-btn text-sm font-medium">
            + New Avatar
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {avatars.map(avatar => (
          <div
            key={avatar.id}
            className={`glass rounded-2xl overflow-hidden transition-all ${
              selected.has(avatar.id) ? 'ring-2 ring-red-500' : ''
            }`}
          >
            <div
              className="aspect-square relative cursor-pointer"
              onClick={() => selectMode ? toggle(avatar.id) : null}
              onContextMenu={e => { e.preventDefault(); toggle(avatar.id) }}
            >
              {avatar.anchor_image_url ? (
                <Image src={avatar.anchor_image_url} alt={avatar.name} fill className="object-cover object-top" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-emerald-900 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white/30">{avatar.name?.charAt(0)}</span>
                </div>
              )}
              <div className="absolute top-2 right-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm ${
                  avatar.is_published ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {avatar.is_published ? 'Published' : 'Draft'}
                </span>
              </div>
              {/* Select checkbox */}
              <button
                onClick={e => { e.stopPropagation(); toggle(avatar.id) }}
                className={`absolute top-2 left-2 w-7 h-7 rounded-md border-2 flex items-center justify-center transition-all ${
                  selected.has(avatar.id)
                    ? 'bg-red-500 border-red-500'
                    : 'border-white/60 bg-black/50 backdrop-blur-sm'
                }`}
              >
                {selected.has(avatar.id) && (
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-sm">{avatar.name}</h3>
              <p className="text-[11px] text-muted line-clamp-1 mt-0.5">{avatar.tagline}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-muted">{avatar.session_count ?? 0} sessions</span>
                <div className="flex items-center gap-2">
                  <Link href={`/creator/avatars/${avatar.id}`} className="text-[10px] text-muted hover:text-foreground transition-colors">
                    Edit
                  </Link>
                  <Link href={`/avatar/${avatar.slug}`} className="text-[10px] text-indigo-400 hover:underline">
                    View
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setConfirmDelete(false)}>
          <div className="glass rounded-2xl p-6 max-w-sm mx-4 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold">Delete {selected.size} avatar{selected.size > 1 ? 's' : ''}?</h3>
            <p className="text-sm text-muted">This will permanently delete the selected avatar{selected.size > 1 ? 's' : ''} and all associated data. This cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-3 rounded-xl glass font-medium hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deleteSelected}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-red-500 font-medium text-white disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
