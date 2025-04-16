"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { FileText, Home, LogOut, MessageSquare, PenSquare, Plus, Settings, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { approveComment, deleteComment, deletePost, signOut } from "@/lib/supabase/actions"
import { useToast } from "@/hooks/use-toast"

export default function AdminDashboard() {
  const [posts, setPosts] = useState<any[]>([])
  const [comments, setComments] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch posts
        const { data: postsData, error: postsError } = await supabase
          .from("posts")
          .select(`
            id,
            title,
            status,
            created_at,
            views,
            comments(count)
          `)
          .order("created_at", { ascending: false })

        if (postsError) throw postsError

        // Fetch comments
        const { data: commentsData, error: commentsError } = await supabase
          .from("comments")
          .select(`
            id,
            author,
            content,
            post_id,
            posts(title),
            created_at,
            status
          `)
          .order("created_at", { ascending: false })

        if (commentsError) throw commentsError

        setPosts(postsData || [])
        setComments(commentsData || [])
      } catch (error: any) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase, toast])

  const filteredPosts = posts.filter((post) => post.title.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleApproveComment = async (commentId: string) => {
    try {
      const result = await approveComment(commentId)

      if (result.error) {
        throw new Error(result.error)
      }

      // Update local state
      setComments(comments.map((comment) => (comment.id === commentId ? { ...comment, status: "Approved" } : comment)))

      toast({
        title: "Success",
        description: "Comment approved successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve comment",
        variant: "destructive",
      })
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return

    try {
      const result = await deleteComment(commentId)

      if (result.error) {
        throw new Error(result.error)
      }

      // Update local state
      setComments(comments.filter((comment) => comment.id !== commentId))

      toast({
        title: "Success",
        description: "Comment deleted successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete comment",
        variant: "destructive",
      })
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) return

    try {
      const result = await deletePost(postId)

      if (result.error) {
        throw new Error(result.error)
      }

      // Update local state
      setPosts(posts.filter((post) => post.id !== postId))

      toast({
        title: "Success",
        description: "Post deleted successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete post",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 p-4 hidden md:block">
        <div className="flex items-center mb-8">
          <h1 className="text-xl font-bold text-red-500">k41n3w Admin</h1>
        </div>

        <nav className="space-y-1">
          <Link
            href="/admin/dashboard"
            className="flex items-center space-x-3 text-red-500 bg-gray-800/50 px-3 py-2 rounded-md"
          >
            <Home className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/admin/posts/new"
            className="flex items-center space-x-3 text-gray-400 hover:text-red-500 px-3 py-2 rounded-md hover:bg-gray-800/50"
          >
            <FileText className="h-5 w-5" />
            <span>New Post</span>
          </Link>
          <Link
            href="/admin/comments"
            className="flex items-center space-x-3 text-gray-400 hover:text-red-500 px-3 py-2 rounded-md hover:bg-gray-800/50"
          >
            <MessageSquare className="h-5 w-5" />
            <span>Comments</span>
          </Link>
          <Link
            href="/admin/settings"
            className="flex items-center space-x-3 text-gray-400 hover:text-red-500 px-3 py-2 rounded-md hover:bg-gray-800/50"
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="mt-auto pt-8">
          <form action={signOut}>
            <Button
              type="submit"
              variant="ghost"
              className="w-full justify-start text-gray-400 hover:text-red-500 hover:bg-gray-800/50"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h1 className="text-2xl font-bold text-red-500 mb-2 sm:mb-0">Dashboard</h1>
            <div className="flex space-x-2">
              <Link href="/admin/posts/new">
                <Button className="bg-red-600 hover:bg-red-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Post
                </Button>
              </Link>
              <Link href="/" target="_blank">
                <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-900/20">
                  View Site
                </Button>
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-red-500">Loading...</div>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="bg-gray-900 border-gray-800 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">Total Posts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-500">{posts.length}</div>
                    <p className="text-xs text-gray-400 mt-1">
                      {posts.filter((p) => p.status === "Published").length} published,{" "}
                      {posts.filter((p) => p.status === "Draft").length} drafts
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">Total Comments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-500">{comments.length}</div>
                    <p className="text-xs text-gray-400 mt-1">
                      {comments.filter((c) => c.status === "Approved").length} approved,{" "}
                      {comments.filter((c) => c.status === "Pending").length} pending
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">Total Views</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-500">
                      {posts.reduce((sum, post) => sum + post.views, 0)}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">All time</p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">Engagement Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-500">
                      {posts.length > 0
                        ? ((comments.length / posts.reduce((sum, post) => sum + post.views, 0)) * 100).toFixed(1) + "%"
                        : "0%"}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Comments per view</p>
                  </CardContent>
                </Card>
              </div>

              {/* Content Tabs */}
              <Tabs defaultValue="posts" className="mb-6">
                <TabsList className="bg-gray-900 border border-gray-800">
                  <TabsTrigger value="posts" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                    Recent Posts
                  </TabsTrigger>
                  <TabsTrigger
                    value="comments"
                    className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
                  >
                    Recent Comments
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="posts" className="mt-4">
                  <Card className="bg-gray-900 border-gray-800 text-white">
                    <CardHeader className="pb-2">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle>Posts</CardTitle>
                        <div className="mt-2 sm:mt-0">
                          <Input
                            placeholder="Search posts..."
                            className="bg-gray-800 border-gray-700 focus:border-red-500 w-full sm:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-800 hover:bg-gray-800/50">
                            <TableHead className="text-gray-400">Title</TableHead>
                            <TableHead className="text-gray-400">Status</TableHead>
                            <TableHead className="text-gray-400">Date</TableHead>
                            <TableHead className="text-gray-400 text-right">Views</TableHead>
                            <TableHead className="text-gray-400 text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredPosts.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-4">
                                No posts found
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredPosts.map((post) => (
                              <TableRow key={post.id} className="border-gray-800 hover:bg-gray-800/50">
                                <TableCell className="font-medium">{post.title}</TableCell>
                                <TableCell>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs ${
                                      post.status === "Published"
                                        ? "bg-green-900/30 text-green-400"
                                        : "bg-yellow-900/30 text-yellow-400"
                                    }`}
                                  >
                                    {post.status}
                                  </span>
                                </TableCell>
                                <TableCell>{new Date(post.created_at).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">{post.views}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end space-x-2">
                                    <Link href={`/admin/posts/edit/${post.id}`}>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-gray-400 hover:text-red-500"
                                      >
                                        <PenSquare className="h-4 w-4" />
                                        <span className="sr-only">Edit</span>
                                      </Button>
                                    </Link>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-gray-400 hover:text-red-500"
                                      onClick={() => handleDeletePost(post.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      <span className="sr-only">Delete</span>
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="comments" className="mt-4">
                  <Card className="bg-gray-900 border-gray-800 text-white">
                    <CardHeader>
                      <CardTitle>Recent Comments</CardTitle>
                      <CardDescription className="text-gray-400">Manage comments from your readers</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-800 hover:bg-gray-800/50">
                            <TableHead className="text-gray-400">Author</TableHead>
                            <TableHead className="text-gray-400">Comment</TableHead>
                            <TableHead className="text-gray-400">Post</TableHead>
                            <TableHead className="text-gray-400">Status</TableHead>
                            <TableHead className="text-gray-400 text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {comments.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-4">
                                No comments found
                              </TableCell>
                            </TableRow>
                          ) : (
                            comments.map((comment) => (
                              <TableRow key={comment.id} className="border-gray-800 hover:bg-gray-800/50">
                                <TableCell className="font-medium">{comment.author}</TableCell>
                                <TableCell className="max-w-xs truncate">{comment.content}</TableCell>
                                <TableCell className="max-w-xs truncate">{comment.posts?.title}</TableCell>
                                <TableCell>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs ${
                                      comment.status === "Approved"
                                        ? "bg-green-900/30 text-green-400"
                                        : "bg-yellow-900/30 text-yellow-400"
                                    }`}
                                  >
                                    {comment.status}
                                  </span>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end space-x-2">
                                    {comment.status === "Pending" && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-gray-400 hover:text-green-500"
                                        onClick={() => handleApproveComment(comment.id)}
                                      >
                                        <span className="sr-only">Approve</span>✓
                                      </Button>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-gray-400 hover:text-red-500"
                                      onClick={() => handleDeleteComment(comment.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      <span className="sr-only">Delete</span>
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
