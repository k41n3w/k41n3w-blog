"use client"

import type React from "react"

import { useState } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createComment, incrementCommentLikes } from "@/lib/supabase/actions"
import { useToast } from "@/hooks/use-toast"
import CommentSubmissionModal from "@/components/post/comment-submission-modal"

interface Comment {
  id: string
  author: string
  content: string
  date: string
  likes: number
}

interface CommentSectionProps {
  postId: string
  comments: Comment[]
}

export default function CommentSection({ postId, comments: initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments)
  const [author, setAuthor] = useState("")
  const [email, setEmail] = useState("")
  const [commentText, setCommentText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>({})
  const [showSubmissionModal, setShowSubmissionModal] = useState(false)
  const { toast } = useToast()

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!author.trim() || !commentText.trim()) {
      toast({
        title: "Informação faltando",
        description: "Por favor, forneça seu nome e comentário.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("postId", postId)
      formData.append("author", author)
      formData.append("email", email)
      formData.append("content", commentText)

      const result = await createComment(formData)

      if (result.error) {
        throw new Error(result.error)
      }

      // Clear form
      setAuthor("")
      setEmail("")
      setCommentText("")

      // Show the modal instead of a toast
      setShowSubmissionModal(true)
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Falha ao enviar comentário. Por favor, tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCommentLike = async (commentId: string) => {
    // Prevent multiple likes
    if (likedComments[commentId]) return

    // Optimistically update UI
    setComments(
      comments.map((comment) => (comment.id === commentId ? { ...comment, likes: comment.likes + 1 } : comment)),
    )

    // Mark comment as liked
    setLikedComments((prev) => ({ ...prev, [commentId]: true }))

    try {
      // Update in database
      const result = await incrementCommentLikes(commentId)

      if (result.error) {
        console.error("Erro ao curtir comentário:", result.error)
        // Reverter o estado em caso de erro
        setComments(
          comments.map((comment) => (comment.id === commentId ? { ...comment, likes: comment.likes } : comment)),
        )
        setLikedComments((prev) => ({ ...prev, [commentId]: false }))
      }
    } catch (error) {
      console.error("Exceção ao curtir comentário:", error)
      // Reverter o estado em caso de erro
      setComments(
        comments.map((comment) => (comment.id === commentId ? { ...comment, likes: comment.likes } : comment)),
      )
      setLikedComments((prev) => ({ ...prev, [commentId]: false }))
    }
  }

  return (
    <section>
      <h2 className="text-2xl font-bold text-red-500 mb-6">Comments ({comments.length})</h2>

      {/* Add Comment */}
      <div className="mb-8">
        <form onSubmit={handleAddComment} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-400 mb-1">
                Name *
              </label>
              <input
                id="author"
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
                className="w-full bg-gray-900 border border-gray-800 focus:border-red-500 rounded-md p-2"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
                Email (optional)
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 focus:border-red-500 rounded-md p-2"
              />
            </div>
          </div>
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-400 mb-1">
              Comment *
            </label>
            <Textarea
              id="comment"
              placeholder="Add a comment..."
              className="bg-gray-900 border border-gray-800 focus:border-red-500"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Enviar Comentário"}
          </Button>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-gray-400">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="mb-2">
                <p className="font-medium">{comment.author}</p>
                <p className="text-sm text-gray-400">{comment.date}</p>
              </div>
              <p className="mb-4">{comment.content}</p>
              <button
                onClick={() => handleCommentLike(comment.id)}
                className="flex items-center space-x-2 text-gray-400 hover:text-red-500"
                disabled={likedComments[comment.id]}
              >
                <Heart className={`h-5 w-5 ${likedComments[comment.id] ? "fill-red-500 text-red-500" : ""}`} />
                <span>{comment.likes}</span>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Comment Submission Modal */}
      <CommentSubmissionModal isOpen={showSubmissionModal} onClose={() => setShowSubmissionModal(false)} />
    </section>
  )
}
