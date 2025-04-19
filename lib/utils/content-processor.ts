import crypto from "crypto"

/**
 * Cria um hash consistente para uma URL para usar como chave de cache
 */
export function createUrlHash(url: string): string {
  return crypto.createHash("md5").update(url).digest("hex").substring(0, 10)
}

/**
 * Processa o conteúdo do post para substituir URLs de imagens com nossas URLs de proxy em cache
 */
export function processPostContent(content: string): string {
  if (!content) return ""

  // Substituir atributos src de imagem com nossa URL de proxy
  return content.replace(/<img\s+[^>]*src="([^"]+)"[^>]*>/g, (match, src) => {
    // Pular se já estiver usando nosso proxy
    if (src.startsWith("/api/image-proxy")) {
      return match
    }

    // Pular se for uma imagem local (já servida pelo Vercel)
    if (src.startsWith("/") && !src.startsWith("//")) {
      return match
    }

    // Criar um hash da URL para cache consistente
    const urlHash = createUrlHash(src)

    // Substituir o src com nossa URL de proxy incluindo o hash
    const proxiedSrc = `/api/image-proxy/${urlHash}?url=${encodeURIComponent(src)}`
    return match.replace(src, proxiedSrc)
  })
}
