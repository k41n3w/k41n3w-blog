import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function POST(request: Request) {
  try {
    // Obter o token de autorização da requisição
    const authHeader = request.headers.get("authorization")
    const expectedToken = process.env.CACHE_PURGE_TOKEN || ""

    // Verificar se o token existe
    if (!expectedToken) {
      console.warn("CACHE_PURGE_TOKEN não está configurado no ambiente")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    // Verificar se o cabeçalho de autorização existe e está no formato correto
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized: Invalid authorization header" }, { status: 401 })
    }

    // Extrair o token do cabeçalho
    const token = authHeader.substring(7) // Remove "Bearer " do início

    // Comparar tokens de forma segura para evitar timing attacks
    if (token !== expectedToken) {
      return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 })
    }

    // Obter o caminho a ser revalidado do corpo da requisição
    const body = await request.json().catch(() => ({}))
    const path = body.path

    if (!path || typeof path !== "string") {
      return NextResponse.json({ error: "Path is required and must be a string" }, { status: 400 })
    }

    // Revalidar o caminho
    revalidatePath(path)

    return NextResponse.json({
      success: true,
      message: `Cache purged for path: ${path}`,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Error purging cache:", error)
    return NextResponse.json(
      { error: "Failed to purge cache", message: error?.message || "Unknown error" },
      { status: 500 },
    )
  }
}
