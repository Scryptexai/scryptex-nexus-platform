
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true,
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' wss: ws:; font-src 'self'"
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()'
          }
        ]
      }
    ]
  },
  
  // Disable server info
  poweredByHeader: false,
  
  // Environment configuration
  env: {
    ADMIN_APP_VERSION: '1.0.0',
    ADMIN_BUILD_TIME: new Date().toISOString(),
  },
  
  // Image optimization
  images: {
    domains: [],
    unoptimized: true
  },
  
  // Output configuration for security
  output: 'standalone',
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false
  },
  
  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false
  }
}

module.exports = nextConfig
