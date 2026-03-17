import { NextRequest, NextResponse } from 'next/server'
import { prisma }                    from '@/lib/prisma'
import { getAuthUserId }             from '@/lib/session'
import { buildInvoiceViewModel }     from '@/lib/invoice/buildViewModel'
import { getBrandColor }             from '@/lib/invoice/getBrandColor'
import { generateInvoicePdf }        from '@/lib/invoicePdf'
import { pdfResponseHeaders }        from '@/lib/pdf'

export const dynamic = 'force-dynamic'

type Params = { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  const userId = await getAuthUserId()
  if (!userId) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 })

  // Fetch invoice + user logo in parallel
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

  if (!invoice) return NextResponse.json({ error: 'Factuur niet gevonden' }, { status: 404 })

  try {
    const logoUrl    = user?.logoUrl ?? null
    const brandColor = await getBrandColor(logoUrl)
    const vm         = buildInvoiceViewModel(invoice, logoUrl, brandColor)
    const buffer   = await generateInvoicePdf(vm)
    const filename = `factuur-${invoice.invoiceNumber}.pdf`
    const headers  = pdfResponseHeaders(filename, buffer.byteLength)
    return new NextResponse(buffer, { status: 200, headers })
  } catch (error) {
    console.error('[GET /api/invoices/[id]/pdf]', error)
    return NextResponse.json({ error: 'PDF genereren mislukt' }, { status: 500 })
  }
}
