import type { Metadata } from "next"

// URL base do site (necessário para OG tags absolutas)
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
  : process.env.VERCEL_URL
    ? new URL(`https://${process.env.VERCEL_URL}`)
    : new URL("http://localhost:3000")

// Configurações base para o site
export const siteConfig = {
  name: "k41n3w | Ruby on Rails Tech Blog",
  description:
    "Insights técnicos e boas práticas de um Rails Tech Lead. Aprenda desenvolvimento web, Ruby on Rails, e arquitetura de software.",
  url: baseUrl.toString(),
  ogImage: "/opengraph-image",
  author: "Caio Ramos",
  twitterHandle: "@k41n3w",
  keywords: [
    "Ruby on Rails",
    "desenvolvimento web",
    "programação",
    "Ruby",
    "backend",
    "tech lead",
    "engenharia de software",
    "desenvolvimento fullstack",
    "API",
    "microserviços",
  ],
}

// Função para gerar metadados base para todas as páginas
export function generateBaseMetadata(): Metadata {
  return {
    metadataBase: baseUrl,
    title: {
      default: siteConfig.name,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    keywords: siteConfig.keywords,
    authors: [{ name: siteConfig.author }],
    creator: siteConfig.author,
    publisher: siteConfig.author,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-video-preview": -1,
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: "/", // URL relativa
    },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      url: siteConfig.url,
      title: siteConfig.name,
      description: siteConfig.description,
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.name,
      description: siteConfig.description,
      images: [siteConfig.ogImage],
      creator: siteConfig.twitterHandle,
    },
    icons: {
      icon: "/icon",
    },
  }
}

// Função para gerar metadados para páginas de post
export function generatePostMetadata(post: {
  title: string
  excerpt: string | null
  content: string
  created_at: string
  id: string
  tags?: string[]
}): Metadata {
  const title = post.title
  const description = post.excerpt || post.content.substring(0, 160).replace(/<[^>]*>/g, "")
  const url = `/posts/${post.id}` // URL relativa
  const publishedTime = new Date(post.created_at).toISOString()
  const tags = post.tags || []

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "article",
      url,
      title,
      description,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      publishedTime,
      authors: [siteConfig.author],
      tags,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [siteConfig.ogImage],
      creator: siteConfig.twitterHandle,
    },
  }
}
