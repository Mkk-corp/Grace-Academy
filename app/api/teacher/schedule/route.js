import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireTeacher } from '@/lib/guard'
import { logAudit } from '@/lib/audit'

const REQUIRED_TOTAL = 16
const VALID_SLOT_SET = new Set(Array.from({ length: 30 }, (_, i) => 540 + i * 30))

function validateSchedule(schedule) {
  if (!schedule || typeof schedule !== 'object') return 'Invalid schedule format'
  const VALID_DAYS = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri']
  let total = 0
  for (const day of VALID_DAYS) {
    const slots = schedule[day]
    if (!slots) continue
    if (!Array.isArray(slots)) return 'Invalid schedule format'
    for (const slot of slots) {
      if (!VALID_SLOT_SET.has(Number(slot))) return `Invalid slot time: ${slot}. Slots must be between 9:00 AM and 11:30 PM`
    }
    total += slots.length
  }
  if (total < REQUIRED_TOTAL) return `Schedule must have at least ${REQUIRED_TOTAL} slots (currently has ${total})`
  return null
}

const SCHEDULE_CONFIG_DEFAULTS = { minDays: 2, maxDays: 5, minSlots: 4, maxSlots: 32 }

export async function GET() {
  const payload = await requireTeacher()
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [template, configRow] = await Promise.all([
    prisma.scheduleTemplate.findUnique({ where: { userId_type: { userId: payload.sub, type: 'teacher' } } }),
    prisma.scheduleConfig.findUnique({ where: { id: 'default' } }),
  ])

  const config = configRow
    ? { minDays: configRow.minDays, maxDays: configRow.maxDays, minSlots: configRow.minSlots, maxSlots: configRow.maxSlots }
    : SCHEDULE_CONFIG_DEFAULTS

  return NextResponse.json({ schedule: template?.schedule ?? null, config })
}

export async function POST(req) {
  const payload = await requireTeacher()
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const existing = await prisma.scheduleTemplate.findUnique({ where: { userId_type: { userId: payload.sub, type: 'teacher' } } })
  if (existing) {
    return NextResponse.json({ error: 'Schedule already exists. Contact admin to modify it.' }, { status: 409 })
  }

  const body = await req.json()
  const { schedule } = body

  const err = validateSchedule(schedule)
  if (err) return NextResponse.json({ error: err }, { status: 400 })

  const template = await prisma.scheduleTemplate.create({
    data: { userId: payload.sub, type: 'teacher', schedule },
  })

  const totalSlots = Object.values(schedule).reduce((s, v) => s + (Array.isArray(v) ? v.length : 0), 0)
  logAudit({
    actorId: payload.sub,
    actorName: payload.name || '',
    actorRole: 'teacher',
    action: 'schedule.created',
    entity: 'ScheduleTemplate',
    entityId: template.id,
    meta: { totalSlots },
  })

  return NextResponse.json({ success: true, data: { schedule: template.schedule, lockedAt: template.createdAt } })
}
