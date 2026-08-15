import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

const ADMIN_ONLY_PERMS = ['access_student_portal', 'access_assessor_portal', 'access_teacher_portal']
const DEFAULTS = { minDays: 2, maxDays: 5, minSlots: 4, maxSlots: 32 }

async function getAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get('ga-admin')?.value
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload?.userId) return null
  const user = await prisma.user.findUnique({ where: { id: payload.userId }, include: { role: true } })
  if (!user) return null
  const permissions = user.role?.permissions || []
  return permissions.some(p => !ADMIN_ONLY_PERMS.includes(p)) ? user : null
}

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
  if (activeDays < minDays) parts.push(`too few active days (${activeDays}/${minDays} minimum)`)
  if (activeDays > maxDays) parts.push(`too many active days (${activeDays}/${maxDays} maximum)`)
  return `Schedule limits updated. Your schedule requires adjustment: ${parts.join('; ')}. Please submit a schedule change request.`
}

export async function GET() {
  const admin = await getAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const config = await prisma.scheduleConfig.findUnique({ where: { id: 'default' } })
  const limits = config
    ? { minDays: config.minDays, maxDays: config.maxDays, minSlots: config.minSlots, maxSlots: config.maxSlots }
    : DEFAULTS

  return NextResponse.json({ limits })
}

export async function PUT(req) {
  const admin = await getAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const minDays  = parseInt(body.minDays,  10)
  const maxDays  = parseInt(body.maxDays,  10)
  const minSlots = parseInt(body.minSlots, 10)
  const maxSlots = parseInt(body.maxSlots, 10)

  if (isNaN(minDays) || isNaN(maxDays) || isNaN(minSlots) || isNaN(maxSlots)) {
    return NextResponse.json({ error: 'All values must be numbers' }, { status: 400 })
  }
  if (minDays < 1 || minDays > maxDays) return NextResponse.json({ error: 'minDays must be ≥ 1 and ≤ maxDays' }, { status: 400 })
  if (maxDays > 7)                      return NextResponse.json({ error: 'maxDays cannot exceed 7' }, { status: 400 })
  if (minSlots < 1 || minSlots > maxSlots) return NextResponse.json({ error: 'minSlots must be ≥ 1 and ≤ maxSlots' }, { status: 400 })

  const limits = { minDays, maxDays, minSlots, maxSlots }
  await prisma.scheduleConfig.upsert({
    where:  { id: 'default' },
    update: limits,
    create: { id: 'default', ...limits },
  })

  // ── Notify all staff of the change and flag non-compliant assessors ──────
  try {
    const [assessorRoles, teacherRoles] = await Promise.all([
      prisma.role.findMany({ where: { permissions: { has: 'access_assessor_portal' } }, select: { id: true } }),
      prisma.role.findMany({ where: { permissions: { has: 'access_teacher_portal' } }, select: { id: true } }),
    ])

    const staffRoleIds = [...assessorRoles, ...teacherRoles].map(r => r.id)

    const staffUsers = staffRoleIds.length
      ? await prisma.user.findMany({
          where: { roleId: { in: staffRoleIds } },
          select: { id: true, scheduleTemplate: { select: { schedule: true } } },
        })
      : []

    const notifData = []

    // Broadcast to all admins
    notifData.push({
      recipientType: 'admin',
      recipientId: null,
      type: 'schedule_limits_updated',
      title: 'Schedule Limits Updated',
      body: `Schedule slot limits have been changed to: ${minSlots}–${maxSlots} slots, ${minDays}–${maxDays} active days.`,
      meta: limits,
    })

    for (const u of staffUsers) {
      const dayMap = u.scheduleTemplate?.schedule ?? null

      if (!dayMap) {
        // No schedule yet — just inform
        notifData.push({
          recipientType: 'user', recipientId: u.id,
          type: 'schedule_limits_updated',
          title: 'Schedule Limits Updated',
          body: `The academy has updated schedule requirements: ${minSlots}–${maxSlots} slots across ${minDays}–${maxDays} days.`,
          meta: { ...limits, compliant: null },
        })
        continue
      }

      const { totalSlots, activeDays } = countScheduleStats(dayMap)
      const slotOk = totalSlots >= minSlots && totalSlots <= maxSlots
      const dayOk  = activeDays >= minDays  && activeDays <= maxDays
      const compliant = slotOk && dayOk

      if (compliant) {
        notifData.push({
          recipientType: 'user', recipientId: u.id,
          type: 'schedule_limits_updated',
          title: 'Schedule Limits Updated — You\'re Compliant',
          body: `Slot limits changed. Your schedule (${totalSlots} slots, ${activeDays} days) already meets the new requirements.`,
          meta: { ...limits, totalSlots, activeDays, compliant: true },
        })
      } else {
        notifData.push({
          recipientType: 'user', recipientId: u.id,
          type: 'schedule_compliance_required',
          title: 'Schedule Update Required',
          body: violationBody(totalSlots, activeDays, minSlots, maxSlots, minDays, maxDays),
          meta: { ...limits, totalSlots, activeDays, compliant: false },
        })
      }
    }

    if (notifData.length) await prisma.notification.createMany({ data: notifData })
  } catch (e) {
    console.error('[schedule-limits] notification error:', e.message)
  }
  // ────────────────────────────────────────────────────────────────────────

  return NextResponse.json({ ok: true, limits })
}
