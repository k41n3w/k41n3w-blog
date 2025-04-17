import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  // Obter todos os cookies
  const cookieStore = cookies()
  const allCookies = cookieStore.getAll()

  // Limpar cada cookie
  for (const cookie of allCookies) {
    // Remover o cookie definindo uma data de expiração no passado
    cookieStore.set({
      name: cookie.name,
      value: "",
      expires: new Date(0),
      path: "/",
    })
  }

  return NextResponse.json({
    success: true,
    message: "Todos os cookies foram limpos",
    clearedCookies: allCookies.map((c) => c.name),
  })
}
