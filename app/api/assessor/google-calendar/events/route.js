import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

async function getAuthUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('ga-admin')?.value
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload?.userId) return null
  return prisma.user.findUnique({ where: { id: payload.userId } })
}

async function refreshAccessToken(user) {
  if (!user.googleCalendarRefreshToken) return null
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     process.env.GCAL_CLIENT_ID,
      client_secret: process.env.GCAL_CLIENT_SECRET,
      refresh_token: user.googleCalendarRefreshToken,
      grant_type:    'refresh_token',
    }),
  })
  if (!res.ok) return null
  const data = await res.json()
  if (!data.access_token) return null
  await prisma.user.update({
    where: { id: user.id },
    data: { googleCalendarAccessToken: data.access_token },
  })
  return data.access_token
}

function getWeekRange() {
  const today = new Date()
  const dow   = today.getDay()
  const satOffset = (dow - 6 + 7) % 7
  const sat = new Date(today)
  sat.setDate(today.getDate() - satOffset)
  sat.setHours(0, 0, 0, 0)
  const fri = new Date(sat)
  fri.setDate(sat.getDate() + 6)
  fri.setHours(23, 59, 59, 999)
  return { timeMin: sat.toISOString(), timeMax: fri.toISOString() }
}

async function doFetch(accessToken, timeMin, timeMax) {
  const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events')
  url.searchParams.set('timeMin', timeMin)
  url.searchParams.set('timeMax', timeMax)
  url.searchParams.set('singleEvents', 'true')
  url.searchParams.set('orderBy', 'startTime')
  url.searchParams.set('maxResults', '100')
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  return { ok: res.ok, status: res.status, data: res.ok ? await res.json() : null }
}

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!user.googleCalendarSyncedAt) return NextResponse.json({ events: [] })

  const { timeMin, timeMax } = getWeekRange()
  let accessToken = user.googleCalendarAccessToken

  let result = await doFetch(accessToken, timeMin, timeMax)

  if (result.status === 401) {
    accessToken = await refreshAccessToken(user)
    if (!accessToken) return NextResponse.json({ events: [] })
    result = await doFetch(accessToken, timeMin, timeMax)
  }

  if (!result.ok || !result.data?.items) return NextResponse.json({ events: [] })

  const events = result.data.items.map(e => ({
    id:       e.id,
    title:    e.summary || '',
    startISO: e.start?.dateTime || e.start?.date || null,
    endISO:   e.end?.dateTime   || e.end?.date   || null,
    isAllDay: !e.start?.dateTime,
  })).filter(e => e.startISO)

  return NextResponse.json({ events })
}
