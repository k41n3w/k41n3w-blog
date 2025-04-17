import Link from "next/link"
import { ArrowRight, Calendar, Heart, MessageSquare, Tag } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"
import { TABLES } from "@/lib/supabase/config"

interface PostsListProps {
  page: number
  postsPerPage: number
  tag: string
  sort: string
}

export default async function PostsList({ page, postsPerPage, tag, sort }: PostsListProps) {
  const supabase = createClient()

  // Calcular o offset para paginação
  const offset = (page - 1) * postsPerPage

  try {
    // Iniciar a query
    let query = supabase
      .from(TABLES.POSTS)
      .select(
        `
       id, 
       title, 
       excerpt, 
       content,
       created_at,
       published_at,
       views,
       likes,
       author_id
     `,
      )
      .eq("status", "Published")

    // Aplicar filtro por tag se necessário
    if (tag) {
      const { data: postIds, error: tagError } = await supabase
        .from(TABLES.POST_TAGS)
        .select("post_id")
        .eq("tag_id", tag)

      if (tagError) {
        console.error("Error fetching post tags:", tagError)
        return (
          <div className="text-center py-8">
            <p className="text-red-500">Erro ao carregar tags. Por favor, tente novamente mais tarde.</p>
          </div>
        )
      }

      if (postIds && postIds.length > 0) {
        const ids = postIds.map((item) => item.post_id)
        query = query.in("id", ids)
      } else {
        // Se não houver posts com a tag selecionada, retornar array vazio
        return (
          <div className="text-center py-8">
            <p className="text-gray-400">Nenhum post encontrado com a tag selecionada.</p>
          </div>
        )
      }
    }

    // Aplicar ordenação
    if (sort === "oldest") {
      query = query.order("created_at", { ascending: true })
    } else if (sort === "popular") {
      query = query.order("views", { ascending: false })
    } else if (sort === "most-liked") {
      query = query.order("likes", { ascending: false })
    } else {
      // Default: newest first
      query = query.order("created_at", { ascending: false })
    }

    // Aplicar paginação
    query = query.range(offset, offset + postsPerPage - 1)

    // Executar a query
    const { data: posts = [], error } = await query

    if (error) {
      console.error("Error fetching posts:", error)
      return (
        <div className="text-center py-8">
          <p className="text-red-500">Erro ao carregar posts. Por favor, tente novamente mais tarde.</p>
          <p className="text-sm text-gray-500 mt-2">{error.message}</p>
        </div>
      )
    }

    if (posts.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-400">Nenhum post encontrado.</p>
        </div>
      )
    }

    // Buscar as tags para cada post
    const postIds = posts.map((post) => post.id)

    // Inicializar mapas vazios para evitar erros de nulo
    const postTagsMap: Record<string, { id: string; name: string }[]> = {}
    const commentCountMap: Record<string, number> = {}

    // Preencher os mapas com valores padrão para cada post
    postIds.forEach((id) => {
      postTagsMap[id] = []
      commentCountMap[id] = 0
    })

    // Buscar tags apenas se houver posts
    if (postIds.length > 0) {
      try {
        const { data: postTags = [], error: postTagsError } = await supabase
          .from(TABLES.POST_TAGS)
          .select("post_id, tag_id")
          .in("post_id", postIds)

        if (postTagsError) {
          console.error("Error fetching post tags:", postTagsError)
        } else if (postTags.length > 0) {
          const tagIds = [...new Set(postTags.map((pt) => pt.tag_id))]

          if (tagIds.length > 0) {
            const { data: tagsData = [], error: tagsError } = await supabase
              .from(TABLES.TAGS)
              .select("id, name")
              .in("id", tagIds)

            if (tagsError) {
              console.error("Error fetching tags:", tagsError)
            } else {
              // Criar um mapa de tags por post
              postTags.forEach((pt) => {
                const tag = tagsData.find((t) => t.id === pt.tag_id)
                if (tag) {
                  if (!postTagsMap[pt.post_id]) {
                    postTagsMap[pt.post_id] = []
                  }
                  postTagsMap[pt.post_id].push(tag)
                }
              })
            }
          }
        }
      } catch (e) {
        console.error("Exception fetching tags:", e)
      }

      // Buscar comentários para cada post e contar manualmente
      // Não usamos mais o método .group() que estava causando o erro
      try {
        const { data: comments = [], error: commentsError } = await supabase
          .from(TABLES.COMMENTS)
          .select("post_id")
          .in("post_id", postIds)
          .eq("status", "Approved")

        if (commentsError) {
          console.error("Error fetching comments:", commentsError)
        } else {
          // Contar comentários manualmente para cada post
          comments.forEach((comment) => {
            const postId = comment.post_id
            if (postId) {
              commentCountMap[postId] = (commentCountMap[postId] || 0) + 1
            }
          })
        }
      } catch (e) {
        console.error("Exception fetching comments:", e)
      }
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => {
          // Obter as tags do post (com fallback para array vazio)
          const tags = postTagsMap[post.id] || []

          // Obter a contagem de comentários (com fallback para 0)
          const commentCount = commentCountMap[post.id] || 0

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
                  <span>por Caio Ramos</span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-gray-300 mb-4">{excerpt}</p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Link key={tag.id} href={`/archive?tag=${tag.id}`}>
                      <Badge variant="outline" className="border-red-500 text-red-400 hover:bg-red-900/20">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag.name}
                      </Badge>
                    </Link>
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
                    <span className="text-sm">{commentCount}</span>
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
    )
  } catch (e: any) {
    console.error("Exception in PostsList:", e)
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.</p>
        <p className="text-sm text-gray-500 mt-2">{e.message}</p>
      </div>
    )
  }
}
