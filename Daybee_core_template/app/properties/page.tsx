import { getAuthUserId } from '@/lib/session'
import { redirect } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import PropertiesClient from '@/components/properties/PropertiesClient'

export default async function PropertiesPage() {
  const userId = await getAuthUserId()
  if (!userId) redirect('/login')

  return (
    <AppLayout title="Panden">
      <PropertiesClient />
    </AppLayout>
  )
}
