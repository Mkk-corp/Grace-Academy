import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma, readContent } from '@/lib/db'

const DAY_KEYS   = ['sat','sun','mon','tue','wed','thu','fri']
const DAY_NAMES  = ['Saturday','Sunday','Monday','Tuesday','Wednesday','Thursday','Friday']
const DAY_SHORT  = ['SAT','SUN','MON','TUE','WED','THU','FRI']

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('ga-admin')?.value
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Current week: Saturday → Friday
  const today = new Date()
  const dow = today.getDay()
  const satOffset = (dow - 6 + 7) % 7
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - satOffset)
  weekStart.setHours(0, 0, 0, 0)

  const dates = DAY_KEYS.map((dayKey, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return {
      date:       d.toLocaleDateString('en-CA'),
      dayKey,
      dayLabel:   DAY_NAMES[i],
      shortLabel: DAY_SHORT[i],
      monthDay:   d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }
  })

  const weekDates = dates.map(d => d.date)

  // Load assessor schedules (stored in SiteContent)
  const schedules = (await readContent('schedules')) || {}

  // Load confirmed bookings for this week from DB
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
  const availability = {}
  dates.forEach(({ date, dayKey }) => {
    availability[date] = {}
    Object.entries(schedules).forEach(([assessorId, data]) => {
      const slots = data.schedule?.[dayKey] || []
      slots.forEach(slotMin => {
        if (bookedSet.has(`${date}::${slotMin}::${assessorId}`)) return
        availability[date][slotMin] = (availability[date][slotMin] || 0) + 1
      })
    })
  })

  return NextResponse.json({ dates, availability })
}
