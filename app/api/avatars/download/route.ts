import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 })

  const res = await fetch(url)
  if (!res.ok) return NextResponse.json({ error: 'Fetch failed' }, { status: 502 })

  const blob = await res.blob()
  return new NextResponse(blob, {
    headers: {
      'Content-Type': blob.type || 'image/jpeg',
      'Content-Disposition': 'attachment; filename="avatar-post.jpg"',
    },
  })
}
