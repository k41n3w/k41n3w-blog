import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function POST(request: Request) {
  try {
    // Obter o token de autorização da requisição
    const authHeader = request.headers.get("authorization")

    // Verificar se o token é válido (substitua por sua própria lógica de autenticação)
    if (!authHeader || authHeader !== `Bearer ${process.env.CACHE_PURGE_TOKEN}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Obter o caminho a ser revalidado do corpo da requisição
    const { path } = await request.json()

    if (!path) {
      return NextResponse.json({ error: "Path is required" }, { status: 400 })
    }

    // Revalidar o caminho
    revalidatePath(path)

    return NextResponse.json({
      success: true,
      message: `Cache purged for path: ${path}`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error purging cache:", error)
    return NextResponse.json({ error: "Failed to purge cache" }, { status: 500 })
  }
}
