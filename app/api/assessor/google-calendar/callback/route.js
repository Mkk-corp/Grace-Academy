import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma, readContent, writeContent } from '@/lib/db'

async function getAuthUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('ga-admin')?.value
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload?.userId) return null
  return prisma.user.findUnique({ where: { id: payload.userId } })
}

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const code  = searchParams.get('code')
  const error = searchParams.get('error')
  const base  = process.env.AUTH_URL

  if (error || !code) {
    return NextResponse.redirect(`${base}/portal/assessor`)
  }

  const user = await getAuthUser()
  if (!user) {
    return NextResponse.redirect(`${base}/login`)
  }

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id:     process.env.GCAL_CLIENT_ID,
      client_secret: process.env.GCAL_CLIENT_SECRET,
      redirect_uri:  `${base}/api/assessor/google-calendar/callback`,
      grant_type:    'authorization_code',
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${base}/portal/assessor`)
  }

  const { access_token, refresh_token } = await tokenRes.json()
  if (!access_token) {
    return NextResponse.redirect(`${base}/portal/assessor`)
  }

  const isFirstSync = !user.googleCalendarSyncedAt

  await prisma.user.update({
    where: { id: user.id },
    data: {
      googleCalendarAccessToken: access_token,
      ...(refresh_token ? { googleCalendarRefreshToken: refresh_token } : {}),
      ...(!user.googleCalendarSyncedAt ? { googleCalendarSyncedAt: new Date() } : {}),
    },
  })

  if (isFirstSync) {
    const notifications = (await readContent('notifications')) || []
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2)
    notifications.push({
      id,
      recipientType: 'user',
      recipientId:   user.id,
      type:          'google_calendar_synced',
      title:         'Google Calendar Connected',
      body:          'Your account is now synced with Google Calendar. Your events will appear in the Calendar tab.',
      meta:          {},
      read:          false,
      createdAt:     new Date().toISOString(),
    })
    await writeContent('notifications', notifications)
  }

  return NextResponse.redirect(`${base}/portal/assessor`)
}
