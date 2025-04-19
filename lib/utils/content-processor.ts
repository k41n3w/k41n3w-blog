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

  // Processar embeds do Giphy inseridos pelo editor
  processedContent = processedContent.replace(
    /<div data-type="giphy-embed"[^>]*data-giphy-id="([^"]+)"[^>]*>.*?<\/div>/g,
    (match, giphyId) => {
      if (giphyId) {
        return `<div class="giphy-embed-container my-4 flex justify-center flex-col items-center">
          <img src="https://media.giphy.com/media/${giphyId}/giphy.gif" alt="GIF" class="max-w-full h-auto rounded-md" />
          <div class="text-xs text-gray-500 text-center mt-1">
            <a href="https://giphy.com/gifs/${giphyId}" target="_blank" rel="noopener noreferrer" class="hover:text-red-400">via GIPHY</a>
          </div>
        </div>`
      }
      return match
    },
  )

  // Processar links para Gists
  processedContent = processedContent.replace(
    /<p>(?:<a[^>]*href="(https:\/\/gist\.github\.com\/[^"]+)"[^>]*>([^<]+)<\/a>)<\/p>/g,
    (match, url, text) => {
      if (isGistUrl(url)) {
        const { gistId, filename } = extractGistId(url)
        if (gistId) {
          // Adicionar um ID único para o container do Gist
          const gistContainerId = `gist-container-${gistId}`

          return `<div class="gist-embed-container my-4" id="${gistContainerId}">
            <script src="https://gist.github.com/${gistId}.js${filename ? `?file=${encodeURIComponent(filename)}` : ""}"></script>
            <noscript>
              <a href="${url}" target="_blank" rel="noopener noreferrer">Ver Gist no GitHub</a>
            </noscript>
          </div>
          <script>
            (function() {
              // Verificar se o script do Gist foi carregado corretamente
              setTimeout(function() {
                var container = document.getElementById('${gistContainerId}');
                if (container && !container.querySelector('.gist')) {
                  // Se não encontrar o elemento .gist, recarregar o script
                  var script = document.createElement('script');
                  script.src = 'https://gist.github.com/${gistId}.js${filename ? `?file=${encodeURIComponent(filename)}` : ""}';
                  container.appendChild(script);
                }
              }, 1000);
            })();
          </script>`
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
          // Usar a URL direta da imagem em vez de iframe
          return `<div class="giphy-embed-container my-4 flex justify-center flex-col items-center">
            <img src="https://media.giphy.com/media/${giphyId}/giphy.gif" alt="GIF" class="max-w-full h-auto rounded-md" />
            <div class="text-xs text-gray-500 text-center mt-1">
              <a href="${url}" target="_blank" rel="noopener noreferrer" class="hover:text-red-400">via GIPHY</a>
            </div>
          </div>`
        }
      }
      return match
    },
  )

  // Processar embeds do Gist inseridos pelo editor
  processedContent = processedContent.replace(
    /<div data-type="gist-embed"[^>]*data-gist-id="([^"]+)"(?:[^>]*data-filename="([^"]+)")?[^>]*>.*?<\/div>/g,
    (match, gistId, filename) => {
      if (gistId) {
        // Adicionar um ID único para o container do Gist
        const gistContainerId = `gist-container-${gistId}`

        return `<div class="gist-embed-container my-4" id="${gistContainerId}">
          <script src="https://gist.github.com/${gistId}.js${filename ? `?file=${encodeURIComponent(filename)}` : ""}"></script>
          <noscript>
            <a href="https://gist.github.com/${gistId}" target="_blank" rel="noopener noreferrer">Ver Gist no GitHub</a>
          </noscript>
        </div>
        <script>
          (function() {
            // Verificar se o script do Gist foi carregado corretamente
            setTimeout(function() {
              var container = document.getElementById('${gistContainerId}');
              if (container && !container.querySelector('.gist')) {
                // Se não encontrar o elemento .gist, recarregar o script
                var script = document.createElement('script');
                script.src = 'https://gist.github.com/${gistId}.js${filename ? `?file=${encodeURIComponent(filename)}` : ""}';
                container.appendChild(script);
              }
            }, 1000);
          })();
        </script>`
      }
      return match
    },
  )

  return processedContent
}
