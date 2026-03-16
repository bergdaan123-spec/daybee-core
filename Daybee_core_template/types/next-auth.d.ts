import { DefaultSession } from 'next-auth'

// Augment the NextAuth Session type to include the user's database ID.
declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & { id: string }
  }
}
