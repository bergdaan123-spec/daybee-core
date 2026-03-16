import { redirect } from 'next/navigation'

// Root route redirects to the dashboard
export default function Home() {
  redirect('/dashboard')
}
