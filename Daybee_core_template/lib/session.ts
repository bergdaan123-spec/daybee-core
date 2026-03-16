import { auth } from '@/auth'

/**
 * Returns the authenticated user's ID from the current session,
 * or null if not authenticated. Use in Server Components and API routes.
 */
export async function getAuthUserId(): Promise<string | null> {
  const session = await auth()
  return session?.user?.id ?? null
}
