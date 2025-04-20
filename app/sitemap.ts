import type { MetadataRoute } from "next"
import { createClient } from "@/lib/supabase/server"
import { TABLES } from "@/lib/supabase/config"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient()

  // Buscar todos os posts publicados
  const { data: posts = [] } = await supabase
    .from(TABLES.POSTS)
    .select("id, created_at, updated_at")
    .eq("status", "Published")

  // Buscar todas as tags
  const { data: tags = [] } = await supabase.from(TABLES.TAGS).select("id")

  // URLs estáticas com URLs relativas
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: "/",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "/about",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "/archive",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ]

  // URLs de posts com URLs relativas
  const postUrls: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `/posts/${post.id}`,
    lastModified: new Date(post.updated_at || post.created_at),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }))

  // URLs de tags com URLs relativas
  const tagUrls: MetadataRoute.Sitemap = tags.map((tag) => ({
    url: `/archive?tag=${tag.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }))

  return [...staticUrls, ...postUrls, ...tagUrls]
}
