import { createClient } from "@/lib/supabase/server"
import AdminDashboard from "@/components/admin/dashboard"

export default async function AdminDashboardPage() {
  const supabase = createClient()

  // Buscar posts
  const { data: posts = [] } = await supabase
    .from("posts")
    .select("id, title, status, created_at, views, likes")
    .order("created_at", { ascending: false })

  // Buscar comentários pendentes
  const { data: pendingComments = [] } = await supabase
    .from("comments")
    .select("id, post_id, author, content, created_at")
    .eq("status", "Pending")
    .order("created_at", { ascending: false })

  // Obter o usuário atual
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return <AdminDashboard user={user} posts={posts} pendingComments={pendingComments} />
}
