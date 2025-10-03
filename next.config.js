/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    largePageDataBytes: 256 * 1000, // 256KB - Increased for large headers
  },
  
  // Production optimizations
  poweredByHeader: false,
  generateEtags: false,

  images: {
    domains: ['images.unsplash.com', 'avatars.githubusercontent.com', 'lh3.googleusercontent.com', 'localhost'],
    formats: ['image/webp', 'image/avif'],
  },

  compress: true,
  swcMinify: true,

  // Replit configuration
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ]
  },

  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

module.exports = nextConfig
