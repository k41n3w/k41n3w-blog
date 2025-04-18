"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Filter, SortAsc, SortDesc, ThumbsUp, Eye } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
// Import our custom useEffectEvent instead of React's
import { useEffectEvent } from "@/hooks/use-effect-event"

interface PostsFilterProps {
  tags: { id: string; name: string }[]
  selectedTag: string
  currentSort: string
}

export default function PostsFilter({ tags, selectedTag, currentSort }: PostsFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tag, setTag] = useState(selectedTag)
  const [sort, setSort] = useState(currentSort)
  const [isInitialized, setIsInitialized] = useState(false)

  // Use our custom useEffectEvent instead of directly importing from React
  const updateUrl = useEffectEvent(() => {
    const params = new URLSearchParams(searchParams.toString())

    if (tag) {
      params.set("tag", tag)
    } else {
      params.delete("tag")
    }

    if (sort && sort !== "newest") {
      params.set("sort", sort)
    } else {
      params.delete("sort")
    }

    // Resetar para a primeira página quando os filtros mudarem
    params.delete("page")

    const newUrl = `/archive?${params.toString()}`

    // Verificar se a URL realmente mudou para evitar navegações desnecessárias
    if (window.location.pathname + window.location.search !== newUrl) {
      router.push(newUrl)
    }
  })

  // Inicializar o estado com os valores dos props
  useEffect(() => {
    if (!isInitialized) {
      setTag(selectedTag)
      setSort(currentSort)
      setIsInitialized(true)
    }
  }, [selectedTag, currentSort, isInitialized])

  // Atualizar a URL quando os filtros mudarem, mas apenas após a inicialização
  useEffect(() => {
    if (isInitialized) {
      updateUrl()
    }
  }, [tag, sort, isInitialized, updateUrl])

  // Obter o nome da tag selecionada
  const selectedTagName = tags.find((t) => t.id === tag)?.name || "Todas as Tags"

  // Obter o nome da ordenação selecionada
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

  // Obter o ícone da ordenação selecionada
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

  return (
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
              className={`${!tag ? "bg-gray-700" : ""} hover:bg-gray-700 cursor-pointer`}
              onClick={() => setTag("")}
            >
              Todas as Tags
            </DropdownMenuItem>
            {tags.map((t) => (
              <DropdownMenuItem
                key={t.id}
                className={`${tag === t.id ? "bg-gray-700" : ""} hover:bg-gray-700 cursor-pointer`}
                onClick={() => setTag(t.id)}
              >
                {t.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto border-gray-700 bg-gray-800">
              {getSortIcon(sort)}
              {getSortName(sort)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white">
            <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-700" />
            <DropdownMenuItem
              className={`${sort === "newest" ? "bg-gray-700" : ""} hover:bg-gray-700 cursor-pointer`}
              onClick={() => setSort("newest")}
            >
              <SortDesc className="h-4 w-4 mr-2" />
              Mais recentes
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`${sort === "oldest" ? "bg-gray-700" : ""} hover:bg-gray-700 cursor-pointer`}
              onClick={() => setSort("oldest")}
            >
              <SortAsc className="h-4 w-4 mr-2" />
              Mais antigos
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`${sort === "popular" ? "bg-gray-700" : ""} hover:bg-gray-700 cursor-pointer`}
              onClick={() => setSort("popular")}
            >
              <Eye className="h-4 w-4 mr-2" />
              Mais visualizados
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`${sort === "most-liked" ? "bg-gray-700" : ""} hover:bg-gray-700 cursor-pointer`}
              onClick={() => setSort("most-liked")}
            >
              <ThumbsUp className="h-4 w-4 mr-2" />
              Mais curtidos
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
