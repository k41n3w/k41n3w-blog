"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Calendar,
  Heart,
  MessageSquare,
  Tag,
  Filter,
  SortAsc,
  SortDesc,
  ThumbsUp,
  Eye,
  ArrowLeft,
} from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Post {
  id: string
  title: string
  excerpt: string | null
  content: string
  created_at: string
  views: number
  likes: number | null
  author_id: string
  tags: { id: string; name: string }[]
  commentCount: number
}

interface ArchiveTag {
  id: string
  name: string
}

interface ClientArchiveProps {
  posts: Post[]
  allTags: ArchiveTag[]
}

export default function ClientArchive({ posts, allTags }: ClientArchiveProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedTag, setSelectedTag] = useState("")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "popular" | "most-liked">("newest")
  const postsPerPage = 9

  // Efeito para rolar para o topo quando o componente for montado
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Filtrar e ordenar posts
  const filteredAndSortedPosts = useMemo(() => {
    // Primeiro, filtrar por tag se necessário
    const result = selectedTag ? posts.filter((post) => post.tags.some((tag) => tag.id === selectedTag)) : posts

    // Depois, ordenar conforme selecionado
    return result.sort((a, b) => {
      if (sortOrder === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      } else if (sortOrder === "popular") {
        return (b.views || 0) - (a.views || 0)
      } else if (sortOrder === "most-liked") {
        return (b.likes || 0) - (a.likes || 0)
      } else {
        // "newest" (padrão)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })
  }, [posts, selectedTag, sortOrder])

  // Calcular paginação
  const totalPages = Math.ceil(filteredAndSortedPosts.length / postsPerPage)
  const currentPosts = filteredAndSortedPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage)

  // Função para mudar de página
  const changePage = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Função para obter o nome da ordenação selecionada
  const getSortName = (sortValue: string) => {
    switch (sortValue) {
      case "newest":
        return "Mais recentes"
      case "oldest":
        return "Mais antigos"
      case "popular":
        return "Mais visualizados"
      case "most-liked":
        return "Mais curtidos"
      default:
        return "Mais recentes"
    }
  }

  // Função para obter o ícone da ordenação selecionada
  const getSortIcon = (sortValue: string) => {
    switch (sortValue) {
      case "newest":
        return <SortDesc className="h-4 w-4 mr-2" />
      case "oldest":
        return <SortAsc className="h-4 w-4 mr-2" />
      case "popular":
        return <Eye className="h-4 w-4 mr-2" />
      case "most-liked":
        return <ThumbsUp className="h-4 w-4 mr-2" />
      default:
        return <SortDesc className="h-4 w-4 mr-2" />
    }
  }

  // Função para criar array de páginas para mostrar
  const getPageNumbers = () => {
    const pages = []
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow) {
      // Se houver poucas páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Sempre mostrar a primeira página
      pages.push(1)

      // Calcular páginas do meio
      let startPage = Math.max(2, currentPage - 1)
      let endPage = Math.min(totalPages - 1, currentPage + 1)

      // Ajustar se estiver no início ou fim
      if (currentPage <= 2) {
        endPage = 4
      } else if (currentPage >= totalPages - 1) {
        startPage = totalPages - 3
      }

      // Adicionar elipses se necessário
      if (startPage > 2) {
        pages.push("ellipsis-start")
      }

      // Adicionar páginas do meio
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }

      // Adicionar elipses se necessário
      if (endPage < totalPages - 1) {
        pages.push("ellipsis-end")
      }

      // Sempre mostrar a última página
      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }

    return pages
  }

  // Obter o nome da tag selecionada
  const selectedTagName = allTags.find((t) => t.id === selectedTag)?.name || "Todas as Tags"

  return (
    <>
      {/* Filtros */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-900 p-4 rounded-lg border border-gray-800">
          <div className="flex items-center">
            <Filter className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-gray-300 mr-2">Filtrar por:</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto border-gray-700 bg-gray-800">
                  <Filter className="h-4 w-4 mr-2" />
                  {selectedTagName}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white">
                <DropdownMenuLabel>Tags</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem
                  className={`${!selectedTag ? "bg-gray-700" : ""} hover:bg-gray-700 cursor-pointer`}
                  onClick={() => {
                    setSelectedTag("")
                    setCurrentPage(1)
                  }}
                >
                  Todas as Tags
                </DropdownMenuItem>
                {allTags.map((tag) => (
                  <DropdownMenuItem
                    key={tag.id}
                    className={`${selectedTag === tag.id ? "bg-gray-700" : ""} hover:bg-gray-700 cursor-pointer`}
                    onClick={() => {
                      setSelectedTag(tag.id)
                      setCurrentPage(1)
                    }}
                  >
                    {tag.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto border-gray-700 bg-gray-800">
                  {getSortIcon(sortOrder)}
                  {getSortName(sortOrder)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white">
                <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem
                  className={`${sortOrder === "newest" ? "bg-gray-700" : ""} hover:bg-gray-700 cursor-pointer`}
                  onClick={() => setSortOrder("newest")}
                >
                  <SortDesc className="h-4 w-4 mr-2" />
                  Mais recentes
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={`${sortOrder === "oldest" ? "bg-gray-700" : ""} hover:bg-gray-700 cursor-pointer`}
                  onClick={() => setSortOrder("oldest")}
                >
                  <SortAsc className="h-4 w-4 mr-2" />
                  Mais antigos
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={`${sortOrder === "popular" ? "bg-gray-700" : ""} hover:bg-gray-700 cursor-pointer`}
                  onClick={() => setSortOrder("popular")}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Mais visualizados
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={`${sortOrder === "most-liked" ? "bg-gray-700" : ""} hover:bg-gray-700 cursor-pointer`}
                  onClick={() => setSortOrder("most-liked")}
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Mais curtidos
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Lista de Posts */}
      {currentPosts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">Nenhum post encontrado com os filtros selecionados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentPosts.map((post) => {
            // Extrair um nome simples do UUID do autor
            const authorId = post.author_id || "unknown"
            const authorName = authorId.split("-")[0] || "Author"

            // Criar um resumo do conteúdo se não houver excerpt
            const excerpt = post.excerpt || post.content.replace(/<[^>]*>/g, "").substring(0, 150) + "..."

            return (
              <Card key={post.id} className="bg-gray-900 border-gray-800 text-white flex flex-col">
                <CardHeader>
                  <CardTitle className="text-red-500 hover:text-red-400">
                    <Link href={`/posts/${post.id}`}>{post.title}</Link>
                  </CardTitle>
                  <div className="flex items-center text-gray-400 text-sm mt-2">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    <span className="mx-2">•</span>
                    <span>por {authorName}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-gray-300 mb-4">{excerpt}</p>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        className="border-red-500 text-red-400 hover:bg-red-900/20 cursor-pointer"
                        onClick={() => {
                          setSelectedTag(tag.id)
                          setCurrentPage(1)
                        }}
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t border-gray-800 pt-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span className="text-sm">{post.likes || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{post.commentCount}</span>
                    </div>
                  </div>
                  <Link href={`/posts/${post.id}`}>
                    <Button variant="ghost" className="text-red-500 hover:text-red-400 hover:bg-gray-800 p-0">
                      Ler mais <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <Button
            variant="outline"
            className="border-gray-700 bg-gray-800 hover:bg-gray-700"
            onClick={() => changePage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Página anterior</span>
          </Button>

          {getPageNumbers().map((page, index) => {
            if (page === "ellipsis-start" || page === "ellipsis-end") {
              return (
                <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-400">
                  ...
                </span>
              )
            }

            return (
              <Button
                key={`page-${page}`}
                variant={currentPage === page ? "default" : "outline"}
                className={
                  currentPage === page ? "bg-red-600 hover:bg-red-700" : "border-gray-700 bg-gray-800 hover:bg-gray-700"
                }
                onClick={() => changePage(page as number)}
              >
                {page}
              </Button>
            )
          })}

          <Button
            variant="outline"
            className="border-gray-700 bg-gray-800 hover:bg-gray-700"
            onClick={() => changePage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ArrowRight className="h-4 w-4" />
            <span className="sr-only">Próxima página</span>
          </Button>
        </div>
      )}
    </>
  )
}
