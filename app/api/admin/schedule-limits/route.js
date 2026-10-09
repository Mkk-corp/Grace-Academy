import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { logAudit } from '@/lib/audit'
import { requireAdmin } from '@/lib/guard'

const ASSESSOR_DEFAULTS = { minDays: 2, maxDays: 5, minSlots: 4,  maxSlots: 32 }
const TEACHER_DEFAULTS  = { minDays: 2, maxDays: 7, minSlots: 8,  maxSlots: 30 }

async function getAdmin() { return requireAdmin() }

function countScheduleStats(dayMap) {
  if (!dayMap || typeof dayMap !== 'object') return { totalSlots: 0, activeDays: 0 }
  const totalSlots = Object.values(dayMap).reduce((s, v) => s + (Array.isArray(v) ? v.length : 0), 0)
  const activeDays = Object.keys(dayMap).filter(k => Array.isArray(dayMap[k]) && dayMap[k].length > 0).length
  return { totalSlots, activeDays }
}

function violationBody(totalSlots, activeDays, minSlots, maxSlots, minDays, maxDays) {
  const parts = []
  if (totalSlots < minSlots) parts.push(`too few slots (${totalSlots}/${minSlots} minimum)`)
  if (totalSlots > maxSlots) parts.push(`too many slots (${totalSlots}/${maxSlots} maximum)`)
  if (activeDays < minDays)  parts.push(`too few active days (${activeDays}/${minDays} minimum)`)
  if (activeDays > maxDays)  parts.push(`too many active days (${activeDays}/${maxDays} maximum)`)
  return `Schedule limits updated. Your schedule requires adjustment: ${parts.join('; ')}. Please submit a schedule change request.`
}

function pick(row) {
  if (!row) return null
  return { minDays: row.minDays, maxDays: row.maxDays, minSlots: row.minSlots, maxSlots: row.maxSlots }
}

export async function GET() {
  const admin = await getAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const configs = await prisma.scheduleConfig.findMany({
    where: { id: { in: ['assessor', 'teacher', 'default'] } },
  })
  const byId = Object.fromEntries(configs.map(c => [c.id, c]))

  return NextResponse.json({
    assessor: pick(byId.assessor ?? byId.default) ?? ASSESSOR_DEFAULTS,
    teacher:  pick(byId.teacher)                  ?? TEACHER_DEFAULTS,
  })
}

export async function PUT(req) {
  const admin = await getAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const type = body.type === 'teacher' ? 'teacher' : 'assessor'

  const minDays  = parseInt(body.minDays,  10)
  const maxDays  = parseInt(body.maxDays,  10)
  const minSlots = parseInt(body.minSlots, 10)
  const maxSlots = parseInt(body.maxSlots, 10)

  if (isNaN(minDays) || isNaN(maxDays) || isNaN(minSlots) || isNaN(maxSlots))
    return NextResponse.json({ error: 'All values must be numbers' }, { status: 400 })
  if (minDays < 1 || minDays > maxDays)
    return NextResponse.json({ error: 'minDays must be ≥ 1 and ≤ maxDays' }, { status: 400 })
  if (maxDays > 7)
    return NextResponse.json({ error: 'maxDays cannot exceed 7' }, { status: 400 })
  if (minSlots < 1 || minSlots > maxSlots)
    return NextResponse.json({ error: 'minSlots must be ≥ 1 and ≤ maxSlots' }, { status: 400 })

  const limits = { minDays, maxDays, minSlots, maxSlots }
  await prisma.scheduleConfig.upsert({
    where:  { id: type },
    update: limits,
    create: { id: type, ...limits },
  })

  // ── Notify the relevant group ─────────────────────────────────────────
  try {
    const permKey = type === 'teacher' ? 'access_teacher_portal' : 'access_assessor_portal'
    const roles   = await prisma.role.findMany({ where: { permissions: { has: permKey } }, select: { id: true } })
    const roleIds = roles.map(r => r.id)

    const users = roleIds.length
      ? await prisma.user.findMany({
          where: { roleId: { in: roleIds } },
          select: { id: true, scheduleTemplates: { where: { type }, select: { schedule: true } } },
        })
      : []

    const groupLabel = type === 'teacher' ? 'Teacher' : 'Consultant'
    const notifData = [{
      recipientType: 'admin', recipientId: null,
      type: 'schedule_limits_updated',
      title: `${groupLabel} Schedule Limits Updated`,
      body:  `${groupLabel} slot limits changed to: ${minSlots}–${maxSlots} slots, ${minDays}–${maxDays} days.`,
      meta:  { ...limits, scheduleType: type },
    }]

    const portalPath = type === 'teacher' ? '/teacher' : '/assessor'

    for (const u of users) {
      const dayMap = u.scheduleTemplates?.[0]?.schedule ?? null
      if (!dayMap) {
        notifData.push({
          recipientType: 'user', recipientId: u.id,
          type: 'schedule_limits_updated',
          title: 'Schedule Limits Updated',
          body:  `The academy has updated schedule requirements: ${minSlots}–${maxSlots} slots across ${minDays}–${maxDays} days.`,
          meta:  { ...limits, scheduleType: type, compliant: null, portalPath },
        })
        continue
      }

      const { totalSlots, activeDays } = countScheduleStats(dayMap)
      const compliant = totalSlots >= minSlots && totalSlots <= maxSlots
                     && activeDays >= minDays   && activeDays <= maxDays

      notifData.push(compliant ? {
        recipientType: 'user', recipientId: u.id,
        type: 'schedule_limits_updated',
        title: "Schedule Limits Updated — You're Compliant",
        body:  `Slot limits changed. Your schedule (${totalSlots} slots, ${activeDays} days) already meets the new requirements.`,
        meta:  { ...limits, scheduleType: type, totalSlots, activeDays, compliant: true, portalPath },
      } : {
        recipientType: 'user', recipientId: u.id,
        type: 'schedule_compliance_required',
        title: 'Schedule Update Required',
        body:  violationBody(totalSlots, activeDays, minSlots, maxSlots, minDays, maxDays),
        meta:  { ...limits, scheduleType: type, totalSlots, activeDays, compliant: false, portalPath },
      })
    }

    if (notifData.length) await prisma.notification.createMany({ data: notifData })
  } catch (e) {
    console.error('[schedule-limits] notification error:', e.message)
  }
  // ──────────────────────────────────────────────────────────────────────

  logAudit({ actorId: admin?.id, actorName: admin?.name, actorRole: 'admin', action: 'schedule_limits.updated', entity: 'ScheduleConfig', entityId: type, meta: { ...limits, scheduleType: type } })
  return NextResponse.json({ ok: true, type, limits })
}
