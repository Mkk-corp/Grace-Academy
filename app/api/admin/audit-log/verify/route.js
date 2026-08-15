import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { verifyPassword } from '@/lib/password'

async function getAdminUser() {
  const jar = await cookies()
  const token = jar.get('ga-admin')?.value
  return token ? verifyToken(token) : null
}

export async function POST(req) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { password } = await req.json().catch(() => ({}))
  if (!password) return NextResponse.json({ error: 'Password required' }, { status: 400 })

  // DB user — verify against their stored hash
  if (admin.userId) {
    const user = await prisma.user.findUnique({ where: { id: admin.userId } })
    if (user?.password && verifyPassword(password, user.password)) {
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }

  // Env super-admin
  if (password === process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
}
