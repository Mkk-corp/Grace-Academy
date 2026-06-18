import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

async function requireAdmin() {
  const jar = await cookies()
  const token = jar.get('ga-admin')?.value
  return token ? verifyToken(token) : null
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(await prisma.role.findMany())
}

export async function POST(request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { name, description, permissions } = await request.json()
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  const existing = await prisma.role.findFirst({ where: { name: { equals: name, mode: 'insensitive' } } })
  if (existing) return NextResponse.json({ error: 'Role name already exists' }, { status: 409 })

  const role = await prisma.role.create({
    data: {
      id: `r_${crypto.randomUUID().slice(0, 8)}`,
      name,
      description: description || '',
      permissions: permissions || [],
    },
  })
  return NextResponse.json(role, { status: 201 })
}

export async function PUT(request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, name, description, permissions } = await request.json()

  const existing = await prisma.role.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Role not found' }, { status: 404 })

  const data = {}
  if (name        !== undefined) data.name        = name
  if (description !== undefined) data.description = description
  if (permissions !== undefined) data.permissions = permissions

  const role = await prisma.role.update({ where: { id }, data })
  return NextResponse.json(role)
}

export async function DELETE(request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await request.json()

  const inUse = await prisma.user.findFirst({ where: { roleId: id } })
  if (inUse) return NextResponse.json({ error: 'Cannot delete a role that is assigned to users' }, { status: 409 })

  const existing = await prisma.role.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Role not found' }, { status: 404 })

  await prisma.role.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
