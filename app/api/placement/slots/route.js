import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma, readContent } from '@/lib/db'

const DAY_KEYS   = ['sat','sun','mon','tue','wed','thu','fri']
const DAY_NAMES  = ['Saturday','Sunday','Monday','Tuesday','Wednesday','Thursday','Friday']
const DAY_SHORT  = ['SAT','SUN','MON','TUE','WED','THU','FRI']

const DOW_INDEX = { sat: 6, sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5 }

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('ga-admin')?.value
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Rolling 14-day window starting from today (never shows past dates)
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

  // Load assessor schedules and slot-requests in parallel
  const [schedules, slotRequests] = await Promise.all([
    readContent('schedules').then(v => v || {}),
    readContent('slot-requests').then(v => v || []),
  ])

  // Assessors with a pending change request are treated as unavailable —
  // they have signalled they want different slots, so don't offer their
  // current schedule to students until the request is resolved.
  const pendingAssessorIds = new Set(
    slotRequests.filter(r => r.status === 'pending').map(r => r.assessorId)
  )

  // Load confirmed bookings for this window from DB
  const confirmedBookings = await prisma.booking.findMany({
    where: {
      status: 'confirmed',
      date: { in: weekDates },
    },
    select: { assessorId: true, date: true, slotMin: true },
  })

  const bookedSet = new Set(
    confirmedBookings.map(b => `${b.date}::${b.slotMin}::${b.assessorId}`)
  )

  // Build availability map: { dateStr: { slotMin: count } }
  // Skip assessors with pending requests and those already fully booked.
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes()
  const availability = {}
  dates.forEach(({ date, dayKey }) => {
    availability[date] = {}
    Object.entries(schedules).forEach(([assessorId, data]) => {
      if (pendingAssessorIds.has(assessorId)) return
      const slots = data.schedule?.[dayKey] || []
      slots.forEach(slotMin => {
        if (date === todayStr && Number(slotMin) <= nowMin + 30) return
        if (bookedSet.has(`${date}::${slotMin}::${assessorId}`)) return
        availability[date][slotMin] = (availability[date][slotMin] || 0) + 1
      })
    })
  })

  return NextResponse.json({ dates, availability })
}
