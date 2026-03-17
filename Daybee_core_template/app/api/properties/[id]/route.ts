import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserId } from '@/lib/session'

export const dynamic = 'force-dynamic'

type Params = { params: { id: string } }

async function getOwnedProperty(userId: string, id: string) {
  return prisma.property.findFirst({ where: { id, userId } })
}

export async function PUT(req: NextRequest, { params }: Params) {
  const userId = await getAuthUserId()
  if (!userId) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 })

  const property = await getOwnedProperty(userId, params.id)
  if (!property) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 })

  try {
    const body = await req.json()
    const { name, address, postalCode, city, country, notes } = body

    if (!name?.trim())       return NextResponse.json({ error: 'Naam is verplicht' },     { status: 400 })
    if (!address?.trim())    return NextResponse.json({ error: 'Adres is verplicht' },     { status: 400 })
    if (!postalCode?.trim()) return NextResponse.json({ error: 'Postcode is verplicht' },  { status: 400 })
    if (!city?.trim())       return NextResponse.json({ error: 'Plaats is verplicht' },    { status: 400 })
    if (!country?.trim())    return NextResponse.json({ error: 'Land is verplicht' },      { status: 400 })

    const updated = await prisma.property.update({
      where: { id: params.id },
      data: {
        name:       name.trim(),
        address:    address.trim(),
        postalCode: postalCode.trim(),
        city:       city.trim(),
        country:    country.trim(),
        notes:      notes?.trim() || null,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[PUT /api/properties/[id]]', error)
    return NextResponse.json({ error: 'Pand bijwerken mislukt' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const userId = await getAuthUserId()
  if (!userId) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 })

  const property = await getOwnedProperty(userId, params.id)
  if (!property) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 })

  try {
    await prisma.property.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/properties/[id]]', error)
    // P2003: foreign key constraint — property is still linked to rental contracts
    if ((error as { code?: string })?.code === 'P2003') {
      return NextResponse.json(
        { error: 'Dit pand is gekoppeld aan een of meer contracten en kan niet worden verwijderd.' },
        { status: 409 },
      )
    }
    return NextResponse.json({ error: 'Pand verwijderen mislukt' }, { status: 500 })
  }
}
