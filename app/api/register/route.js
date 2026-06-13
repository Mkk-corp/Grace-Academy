import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { readData, writeData } from '@/lib/db'
import { hashPassword } from '@/lib/password'

export async function POST(request) {
  const { name, email, phone, password } = await request.json()

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 })
  }

  const users = readData('users.json')
  if (users.find(u => u.email === email)) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
  }

  const newUser = {
    id: crypto.randomUUID(),
    name,
    username: '',
    email,
    phone: phone || '',
    password: hashPassword(password),
    roleId: null,
    source: 'website',
    createdAt: new Date().toISOString(),
  }

  users.push(newUser)
  writeData('users.json', users)

  return NextResponse.json({ ok: true }, { status: 201 })
}
