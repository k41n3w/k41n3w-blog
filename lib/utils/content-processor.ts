/**
 * Processa o conteúdo do post para substituir URLs de imagens com nossas URLs de proxy em cache
 * e processar embeds especiais como GIFs do Giphy
 */
export function processPostContent(content: string): string {
  if (!content) return ""

  // Adicionar log para depuração
  console.log("Processando conteúdo:", content.substring(0, 300) + "...")

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

  // Método 1: Procurar por divs com data-node-type="giphyEmbed"
  processedContent = processedContent.replace(
    /<div[^>]*data-node-type="giphyEmbed"[^>]*data-giphy-id="([^"]+)"[^>]*>[\s\S]*?<\/div>/g,
    (match, giphyId) => {
      console.log("Encontrado embed do Giphy (método 1):", giphyId)
      return renderGiphyEmbed(giphyId)
    },
  )

  // Método 2: Procurar por divs com data-type="giphy-embed"
  processedContent = processedContent.replace(
    /<div[^>]*data-type="giphy-embed"[^>]*data-giphy-id="([^"]+)"[^>]*>[\s\S]*?<\/div>/g,
    (match, giphyId) => {
      console.log("Encontrado embed do Giphy (método 2):", giphyId)
      return renderGiphyEmbed(giphyId)
    },
  )

  // Método 3: Procurar por qualquer div que contenha giphy-embed e extrair o ID
  processedContent = processedContent.replace(
    /<div[^>]*class="[^"]*giphy-embed[^"]*"[^>]*>[\s\S]*?<\/div>/g,
    (match) => {
      // Tentar extrair o ID do Giphy do conteúdo
      const giphyIdMatch = match.match(/giphy\.com\/media\/([^/]+)/)
      if (giphyIdMatch && giphyIdMatch[1]) {
        const giphyId = giphyIdMatch[1]
        console.log("Encontrado embed do Giphy (método 3):", giphyId)
        return renderGiphyEmbed(giphyId)
      }
      return match
    },
  )

  // Método 4: Procurar por links do Giphy
  processedContent = processedContent.replace(
    /<p>(?:<a[^>]*href="(https:\/\/(?:media\.)?giphy\.com\/[^"]+)"[^>]*>([^<]+)<\/a>)<\/p>/g,
    (match, url) => {
      // Extrair o ID do Giphy da URL
      const giphyIdMatch = url.match(/giphy\.com\/(?:gifs\/|media\/)([^/-]+)/)
      if (giphyIdMatch && giphyIdMatch[1]) {
        const giphyId = giphyIdMatch[1].replace(/[^\w\d]/g, "")
        console.log("Encontrado link do Giphy (método 4):", giphyId)
        return renderGiphyEmbed(giphyId)
      }
      return match
    },
  )

  return processedContent
}

// Função auxiliar para renderizar o embed do Giphy
function renderGiphyEmbed(giphyId: string): string {
  return `<div class="giphy-embed-container my-4 flex justify-center flex-col items-center">
    <img src="https://media.giphy.com/media/${giphyId}/giphy.gif" alt="GIF" class="max-w-full h-auto rounded-md" />
    <div class="text-xs text-gray-500 text-center mt-1">
      <a href="https://giphy.com/gifs/${giphyId}" target="_blank" rel="noopener noreferrer" class="hover:text-red-400">via GIPHY</a>
    </div>
  </div>`
}
