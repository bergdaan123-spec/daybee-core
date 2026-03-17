import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserId } from '@/lib/session'

export const dynamic = 'force-dynamic'

type Params = { params: { id: string } }

const contractInclude = {
  tenant:   { select: { name: true } },
  property: { select: { name: true } },
  identity: { select: { name: true, type: true } },
} as const

async function getOwnedContract(userId: string, id: string) {
  return prisma.rentalContract.findFirst({ where: { id, userId } })
}

export async function PUT(req: NextRequest, { params }: Params) {
  const userId = await getAuthUserId()
  if (!userId) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 })

  const existing = await getOwnedContract(userId, params.id)
  if (!existing) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 })

  try {
    const body = await req.json()
    const { tenantId, propertyId, identityId, monthlyRent, paymentDayOfMonth, startDate, endDate, active } = body

    if (!tenantId)   return NextResponse.json({ error: 'Huurder is verplicht' },   { status: 400 })
    if (!propertyId) return NextResponse.json({ error: 'Pand is verplicht' },       { status: 400 })
    if (!identityId) return NextResponse.json({ error: 'Identiteit is verplicht' }, { status: 400 })
    if (!startDate)  return NextResponse.json({ error: 'Startdatum is verplicht' }, { status: 400 })

    const rent = parseFloat(monthlyRent)
    if (isNaN(rent) || rent <= 0)
      return NextResponse.json({ error: 'Maandhuur moet een positief bedrag zijn' }, { status: 400 })

    const day = parseInt(paymentDayOfMonth, 10)
    if (isNaN(day) || day < 1 || day > 31)
      return NextResponse.json({ error: 'Betaaldag moet tussen 1 en 31 liggen' }, { status: 400 })

    const start = new Date(startDate)
    if (isNaN(start.getTime()))
      return NextResponse.json({ error: 'Ongeldige startdatum' }, { status: 400 })

    let end: Date | null = null
    if (endDate) {
      end = new Date(endDate)
      if (isNaN(end.getTime()))
        return NextResponse.json({ error: 'Ongeldige einddatum' }, { status: 400 })
      if (end <= start)
        return NextResponse.json({ error: 'Einddatum moet na de startdatum liggen' }, { status: 400 })
    }

    // ── Eigendomscheck op gerelateerde records ────────────────────────────────
    const [tenant, property, identity] = await Promise.all([
      prisma.tenant.findFirst({ where: { id: tenantId, userId } }),
      prisma.property.findFirst({ where: { id: propertyId, userId } }),
      prisma.identity.findFirst({ where: { id: identityId, userId } }),
    ])
    if (!tenant)   return NextResponse.json({ error: 'Geselecteerde huurder niet gevonden' },   { status: 400 })
    if (!property) return NextResponse.json({ error: 'Geselecteerd pand niet gevonden' },        { status: 400 })
    if (!identity) return NextResponse.json({ error: 'Geselecteerde identiteit niet gevonden' }, { status: 400 })

    const updated = await prisma.rentalContract.update({
      where: { id: params.id },
      data: {
        tenantId,
        propertyId,
        identityId,
        monthlyRent:       rent,
        paymentDayOfMonth: day,
        startDate:         start,
        endDate:           end,
        active:            active === true || active === 'true',
      },
      include: contractInclude,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[PUT /api/contracts/[id]]', error)
    return NextResponse.json({ error: 'Contract bijwerken mislukt' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const userId = await getAuthUserId()
  if (!userId) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 })

  const existing = await getOwnedContract(userId, params.id)
  if (!existing) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 })

  try {
    await prisma.rentalContract.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/contracts/[id]]', error)
    // P2003: foreign key constraint — contract is still linked to invoices
    if ((error as { code?: string })?.code === 'P2003') {
      return NextResponse.json(
        { error: 'Dit contract heeft gekoppelde facturen en kan niet worden verwijderd.' },
        { status: 409 },
      )
    }
    return NextResponse.json({ error: 'Contract verwijderen mislukt' }, { status: 500 })
  }
}
