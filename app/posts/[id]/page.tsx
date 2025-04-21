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
import { generatePostMetadata } from "@/lib/seo/metadata"
import { JsonLd } from "@/components/seo/json-ld"

// Configuração para geração estática com revalidação
export const dynamic = "force-static"
export const revalidate = 1800 // Revalidar a cada 30 minutos

// Função para gerar metadados estáticos
export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: post } = await supabase
    .from(TABLES.POSTS)
    .select("title, excerpt, content, created_at")
    .eq("id", params.id)
    .single()

  if (!post) {
    return {
      title: "Post não encontrado",
      description: "O post que você está procurando não existe.",
    }
  }

  // Buscar tags do post
  const { data: postTags = [] } = await supabase.from(TABLES.POST_TAGS).select("tag_id").eq("post_id", params.id)

  // Obter nomes das tags
  let tags: string[] = []
  if (postTags.length > 0) {
    const tagIds = postTags.map((pt) => pt.tag_id)
    const { data: tagData = [] } = await supabase.from(TABLES.TAGS).select("name").in("id", tagIds)

    tags = tagData.map((t) => t.name)
  }

  return generatePostMetadata({
    ...post,
    id: params.id,
    tags,
  })
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

  // Garantir que temos datas válidas
  let publishDate, modifiedDate
  try {
    publishDate = post.created_at ? new Date(post.created_at).toISOString() : new Date().toISOString()
  } catch (e) {
    console.error("Error formatting publish date:", e)
    publishDate = new Date().toISOString()
  }

  try {
    modifiedDate = post.updated_at
      ? new Date(post.updated_at).toISOString()
      : post.created_at
        ? new Date(post.created_at).toISOString()
        : new Date().toISOString()
  } catch (e) {
    console.error("Error formatting modified date:", e)
    modifiedDate = new Date().toISOString()
  }

  // Preparar dados para o Schema.org usando URLs relativas
  const postUrl = `/posts/${params.id}`
  const authorName = "Caio Ramos"

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Schema.org JSON-LD */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt || post.content.substring(0, 160).replace(/<[^>]*>/g, ""),
          image: `/images/og-image.jpg`, // URL relativa
          datePublished: publishDate,
          dateModified: modifiedDate,
          author: {
            "@type": "Person",
            name: authorName,
          },
          publisher: {
            "@type": "Organization",
            name: "Ruby on Rails Tech Blog",
            logo: {
              "@type": "ImageObject",
              url: `/images/logo.png`, // URL relativa
            },
          },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": postUrl,
          },
          keywords: tags.join(", "),
        }}
      />

      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 py-4">
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center text-red-500 hover:text-red-400">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Voltar para home
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
        <article itemScope itemType="https://schema.org/BlogPosting">
          <meta itemProp="datePublished" content={publishDate} />
          <meta itemProp="dateModified" content={modifiedDate} />
          <meta itemProp="author" content={authorName} />
          <link itemProp="mainEntityOfPage" href={postUrl} />

          <PostContent
            post={{
              id: post.id,
              title: post.title,
              content: post.content,
              date: (() => {
                try {
                  return post.created_at
                    ? new Date(post.created_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : "Data não disponível"
                } catch (e) {
                  console.error("Error formatting post date:", e)
                  return "Data não disponível"
                }
              })(),
              author: authorName,
              authorAvatar: "/images/profile.jpg",
              likes: post.likes || 0,
              comments: comments.length,
              tags,
            }}
          />
        </article>

        <Separator className="my-8 bg-gray-800" />

        {/* Comments Section */}
        <CommentSection
          postId={post.id}
          comments={comments.map((comment) => ({
            id: comment.id,
            author: comment.author,
            content: comment.content,
            date: (() => {
              try {
                return comment.created_at
                  ? new Date(comment.created_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                  : "Data não disponível"
              } catch (e) {
                console.error("Error formatting comment date:", e)
                return "Data não disponível"
              }
            })(),
            likes: comment.likes || 0,
          }))}
        />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
