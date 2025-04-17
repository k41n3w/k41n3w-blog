"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Edit, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { deletePost } from "@/lib/supabase/actions"
import { useToast } from "@/hooks/use-toast"

interface PostsListProps {
  posts: any[]
}

export default function PostsList({ posts }: PostsListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [postToDelete, setPostToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleDeleteClick = (postId: string) => {
    setPostToDelete(postId)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!postToDelete) return

    try {
      setIsDeleting(true)
      console.log("Iniciando exclusão do post:", postToDelete)

      const result = await deletePost(postToDelete)

      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: "Post excluído",
        description: "O post foi excluído com sucesso.",
      })

      // Forçar recarregamento da página para atualizar a lista
      router.refresh()

      // Pequeno atraso para garantir que a UI seja atualizada
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (error: any) {
      console.error("Erro ao excluir post:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o post. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setPostToDelete(null)
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Published":
        return <Badge className="bg-green-600">Publicado</Badge>
      case "Draft":
        return <Badge className="bg-yellow-600">Rascunho</Badge>
      default:
        return <Badge className="bg-gray-600">{status}</Badge>
    }
  }

  return (
    <div>
      {posts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">Nenhum post encontrado.</p>
          <Link href="/admin/posts/new" className="mt-4 inline-block">
            <Button className="bg-red-600 hover:bg-red-700">Criar Novo Post</Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-md border border-gray-800 overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-900">
              <TableRow className="border-gray-800">
                <TableHead className="text-gray-300">Título</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Data</TableHead>
                <TableHead className="text-gray-300 text-right">Visualizações</TableHead>
                <TableHead className="text-gray-300 text-right">Likes</TableHead>
                <TableHead className="text-gray-300 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id} className="border-gray-800 bg-gray-900/50">
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell>{getStatusBadge(post.status)}</TableCell>
                  <TableCell>{formatDate(post.created_at)}</TableCell>
                  <TableCell className="text-right">{post.views || 0}</TableCell>
                  <TableCell className="text-right">{post.likes || 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Link href={`/posts/${post.id}`}>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Ver</span>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/posts/edit/${post.id}`}>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Editar</span>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:text-red-500"
                        onClick={() => handleDeleteClick(post.id)}
                      >
                        <span className="sr-only">Excluir</span>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-900 border-gray-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Esta ação não pode ser desfeita. O post será permanentemente excluído.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 text-white hover:bg-gray-700" disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={(e) => {
                e.preventDefault()
                handleConfirmDelete()
              }}
              disabled={isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
