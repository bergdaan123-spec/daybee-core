import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserId } from '@/lib/session'
import { InvoiceStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

type Params = { params: { id: string } }

const VALID_STATUSES: string[] = ['DRAFT', 'SENT', 'PAID', 'OVERDUE']

const invoiceInclude = {
  tenant:         { select: { name: true } },
  identity:       { select: { name: true, type: true } },
  rentalContract: { select: { property: { select: { name: true } } } },
  charges:        true,
} as const

async function getOwnedInvoice(userId: string, id: string) {
  return prisma.invoice.findFirst({ where: { id, userId } })
}

export async function PUT(req: NextRequest, { params }: Params) {
  const userId = await getAuthUserId()
  if (!userId) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 })

  const existing = await getOwnedInvoice(userId, params.id)
  if (!existing) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 })

  try {
    const body = await req.json()
    const {
      invoiceNumber, rentalContractId, tenantId, identityId,
      issueDate, dueDate, amount, vatRate, charges, status, description,
    } = body

    if (!invoiceNumber?.trim())    return NextResponse.json({ error: 'Factuurnummer is verplicht' },  { status: 400 })
    if (!rentalContractId)         return NextResponse.json({ error: 'Contract is verplicht' },        { status: 400 })
    if (!tenantId)                 return NextResponse.json({ error: 'Huurder is verplicht' },         { status: 400 })
    if (!identityId)               return NextResponse.json({ error: 'Identiteit is verplicht' },      { status: 400 })
    if (!issueDate)                return NextResponse.json({ error: 'Factuurdatum is verplicht' },    { status: 400 })
    if (!dueDate)                  return NextResponse.json({ error: 'Vervaldatum is verplicht' },     { status: 400 })
    if (!VALID_STATUSES.includes(status))
      return NextResponse.json({ error: 'Ongeldige status' }, { status: 400 })

    const amt = parseFloat(amount)
    if (isNaN(amt) || amt <= 0)
      return NextResponse.json({ error: 'Bedrag moet een positieve waarde zijn' }, { status: 400 })

    const issue = new Date(issueDate)
    const due   = new Date(dueDate)
    if (isNaN(issue.getTime())) return NextResponse.json({ error: 'Ongeldige factuurdatum' }, { status: 400 })
    if (isNaN(due.getTime()))   return NextResponse.json({ error: 'Ongeldige vervaldatum' },  { status: 400 })
    if (due < issue)            return NextResponse.json({ error: 'Vervaldatum moet op of na de factuurdatum liggen' }, { status: 400 })

    // ── Factuurnummer uniek (eigen record negeren) ────────────────────────────
    const numberTaken = await prisma.invoice.findUnique({
      where: { invoiceNumber: invoiceNumber.trim() },
    })
    if (numberTaken && numberTaken.id !== params.id)
      return NextResponse.json({ error: 'Factuurnummer is al in gebruik — kies een ander nummer' }, { status: 409 })

    // ── Eigendomscheck op gerelateerde records ────────────────────────────────
    const [contract, tenant, identity] = await Promise.all([
      prisma.rentalContract.findFirst({ where: { id: rentalContractId, userId } }),
      prisma.tenant.findFirst({ where: { id: tenantId, userId } }),
      prisma.identity.findFirst({ where: { id: identityId, userId } }),
    ])
    if (!contract) return NextResponse.json({ error: 'Geselecteerd contract niet gevonden' },      { status: 400 })
    if (!tenant)   return NextResponse.json({ error: 'Geselecteerde huurder niet gevonden' },      { status: 400 })
    if (!identity) return NextResponse.json({ error: 'Geselecteerde identiteit niet gevonden' },   { status: 400 })

    // ── Parse VAT ──────────────────────────────────────────────────────────────
    const vatRateVal   = vatRate ? parseFloat(vatRate) : null
    const finalVatRate = (vatRateVal !== null && !isNaN(vatRateVal) && vatRateVal > 0) ? vatRateVal : null

    // ── Parse extra charges ────────────────────────────────────────────────────
    const chargeLines: { label: string; reference: string | null; amount: number; sortOrder: number }[] = []
    if (Array.isArray(charges)) {
      for (let i = 0; i < charges.length; i++) {
        const c = charges[i]
        const cAmt = parseFloat(c.amount)
        if (c.label?.trim() && !isNaN(cAmt)) {
          chargeLines.push({ label: c.label.trim(), reference: c.reference?.trim() || null, amount: cAmt, sortOrder: i })
        }
      }
    }

    // ── Update invoice + replace charges ─────────────────────────────────────
    // Delete all existing charges first, then create new ones
    await prisma.invoiceCharge.deleteMany({ where: { invoiceId: params.id } })

    const updated = await prisma.invoice.update({
      where: { id: params.id },
      data: {
        invoiceNumber:    invoiceNumber.trim(),
        rentalContractId,
        tenantId,
        identityId,
        issueDate:        issue,
        dueDate:          due,
        amount:           amt,
        vatRate:          finalVatRate,
        status:           status as InvoiceStatus,
        description:      description?.trim() || null,
        charges: {
          create: chargeLines,
        },
      },
      include: invoiceInclude,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[PUT /api/invoices/[id]]', error)
    return NextResponse.json({ error: 'Factuur bijwerken mislukt' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const userId = await getAuthUserId()
  if (!userId) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 })

  const existing = await getOwnedInvoice(userId, params.id)
  if (!existing) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 })

  try {
    await prisma.invoice.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/invoices/[id]]', error)
    return NextResponse.json({ error: 'Factuur verwijderen mislukt' }, { status: 500 })
  }
}
