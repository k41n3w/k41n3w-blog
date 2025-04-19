/**
 * Extrai o ID do Gist a partir de uma URL do GitHub Gist
 */
export function extractGistId(url: string): { gistId: string; filename: string | null } {
  // Padrões de URL do Gist:
  // https://gist.github.com/username/gistId
  // https://gist.github.com/username/gistId#file-filename
  // https://gist.github.com/gistId

  let gistId = null
  let filename = null

  try {
    const urlObj = new URL(url)

    if (urlObj.hostname === "gist.github.com") {
      const pathParts = urlObj.pathname.split("/").filter(Boolean)

      // O último segmento do caminho é o ID do Gist
      if (pathParts.length >= 2) {
        gistId = pathParts[pathParts.length - 1]
      } else if (pathParts.length === 1) {
        gistId = pathParts[0]
      }

      // Verificar se há um fragmento para o nome do arquivo
      if (urlObj.hash && urlObj.hash.startsWith("#file-")) {
        filename = urlObj.hash.substring(6) // Remover '#file-'
      }
    }
  } catch (e) {
    console.error("Erro ao analisar URL do Gist:", e)
  }

  return { gistId: gistId || "", filename }
}

/**
 * Extrai o ID do Giphy a partir de uma URL do Giphy
 */
export function extractGiphyId(url: string): string | null {
  // Padrões de URL do Giphy:
  // https://giphy.com/gifs/id
  // https://giphy.com/gifs/source-id
  // https://media.giphy.com/media/id/giphy.gif
  // https://giphy.com/embed/id

  let giphyId = null

  try {
    const urlObj = new URL(url)

    if (urlObj.hostname === "giphy.com" || urlObj.hostname.endsWith(".giphy.com")) {
      const pathParts = urlObj.pathname.split("/").filter(Boolean)

      if (pathParts[0] === "gifs") {
        // Formato: giphy.com/gifs/id ou giphy.com/gifs/source-id
        giphyId = pathParts[pathParts.length - 1]
      } else if (pathParts[0] === "embed") {
        // Formato: giphy.com/embed/id
        giphyId = pathParts[1]
      } else if (pathParts[0] === "media") {
        // Formato: media.giphy.com/media/id/...
        giphyId = pathParts[1]
      }
    } else if (urlObj.hostname === "media.giphy.com") {
      // Formato: media.giphy.com/media/id/giphy.gif
      const pathParts = urlObj.pathname.split("/").filter(Boolean)
      if (pathParts[0] === "media" && pathParts.length > 1) {
        giphyId = pathParts[1]
      }
    }

    // Limpar qualquer sufixo que possa estar no ID
    if (giphyId) {
      // Alguns IDs do Giphy têm um prefixo de fonte, como "source-id"
      // Nesse caso, queremos apenas o ID real
      const parts = giphyId.split("-")
      if (parts.length > 1 && parts[parts.length - 1].length >= 8) {
        // Se a última parte parece ser um ID válido (pelo menos 8 caracteres)
        giphyId = parts[parts.length - 1]
      }
    }
  } catch (e) {
    console.error("Erro ao analisar URL do Giphy:", e)
  }

  return giphyId
}

/**
 * Verifica se uma URL é um link para um Gist
 */
export function isGistUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname === "gist.github.com"
  } catch (e) {
    return false
  }
}

/**
 * Verifica se uma URL é um link para um GIF do Giphy
 */
export function isGiphyUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return (
      urlObj.hostname === "giphy.com" ||
      urlObj.hostname.endsWith(".giphy.com") ||
      (urlObj.hostname === "media.giphy.com" && urlObj.pathname.endsWith(".gif"))
    )
  } catch (e) {
    return false
  }
}
