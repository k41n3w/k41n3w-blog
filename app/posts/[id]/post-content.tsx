"use client"

import { useState } from "react"
import { Heart, MessageSquare, Share2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { incrementPostLikes } from "@/lib/supabase/actions"
import parse from "html-react-parser"
import { type DOMNode, type HTMLReactParserOptions, Element, domToReact } from "html-react-parser"
import GiphyRenderer from "@/components/post/giphy-renderer"

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

  // Opções para o parser HTML
  const options: HTMLReactParserOptions = {
    replace: (domNode: DOMNode) => {
      if (domNode instanceof Element && domNode.name === "img") {
        const { src, alt, class: className, width, height } = domNode.attribs

        // Verificar se é um GIF do Giphy
        const isGiphy =
          src?.includes("giphy.com") ||
          domNode.parent?.attribs?.class?.includes("giphy") ||
          domNode.parent?.parent?.attribs?.class?.includes("giphy")

        if (isGiphy) {
          return <GiphyRenderer src={src} alt={alt} />
        }

        // Para imagens normais
        return (
          <div className="my-4 flex justify-center">
            <img
              src={src || "/placeholder.svg"}
              alt={alt || "Imagem"}
              className={className || "max-w-full h-auto rounded-md"}
              width={width ? Number.parseInt(width) : undefined}
              height={height ? Number.parseInt(height) : undefined}
            />
          </div>
        )
      }

      // Verificar se é um contêiner de Giphy
      if (
        domNode instanceof Element &&
        (domNode.attribs.class?.includes("giphy-embed-container") ||
          domNode.attribs.class?.includes("giphy-embed-wrapper"))
      ) {
        // Procurar pelo ID do Giphy nos atributos
        const giphyId = domNode.attribs["data-giphy-id"]

        // Se encontrarmos um ID, usar o componente GiphyRenderer
        if (giphyId) {
          return <GiphyRenderer giphyId={giphyId} />
        }

        // Caso contrário, procurar por uma tag img dentro do contêiner
        const imgNode = findImgNode(domNode)
        if (imgNode) {
          return <GiphyRenderer src={imgNode.attribs.src} alt={imgNode.attribs.alt} />
        }

        // Se não encontrarmos uma imagem, renderizar o conteúdo normalmente
        return (
          <div className="giphy-embed-container my-4 flex justify-center flex-col items-center">
            {domToReact(domNode.children, options)}
          </div>
        )
      }
    },
  }

  // Função auxiliar para encontrar uma tag img dentro de um elemento
  function findImgNode(element: Element): Element | null {
    if (!element.children || element.children.length === 0) {
      return null
    }

    for (const child of element.children) {
      if (child instanceof Element) {
        if (child.name === "img") {
          return child
        }

        const imgInChild = findImgNode(child)
        if (imgInChild) {
          return imgInChild
        }
      }
    }

    return null
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

      {/* Conteúdo do post usando html-react-parser */}
      <div className="prose prose-invert prose-red max-w-none mb-8 editor-content">{parse(post.content, options)}</div>

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
