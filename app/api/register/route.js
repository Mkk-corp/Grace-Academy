import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/password'
import { logAudit } from '@/lib/audit'

export async function POST(request) {
  try {
    const { name, username, email, phone, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 })
    }

    const existingEmail = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    })
    if (existingEmail) return NextResponse.json({ error: 'Email already registered' }, { status: 409 })

    if (username) {
      const existingUsername = await prisma.user.findFirst({
        where: { username: { equals: username, mode: 'insensitive' } },
      })
      if (existingUsername) return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
    }

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null
    const newUser = await prisma.user.create({
      data: {
        name,
        username: username || '',
        email,
        phone: phone || '',
        password: hashPassword(password),
        roleId: 'r_student',
        source: 'website',
      },
    })

    logAudit({ actorId: newUser.id, actorName: newUser.name, actorRole: 'student', action: 'user.registered', entity: 'User', entityId: newUser.id, meta: { email, source: 'website' }, ip })
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (err) {
    console.error('[register]', err)
    return NextResponse.json({ error: 'Internal server error', detail: err.message }, { status: 500 })
  }
}
