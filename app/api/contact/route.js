import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { logAudit } from '@/lib/audit'

export async function POST(request) {
  const { name, email, phone, message } = await request.json()
  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null
  const msg = await prisma.contactMessage.create({
    data: { name, email, phone: phone || '', message },
  })
  logAudit({ actorName: name, actorRole: 'visitor', action: 'contact.submitted', entity: 'ContactMessage', entityId: msg.id, meta: { email }, ip })
  return NextResponse.json({ ok: true }, { status: 201 })
}

export async function GET() {
  const token = (await cookies()).get('ga-admin')?.value
  if (!verifyToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const messages = await prisma.contactMessage.findMany({ orderBy: { submittedAt: 'desc' } })
  return NextResponse.json(messages)
}

export async function PUT(request) {
  const token = (await cookies()).get('ga-admin')?.value
  if (!verifyToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await request.json()
  await prisma.contactMessage.update({ where: { id }, data: { read: true } })
  return NextResponse.json({ ok: true })
}

export async function DELETE(request) {
  const token = (await cookies()).get('ga-admin')?.value
  if (!verifyToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await request.json()
  await prisma.contactMessage.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
