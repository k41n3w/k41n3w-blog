import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/server"
import { TABLES } from "@/lib/supabase/config"
import PostContent from "./post-content"
import CommentSection from "./comment-section"
import Footer from "@/components/layout/footer"

// Configuração para geração estática com revalidação
export const dynamic = "force-static"
export const revalidate = 1800 // Revalidar a cada 30 minutos

// Função para gerar metadados estáticos
export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: post } = await supabase.from(TABLES.POSTS).select("title, excerpt").eq("id", params.id).single()

  return {
    title: post?.title || "Post",
    description: post?.excerpt || "Ruby on Rails Tech Blog Post",
  }
}

export default async function PostPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  // Buscar post sem joins
  const { data: post, error: postError } = await supabase.from(TABLES.POSTS).select("*").eq("id", params.id).single()

  if (postError) {
    console.error("Error fetching post:", postError)
    notFound()
  }

  if (!post) {
    console.error("Post not found with ID:", params.id)
    notFound()
  }

  // Buscar comentários separadamente
  const { data: comments = [] } = await supabase
    .from(TABLES.COMMENTS)
    .select("*")
    .eq("post_id", params.id)
    .eq("status", "Approved")

  // Buscar tags separadamente
  const { data: postTags = [] } = await supabase.from(TABLES.POST_TAGS).select("tag_id").eq("post_id", params.id)

  // Obter nomes das tags se tivermos IDs de tags
  let tags: string[] = []
  if (postTags.length > 0) {
    const tagIds = postTags.map((pt) => pt.tag_id)
    const { data: tagData = [] } = await supabase.from(TABLES.TAGS).select("name").in("id", tagIds)

    tags = tagData.map((t) => t.name)
  }

  // Tentar incrementar a contagem de visualizações, mas não falhar se não funcionar
  try {
    await supabase.rpc("increment_post_views", { post_id: params.id })
  } catch (error) {
    console.error("Error incrementing views:", error)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 py-4">
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center text-red-500 hover:text-red-400">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Home
          </Link>
          <Link href="/admin/login">
            <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-900/20">
              Admin Login
            </Button>
          </Link>
        </div>
      </header>

      {/* Post Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <PostContent
          post={{
            id: post.id,
            title: post.title,
            content: post.content,
            date: new Date(post.created_at).toLocaleDateString(),
            author: "Caio Ramos", // Nome fixo do autor
            authorAvatar: "/images/profile.jpg", // Usar a mesma imagem da página About
            likes: post.likes || 0,
            comments: comments.length,
            tags,
          }}
        />

        <Separator className="my-8 bg-gray-800" />

        {/* Comments Section */}
        <CommentSection
          postId={post.id}
          comments={comments.map((comment) => ({
            id: comment.id,
            author: comment.author,
            content: comment.content,
            date: new Date(comment.created_at).toLocaleDateString(),
            likes: comment.likes || 0,
          }))}
        />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
