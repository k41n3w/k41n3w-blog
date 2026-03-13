import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import PostForm from "@/components/admin/post-form"
import { TABLES } from "@/lib/supabase/config"

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Verificar se o usuário está autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/login")
  }

  // Buscar o post
  const { data: post, error } = await supabase.from(TABLES.POSTS).select("*").eq("id", id).single()

  if (error || !post) {
    console.error("Error fetching post:", error)
    notFound()
  }

  // Buscar as tags do post
  const { data: postTags = [] } = await supabase.from(TABLES.POST_TAGS).select("tag_id").eq("post_id", id)

  // Buscar os nomes das tags
  let tags: string[] = []
  if (postTags.length > 0) {
    const tagIds = postTags.map((pt) => pt.tag_id)
    const { data: tagData = [] } = await supabase.from(TABLES.TAGS).select("name").in("id", tagIds)

    tags = tagData.map((t) => t.name)
  }

  return <PostForm post={{ ...post, tags: tags.join(", ") }} />
}
