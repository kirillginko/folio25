/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        formats: ["image/avif", "image/webp"],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'res.cloudinary.com',
            pathname: '/dtps5ugbf/**',
          },
        ],
      },
    // Disable CSS optimization in development
    experimental: {
      optimizeCss: process.env.NODE_ENV === 'production',
      optimizePackageImports: ["@vercel/analytics"],
    },
    // Configure webpack for development
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
};

export default nextConfig;
