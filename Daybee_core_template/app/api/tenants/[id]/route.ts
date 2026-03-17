import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserId } from '@/lib/session'

export const dynamic = 'force-dynamic'

type Params = { params: { id: string } }

async function getOwnedTenant(userId: string, id: string) {
  return prisma.tenant.findFirst({ where: { id, userId } })
}

export async function PUT(req: NextRequest, { params }: Params) {
  const userId = await getAuthUserId()
  if (!userId) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 })

  const tenant = await getOwnedTenant(userId, params.id)
  if (!tenant) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 })

  try {
    const body = await req.json()
    const { name, email, phone, address, postalCode, city, country,
            companyName, contactPerson, kvkNumber, btwNumber } = body

    if (!name?.trim())       return NextResponse.json({ error: 'Naam is verplicht' },      { status: 400 })
    if (!email?.trim())      return NextResponse.json({ error: 'E-mailadres is verplicht' }, { status: 400 })
    if (!address?.trim())    return NextResponse.json({ error: 'Adres is verplicht' },      { status: 400 })
    if (!postalCode?.trim()) return NextResponse.json({ error: 'Postcode is verplicht' },   { status: 400 })
    if (!city?.trim())       return NextResponse.json({ error: 'Plaats is verplicht' },     { status: 400 })
    if (!country?.trim())    return NextResponse.json({ error: 'Land is verplicht' },       { status: 400 })

    const updated = await prisma.tenant.update({
      where: { id: params.id },
      data: {
        name:          name.trim(),
        email:         email.trim().toLowerCase(),
        phone:         phone?.trim()         || null,
        address:       address.trim(),
        postalCode:    postalCode.trim(),
        city:          city.trim(),
        country:       country.trim(),
        companyName:   companyName?.trim()   || null,
        contactPerson: contactPerson?.trim() || null,
        kvkNumber:     kvkNumber?.trim()     || null,
        btwNumber:     btwNumber?.trim()     || null,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[PUT /api/tenants/[id]]', error)
    return NextResponse.json({ error: 'Huurder bijwerken mislukt' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const userId = await getAuthUserId()
  if (!userId) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 })

  const tenant = await getOwnedTenant(userId, params.id)
  if (!tenant) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 })

  try {
    await prisma.tenant.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/tenants/[id]]', error)
    // P2003: foreign key constraint — tenant is still linked to contracts or invoices
    if ((error as { code?: string })?.code === 'P2003') {
      return NextResponse.json(
        { error: 'Deze huurder is gekoppeld aan contracten of facturen en kan niet worden verwijderd.' },
        { status: 409 },
      )
    }
    return NextResponse.json({ error: 'Huurder verwijderen mislukt' }, { status: 500 })
  }
}
