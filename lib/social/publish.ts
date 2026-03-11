import { PlatformId } from './platforms'

export async function downloadImageAsBuffer(url: string): Promise<{ buffer: Buffer; arrayBuffer: ArrayBuffer; contentType: string }> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to download image: ${res.status}`)
  const arrayBuffer = await res.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const contentType = res.headers.get('content-type') || 'image/jpeg'
  return { buffer, arrayBuffer, contentType }
}

export async function publishToX(accessToken: string, text: string, imageUrl?: string): Promise<string> {
  let mediaId: string | undefined

  if (imageUrl) {
    const { buffer } = await downloadImageAsBuffer(imageUrl)
    const form = new FormData()
    form.append('media_data', buffer.toString('base64'))

    const uploadRes = await fetch('https://upload.twitter.com/1.1/media/upload.json', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: form,
    })
    if (!uploadRes.ok) throw new Error(`X media upload failed: ${uploadRes.status} ${await uploadRes.text()}`)
    const uploadData = await uploadRes.json()
    mediaId = uploadData.media_id_string
  }

  const body: Record<string, unknown> = { text }
  if (mediaId) body.media = { media_ids: [mediaId] }

  const tweetRes = await fetch('https://api.twitter.com/2/tweets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!tweetRes.ok) throw new Error(`X tweet failed: ${tweetRes.status} ${await tweetRes.text()}`)
  const tweet = await tweetRes.json()
  return `https://x.com/i/status/${tweet.data.id}`
}

export async function publishToBluesky(appPassword: string, handle: string, text: string, imageUrl?: string): Promise<string> {
  // Create session
  const sessionRes = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: handle, password: appPassword }),
  })
  if (!sessionRes.ok) throw new Error(`Bluesky auth failed: ${sessionRes.status} ${await sessionRes.text()}`)
  const session = await sessionRes.json()

  let embed: Record<string, unknown> | undefined

  if (imageUrl) {
    const { arrayBuffer, contentType } = await downloadImageAsBuffer(imageUrl)
    const blobRes = await fetch('https://bsky.social/xrpc/com.atproto.repo.uploadBlob', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.accessJwt}`,
        'Content-Type': contentType,
      },
      body: new Uint8Array(arrayBuffer),
    })
    if (!blobRes.ok) throw new Error(`Bluesky blob upload failed: ${blobRes.status}`)
    const blobData = await blobRes.json()

    embed = {
      $type: 'app.bsky.embed.images',
      images: [{ alt: text.slice(0, 100), image: blobData.blob }],
    }
  }

  const record: Record<string, unknown> = {
    text,
    createdAt: new Date().toISOString(),
  }
  if (embed) record.embed = embed

  const postRes = await fetch('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.accessJwt}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      repo: session.did,
      collection: 'app.bsky.feed.post',
      record,
    }),
  })
  if (!postRes.ok) throw new Error(`Bluesky post failed: ${postRes.status} ${await postRes.text()}`)
  const postData = await postRes.json()
  const rkey = postData.uri.split('/').pop()
  return `https://bsky.app/profile/${handle}/post/${rkey}`
}

export async function publishToLinkedIn(accessToken: string, text: string, imageUrl?: string): Promise<string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'X-Restli-Protocol-Version': '2.0.0',
    'LinkedIn-Version': '202401',
  }

  // Get user sub
  const userRes = await fetch('https://api.linkedin.com/v2/userinfo', { headers })
  if (!userRes.ok) throw new Error(`LinkedIn userinfo failed: ${userRes.status}`)
  const { sub } = await userRes.json()

  let imageUrn: string | undefined

  if (imageUrl) {
    // Initialize upload
    const initRes = await fetch('https://api.linkedin.com/rest/images?action=initializeUpload', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        initializeUploadRequest: { owner: `urn:li:person:${sub}` },
      }),
    })
    if (!initRes.ok) throw new Error(`LinkedIn image init failed: ${initRes.status}`)
    const initData = await initRes.json()
    const uploadUrl = initData.value.uploadUrl
    imageUrn = initData.value.image

    // Upload binary
    const { arrayBuffer, contentType } = await downloadImageAsBuffer(imageUrl)
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': contentType,
      },
      body: new Uint8Array(arrayBuffer),
    })
    if (!uploadRes.ok) throw new Error(`LinkedIn image upload failed: ${uploadRes.status}`)
  }

  const postBody: Record<string, unknown> = {
    author: `urn:li:person:${sub}`,
    commentary: text,
    visibility: 'PUBLIC',
    distribution: { feedDistribution: 'MAIN_FEED' },
    lifecycleState: 'PUBLISHED',
  }
  if (imageUrn) {
    postBody.content = { media: { id: imageUrn } }
  }

  const postRes = await fetch('https://api.linkedin.com/rest/posts', {
    method: 'POST',
    headers,
    body: JSON.stringify(postBody),
  })
  if (!postRes.ok) throw new Error(`LinkedIn post failed: ${postRes.status} ${await postRes.text()}`)

  return 'https://www.linkedin.com/feed/'
}

export async function publishToPinterest(accessToken: string, text: string, imageUrl: string): Promise<string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  }

  // Get first board
  const boardsRes = await fetch('https://api.pinterest.com/v5/boards', { headers })
  if (!boardsRes.ok) throw new Error(`Pinterest boards list failed: ${boardsRes.status}`)
  const boardsData = await boardsRes.json()
  const boards = boardsData.items || []
  if (boards.length === 0) throw new Error('Pinterest: user needs at least one board to publish pins')

  const boardId = boards[0].id

  const pinRes = await fetch('https://api.pinterest.com/v5/pins', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title: text.slice(0, 100),
      description: text,
      board_id: boardId,
      media_source: { source_type: 'image_url', url: imageUrl },
    }),
  })
  if (!pinRes.ok) throw new Error(`Pinterest pin failed: ${pinRes.status} ${await pinRes.text()}`)
  const pin = await pinRes.json()
  return pin.link || `https://www.pinterest.com/pin/${pin.id}/`
}

export async function publishToInstagram(accessToken: string, text: string, imageUrl: string): Promise<string> {
  // Get pages with IG accounts
  const pagesRes = await fetch(
    `https://graph.facebook.com/v21.0/me/accounts?fields=instagram_business_account&access_token=${accessToken}`
  )
  if (!pagesRes.ok) throw new Error(`Instagram pages fetch failed: ${pagesRes.status}`)
  const pagesData = await pagesRes.json()
  const page = pagesData.data?.find((p: { instagram_business_account?: { id: string } }) => p.instagram_business_account)
  if (!page?.instagram_business_account?.id) throw new Error('No Instagram business account linked to Facebook pages')

  const igAccountId = page.instagram_business_account.id

  // Create media container
  const containerRes = await fetch(`https://graph.facebook.com/v21.0/${igAccountId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_url: imageUrl, caption: text, access_token: accessToken }),
  })
  if (!containerRes.ok) throw new Error(`Instagram container failed: ${containerRes.status} ${await containerRes.text()}`)
  const container = await containerRes.json()

  // Publish
  const publishRes = await fetch(`https://graph.facebook.com/v21.0/${igAccountId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ creation_id: container.id, access_token: accessToken }),
  })
  if (!publishRes.ok) throw new Error(`Instagram publish failed: ${publishRes.status} ${await publishRes.text()}`)

  return 'https://www.instagram.com/'
}

export interface PublishResult {
  platform: PlatformId
  success: boolean
  postUrl?: string
  error?: string
}

export async function publishToAll(
  connections: Array<{ platform: PlatformId; access_token: string; refresh_token?: string; platform_username?: string }>,
  text: string,
  imageUrl?: string
): Promise<PublishResult[]> {
  const promises = connections.map(async (conn): Promise<PublishResult> => {
    try {
      let postUrl: string

      switch (conn.platform) {
        case 'x':
          postUrl = await publishToX(conn.access_token, text, imageUrl)
          break
        case 'bluesky':
          postUrl = await publishToBluesky(conn.access_token, conn.platform_username || '', text, imageUrl)
          break
        case 'linkedin':
          postUrl = await publishToLinkedIn(conn.access_token, text, imageUrl)
          break
        case 'pinterest':
          if (!imageUrl) throw new Error('Pinterest requires an image')
          postUrl = await publishToPinterest(conn.access_token, text, imageUrl)
          break
        case 'instagram':
          if (!imageUrl) throw new Error('Instagram requires an image')
          postUrl = await publishToInstagram(conn.access_token, text, imageUrl)
          break
        default:
          throw new Error(`Unsupported platform: ${conn.platform}`)
      }

      return { platform: conn.platform, success: true, postUrl }
    } catch (e) {
      return { platform: conn.platform, success: false, error: e instanceof Error ? e.message : String(e) }
    }
  })

  const settled = await Promise.allSettled(promises)
  return settled.map((r) =>
    r.status === 'fulfilled'
      ? r.value
      : { platform: 'x' as PlatformId, success: false, error: r.reason?.message || 'Unknown error' }
  )
}
