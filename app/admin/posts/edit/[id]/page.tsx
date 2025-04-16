"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { updatePost } from "@/lib/supabase/actions"
import { useToast } from "@/hooks/use-toast"

export default function EditPostPage({ params }: { params: { id: string } }) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [tags, setTags] = useState("")
  const [status, setStatus] = useState("Draft")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    async function fetchPost() {
      try {
        const { data: post, error } = await supabase
          .from("posts")
          .select(`
            *,
            post_tags(
              tags:tag_id(name)
            )
          `)
          .eq("id", params.id)
          .single()

        if (error) throw error

        if (post) {
          setTitle(post.title)
          setContent(post.content)
          setExcerpt(post.excerpt || "")
          setStatus(post.status)

          // Extract tag names
          const tagNames = post.post_tags.map((pt: any) => pt.tags.name)
          setTags(tagNames.join(", "))
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to load post data",
          variant: "destructive",
        })
        console.error("Error fetching post:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPost()
  }, [params.id, supabase, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("title", title)
      formData.append("content", content)
      formData.append("excerpt", excerpt)
      formData.append("tags", tags)
      formData.append("status", status)

      const result = await updatePost(params.id, formData)

      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: "Success",
        description: "Post updated successfully",
      })

      router.push("/admin/dashboard")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update post",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-red-500">Loading post data...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/admin/dashboard" className="inline-flex items-center text-red-500 hover:text-red-400">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Dashboard
          </Link>
        </div>

        <Card className="bg-gray-900 border-gray-800 text-white">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-red-500">Edit Post</CardTitle>
            <CardDescription className="text-gray-400">Update your blog post</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-gray-800 border-gray-700 focus:border-red-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="bg-gray-800 border-gray-700 focus:border-red-500"
                  placeholder="A brief summary of your post"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content (HTML)</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="bg-gray-800 border-gray-700 focus:border-red-500 font-mono"
                  placeholder="<p>Your content here...</p>"
                  rows={10}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="bg-gray-800 border-gray-700 focus:border-red-500"
                  placeholder="Ruby, Rails, Web Development (comma separated)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="status"
                      value="Draft"
                      checked={status === "Draft"}
                      onChange={() => setStatus("Draft")}
                      className="text-red-500 focus:ring-red-500"
                    />
                    <span>Draft</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="status"
                      value="Published"
                      checked={status === "Published"}
                      onChange={() => setStatus("Published")}
                      className="text-red-500 focus:ring-red-500"
                    />
                    <span>Published</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Link href="/admin/dashboard">
                  <Button type="button" variant="outline" className="border-gray-700 text-gray-300">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Post"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
