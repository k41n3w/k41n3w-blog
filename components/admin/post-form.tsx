"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import dynamic from "next/dynamic"
import { ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { createPost, updatePost } from "@/lib/supabase/actions"

// Importar o editor de forma dinâmica para evitar problemas de SSR
const RichTextEditor = dynamic(() => import("./rich-text-editor"), {
  ssr: false,
  loading: () => <div className="h-[500px] bg-gray-800 rounded-md animate-pulse"></div>,
})

interface PostFormProps {
  post?: {
    id: string
    title: string
    content: string
    excerpt: string
    status: string
    tags: string
  }
}

export default function PostForm({ post }: PostFormProps) {
  const [title, setTitle] = useState(post?.title || "")
  const [content, setContent] = useState(post?.content || "")
  const [excerpt, setExcerpt] = useState(post?.excerpt || "")
  const [status, setStatus] = useState(post?.status || "Draft")
  const [tags, setTags] = useState(post?.tags || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      console.log("Iniciando submissão do formulário")

      // Validação básica
      if (!title.trim()) {
        throw new Error("O título é obrigatório")
      }

      if (!content.trim()) {
        throw new Error("O conteúdo é obrigatório")
      }

      const formData = new FormData()
      formData.append("title", title)
      formData.append("content", content)
      formData.append("excerpt", excerpt)
      formData.append("status", status)
      formData.append("tags", tags)

      console.log("Enviando dados para o servidor")
      let result
      if (post?.id) {
        result = await updatePost(post.id, formData)
      } else {
        result = await createPost(formData)
      }

      console.log("Resultado da operação:", result)

      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: post?.id ? "Post atualizado" : "Post criado",
        description: post?.id ? "O post foi atualizado com sucesso." : "O post foi criado com sucesso.",
      })

      // Redirecionar para o dashboard
      console.log("Redirecionando para o dashboard")
      window.location.href = "/admin/dashboard"
    } catch (error: any) {
      console.error("Erro ao salvar post:", error)
      setError(error.message || "Ocorreu um erro ao salvar o post.")
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao salvar o post.",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 py-4 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/admin/dashboard" className="text-red-500 hover:text-red-400 mr-4">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-red-500">{post?.id ? "Editar Post" : "Novo Post"}</h1>
          </div>
          <Button
            type="submit"
            form="post-form"
            className="bg-red-600 hover:bg-red-700 flex items-center"
            disabled={isSubmitting}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-white px-4 py-3 rounded mb-6">
            <p className="font-medium">Erro ao salvar o post:</p>
            <p>{error}</p>
          </div>
        )}

        <form id="post-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="bg-gray-800 border-gray-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Conteúdo</Label>
            <div className="sticky top-[73px] z-10 bg-black pt-2 pb-1">
              <div className="text-xs text-gray-400 mb-1">
                Dica: Você pode colar conteúdo do Medium diretamente no editor abaixo.
              </div>
            </div>
            <RichTextEditor value={content} onChange={setContent} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Resumo</Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="bg-gray-800 border-gray-700 min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="Draft">Rascunho</SelectItem>
                  <SelectItem value="Published">Publicado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="ruby, rails, web"
                className="bg-gray-800 border-gray-700"
              />
            </div>
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="py-4 bg-gray-900 border-t border-gray-800 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} k41n3w. Todos os direitos reservados.</p>
      </footer>
    </div>
  )
}
