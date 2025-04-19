import crypto from "crypto"

/**
 * Creates a consistent hash for a URL to use as a cache key
 */
export function createUrlHash(url: string): string {
  return crypto.createHash("md5").update(url).digest("hex").substring(0, 10)
}

/**
 * Processes post content to replace image URLs with our cached proxy URLs
 */
export function processPostContent(content: string): string {
  if (!content) return ""

  // Replace image src attributes with our proxy URL
  return content.replace(/<img\s+[^>]*src="([^"]+)"[^>]*>/g, (match, src) => {
    // Skip if it's already using our proxy
    if (src.startsWith("/api/image-proxy")) {
      return match
    }

    // Skip if it's a local image (already served by Vercel)
    if (src.startsWith("/") && !src.startsWith("//")) {
      return match
    }

    // Create a hash of the URL for consistent caching
    const urlHash = createUrlHash(src)

    // Replace the src with our proxy URL including the hash
    const proxiedSrc = `/api/image-proxy/${urlHash}?url=${encodeURIComponent(src)}`
    return match.replace(src, proxiedSrc)
  })
}
