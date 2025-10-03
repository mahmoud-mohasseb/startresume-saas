/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    largePageDataBytes: 256 * 1000, // 256KB - Increased for large headers
    optimizeCss: true,
  },
  
  // Production optimizations
  poweredByHeader: false,
  generateEtags: false,
  trailingSlash: true,

  images: {
    unoptimized: true, // Required for static export
    domains: ['images.unsplash.com', 'avatars.githubusercontent.com', 'lh3.googleusercontent.com', 'localhost'],
    formats: ['image/webp', 'image/avif'],
  },

  compress: true,

  swcMinify: true,

  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

module.exports = nextConfig
