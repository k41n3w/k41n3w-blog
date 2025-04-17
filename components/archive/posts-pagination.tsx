"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PostsPaginationProps {
  currentPage: number
  totalPages: number
  tag: string
  sort: string
}

export default function PostsPagination({ currentPage, totalPages, tag, sort }: PostsPaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Se não houver páginas ou apenas uma página, não mostrar paginação
  if (totalPages <= 1) {
    return null
  }

  // Função para navegar para uma página específica
  const goToPage = (page: number) => {
    try {
      const params = new URLSearchParams(searchParams.toString())

      if (page === 1) {
        params.delete("page")
      } else {
        params.set("page", page.toString())
      }

      router.push(`/archive?${params.toString()}`)
    } catch (e) {
      console.error("Error navigating to page:", e)
    }
  }

  // Criar array de páginas para mostrar
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

  const pageNumbers = getPageNumbers()

  return (
    <div className="flex justify-center items-center space-x-2">
      <Button
        variant="outline"
        className="border-gray-700 bg-gray-800 hover:bg-gray-700"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Página anterior</span>
      </Button>

      {pageNumbers.map((page, index) => {
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
            onClick={() => goToPage(page as number)}
          >
            {page}
          </Button>
        )
      })}

      <Button
        variant="outline"
        className="border-gray-700 bg-gray-800 hover:bg-gray-700"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Próxima página</span>
      </Button>
    </div>
  )
}
