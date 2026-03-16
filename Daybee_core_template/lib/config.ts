/**
 * Central app configuration.
 *
 * Set NEXT_PUBLIC_APP_NAME in your .env file to change the app name
 * everywhere it appears (sidebar, auth pages, browser tab title).
 */
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'MyApp'

/**
 * App description shown in browser metadata.
 * Override with NEXT_PUBLIC_APP_DESCRIPTION if needed.
 */
export const APP_DESCRIPTION =
  process.env.NEXT_PUBLIC_APP_DESCRIPTION ?? 'A SaaS application'
