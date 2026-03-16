import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { authConfig } from './auth.config'

// ─── OAuth providers (optional) ───────────────────────────────────────────────
// To enable Google or GitHub login:
//
// 1. Uncomment the import(s) below — both are included in next-auth, no extra package needed.
// 2. Add the required credentials to your .env file (see .env.example).
// 3. Add the provider to the `providers` array below.
// 4. Create an OAuth app in the provider's developer console and set the callback URL to:
//      https://your-domain.com/api/auth/callback/google
//      https://your-domain.com/api/auth/callback/github
//
// import Google from 'next-auth/providers/google'
// import GitHub from 'next-auth/providers/github'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    // ── Credentials (email + password) — always enabled ──────────────────────
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: (credentials.email as string).toLowerCase() },
        })
        if (!user) return null

        const valid = await compare(credentials.password as string, user.password)
        if (!valid) return null

        return { id: user.id, name: user.name, email: user.email }
      },
    }),

    // ── Google OAuth (uncomment to enable) ───────────────────────────────────
    // Google({
    //   clientId:     process.env.GOOGLE_CLIENT_ID,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // }),

    // ── GitHub OAuth (uncomment to enable) ───────────────────────────────────
    // GitHub({
    //   clientId:     process.env.GITHUB_CLIENT_ID,
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET,
    // }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.id = user.id
      return token
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },
})
