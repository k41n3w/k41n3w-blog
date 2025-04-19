import { type NextRequest, NextResponse } from "next/server"
import sharp from "sharp"

export const runtime = "edge"

// Configurar tempo de revalidação (1 ano em segundos)
export const revalidate = 31536000

export async function GET(request: NextRequest) {
  try {
    // Obter a URL da imagem do parâmetro de consulta
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get("url")
    const width = searchParams.get("width") ? Number.parseInt(searchParams.get("width") || "0", 10) : undefined
    const quality = searchParams.get("quality") ? Number.parseInt(searchParams.get("quality") || "80", 10) : 80

    if (!imageUrl) {
      return new NextResponse("URL da imagem ausente", { status: 400 })
    }

    // Decodificar a URL se estiver codificada
    const decodedUrl = decodeURIComponent(imageUrl)

    // Verificar se o navegador suporta WebP
    const acceptHeader = request.headers.get("accept") || ""
    const supportsWebp = acceptHeader.includes("image/webp")

    // Buscar a imagem
    const imageResponse = await fetch(decodedUrl, {
      headers: {
        // Encaminhar user agent para evitar ser bloqueado por alguns serviços
        "User-Agent": request.headers.get("user-agent") || "Mozilla/5.0",
      },
    })

    if (!imageResponse.ok) {
      return new NextResponse(`Falha ao buscar imagem: ${imageResponse.statusText}`, {
        status: imageResponse.status,
      })
    }

    // Obter os dados da imagem
    const imageBuffer = await imageResponse.arrayBuffer()

    // Processar a imagem com sharp
    let processedImageBuffer: Buffer
    let contentType: string

    try {
      // Criar uma instância do sharp com o buffer da imagem
      let sharpInstance = sharp(Buffer.from(imageBuffer))

      // Redimensionar se necessário
      if (width) {
        sharpInstance = sharpInstance.resize(width)
      }

      // Converter para WebP se o navegador suportar
      if (supportsWebp) {
        processedImageBuffer = await sharpInstance.webp({ quality }).toBuffer()
        contentType = "image/webp"
      } else {
        // Caso contrário, otimizar como JPEG
        processedImageBuffer = await sharpInstance.jpeg({ quality }).toBuffer()
        contentType = "image/jpeg"
      }
    } catch (error) {
      console.error("Erro ao processar imagem com sharp:", error)
      // Fallback: retornar a imagem original se houver erro no processamento
      processedImageBuffer = Buffer.from(imageBuffer)
      contentType = imageResponse.headers.get("content-type") || "image/jpeg"
    }

    // Gerar um ETag baseado no conteúdo da imagem para melhorar o cache
    const etag = `"${Buffer.from(processedImageBuffer).toString("base64").substring(0, 16)}"`

    // Retornar a imagem com headers de cache fortes
    return new NextResponse(processedImageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
        "CDN-Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
        "Vercel-CDN-Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
        "Content-Length": processedImageBuffer.byteLength.toString(),
        ETag: etag,
        Vary: "Accept", // Importante para diferenciar entre clientes que suportam WebP e os que não suportam
      },
    })
  } catch (error: any) {
    console.error("Erro no proxy de imagem:", error)
    return new NextResponse(`Erro ao processar imagem: ${error.message}`, { status: 500 })
  }
}
