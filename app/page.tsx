import Link from "next/link"
import { ArrowRight, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { TABLES } from "@/lib/supabase/config"
import MatrixAnimation from "@/components/matrix-animation"
import Footer from "@/components/layout/footer"

export const revalidate = 60 // Revalidate this page every 60 seconds

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
      console.log("Posts fetched successfully:", posts)
    }
  } catch (e) {
    console.error("Exception fetching posts:", e)
    error = e
  }

  // Transformar os dados para o formato esperado pelo componente
  const formattedPosts = posts.map((post) => {
    // Usar uma exibição simples para o autor
    const authorId = post?.author_id || "unknown"
    // Extrair um nome simples do UUID se possível
    const authorName = authorId.split("-")[0] || "Author"

    return {
      id: post.id,
      title: post.title,
      excerpt: post.excerpt || "No excerpt available",
      date: new Date(post.created_at).toLocaleDateString(),
      author: authorName,
      likes: post.likes || 0,
      comments: 0, // Buscaremos os comentários separadamente depois
    }
  })

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      {/* Matrix Animation Header */}
      <div className="relative w-full h-[400px]">
        <MatrixAnimation />
      </div>

      {/* Latest Posts Section */}
      <section className="py-12 px-4 max-w-6xl mx-auto w-full">
        <h2 className="text-3xl font-bold mb-8 text-red-500">Latest Posts</h2>
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
                  <CardTitle className="text-red-500 hover:text-red-400">
                    <Link href={`/posts/${post.id}`}>{post.title}</Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm mb-2">
                    {post.date} • by {post.author}
                  </p>
                  <p className="text-gray-300">{post.excerpt}</p>
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
      </section>

      {/* Admin Login Button */}
      <div className="fixed top-4 right-4">
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
