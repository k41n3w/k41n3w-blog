import { type NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

// Configurar tempo de revalidação (1 ano em segundos)
export const revalidate = 31536000

export async function GET(request: NextRequest, { params }: { params: { hash: string } }) {
  try {
    // Obter a URL da imagem do parâmetro de consulta
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get("url")

    if (!imageUrl) {
      return new NextResponse("URL da imagem ausente", { status: 400 })
    }

    // Decodificar a URL se estiver codificada
    const decodedUrl = decodeURIComponent(imageUrl)

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
    const imageData = await imageResponse.arrayBuffer()
    const contentType = imageResponse.headers.get("content-type") || "image/jpeg"

    // Retornar a imagem com headers de cache
    return new NextResponse(imageData, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
        "CDN-Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
        "Vercel-CDN-Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
        "Content-Length": imageData.byteLength.toString(),
      },
    })
  } catch (error: any) {
    console.error("Erro no proxy de imagem:", error)
    return new NextResponse(`Erro ao processar imagem: ${error.message}`, { status: 500 })
  }
}
