import { isGistUrl, extractGistId, isGiphyUrl, extractGiphyId } from "./embed-utils"

/**
 * Processa o conteúdo do post para substituir URLs de imagens com nossas URLs de proxy em cache
 * e processar embeds especiais como Gists e GIFs do Giphy
 */
export function processPostContent(content: string): string {
  if (!content) return ""

  // Substituir atributos src de imagem com nossa URL de proxy
  let processedContent = content.replace(/<img\s+[^>]*src="([^"]+)"[^>]*>/g, (match, src) => {
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

  // Processar links para Gists
  processedContent = processedContent.replace(
    /<p>(?:<a[^>]*href="(https:\/\/gist\.github\.com\/[^"]+)"[^>]*>([^<]+)<\/a>)<\/p>/g,
    (match, url, text) => {
      if (isGistUrl(url)) {
        const { gistId, filename } = extractGistId(url)
        if (gistId) {
          return `<div class="gist-embed-container my-4">
            <script src="https://gist.github.com/${gistId}.js${filename ? `?file=${encodeURIComponent(filename)}` : ""}"></script>
          </div>`
        }
      }
      return match
    },
  )

  // Processar links para GIFs do Giphy
  processedContent = processedContent.replace(
    /<p>(?:<a[^>]*href="(https:\/\/(?:media\.)?giphy\.com\/[^"]+)"[^>]*>([^<]+)<\/a>)<\/p>/g,
    (match, url, text) => {
      if (isGiphyUrl(url)) {
        const giphyId = extractGiphyId(url)
        if (giphyId) {
          return `<div class="giphy-embed-container my-4 flex justify-center">
            <iframe src="https://giphy.com/embed/${giphyId}" width="480" height="360" frameBorder="0" class="giphy-embed rounded-md" allowFullScreen></iframe>
          </div>`
        }
      }
      return match
    },
  )

  return processedContent
}
