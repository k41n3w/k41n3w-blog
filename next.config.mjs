/** @type {import('next').NextConfig} */
const nextConfig = {
// Configurações para o Supabase
images: {
  domains: ['v0.blob.com', 'placeholder.com', 'media.giphy.com', 'i.giphy.com'],
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
},
// Configurações para o ambiente de produção
productionBrowserSourceMaps: true, // Ajuda a depurar problemas em produção
// Configurações para o Vercel
experimental: {
  serverComponentsExternalPackages: ['@supabase/ssr'],
  optimizeCss: false, // Desabilitar otimização CSS que requer critters
  scrollRestoration: true, // Melhora a experiência de navegação
  // Remover qualquer configuração de CSS inlining
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
// Configurações de headers para melhorar o SEO e a segurança
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
      ],
    },
    {
      source: '/api/(.*)',
      headers: [
        { key: 'Access-Control-Allow-Credentials', value: 'true' },
        { key: 'Access-Control-Allow-Origin', value: '*' },
        { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
        { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
      ],
    },
  ];
},
}

export default nextConfig
