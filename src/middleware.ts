// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const host = request.headers.get('host')?.split(':')[0] ?? ''
  const subdomain = host.split('.')[0]
  
  console.log('Middleware processing:', {
    url: request.url,
    subdomain: subdomain,
    hostname: host,
    pathname: url.pathname
  });
  
  // skip root, www, localhost, admin etc.
  if (subdomain && subdomain !== 'www' && subdomain !== 'localhost' && !host.startsWith('admin.')) {
    // Rewrite to the sites route - the actual template handling will be done in the page component
    url.pathname = `/sites/${subdomain}${url.pathname}`
    return NextResponse.rewrite(url)
  }

  // Check if the request is for the admin path (not including the login page)
  if (request.nextUrl.pathname.startsWith('/admin') && 
      !request.nextUrl.pathname.includes('/login')) {
    
    // Get the token from cookies
    const token = request.cookies.get('auth-token')?.value;
    
    console.log('Auth check for admin route:', { 
      path: request.nextUrl.pathname,
      hasToken: !!token 
    });
    
    // If no token exists, redirect to login
    if (!token) {
      console.log('No auth token found, redirecting to login');
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    // In Edge Runtime, we can't verify the JWT token with crypto
    // So we just check if the token exists and let the API routes handle verification
    return NextResponse.next();
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)',
    '/admin/:path*',
  ],
}
