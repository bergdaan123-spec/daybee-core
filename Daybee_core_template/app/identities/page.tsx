import { getAuthUserId } from '@/lib/session'
import { redirect } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import IdentitiesClient from '@/components/identities/IdentitiesClient'

export default async function IdentitiesPage() {
  const userId = await getAuthUserId()
  if (!userId) redirect('/login')

  return (
    <AppLayout title="Identiteiten">
      <IdentitiesClient />
    </AppLayout>
  )
}
