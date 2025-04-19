/**
 * Extrai o ID do Giphy a partir de uma URL do Giphy
 */
export function extractGiphyId(url: string): string | null {
  if (!url) return null

  try {
    // Tentar extrair o ID usando regex para diferentes formatos de URL
    const patterns = [
      /giphy\.com\/gifs\/([a-zA-Z0-9]+)/, // giphy.com/gifs/ID
      /giphy\.com\/gifs\/[a-zA-Z0-9]+-([a-zA-Z0-9]+)/, // giphy.com/gifs/SOURCE-ID
      /giphy\.com\/embed\/([a-zA-Z0-9]+)/, // giphy.com/embed/ID
      /media\.giphy\.com\/media\/([a-zA-Z0-9]+)/, // media.giphy.com/media/ID
      /i\.giphy\.com\/([a-zA-Z0-9]+)\.gif/, // i.giphy.com/ID.gif
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }

    // Se nenhum padrão corresponder, tentar extrair o último segmento da URL
    const urlObj = new URL(url)
    const pathSegments = urlObj.pathname.split("/").filter(Boolean)
    if (pathSegments.length > 0) {
      const lastSegment = pathSegments[pathSegments.length - 1]
      // Remover extensão .gif se presente
      return lastSegment.replace(/\.gif$/, "")
    }
  } catch (e) {
    console.error("Erro ao analisar URL do Giphy:", e)
  }

  return null
}

/**
 * Verifica se uma URL é um link para um GIF do Giphy
 */
export function isGiphyUrl(url: string): boolean {
  if (!url) return false

  try {
    return url.includes("giphy.com") || url.includes("gph.is")
  } catch (e) {
    return false
  }
}
