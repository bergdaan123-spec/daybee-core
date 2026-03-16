import type { Metadata } from 'next'
import '@/styles/globals.css'
import Providers from './providers'
import { APP_NAME, APP_DESCRIPTION } from '@/lib/config'

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
