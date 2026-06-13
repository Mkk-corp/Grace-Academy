import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'
import { verifyToken } from '@/lib/auth'
import { readData, writeData } from '@/lib/db'
import { hashPassword } from '@/lib/password'

async function requireAdmin() {
  const jar = await cookies()
  const token = jar.get('ga-admin')?.value
  return token ? verifyToken(token) : null
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const users = readData('users.json').map(({ password, ...u }) => u)
  return NextResponse.json(users)
}

export async function POST(request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { name, username, email, phone, password, roleId } = await request.json()

  if (!username || !email || !password) {
    return NextResponse.json({ error: 'Username, email and password required' }, { status: 400 })
  }

  const users = readData('users.json')
  if (users.find(u => u.email === email)) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
  }
  if (users.find(u => u.username && u.username === username)) {
    return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
  }

  const newUser = {
    id: crypto.randomUUID(),
    name: name || username,
    username,
    email,
    phone: phone || '',
    password: hashPassword(password),
    roleId: roleId || null,
    source: 'admin',
    createdAt: new Date().toISOString(),
  }

  users.push(newUser)
  writeData('users.json', users)

  const { password: _, ...safe } = newUser
  return NextResponse.json(safe, { status: 201 })
}

export async function PUT(request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, name, email, phone, roleId, password } = await request.json()

  const users = readData('users.json')
  const idx = users.findIndex(u => u.id === id)
  if (idx === -1) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  users[idx] = {
    ...users[idx],
    ...(name !== undefined && { name }),
    ...(email !== undefined && { email }),
    ...(phone !== undefined && { phone }),
    ...(roleId !== undefined && { roleId }),
    ...(password && { password: hashPassword(password) }),
  }

  writeData('users.json', users)
  const { password: _, ...safe } = users[idx]
  return NextResponse.json(safe)
}

export async function DELETE(request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await request.json()

  const users = readData('users.json')
  const filtered = users.filter(u => u.id !== id)
  if (filtered.length === users.length) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  writeData('users.json', filtered)
  return NextResponse.json({ ok: true })
}
