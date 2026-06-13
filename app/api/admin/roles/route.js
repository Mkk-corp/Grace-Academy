import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'
import { verifyToken } from '@/lib/auth'
import { readData, writeData } from '@/lib/db'

async function requireAdmin() {
  const jar = await cookies()
  const token = jar.get('ga-admin')?.value
  return token ? verifyToken(token) : null
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(readData('roles.json'))
}

export async function POST(request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { name, description, permissions } = await request.json()

  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  const roles = readData('roles.json')
  if (roles.find(r => r.name.toLowerCase() === name.toLowerCase())) {
    return NextResponse.json({ error: 'Role name already exists' }, { status: 409 })
  }

  const newRole = {
    id: `r_${crypto.randomUUID().slice(0, 8)}`,
    name,
    description: description || '',
    permissions: permissions || [],
  }

  roles.push(newRole)
  writeData('roles.json', roles)
  return NextResponse.json(newRole, { status: 201 })
}

export async function PUT(request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, name, description, permissions } = await request.json()

  const roles = readData('roles.json')
  const idx = roles.findIndex(r => r.id === id)
  if (idx === -1) return NextResponse.json({ error: 'Role not found' }, { status: 404 })

  roles[idx] = {
    ...roles[idx],
    ...(name !== undefined && { name }),
    ...(description !== undefined && { description }),
    ...(permissions !== undefined && { permissions }),
  }

  writeData('roles.json', roles)
  return NextResponse.json(roles[idx])
}

export async function DELETE(request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await request.json()

  const users = readData('users.json')
  if (users.some(u => u.roleId === id)) {
    return NextResponse.json({ error: 'Cannot delete a role that is assigned to users' }, { status: 409 })
  }

  const roles = readData('roles.json')
  const filtered = roles.filter(r => r.id !== id)
  if (filtered.length === roles.length) return NextResponse.json({ error: 'Role not found' }, { status: 404 })

  writeData('roles.json', filtered)
  return NextResponse.json({ ok: true })
}
