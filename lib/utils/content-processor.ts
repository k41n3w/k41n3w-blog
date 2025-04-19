/**
 * Processa o conteúdo do post para substituir URLs de imagens com nossas URLs de proxy em cache
 * e processar embeds especiais como GIFs do Giphy
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

  // Processar divs com classe giphy-embed-wrapper
  processedContent = processedContent.replace(
    /<div[^>]*class="[^"]*giphy-embed-wrapper[^"]*"[^>]*data-giphy-id="([^"]+)"[^>]*>[\s\S]*?<\/div>/g,
    (match, giphyId) => {
      if (!giphyId) return match

      return `
        <div class="giphy-embed-container my-4 flex justify-center flex-col items-center">
          <img src="https://media.giphy.com/media/${giphyId}/giphy.gif" alt="GIF" class="max-w-full h-auto rounded-md" />
          <div class="text-xs text-gray-500 text-center mt-1">
            <a href="https://giphy.com/gifs/${giphyId}" target="_blank" rel="noopener noreferrer" class="hover:text-red-400">via GIPHY</a>
          </div>
        </div>
      `
    },
  )

  // Processar links para GIFs do Giphy
  processedContent = processedContent.replace(
    /<p>(?:<a[^>]*href="(https:\/\/(?:media\.)?giphy\.com\/[^"]+)"[^>]*>([^<]+)<\/a>)<\/p>/g,
    (match, url) => {
      // Extrair o ID do Giphy da URL
      const giphyIdMatch = url.match(/giphy\.com\/(?:gifs\/|media\/|embed\/)([^/-]+)/)
      if (giphyIdMatch && giphyIdMatch[1]) {
        const giphyId = giphyIdMatch[1].replace(/[^\w\d]/g, "")

        return `
          <div class="giphy-embed-container my-4 flex justify-center flex-col items-center">
            <img src="https://media.giphy.com/media/${giphyId}/giphy.gif" alt="GIF" class="max-w-full h-auto rounded-md" />
            <div class="text-xs text-gray-500 text-center mt-1">
              <a href="${url}" target="_blank" rel="noopener noreferrer" class="hover:text-red-400">via GIPHY</a>
            </div>
          </div>
        `
      }
      return match
    },
  )

  return processedContent
}
