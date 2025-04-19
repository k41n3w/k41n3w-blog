/**
 * Processa o conteúdo do post para substituir URLs de imagens com nossas URLs de proxy em cache
 */
export function processPostContent(content: string): string {
  if (!content) return ""

  // Substituir atributos src de imagem com nossa URL de proxy
  return content.replace(/<img\s+([^>]*)src="([^"]+)"([^>]*)>/g, (match, beforeSrc, src, afterSrc) => {
    // Pular se já estiver usando nosso proxy
    if (src.startsWith("/api/image-proxy")) {
      return match
    }

    // Pular se for uma imagem local (já servida pelo Vercel)
    if (src.startsWith("/") && !src.startsWith("//")) {
      return match
    }

    // Extrair a largura da imagem se estiver disponível
    const widthMatch = (beforeSrc + afterSrc).match(/width="(\d+)"/i)
    const width = widthMatch ? widthMatch[1] : null

    // Construir a URL do proxy com parâmetros adicionais
    let proxiedSrc = `/api/image-proxy?url=${encodeURIComponent(src)}&quality=80`

    // Adicionar largura se disponível
    if (width) {
      proxiedSrc += `&width=${width}`
    }

    // Substituir o src com nossa URL de proxy
    return match.replace(src, proxiedSrc)
  })
}
