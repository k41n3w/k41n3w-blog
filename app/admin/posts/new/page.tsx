import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import PostForm from "@/components/admin/post-form"

export default async function NewPostPage() {
  const supabase = createClient()

  // Verificar se o usuário está autenticado
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  console.log("Página de novo post - Usuário:", user?.email || "Não autenticado")

  if (error) {
    console.error("Erro ao verificar autenticação:", error)
  }

  if (!user) {
    console.log("Usuário não autenticado, redirecionando para login")
    redirect("/admin/login")
  }

  return <PostForm />
}
