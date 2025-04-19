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

    // Replace the src with our proxy URL
    const proxiedSrc = `/api/image-proxy?url=${encodeURIComponent(src)}`
    return match.replace(src, proxiedSrc)
  })
}
