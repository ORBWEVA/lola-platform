import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default async function AvatarsListPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: avatars } = await supabase
    .from('avatars')
    .select('*')
    .eq('creator_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Avatars</h1>
        <Link href="/creator/avatars/new" className="px-4 py-2 rounded-xl gradient-btn text-sm font-medium">
          + New Avatar
        </Link>
      </div>

      {(!avatars || avatars.length === 0) ? (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-muted">No avatars yet.</p>
          <Link href="/creator/avatars/new" className="inline-block mt-4 text-indigo-400 hover:underline">
            Create your first avatar →
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {avatars.map(avatar => (
            <div key={avatar.id} className="glass rounded-2xl overflow-hidden">
              <div className="h-32 relative">
                {avatar.anchor_image_url ? (
                  <Image src={avatar.anchor_image_url} alt={avatar.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-emerald-900" />
                )}
                <div className="absolute top-2 right-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${avatar.is_published ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {avatar.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold">{avatar.name}</h3>
                <p className="text-xs text-muted">{avatar.tagline}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-muted">{avatar.session_count} sessions</span>
                  <Link href={`/avatar/${avatar.slug}`} className="text-xs text-indigo-400 hover:underline">
                    View Profile →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
