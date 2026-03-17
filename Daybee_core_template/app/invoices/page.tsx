import { getAuthUserId } from '@/lib/session'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AppLayout from '@/components/layout/AppLayout'
import InvoicesClient from '@/components/invoices/InvoicesClient'
import type { ContractOption } from '@/components/invoices/InvoiceForm'

export default async function InvoicesPage() {
  const userId = await getAuthUserId()
  if (!userId) redirect('/login')

  // Fetch all reference data server-side so form dropdowns are populated on first open.
  const [contracts, tenants, identities] = await Promise.all([
    prisma.rentalContract.findMany({
      where: { userId },
      include: {
        tenant:   { select: { name: true } },
        property: { select: { name: true } },
        identity: { select: { name: true, type: true } },
      },
      orderBy: { startDate: 'desc' },
    }),
    prisma.tenant.findMany({
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

  // Shape contract options for the form dropdown with embedded prefill data
  const contractOptions: ContractOption[] = contracts.map(c => ({
    id:          c.id,
    label:       `${c.tenant.name} — ${c.property.name}${!c.active ? ' (inactief)' : ''}`,
    tenantId:    c.tenantId,
    identityId:  c.identityId,
    monthlyRent: String(c.monthlyRent),
  }))

  return (
    <AppLayout title="Facturen">
      <InvoicesClient
        contracts={contractOptions}
        tenants={tenants}
        identities={identities}
      />
    </AppLayout>
  )
}
