import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const KIE_BASE = 'https://api.kie.ai/api/v1/jobs'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.KIE_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'KIE_API_KEY not configured' }, { status: 500 })
  }

  const { jobs } = await request.json() as {
    jobs: { taskId: string; recordId: string; label?: string; prompt?: string }[]
  }

  const results = await Promise.all(
    jobs.map(async (job) => {
      if (!job.taskId || !job.recordId) {
        return { ...job, status: 'failed' as const, imageUrl: null }
      }

      try {
        const res = await fetch(
          `${KIE_BASE}/recordInfo?taskId=${job.taskId}&recordId=${job.recordId}`,
          { headers: { Authorization: `Bearer ${apiKey}` } },
        )

        if (!res.ok) {
          return { ...job, status: 'pending' as const, imageUrl: null }
        }

        const data = await res.json()
        const state = data.data?.state

        if (state === 'success' || state === 'completed') {
          let imageUrl: string | null = null
          try {
            const resultJson = JSON.parse(data.data.resultJson || '{}')
            imageUrl = resultJson.resultUrls?.[0] || null
          } catch {
            // fallback to other possible locations
            imageUrl = data.data?.output?.image_url || data.data?.resultUrl || null
          }
          return { ...job, status: 'completed' as const, imageUrl }
        }

        if (state === 'failed' || state === 'error') {
          return { ...job, status: 'failed' as const, imageUrl: null }
        }

        return { ...job, status: 'pending' as const, imageUrl: null }
      } catch {
        return { ...job, status: 'pending' as const, imageUrl: null }
      }
    }),
  )

  const allDone = results.every(r => r.status === 'completed' || r.status === 'failed')

  return NextResponse.json({ results, allDone })
}
