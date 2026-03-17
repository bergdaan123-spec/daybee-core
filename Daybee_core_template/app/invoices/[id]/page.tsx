import { getAuthUserId }          from '@/lib/session'
import { redirect, notFound }     from 'next/navigation'
import { prisma }                 from '@/lib/prisma'
import AppLayout                  from '@/components/layout/AppLayout'
import InvoiceDetail              from '@/components/invoices/InvoiceDetail'
import { buildInvoiceViewModel }  from '@/lib/invoice/buildViewModel'
import { getBrandColor }          from '@/lib/invoice/getBrandColor'

type Props = { params: { id: string } }

export default async function InvoiceDetailPage({ params }: Props) {
  const userId = await getAuthUserId()
  if (!userId) redirect('/login')

  const [invoice, user] = await Promise.all([
    prisma.invoice.findFirst({
      where: { id: params.id, userId },
      include: {
        tenant:   true,
        identity: true,
        rentalContract: { include: { property: true } },
        charges:  true,
      },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { logoUrl: true } }),
  ])

  if (!invoice) notFound()

  const logoUrl    = user?.logoUrl ?? null
  const brandColor = await getBrandColor(logoUrl)
  const vm         = buildInvoiceViewModel(invoice, logoUrl, brandColor)

  return (
    <AppLayout title={`Factuur ${invoice.invoiceNumber}`}>
      <InvoiceDetail invoice={vm} />
    </AppLayout>
  )
}
