import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserId } from '@/lib/session'

export const dynamic = 'force-dynamic'

export async function GET() {
  const userId = await getAuthUserId()
  if (!userId) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 })

  try {
    const tenants = await prisma.tenant.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(tenants)
  } catch (error) {
    console.error('[GET /api/tenants]', error)
    return NextResponse.json({ error: 'Huurders laden mislukt' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const userId = await getAuthUserId()
  if (!userId) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 })

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

    const tenant = await prisma.tenant.create({
      data: {
        userId,
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

    return NextResponse.json(tenant, { status: 201 })
  } catch (error) {
    console.error('[POST /api/tenants]', error)
    return NextResponse.json({ error: 'Huurder aanmaken mislukt' }, { status: 500 })
  }
}
