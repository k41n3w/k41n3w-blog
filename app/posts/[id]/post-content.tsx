"use client"

import { useState, useEffect } from "react"
import { Heart, MessageSquare, Share2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { incrementPostLikes } from "@/lib/supabase/actions"
// Import the content processor
import { processPostContent } from "@/lib/utils/content-processor"

interface PostContentProps {
  post: {
    id: string
    title: string
    content: string
    date: string
    author: string
    authorAvatar: string
    likes: number
    comments: number
    tags: string[]
  }
}

export default function PostContent({ post }: PostContentProps) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likes || 0)
  const [isLiking, setIsLiking] = useState(false)
  const [processedContent, setProcessedContent] = useState("")

  useEffect(() => {
    // Adicionar log para depuração
    console.log("Conteúdo original do post:", post.content.substring(0, 300) + "...")

    // Processar o conteúdo
    const processed = processPostContent(post.content)

    // Adicionar log para depuração
    console.log("Conteúdo processado:", processed.substring(0, 300) + "...")

    setProcessedContent(processed)
  }, [post.content])

  const handleLike = async () => {
    if (liked || isLiking) return // Prevent multiple likes

    setIsLiking(true)
    setLiked(true)
    setLikeCount(likeCount + 1)

    try {
      // Update like count in database
      const result = await incrementPostLikes(post.id)

      if (result.error) {
        console.error("Erro ao curtir post:", result.error)
        // Reverter o estado em caso de erro
        setLiked(false)
        setLikeCount(likeCount)
      }
    } catch (error) {
      console.error("Exceção ao curtir post:", error)
      // Reverter o estado em caso de erro
      setLiked(false)
      setLikeCount(likeCount)
    } finally {
      setIsLiking(false)
    }
  }

  return (
    <article>
      <h1 className="text-3xl md:text-4xl font-bold text-red-500 mb-4">{post.title}</h1>

      <div className="flex items-center space-x-4 mb-8">
        <Avatar>
          <AvatarImage src={post.authorAvatar || "/placeholder.svg"} alt={post.author} />
          <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{post.author}</p>
          <p className="text-sm text-gray-400">{post.date}</p>
        </div>
      </div>

      {/* Atualizado para usar as mesmas classes do editor */}
      <div
        className="prose prose-invert prose-red max-w-none mb-8 editor-content"
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />

      <div className="flex items-center space-x-6 mb-8">
        <button
          onClick={handleLike}
          className="flex items-center space-x-2 text-gray-400 hover:text-red-500"
          disabled={liked || isLiking}
        >
          <Heart className={`h-6 w-6 ${liked ? "fill-red-500 text-red-500" : ""}`} />
          <span>{likeCount}</span>
        </button>
        <div className="flex items-center space-x-2 text-gray-400">
          <MessageSquare className="h-6 w-6" />
          <span>{post.comments}</span>
        </div>
        <button className="flex items-center space-x-2 text-gray-400 hover:text-gray-300">
          <Share2 className="h-6 w-6" />
          <span>Share</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {post.tags.map((tag) => (
          <span key={tag} className="bg-gray-800 text-red-400 px-3 py-1 rounded-full text-sm">
            {tag}
          </span>
        ))}
      </div>
    </article>
  )
}
