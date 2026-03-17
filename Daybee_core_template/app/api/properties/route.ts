import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserId } from '@/lib/session'

export const dynamic = 'force-dynamic'

export async function GET() {
  const userId = await getAuthUserId()
  if (!userId) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 })

  try {
    const properties = await prisma.property.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(properties)
  } catch (error) {
    console.error('[GET /api/properties]', error)
    return NextResponse.json({ error: 'Panden laden mislukt' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const userId = await getAuthUserId()
  if (!userId) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 })

  try {
    const body = await req.json()
    const { name, address, postalCode, city, country, notes } = body

    if (!name?.trim())       return NextResponse.json({ error: 'Naam is verplicht' },     { status: 400 })
    if (!address?.trim())    return NextResponse.json({ error: 'Adres is verplicht' },     { status: 400 })
    if (!postalCode?.trim()) return NextResponse.json({ error: 'Postcode is verplicht' },  { status: 400 })
    if (!city?.trim())       return NextResponse.json({ error: 'Plaats is verplicht' },    { status: 400 })
    if (!country?.trim())    return NextResponse.json({ error: 'Land is verplicht' },      { status: 400 })

    const property = await prisma.property.create({
      data: {
        userId,
        name:       name.trim(),
        address:    address.trim(),
        postalCode: postalCode.trim(),
        city:       city.trim(),
        country:    country.trim(),
        notes:      notes?.trim() || null,
      },
    })

    return NextResponse.json(property, { status: 201 })
  } catch (error) {
    console.error('[POST /api/properties]', error)
    return NextResponse.json({ error: 'Pand aanmaken mislukt' }, { status: 500 })
  }
}
