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

// Forçar renderização dinâmica sem cache
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function Home() {
  const supabase = await createClient()

  // Buscar posts publicados
  let posts: any[] = []
  let error: any = null

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
      error = fetchError
    } else {
      posts = data || []
    }
  } catch (e: any) {
    error = e
  }

  // Transformar os dados para o formato esperado pelo componente
  const formattedPosts = posts.map((post) => {
    // Garantir que a data seja válida antes de formatar
    let formattedDate = "Data não disponível"
    try {
      if (post.created_at) {
        const date = new Date(post.created_at)
        // Formato brasileiro: dia/mês/ano
        formattedDate = date.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
        if (formattedDate === "Invalid Date") {
          formattedDate = "Data não disponível"
        }
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

      {/* Matrix Animation Hero */}
      <div className="relative w-full h-[650px]">
        <MatrixAnimation />
      </div>

      {/* Latest Posts Section */}
      <section className="py-16 px-4 w-full box-border">
        <div className="max-w-6xl mx-auto w-full">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-white inline-block pb-2">
              Últimas postagens
              <span className="block h-0.5 bg-red-600 mt-2" />
            </h2>
          </div>

          {formattedPosts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-zinc-400">No posts found. Check back soon!</p>
              <p className="text-xs text-zinc-600 mt-2">
                Debug: {posts ? `${posts.length} posts retrieved` : "No posts data"}
                {error ? ` | Error: ${error.message || "Unknown error"}` : ""}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {formattedPosts.map((post) => (
                <Card
                  key={post.id}
                  className="bg-zinc-950 border border-zinc-800 text-white hover:border-red-600 hover:shadow-lg hover:shadow-red-950/30 transition-all duration-200 flex flex-col"
                >
                  <CardHeader>
                    <CardTitle className="text-white hover:text-red-400 transition-colors break-words leading-snug">
                      <Link href={`/posts/${post.id}`}>{post.title}</Link>
                    </CardTitle>
                    <p className="text-zinc-500 text-xs mt-1">
                      {post.date} · {post.author}
                    </p>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-zinc-400 break-words text-sm leading-relaxed">{post.excerpt}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t border-zinc-800 pt-4 mt-2">
                    <div className="flex items-center space-x-1 text-zinc-600">
                      <Heart className="h-4 w-4" />
                      <span className="text-xs">{post.likes}</span>
                    </div>
                    <Link href={`/posts/${post.id}`}>
                      <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800 px-2 py-1 h-auto text-sm">
                        Saiba mais <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-10 text-center">
            <Link href="/archive">
              <Button className="bg-red-600 hover:bg-red-500 text-white font-semibold px-8 py-2 transition-colors duration-200">
                Ver todos os posts
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
