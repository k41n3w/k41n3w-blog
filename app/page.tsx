import Link from "next/link"
import { ArrowRight, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { TABLES } from "@/lib/supabase/config"
import MatrixAnimation from "@/components/matrix-animation"
import Footer from "@/components/layout/footer"
import { JsonLd } from "@/components/seo/json-ld"
import { siteConfig } from "@/lib/seo/metadata"

// Configuração para geração estática com revalidação
export const dynamic = "force-static"
export const revalidate = 3600 // Revalidar a cada hora

export default async function Home() {
  const supabase = createClient()

  // Buscar posts publicados
  let posts = []
  let error = null

  try {
    const { data, error: fetchError } = await supabase
      .from(TABLES.POSTS)
      .select(`
       id, 
       title, 
       excerpt, 
       created_at,
       views,
       likes,
       author_id
     `)
      .eq("status", "Published")
      .order("created_at", { ascending: false })
      .limit(6)

    if (fetchError) {
      console.error("Error fetching posts:", fetchError)
      error = fetchError
    } else {
      posts = data || []
    }
  } catch (e) {
    console.error("Exception fetching posts:", e)
    error = e
  }

  // Transformar os dados para o formato esperado pelo componente
  const formattedPosts = posts.map((post) => {
    // Garantir que a data seja válida antes de formatar
    let formattedDate = "Data não disponível"
    try {
      if (post.created_at) {
        formattedDate = new Date(post.created_at).toLocaleDateString()
      }
    } catch (e) {
      console.error("Error formatting date:", e)
    }

    return {
      id: post.id,
      title: post.title,
      excerpt: post.excerpt || "No excerpt available",
      date: formattedDate,
      author: "Caio Ramos", // Nome fixo do autor
      likes: post.likes || 0,
      comments: 0, // Buscaremos os comentários separadamente depois
    }
  })

  // Preparar dados para o Schema.org com URLs relativas
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    description: siteConfig.description,
    url: "/",
    potentialAction: {
      "@type": "SearchAction",
      target: `/archive?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  }

  // Schema para organização
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: "/",
    logo: `/images/logo.png`,
    sameAs: ["https://github.com/k41n3w/", "https://www.linkedin.com/in/k41n3w/", "https://medium.com/@caio_ramos"],
  }

  // Schema para lista de blog posts
  const blogPostingListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: formattedPosts.map((post, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "BlogPosting",
        headline: post.title,
        description: post.excerpt,
        // Usar uma data ISO válida ou uma data padrão
        datePublished: (() => {
          try {
            // Verificar se a data é válida antes de converter para ISO
            const date = new Date(post.date)
            // Verificar se a data é válida
            if (isNaN(date.getTime())) {
              return new Date().toISOString() // Data padrão se inválida
            }
            return date.toISOString()
          } catch (e) {
            console.error("Error converting date to ISO:", e)
            return new Date().toISOString() // Data padrão em caso de erro
          }
        })(),
        author: {
          "@type": "Person",
          name: post.author,
        },
        url: `/posts/${post.id}`,
      },
    })),
  }

  return (
    <div className="flex min-h-screen flex-col bg-black text-white overflow-x-hidden w-full">
      {/* Schema.org JSON-LD */}
      <JsonLd data={websiteSchema} />
      <JsonLd data={organizationSchema} />
      <JsonLd data={blogPostingListSchema} />

      {/* Matrix Animation Header - Increased height */}
      <div className="relative w-full h-[500px]">
        <MatrixAnimation />
      </div>

      {/* Latest Posts Section - Added more padding at the top */}
      <section className="py-16 px-4 w-full box-border">
        <div className="max-w-6xl mx-auto w-full">
          <h1 className="text-3xl font-bold mb-8 text-red-500">Latest Posts</h1>
          {formattedPosts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No posts found. Check back soon!</p>
              {/* Debug info */}
              <p className="text-xs text-gray-600 mt-2">
                Debug: {posts ? `${posts.length} posts retrieved` : "No posts data"}
                {error ? ` | Error: ${error.message || "Unknown error"}` : ""}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {formattedPosts.map((post) => (
                <Card key={post.id} className="bg-gray-900 border-gray-800 text-white">
                  <CardHeader>
                    <CardTitle className="text-red-500 hover:text-red-400 break-words">
                      <Link href={`/posts/${post.id}`}>{post.title}</Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 text-sm mb-2">
                      {post.date} • by {post.author}
                    </p>
                    <p className="text-gray-300 break-words">{post.excerpt}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="flex items-center space-x-2">
                      <Heart className="h-5 w-5 text-red-500" />
                      <span className="text-sm">{post.likes}</span>
                    </div>
                    <Link href={`/posts/${post.id}`}>
                      <Button variant="ghost" className="text-red-500 hover:text-red-400 hover:bg-gray-800">
                        Read More <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
          <div className="mt-8 text-center">
            <Link href="/archive">
              <Button className="bg-red-600 hover:bg-red-700 text-white">View All Posts</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Admin Login Button */}
      <div className="fixed top-4 right-4 z-10">
        <Link href="/admin/login">
          <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-900/20">
            Admin Login
          </Button>
        </Link>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
