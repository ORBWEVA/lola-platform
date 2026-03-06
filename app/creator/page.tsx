import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function CreatorOverview() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Upgrade role to creator if not already
  await supabase
    .from('profiles')
    .update({ role: 'creator' })
    .eq('id', user.id)
    .in('role', ['learner'])

  const { data: avatars } = await supabase
    .from('avatars')
    .select('id, session_count')
    .eq('creator_id', user.id)

  const totalSessions = avatars?.reduce((sum, a) => sum + (a.session_count || 0), 0) ?? 0

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Creator Dashboard</h1>
        <Link href="/creator/avatars/new" className="px-4 py-2 rounded-xl gradient-btn text-sm font-medium">
          + New Avatar
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-5 text-center">
          <p className="text-3xl font-bold text-indigo-400">{avatars?.length ?? 0}</p>
          <p className="text-sm text-muted mt-1">Avatars</p>
        </div>
        <div className="glass rounded-2xl p-5 text-center">
          <p className="text-3xl font-bold">{totalSessions}</p>
          <p className="text-sm text-muted mt-1">Total Sessions</p>
        </div>
        <div className="glass rounded-2xl p-5 text-center">
          <p className="text-3xl font-bold text-emerald-400">$0</p>
          <p className="text-sm text-muted mt-1">Revenue</p>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 text-center">
        <h2 className="font-semibold">Ready to create your first avatar?</h2>
        <p className="text-sm text-muted mt-2">It takes less than 5 minutes. AI generates everything.</p>
        <Link href="/creator/avatars/new" className="inline-block mt-4 px-6 py-3 rounded-xl gradient-btn font-medium">
          Create Avatar
        </Link>
      </div>
    </div>
  )
}
