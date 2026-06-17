import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { signToken } from '@/lib/auth'
import { readData, writeData } from '@/lib/db'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const authUrl = process.env.AUTH_URL || 'http://localhost:3000'

  if (error || !code) {
    return NextResponse.redirect(`${authUrl}/login?error=google_cancelled`)
  }

  // Exchange code for tokens
  let googleUser
  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${authUrl}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    })
    const tokenData = await tokenRes.json()
    if (!tokenData.access_token) throw new Error('No access token')

    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    googleUser = await userRes.json()
    if (!googleUser.email) throw new Error('No email from Google')
  } catch {
    return NextResponse.redirect(`${authUrl}/login?error=google_failed`)
  }

  const users = readData('users.json')
  const roles = readData('roles.json')

  // Find existing user by email or google sub
  let user = users.find(u =>
    u.email?.toLowerCase() === googleUser.email.toLowerCase() ||
    u.googleId === googleUser.sub
  )

  if (user) {
    // Sync googleId if not yet stored
    if (!user.googleId) {
      user.googleId = googleUser.sub
      writeData('users.json', users)
    }
  } else {
    // Create new student account
    user = {
      id: crypto.randomUUID(),
      name: googleUser.name || googleUser.email.split('@')[0],
      username: '',
      email: googleUser.email,
      phone: '',
      password: null,
      googleId: googleUser.sub,
      avatar: googleUser.picture || null,
      roleId: 'r_student',
      source: 'google',
      createdAt: new Date().toISOString(),
    }
    users.push(user)
    writeData('users.json', users)
  }

  // Determine redirect
  const userRole = roles.find(r => r.id === user.roleId)
  const permissions = userRole?.permissions || []
  const hasAdminAccess = permissions.some(p => p !== 'access_student_portal')
  const redirect = hasAdminAccess ? '/admin' : '/portal'

  const token = signToken({ userId: user.id, roleId: user.roleId, name: user.name })
  const response = NextResponse.redirect(`${authUrl}${redirect}`)
  response.cookies.set('ga-admin', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  })
  return response
}
