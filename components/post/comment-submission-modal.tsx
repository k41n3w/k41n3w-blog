"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

interface CommentSubmissionModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CommentSubmissionModal({ isOpen, onClose }: CommentSubmissionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <DialogTitle className="text-center text-xl">Comentário Enviado</DialogTitle>
          <DialogDescription className="text-center text-gray-400">
            Seu comentário foi enviado com sucesso e está aguardando aprovação do administrador antes de ser publicado.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button onClick={onClose} className="bg-red-600 hover:bg-red-700">
            Entendi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
