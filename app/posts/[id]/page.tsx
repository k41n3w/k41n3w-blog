import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/server"
import { TABLES } from "@/lib/supabase/config"
import PostContent from "./post-content"
import CommentSection from "./comment-section"

export const revalidate = 60 // Revalidate this page every 60 seconds

export default async function PostPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  // Fetch post without any joins
  const { data: post, error: postError } = await supabase.from(TABLES.POSTS).select("*").eq("id", params.id).single()

  if (postError || !post) {
    console.error("Error fetching post:", postError)
    notFound()
  }

  // Fetch comments separately
  const { data: comments = [], error: commentsError } = await supabase
    .from(TABLES.COMMENTS)
    .select("*")
    .eq("post_id", params.id)
    .eq("status", "Approved")

  if (commentsError) {
    console.error("Error fetching comments:", commentsError)
    // Continue even if comments fetch fails
  }

  // Fetch tags separately
  const { data: postTags = [], error: tagsError } = await supabase
    .from(TABLES.POST_TAGS)
    .select("tag_id")
    .eq("post_id", params.id)

  if (tagsError) {
    console.error("Error fetching post tags:", tagsError)
    // Continue even if tags fetch fails
  }

  // Get tag names if we have tag IDs
  let tags: string[] = []
  if (postTags.length > 0) {
    const tagIds = postTags.map((pt) => pt.tag_id)
    const { data: tagData = [] } = await supabase.from(TABLES.TAGS).select("name").in("id", tagIds)

    tags = tagData.map((t) => t.name)
  }

  // Try to increment view count, but don't fail if it doesn't work
  try {
    await supabase
      .from(TABLES.POSTS)
      .update({ views: (post.views || 0) + 1 })
      .eq("id", params.id)
  } catch (error) {
    console.error("Error incrementing views:", error)
  }

  // Format the author name from author_id
  const authorId = post.author_id || "unknown"
  const authorName = authorId.split("-")[0] || "Author"

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
            author: authorName,
            authorAvatar: "/placeholder.svg?height=40&width=40",
            likes: 0, // We'll implement likes later
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
            authorAvatar: "/placeholder.svg?height=40&width=40",
            content: comment.content,
            date: new Date(comment.created_at).toLocaleDateString(),
            likes: comment.likes || 0,
          }))}
        />
      </main>

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
