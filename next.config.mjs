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
  // Adicionar headers para contornar problemas de CORS
  async headers() {
    return [
      {
        // Aplicar a todas as rotas
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*', // Permitir qualquer origem
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, Content-Type, Authorization',
          },
        ],
      },
    ]
  },
}

export default nextConfig
