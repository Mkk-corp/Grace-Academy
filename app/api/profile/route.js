import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { readData, writeData } from '@/lib/db'

const ALLOWED_AVATARS = ['user1', 'user2', 'user3', 'user4', 'user5']

async function getUser() {
  const jar = await cookies()
  const token = jar.get('ga-admin')?.value
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload) return null
  const users = readData('users.json')
  const idx = users.findIndex(u => u.id === payload.userId)
  if (idx === -1) return null
  return { idx, users }
}

export async function GET() {
  const result = await getUser()
  if (!result) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { idx, users } = result
  const { password, passwordHistory, ...safe } = users[idx]
  return NextResponse.json(safe)
}

export async function PUT(request) {
  const result = await getUser()
  if (!result) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { idx, users } = result

  const body = await request.json()
  const allowed = ['name', 'phone', 'dob', 'gender', 'bio', 'country', 'city', 'nationalId', 'emergencyContact', 'avatar']

  const updates = {}
  for (const key of allowed) {
    if (body[key] !== undefined) {
      updates[key] = body[key]
    }
  }

  // Validate avatar choice
  if (updates.avatar && !ALLOWED_AVATARS.includes(updates.avatar)) {
    return NextResponse.json({ error: 'Invalid avatar selection.' }, { status: 400 })
  }

  // Name must not be empty if provided
  if (updates.name !== undefined && !updates.name.trim()) {
    return NextResponse.json({ error: 'Name cannot be empty.' }, { status: 400 })
  }

  users[idx] = { ...users[idx], ...updates, updatedAt: new Date().toISOString() }
  writeData('users.json', users)

  const { password, passwordHistory, ...safe } = users[idx]
  return NextResponse.json(safe)
}
