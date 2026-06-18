import { NextResponse } from 'next/server'
import { signToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const authUrl = process.env.AUTH_URL || 'http://localhost:3000'

  if (error || !code) return NextResponse.redirect(`${authUrl}/login?error=google_cancelled`)

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

  let user = await prisma.user.findFirst({
    where: { OR: [{ email: { equals: googleUser.email, mode: 'insensitive' } }, { googleId: googleUser.sub }] },
    include: { role: true },
  })

  if (user) {
    if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId: googleUser.sub },
        include: { role: true },
      })
    }
  } else {
    user = await prisma.user.create({
      data: {
        name: googleUser.name || googleUser.email.split('@')[0],
        username: '',
        email: googleUser.email,
        phone: '',
        password: null,
        googleId: googleUser.sub,
        avatar: googleUser.picture || null,
        roleId: 'r_student',
        source: 'google',
      },
      include: { role: true },
    })
  }

  const permissions = user.role?.permissions || []
  const hasAdminAccess = permissions.some(p => !['access_student_portal', 'access_assessor_portal', 'access_teacher_portal'].includes(p))
  const isAssessor     = permissions.includes('access_assessor_portal') && !hasAdminAccess
  const isTeacher      = permissions.includes('access_teacher_portal')  && !hasAdminAccess
  const redirect = hasAdminAccess ? '/admin' : isAssessor ? '/assessor' : isTeacher ? '/teacher' : '/portal'

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
