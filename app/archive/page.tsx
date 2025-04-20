import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { TABLES } from "@/lib/supabase/config"
import ClientArchive from "@/components/archive/client-archive"
import RetryButton from "@/components/archive/retry-button"
import Footer from "@/components/layout/footer"
import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { JsonLd } from "@/components/seo/json-ld"

// Configuração para geração estática com revalidação
export const dynamic = "force-static"
export const revalidate = 3600 // Revalidar a cada hora

// Função para gerar metadados estáticos
export async function generateMetadata() {
  return {
    title: "Arquivo de Posts - Ruby on Rails Tech Blog",
    description:
      "Explore todos os artigos técnicos sobre Ruby on Rails, desenvolvimento web, e boas práticas de programação.",
    openGraph: {
      title: "Arquivo de Posts - Ruby on Rails Tech Blog",
      description:
        "Explore todos os artigos técnicos sobre Ruby on Rails, desenvolvimento web, e boas práticas de programação.",
    },
    alternates: {
      canonical: `/archive`,
    },
  }
}

export default async function ArchivePage() {
  const supabase = createClient()
  let error = null
  let posts = []
  let tags = []

  try {
    // 1. Buscar todos os posts publicados em uma única consulta
    const { data: postsData = [], error: postsError } = await supabase
      .from(TABLES.POSTS)
      .select("id, title, excerpt, content, created_at, views, likes, author_id")
      .eq("status", "Published")

    if (postsError) {
      console.error("Error fetching posts:", postsError)
      error = postsError
    } else {
      // Garantir que as datas são válidas
      posts = postsData.map((post) => {
        // Verificar se created_at é válido
        let validCreatedAt = post.created_at
        try {
          if (post.created_at) {
            const date = new Date(post.created_at)
            if (isNaN(date.getTime())) {
              validCreatedAt = new Date().toISOString()
            }
          } else {
            validCreatedAt = new Date().toISOString()
          }
        } catch (e) {
          console.error("Error validating date:", e)
          validCreatedAt = new Date().toISOString()
        }

        return {
          ...post,
          created_at: validCreatedAt,
        }
      })
    }

    // 2. Buscar todas as tags em uma única consulta
    const { data: tagsData = [], error: tagsError } = await supabase.from(TABLES.TAGS).select("id, name")

    if (tagsError) {
      console.error("Error fetching tags:", tagsError)
      error = tagsError
    } else {
      tags = tagsData
    }

    // 3. Se temos posts, buscar as relações post_tags em uma única consulta
    if (posts.length > 0) {
      const postIds = posts.map((post) => post.id)

      // Buscar todas as relações post_tags para os posts
      const { data: postTagsData = [], error: postTagsError } = await supabase
        .from(TABLES.POST_TAGS)
        .select("post_id, tag_id")
        .in("post_id", postIds)

      if (postTagsError) {
        console.error("Error fetching post_tags:", postTagsError)
      } else {
        // Adicionar tags a cada post
        posts = posts.map((post) => {
          const postTags = postTagsData
            .filter((pt) => pt.post_id === post.id)
            .map((pt) => {
              const tag = tags.find((t) => t.id === pt.tag_id)
              return tag || { id: pt.tag_id, name: "Unknown" }
            })

          return {
            ...post,
            tags: postTags,
          }
        })
      }

      // 4. Buscar contagem de comentários para cada post em uma única consulta
      const { data: commentsData = [], error: commentsError } = await supabase
        .from(TABLES.COMMENTS)
        .select("post_id")
        .in("post_id", postIds)
        .eq("status", "Approved")

      if (commentsError) {
        console.error("Error fetching comments:", commentsError)
      } else {
        // Contar comentários para cada post
        const commentCounts = {}
        commentsData.forEach((comment) => {
          commentCounts[comment.post_id] = (commentCounts[comment.post_id] || 0) + 1
        })

        // Adicionar contagem de comentários a cada post
        posts = posts.map((post) => ({
          ...post,
          commentCount: commentCounts[post.id] || 0,
        }))
      }
    }
  } catch (e) {
    console.error("Exception in ArchivePage:", e)
    error = e
  }

  // Preparar dados para o Schema.org
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Ruby on Rails Tech Blog - Arquivo",
    description: "Arquivo de posts técnicos sobre Ruby on Rails e desenvolvimento web",
    url: `/archive`,
    blogPost: posts.map((post) => {
      // Garantir que temos uma data válida para publicação
      let datePublished
      try {
        datePublished = post.created_at ? new Date(post.created_at).toISOString() : new Date().toISOString()
        // Verificar se a data é válida
        if (datePublished === "Invalid Date") {
          datePublished = new Date().toISOString()
        }
      } catch (e) {
        console.error("Error formatting blog post date:", e)
        datePublished = new Date().toISOString()
      }

      return {
        "@type": "BlogPosting",
        headline: post.title,
        description: post.excerpt || post.content.substring(0, 160).replace(/<[^>]*>/g, ""),
        datePublished: datePublished,
        author: {
          "@type": "Person",
          name: "Caio Ramos",
        },
        url: `/posts/${post.id}`,
      }
    }),
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Schema.org JSON-LD */}
      <JsonLd data={blogSchema} />

      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 py-4">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center text-red-500 hover:text-red-400">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Voltar para a Home
          </Link>
          <Link href="/admin/login">
            <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-900/20">
              Admin Login
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Breadcrumbs items={[{ label: "Arquivo", href: "/archive" }]} />

        <h1 className="text-4xl font-bold text-red-500 mb-8">Arquivo de Posts</h1>

        {error ? (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-8">
            <h2 className="text-xl font-bold text-red-500 mb-2">Erro ao carregar dados</h2>
            <p className="text-white mb-2">
              Ocorreu um erro ao carregar os dados. Por favor, tente novamente mais tarde.
            </p>
            <div className="mt-4">
              <RetryButton />
            </div>
          </div>
        ) : (
          <ClientArchive posts={posts} allTags={tags} />
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
