import { getAuthUserId } from '@/lib/session'
import { redirect } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import TenantsClient from '@/components/tenants/TenantsClient'

export default async function TenantsPage() {
  const userId = await getAuthUserId()
  if (!userId) redirect('/login')

  return (
    <AppLayout title="Huurders">
      <TenantsClient />
    </AppLayout>
  )
}
