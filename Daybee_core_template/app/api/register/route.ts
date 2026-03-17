import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    if (!name?.trim())
      return NextResponse.json({ error: 'Naam is verplicht' }, { status: 400 })
    if (!email?.trim())
      return NextResponse.json({ error: 'E-mailadres is verplicht' }, { status: 400 })
    if (!password || (password as string).length < 8)
      return NextResponse.json({ error: 'Wachtwoord moet minimaal 8 tekens bevatten' }, { status: 400 })

    const existing = await prisma.user.findUnique({
      where: { email: (email as string).trim().toLowerCase() },
    })
    if (existing)
      return NextResponse.json({ error: 'Dit e-mailadres is al in gebruik' }, { status: 409 })

    const hashed = await hash(password as string, 12)
    const user = await prisma.user.create({
      data: {
        name: (name as string).trim(),
        email: (email as string).trim().toLowerCase(),
        password: hashed,
      },
    })

    return NextResponse.json({ id: user.id, name: user.name, email: user.email }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/register]', error)
    // In development, surface the real error so DB/config issues are immediately visible.
    // In production, always return the generic message.
    const message =
      process.env.NODE_ENV === 'development' && error instanceof Error
        ? error.message
        : 'Registratie mislukt'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
