import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserId } from '@/lib/session'
import { generateInvoiceNumber } from '@/lib/invoiceNumber'
import { InvoiceStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

const VALID_STATUSES: string[] = ['DRAFT', 'SENT', 'PAID', 'OVERDUE']

// ─── Relation shape included in every response ────────────────────────────────
const invoiceInclude = {
  tenant:         { select: { name: true } },
  identity:       { select: { name: true, type: true } },
  rentalContract: { select: { property: { select: { name: true } } } },
  charges:        true,
} as const

export async function GET() {
  const userId = await getAuthUserId()
  if (!userId) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 })

  try {
    const invoices = await prisma.invoice.findMany({
      where: { userId },
      include: invoiceInclude,
      orderBy: { issueDate: 'desc' },
    })
    return NextResponse.json(invoices)
  } catch (error) {
    console.error('[GET /api/invoices]', error)
    return NextResponse.json({ error: 'Facturen laden mislukt' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const userId = await getAuthUserId()
  if (!userId) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 })

  try {
    const body = await req.json()
    const {
      invoiceNumber, rentalContractId, tenantId, identityId,
      issueDate, dueDate, amount, vatRate, charges, status, description,
    } = body

    // ── Invoice number: use provided value or auto-generate ───────────────────
    const providedNumber  = invoiceNumber?.trim()
    const finalNumber     = providedNumber || await generateInvoiceNumber(userId)

    // ── Verplichte velden ──────────────────────────────────────────────────────
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
    if (isNaN(issue.getTime())) return NextResponse.json({ error: 'Ongeldige factuurdatum' },  { status: 400 })
    if (isNaN(due.getTime()))   return NextResponse.json({ error: 'Ongeldige vervaldatum' },   { status: 400 })
    if (due < issue)            return NextResponse.json({ error: 'Vervaldatum moet op of na de factuurdatum liggen' }, { status: 400 })

    // ── Factuurnummer uniek (alleen valideren bij aangepast nummer) ────────────
    if (providedNumber) {
      const numberTaken = await prisma.invoice.findUnique({ where: { invoiceNumber: finalNumber } })
      if (numberTaken)
        return NextResponse.json({ error: 'Factuurnummer is al in gebruik — kies een ander nummer' }, { status: 409 })
    }

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
    const vatRateVal = vatRate ? parseFloat(vatRate) : null
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

    const invoice = await prisma.invoice.create({
      data: {
        userId,
        invoiceNumber:    finalNumber,
        rentalContractId,
        tenantId,
        identityId,
        issueDate:        issue,
        dueDate:          due,
        amount:           amt,
        vatRate:          finalVatRate,
        status:           status as InvoiceStatus,
        description:      description?.trim() || null,
        pdfUrl:           null,
        charges: {
          create: chargeLines,
        },
      },
      include: invoiceInclude,
    })

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error('[POST /api/invoices]', error)
    return NextResponse.json({ error: 'Factuur aanmaken mislukt' }, { status: 500 })
  }
}
