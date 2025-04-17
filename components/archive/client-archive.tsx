"use client"

import { useState } from "react"

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

  //

\
Agora vamos atualizar o componente `CommentSection` para remover o avatar dos comentários:
