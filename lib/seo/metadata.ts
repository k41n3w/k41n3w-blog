import type { Metadata } from "next"

// Configurações base para o site
export const siteConfig = {
  name: "Ruby on Rails Tech Blog",
  description:
    "Insights técnicos e boas práticas de um Rails Tech Lead. Aprenda desenvolvimento web, Ruby on Rails, e arquitetura de software.",
  url: "/", // Alterado para URL relativa
  ogImage: "/images/og-image.jpg",
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
    // Removendo metadataBase que dependia de URL absoluta
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
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      ],
      shortcut: "/favicon-16x16.png",
      apple: "/apple-touch-icon.png",
    },
    manifest: "/site.webmanifest",
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
