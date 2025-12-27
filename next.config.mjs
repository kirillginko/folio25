/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        formats: ["image/avif", "image/webp"],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: process.env.NODE_ENV === 'production' ? 86400 : 0, // 1 day in production, 0 in dev
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'res.cloudinary.com',
            pathname: '/dtps5ugbf/**',
          },
          {
            protocol: 'https',
            hostname: 'res.cloudinary.com',
            pathname: '/ds8rxobq9/**',
          },
          {
            protocol: 'https',
            hostname: 'res.cloudinary.com',
            pathname: '/ddkuxrisq/**',
          },
          {
            protocol: 'https',
            hostname: 'firebasestorage.googleapis.com',
          },
        ],
      },
    // Add redirects for SEO consistency
    async redirects() {
      return [
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: 'kirill.agency',
            },
          ],
          destination: 'https://www.kirill.agency/:path*',
          permanent: true,
        },
      ];
    },
    // Performance optimizations
    experimental: {
      optimizeCss: process.env.NODE_ENV === 'production',
      optimizePackageImports: ["@vercel/analytics", "gsap", "next-themes"],
    },
    compiler: {
      removeConsole: process.env.NODE_ENV === "production" ? {
        exclude: ["error", "warn"],
      } : false,
    },
    // Configure webpack for development
    async headers() {
      const isDev = process.env.NODE_ENV === 'development';

      return [
        {
          source: '/:path*',
          headers: isDev ? [
            {
              key: 'Cache-Control',
              value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
            },
          ] : [],
        },
        {
          source: '/_next/image(.*)',
          headers: [
            {
              key: 'Cache-Control',
              value: isDev ? 'no-store, must-revalidate' : 'public, max-age=604800, immutable', // 7 days
            },
          ],
        },
        {
          source: '/_next/static/(.*)',
          headers: [
            {
              key: 'Cache-Control',
              value: isDev ? 'no-store, must-revalidate' : 'public, max-age=86400, immutable', // 1 day
            },
          ],
        },
        {
          source: '/fonts/(.*)',
          headers: [
            {
              key: 'Cache-Control',
              value: isDev ? 'no-store, must-revalidate' : 'public, max-age=2592000, immutable', // 30 days (fonts rarely change)
            },
          ],
        },
        {
          source: '/api/(.*)',
          headers: [
            {
              key: 'Cache-Control',
              value: isDev ? 'no-store, must-revalidate' : 'public, max-age=3600',
            },
          ],
        },
      ];
    },
    webpack: (config, { dev }) => {
      if (dev) {
        config.watchOptions = {
          ...config.watchOptions,
          poll: 1000,
          aggregateTimeout: 300,
        };
      }
      return config;
    },
    // Turbopack configuration (Next.js 16+)
    turbopack: {
      resolveAlias: {
        '@': './src',
      },
    },
};

export default nextConfig;
