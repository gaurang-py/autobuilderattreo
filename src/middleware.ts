import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const host = request.headers.get('host')?.split(':')[0] ?? ''
  
  const isLocalhost = host.includes('localhost')
  const isVercelDomain = host.endsWith('.vercel.app')
  const isRootDomain = host === 'servicecenterkolkata24x7.com' || host === 'www.servicecenterkolkata24x7.com' || host === 'authoriseservice.center' || host === 'www.authoriseservice.center'

  // Detect actual subdomains only (e.g., client1.servicecenterkolkata24x7.com)
  const parts = host.split('.')
  const hasSubdomain = parts.length > 2 && !isVercelDomain && !isLocalhost
  const subdomain = hasSubdomain ? parts[0] : null

  console.log('Middleware:', {
    host,
    subdomain,
    hasSubdomain,
    isRootDomain,
    pathname: url.pathname
  })

  if (hasSubdomain && subdomain && !host.startsWith('admin.')) {
    url.pathname = `/sites/${subdomain}${url.pathname}`
    return NextResponse.rewrite(url)
  }

  // Admin auth
  if (url.pathname.startsWith('/admin') && !url.pathname.includes('/login')) {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)',
    '/admin/:path*',
  ],
}
