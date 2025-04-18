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
  
  // Add webpack configuration to handle the problematic module
  webpack: (config, { isServer }) => {
    // Provide a polyfill for React.useEffectEvent
    config.plugins.push(
      new config.webpack.ProvidePlugin({
        React: ['react', ''],
      })
    );
    
    // Add a resolver for the problematic module
    config.resolve.alias = {
      ...config.resolve.alias,
      '@radix-ui/react-use-effect-event': require.resolve('./lib/radix-ui-polyfill.js'),
    };
    
    return config;
  },
}

export default nextConfig
