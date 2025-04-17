/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações para o Supabase
  images: {
    domains: ['v0.blob.com', 'placeholder.com'],
    unoptimized: true,
  },
  // Configurações para o ambiente de produção
  productionBrowserSourceMaps: true, // Ajuda a depurar problemas em produção
  // Configurações para o Vercel
  experimental: {
    serverComponentsExternalPackages: ['@supabase/ssr'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
