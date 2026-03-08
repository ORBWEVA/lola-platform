/**
 * Together AI image URLs are temporary and expire after a few hours.
 * This checks if a URL is likely expired.
 */
export function isExpiredImageUrl(url: string | null | undefined): boolean {
  if (!url) return true
  return url.includes('api.together')
}

/**
 * Filter an array of image URLs, removing expired ones.
 */
export function filterExpiredUrls(urls: string[]): string[] {
  return urls.filter(url => !isExpiredImageUrl(url))
}

/**
 * Return a valid image URL or null if expired.
 */
export function validImageUrl(url: string | null | undefined): string | null {
  if (!url || isExpiredImageUrl(url)) return null
  return url
}
