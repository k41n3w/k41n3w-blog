/**
 * Processa o conteúdo do post para substituir URLs de imagens com nossas URLs de proxy em cache
 */
export function processPostContent(content: string): string {
  if (!content) return ""

  // Substituir atributos src de imagem com nossa URL de proxy
  const processedContent = content.replace(/<img\s+[^>]*src="([^"]+)"[^>]*>/g, (match, src) => {
    // Pular se já estiver usando nosso proxy
    if (src.startsWith("/api/image-proxy")) {
      return match
    }

    // Pular se for uma imagem local (já servida pelo Vercel)
    if (src.startsWith("/") && !src.startsWith("//")) {
      return match
    }

    // Substituir o src com nossa URL de proxy
    const proxiedSrc = `/api/image-proxy?url=${encodeURIComponent(src)}`
    return match.replace(src, proxiedSrc)
  })

  return processedContent
}
