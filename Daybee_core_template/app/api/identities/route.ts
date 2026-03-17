import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserId } from '@/lib/session'
import { IdentityType } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function GET() {
  const userId = await getAuthUserId()
  if (!userId) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 })

  try {
    const identities = await prisma.identity.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json(identities)
  } catch (error) {
    console.error('[GET /api/identities]', error)
    return NextResponse.json({ error: 'Identiteiten laden mislukt' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const userId = await getAuthUserId()
  if (!userId) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 })

  try {
    const body = await req.json()
    const { name, type, address, postalCode, city, country, email, phone, kvkNumber, btwNumber, iban } = body

    if (!name?.trim())        return NextResponse.json({ error: 'Naam is verplicht' },     { status: 400 })
    if (!['PRIVATE', 'BV'].includes(type)) return NextResponse.json({ error: 'Type moet PRIVATE of BV zijn' }, { status: 400 })
    if (!address?.trim())     return NextResponse.json({ error: 'Adres is verplicht' },     { status: 400 })
    if (!postalCode?.trim())  return NextResponse.json({ error: 'Postcode is verplicht' },  { status: 400 })
    if (!city?.trim())        return NextResponse.json({ error: 'Plaats is verplicht' },    { status: 400 })
    if (!country?.trim())     return NextResponse.json({ error: 'Land is verplicht' },      { status: 400 })
    if (!email?.trim())       return NextResponse.json({ error: 'E-mailadres is verplicht' }, { status: 400 })

    const identity = await prisma.identity.create({
      data: {
        userId,
        name:      name.trim(),
        type:      type as IdentityType,
        address:   address.trim(),
        postalCode: postalCode.trim(),
        city:      city.trim(),
        country:   country.trim(),
        email:     email.trim().toLowerCase(),
        phone:     phone?.trim()     || null,
        kvkNumber: kvkNumber?.trim() || null,
        btwNumber: btwNumber?.trim() || null,
        iban:      iban?.trim()      || null,
      },
    })

    return NextResponse.json(identity, { status: 201 })
  } catch (error) {
    console.error('[POST /api/identities]', error)
    return NextResponse.json({ error: 'Identiteit aanmaken mislukt' }, { status: 500 })
  }
}
