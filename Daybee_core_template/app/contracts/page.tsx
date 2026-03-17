import { getAuthUserId } from '@/lib/session'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AppLayout from '@/components/layout/AppLayout'
import ContractsClient from '@/components/contracts/ContractsClient'

export default async function ContractsPage() {
  const userId = await getAuthUserId()
  if (!userId) redirect('/login')

  // Fetch reference data server-side so the form dropdowns are ready on first open.
  // These lists are small and stable — no need for client-side refetch.
  const [tenants, properties, identities] = await Promise.all([
    prisma.tenant.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
    prisma.property.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
    prisma.identity.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, type: true },
    }),
  ])

  return (
    <AppLayout title="Contracten">
      <ContractsClient
        tenants={tenants}
        properties={properties}
        identities={identities}
      />
    </AppLayout>
  )
}
