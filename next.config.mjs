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
  // Configurações de otimização para produção
  swcMinify: true,
  // Configuração para compressão
  compress: true,
  // Configuração para cache
  staticPageGenerationTimeout: 120, // Aumentar o timeout para geração de páginas estáticas
  // Configuração para output
  output: 'standalone', // Otimiza para implantação no Vercel
}

export default nextConfig
