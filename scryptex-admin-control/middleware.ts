
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// IP whitelist configuration
const ALLOWED_IPS = process.env.ADMIN_IP_WHITELIST?.split(',') || []
const SKIP_IP_WHITELIST = process.env.SKIP_IP_WHITELIST === 'true'

// Rate limiting
const rateLimitMap = new Map()
const RATE_LIMIT_MAX = parseInt(process.env.SECURITY_RATE_LIMIT_MAX || '100')
const RATE_LIMIT_WINDOW = parseInt(process.env.SECURITY_RATE_LIMIT_WINDOW || '900000') // 15 minutes

function getClientIP(request: NextRequest): string {
  const xff = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (xff) {
    return xff.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP.trim()
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP.trim()
  }
  
  return request.ip || 'unknown'
}

function isIPAllowed(ip: string): boolean {
  if (SKIP_IP_WHITELIST) return true
  
  // Check if IP is in whitelist
  for (const allowedIP of ALLOWED_IPS) {
    if (allowedIP.includes('/')) {
      // CIDR notation check (simplified)
      const [network, mask] = allowedIP.split('/')
      // This is a simplified check - in production, use a proper CIDR library
      if (ip.startsWith(network.split('.').slice(0, parseInt(mask) / 8).join('.'))) {
        return true
      }
    } else if (ip === allowedIP.trim()) {
      return true
    }
  }
  
  return false
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, [])
  }
  
  const requests = rateLimitMap.get(ip)
  
  // Remove old requests outside the window
  const recentRequests = requests.filter((timestamp: number) => timestamp > windowStart)
  
  if (recentRequests.length >= RATE_LIMIT_MAX) {
    return false
  }
  
  recentRequests.push(now)
  rateLimitMap.set(ip, recentRequests)
  
  return true
}

export function middleware(request: NextRequest) {
  const clientIP = getClientIP(request)
  const pathname = request.nextUrl.pathname
  
  // Security headers
  const response = NextResponse.next()
  
  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()')
  
  // Skip middleware for public assets and API health checks
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/robots.txt') ||
    pathname === '/api/health'
  ) {
    return response
  }
  
  // IP whitelist check
  if (!isIPAllowed(clientIP)) {
    console.log(`Access denied for IP: ${clientIP}`)
    return new NextResponse('Access Denied', { 
      status: 403,
      headers: {
        'Content-Type': 'text/plain',
      }
    })
  }
  
  // Rate limiting check
  if (!checkRateLimit(clientIP)) {
    console.log(`Rate limit exceeded for IP: ${clientIP}`)
    return new NextResponse('Rate Limit Exceeded', { 
      status: 429,
      headers: {
        'Content-Type': 'text/plain',
        'Retry-After': '900'
      }
    })
  }
  
  // Add client IP to headers for logging
  response.headers.set('X-Client-IP', clientIP)
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
