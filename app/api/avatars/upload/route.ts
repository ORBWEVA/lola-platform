import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const allowedExts = ['jpg', 'jpeg', 'png', 'webp']
  if (!allowedExts.includes(ext)) {
    return NextResponse.json({ error: 'Unsupported file type. Use JPG, PNG, or WebP.' }, { status: 400 })
  }

  const path = `anchors/${user.id}/${Date.now()}.${ext}`
  const buffer = await file.arrayBuffer()

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    console.error('Upload error:', uploadError.message, uploadError)
    return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 })
  }

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(path)

  return NextResponse.json({ url: publicUrl })
}
