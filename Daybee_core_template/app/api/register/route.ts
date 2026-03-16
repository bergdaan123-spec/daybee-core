import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    if (!name?.trim())
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    if (!email?.trim())
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 })
    if (!password || (password as string).length < 8)
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })

    const existing = await prisma.user.findUnique({
      where: { email: (email as string).trim().toLowerCase() },
    })
    if (existing)
      return NextResponse.json({ error: 'Email address is already in use' }, { status: 409 })

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
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
