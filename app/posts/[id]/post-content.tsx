"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { incrementPostLikes } from "@/lib/supabase/actions"
import parse from "html-react-parser"
import { type DOMNode, type HTMLReactParserOptions, Element, domToReact } from "html-react-parser"
import GiphyRenderer from "@/components/post/giphy-renderer"
import CodeBlock from "@/components/post/code-block"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Facebook, Twitter, Linkedin, Link2, Share2, MessageSquare, Heart } from "lucide-react"

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

  const handleShare = async () => {
    // URL atual do post
    const postUrl = window.location.href

    // Tentar usar a Web Share API se disponível
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: `Confira este post: ${post.title}`,
          url: postUrl,
        })
        return
      } catch (error) {
        console.error("Erro ao compartilhar:", error)
        // Se o erro for de permissão negada ou cancelamento pelo usuário, não mostrar erro
        // Continuar para as opções alternativas se a Web Share API falhar
      }
    }

    // Se a Web Share API não estiver disponível, copiar o link para a área de transferência
    try {
      await navigator.clipboard.writeText(postUrl)
      alert("Copiado com sucesso!")
    } catch (error) {
      console.error("Erro ao copiar link:", error)
      // Fallback manual para copiar o link
      const textArea = document.createElement("textarea")
      textArea.value = postUrl
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand("copy")
        alert("Copiado com sucesso!")
      } catch (err) {
        console.error("Falha ao copiar link:", err)
        alert("Não foi possível copiar o link. Por favor, copie manualmente.")
      }
      document.body.removeChild(textArea)
    }
  }

  // Função para compartilhar em redes sociais específicas
  const shareToSocial = (platform: string) => {
    const postUrl = encodeURIComponent(window.location.href)
    const postTitle = encodeURIComponent(post.title)

    let shareUrl = ""

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${postUrl}`
        break
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${postTitle}&url=${postUrl}`
        break
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${postUrl}`
        break
      default:
        return
    }

    window.open(shareUrl, "_blank", "width=600,height=400")
  }

  // Função para detectar a linguagem a partir de classes
  const detectLanguage = (className: string): string => {
    if (!className) return ""

    // Procurar por classes como "language-ruby", "language-js", etc.
    const match = className.match(/language-(\w+)/)
    return match ? match[1] : ""
  }

  // Opções para o parser HTML
  const options: HTMLReactParserOptions = {
    replace: (domNode: DOMNode) => {
      // Tratar blocos de código
      if (domNode instanceof Element && domNode.name === "pre") {
        // Verificar se há um elemento code dentro do pre
        const codeElement = domNode.children.find(
          (child): child is Element => child instanceof Element && child.name === "code",
        )

        if (codeElement) {
          // Detectar a linguagem a partir das classes
          const language = detectLanguage(codeElement.attribs.class || "")

          // Obter o conteúdo do código
          let code = ""
          if (codeElement.children.length > 0) {
            // Se o conteúdo for texto simples
            if (typeof codeElement.children[0].data === "string") {
              code = codeElement.children[0].data
            }
            // Se o conteúdo for HTML
            else {
              code = domToReact(codeElement.children, options) as string
              // Converter para string se for um objeto React
              if (typeof code !== "string") {
                code = String(code)
              }
            }
          }

          // Verificar se há um elemento de filename (geralmente um comentário ou div antes do pre)
          let filename = ""
          if (domNode.prev && domNode.prev instanceof Element && domNode.prev.attribs.class?.includes("filename")) {
            filename = domNode.prev.children[0]?.data || ""
          }

          return <CodeBlock code={code} language={language} filename={filename} />
        }
      }

      // Verificar se é um GIF do Giphy
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center space-x-2 text-gray-400 hover:text-gray-300">
              <Share2 className="h-6 w-6" />
              <span>Share</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-gray-800 border-gray-700">
            <DropdownMenuItem
              className="flex items-center cursor-pointer hover:bg-gray-700"
              onClick={() => shareToSocial("facebook")}
            >
              <Facebook className="h-4 w-4 mr-2 text-blue-500" />
              <span>Facebook</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center cursor-pointer hover:bg-gray-700"
              onClick={() => shareToSocial("twitter")}
            >
              <Twitter className="h-4 w-4 mr-2 text-blue-400" />
              <span>Twitter</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center cursor-pointer hover:bg-gray-700"
              onClick={() => shareToSocial("linkedin")}
            >
              <Linkedin className="h-4 w-4 mr-2 text-blue-600" />
              <span>LinkedIn</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center cursor-pointer hover:bg-gray-700" onClick={handleShare}>
              <Link2 className="h-4 w-4 mr-2 text-gray-400" />
              <span>Copiar Link</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
