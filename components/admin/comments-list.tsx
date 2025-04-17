"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { approveComment, deleteComment } from "@/lib/supabase/actions"
import { useToast } from "@/hooks/use-toast"

interface CommentsListProps {
  comments: any[]
}

export default function CommentsList({ comments }: CommentsListProps) {
  const [processingComments, setProcessingComments] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  const handleApprove = async (commentId: string) => {
    setProcessingComments((prev) => ({ ...prev, [commentId]: true }))

    try {
      const result = await approveComment(commentId)

      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: "Comentário aprovado",
        description: "O comentário foi aprovado com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível aprovar o comentário. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setProcessingComments((prev) => ({ ...prev, [commentId]: false }))
    }
  }

  const handleDelete = async (commentId: string) => {
    setProcessingComments((prev) => ({ ...prev, [commentId]: true }))

    try {
      const result = await deleteComment(commentId)

      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: "Comentário excluído",
        description: "O comentário foi excluído com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o comentário. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setProcessingComments((prev) => ({ ...prev, [commentId]: false }))
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  return (
    <div>
      {comments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">Não há comentários pendentes de aprovação.</p>
        </div>
      ) : (
        <div className="rounded-md border border-gray-800 overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-900">
              <TableRow className="border-gray-800">
                <TableHead className="text-gray-300">Autor</TableHead>
                <TableHead className="text-gray-300">Comentário</TableHead>
                <TableHead className="text-gray-300">Data</TableHead>
                <TableHead className="text-gray-300">Post</TableHead>
                <TableHead className="text-gray-300 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comments.map((comment) => (
                <TableRow key={comment.id} className="border-gray-800 bg-gray-900/50">
                  <TableCell className="font-medium">{comment.author}</TableCell>
                  <TableCell className="max-w-xs truncate">{comment.content}</TableCell>
                  <TableCell>{formatDate(comment.created_at)}</TableCell>
                  <TableCell>
                    <Link href={`/posts/${comment.post_id}`} className="text-red-500 hover:text-red-400">
                      Ver post
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:text-green-500"
                        onClick={() => handleApprove(comment.id)}
                        disabled={processingComments[comment.id]}
                      >
                        <span className="sr-only">Aprovar</span>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:text-red-500"
                        onClick={() => handleDelete(comment.id)}
                        disabled={processingComments[comment.id]}
                      >
                        <span className="sr-only">Excluir</span>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
