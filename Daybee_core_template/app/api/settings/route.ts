import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserId } from '@/lib/session'

export const dynamic = 'force-dynamic'

// Fields exposed via the settings API.
// Extend this list to include additional user profile fields from your schema.
const settingsFields = {
  companyName: true,
  phone: true,
  address: true,
  postalCode: true,
  city: true,
  logoUrl: true,
  email: true,
} as const

export async function GET() {
  const userId = await getAuthUserId()
  if (!userId) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 })
  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: settingsFields })
    return NextResponse.json(user ?? {})
  } catch (error) {
    console.error('[GET /api/settings]', error)
    return NextResponse.json({ error: 'Instellingen laden mislukt' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const userId = await getAuthUserId()
  if (!userId) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 })
  try {
    const body = await req.json()
    const { companyName, email, phone, address, postalCode, city, logoUrl } = body
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(companyName !== undefined && { companyName: companyName || null }),
        ...(email       !== undefined && { email:       email       || null }),
        ...(phone       !== undefined && { phone:       phone       || null }),
        ...(address     !== undefined && { address:     address     || null }),
        ...(postalCode  !== undefined && { postalCode:  postalCode  || null }),
        ...(city        !== undefined && { city:        city        || null }),
        ...(logoUrl     !== undefined && { logoUrl:     logoUrl     || null }),
      },
      select: settingsFields,
    })
    return NextResponse.json(user)
  } catch (error) {
    console.error('[PUT /api/settings]', error)
    return NextResponse.json({ error: 'Instellingen opslaan mislukt' }, { status: 500 })
  }
}
