import Link from "next/link"
import { ArrowRight, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { TABLES } from "@/lib/supabase/config"
import MatrixAnimation from "@/components/matrix-animation"

export const revalidate = 60 // Revalidate this page every 60 seconds

export default async function Home() {
  const supabase = createClient()

  // Verificar tabelas existentes usando SQL direto
  const { data: tableCheck, error: tableCheckError } = await supabase.rpc("check_table_exists", {
    table_name: "posts",
  })

  console.log("Table check result:", tableCheck)
  if (tableCheckError) {
    console.error("Error checking table:", tableCheckError)
  }

  // Tentar buscar posts diretamente
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

  // Transform the data to match our component's expected format
  const formattedPosts = posts.map((post) => {
    // Use a simple author display for now
    const authorId = post.author_id || "unknown"
    // Extract a simple name from the UUID if possible
    const authorName = authorId.split("-")[0] || "Author"

    return {
      id: post.id,
      title: post.title,
      excerpt: post.excerpt || "No excerpt available",
      date: new Date(post.created_at).toLocaleDateString(),
      author: authorName,
      likes: 0, // We'll implement likes later
      comments: 0, // We'll fetch comments separately later
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
              {error ? ` | Error: ${error.message}` : ""}
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
      <footer className="mt-auto py-8 bg-gray-900 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold text-red-500 mb-4">k41n3w</h3>
              <p className="text-gray-400">A tech blog for Ruby on Rails developers and enthusiasts.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-red-500 mb-4">Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/" className="hover:text-red-400">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-red-400">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/archive" className="hover:text-red-400">
                    Archive
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-red-400">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold text-red-500 mb-4">Subscribe</h3>
              <p className="text-gray-400 mb-4">Get the latest posts delivered to your inbox.</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="bg-gray-800 text-white px-4 py-2 rounded-l-md focus:outline-none focus:ring-1 focus:ring-red-500 border-0"
                />
                <Button className="bg-red-600 hover:bg-red-700 rounded-l-none">Subscribe</Button>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} k41n3w. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
