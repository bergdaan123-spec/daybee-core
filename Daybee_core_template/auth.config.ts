import type { NextAuthConfig } from 'next-auth'

// Edge-compatible auth config (no Node.js APIs like bcrypt or Prisma)
export const authConfig: NextAuthConfig = {
  trustHost: true,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const path = nextUrl.pathname

      // Always allow auth routes and registration
      if (path.startsWith('/api/auth')) return true
      if (path === '/api/register') return true

      // Public pages: redirect to dashboard if already logged in
      if (path === '/login' || path === '/register') {
        if (isLoggedIn) return Response.redirect(new URL('/dashboard', nextUrl))
        return true
      }

      // Unauthenticated API request → 401
      if (!isLoggedIn && path.startsWith('/api/')) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      // Page routes: redirect to /login if not logged in
      return isLoggedIn
    },
  },
  providers: [],
}
