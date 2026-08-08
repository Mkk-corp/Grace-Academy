import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

const DAY_KEYS  = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri']
const DAY_NAMES = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const DAY_SHORT = ['SAT', 'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI']
const DOW_INDEX = { sat: 6, sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5 }

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('ga-admin')?.value
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toLocaleDateString('en-CA')

  const dates = []
  for (let i = 0; i < 14; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const dow    = d.getDay()
    const keyIdx = DAY_KEYS.findIndex(k => DOW_INDEX[k] === dow)
    dates.push({
      date:       d.toLocaleDateString('en-CA'),
      dayKey:     DAY_KEYS[keyIdx],
      dayLabel:   DAY_NAMES[keyIdx],
      shortLabel: DAY_SHORT[keyIdx],
      monthDay:   d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    })
  }

  const weekDates = dates.map(d => d.date)

  const [templates, pendingRequests, confirmedBookings] = await Promise.all([
    prisma.scheduleTemplate.findMany({ select: { userId: true, schedule: true } }),
    prisma.slotRequest.findMany({ where: { status: 'pending' }, select: { assessorId: true } }),
    prisma.booking.findMany({
      where: { status: 'confirmed', date: { in: weekDates } },
      select: { assessorId: true, date: true, slotMin: true },
    }),
  ])

  const pendingAssessorIds = new Set(pendingRequests.map(r => r.assessorId))
  const bookedSet = new Set(confirmedBookings.map(b => `${b.date}::${b.slotMin}::${b.assessorId}`))

  const nowMin = new Date().getHours() * 60 + new Date().getMinutes()
  const availability = {}

  dates.forEach(({ date, dayKey }) => {
    availability[date] = {}
    templates.forEach(({ userId: assessorId, schedule }) => {
      if (pendingAssessorIds.has(assessorId)) return
      const slots = schedule[dayKey] || []
      slots.forEach(slotMin => {
        if (date === todayStr && Number(slotMin) <= nowMin + 30) return
        if (bookedSet.has(`${date}::${slotMin}::${assessorId}`)) return
        availability[date][slotMin] = (availability[date][slotMin] || 0) + 1
      })
    })
  })

  return NextResponse.json({ dates, availability })
}
