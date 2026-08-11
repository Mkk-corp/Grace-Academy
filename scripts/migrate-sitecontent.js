/**
 * One-time migration: moves operational data from SiteContent JSON blobs
 * into the proper relational tables added in the schema redesign.
 *
 * Safe to run multiple times — all writes are upserts or check for
 * existing rows before inserting.
 *
 * Usage:
 *   node scripts/migrate-sitecontent.js
 *
 * For production, set DATABASE_URL first:
 *   $env:DATABASE_URL="postgresql://..." ; node scripts/migrate-sitecontent.js
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function migrateSchedules() {
  const row = await prisma.siteContent.findUnique({ where: { key: 'schedules' } })
  if (!row?.data || typeof row.data !== 'object') {
    console.log('  schedules: nothing to migrate')
    return
  }

  let created = 0
  let skipped = 0

  for (const [userId, data] of Object.entries(row.data)) {
    if (!data?.schedule) { skipped++; continue }

    const userExists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } })
    if (!userExists) { skipped++; continue }

    await prisma.scheduleTemplate.upsert({
      where: { userId },
      update: { schedule: data.schedule },
      create: {
        userId,
        schedule: data.schedule,
        ...(data.lockedAt ? { createdAt: new Date(data.lockedAt) } : {}),
      },
    })
    created++
  }

  console.log(`  schedules → ScheduleTemplate: ${created} migrated, ${skipped} skipped`)
}

async function migrateSlotRequests() {
  const row = await prisma.siteContent.findUnique({ where: { key: 'slot-requests' } })
  if (!row?.data || !Array.isArray(row.data)) {
    console.log('  slot-requests: nothing to migrate')
    return
  }

  let created = 0
  let skipped = 0

  for (const r of row.data) {
    if (!r.assessorId || !r.proposedSchedule) { skipped++; continue }

    const userExists = await prisma.user.findUnique({ where: { id: r.assessorId }, select: { id: true } })
    if (!userExists) { skipped++; continue }

    // Deduplicate: match on assessorId + createdAt timestamp
    const createdAt = r.createdAt ? new Date(r.createdAt) : new Date()
    const existing = await prisma.slotRequest.findFirst({
      where: { assessorId: r.assessorId, createdAt },
    })
    if (existing) { skipped++; continue }

    await prisma.slotRequest.create({
      data: {
        assessorId:       r.assessorId,
        currentSchedule:  r.currentSchedule ?? null,
        proposedSchedule: r.proposedSchedule,
        reason:           r.reason ?? '',
        status:           r.status ?? 'pending',
        adminNote:        r.adminNote ?? null,
        resolvedAt:       r.resolvedAt ? new Date(r.resolvedAt) : null,
        resolvedById:     r.resolvedBy ?? null,
        resolvedByName:   r.resolvedByName ?? null,
        createdAt,
      },
    })
    created++
  }

  console.log(`  slot-requests → SlotRequest: ${created} migrated, ${skipped} skipped`)
}

async function migrateNotifications() {
  const row = await prisma.siteContent.findUnique({ where: { key: 'notifications' } })
  if (!row?.data || !Array.isArray(row.data)) {
    console.log('  notifications: nothing to migrate')
    return
  }

  let created = 0
  let skipped = 0

  for (const n of row.data) {
    if (!n.recipientType || !n.title || !n.body) { skipped++; continue }

    // For user notifications, verify the recipient still exists
    if (n.recipientType === 'user' && n.recipientId) {
      const userExists = await prisma.user.findUnique({ where: { id: n.recipientId }, select: { id: true } })
      if (!userExists) { skipped++; continue }
    }

    const createdAt = n.createdAt ? new Date(n.createdAt) : new Date()

    // Deduplicate: match on recipientId + type + createdAt
    const existing = await prisma.notification.findFirst({
      where: {
        recipientId: n.recipientId ?? null,
        type:        n.type ?? 'info',
        createdAt,
      },
    })
    if (existing) { skipped++; continue }

    await prisma.notification.create({
      data: {
        recipientType: n.recipientType,
        recipientId:   n.recipientId ?? null,
        type:          n.type ?? 'info',
        title:         n.title,
        body:          n.body,
        meta:          n.meta ?? {},
        read:          n.read ?? false,
        createdAt,
      },
    })
    created++
  }

  console.log(`  notifications → Notification: ${created} migrated, ${skipped} skipped`)
}

async function migrateAssessorPrefs() {
  const row = await prisma.siteContent.findUnique({ where: { key: 'assessor_prefs' } })
  if (!row?.data || typeof row.data !== 'object') {
    console.log('  assessor_prefs: nothing to migrate')
    return
  }

  let created = 0
  let skipped = 0

  for (const [userId, data] of Object.entries(row.data)) {
    const userExists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } })
    if (!userExists) { skipped++; continue }

    await prisma.assessorPreference.upsert({
      where:  { userId },
      update: { accent: data.accent || 'american', topics: data.topics || [] },
      create: { userId, accent: data.accent || 'american', topics: data.topics || [] },
    })
    created++
  }

  console.log(`  assessor_prefs → AssessorPreference: ${created} migrated, ${skipped} skipped`)
}

async function migrateScheduleLimits() {
  const row = await prisma.siteContent.findUnique({ where: { key: 'schedule_limits' } })
  if (!row?.data) {
    console.log('  schedule_limits: nothing to migrate (defaults will apply)')
    return
  }

  const d = row.data
  await prisma.scheduleConfig.upsert({
    where:  { id: 'default' },
    update: { minDays: d.minDays ?? 2, maxDays: d.maxDays ?? 5, minSlots: d.minSlots ?? 4, maxSlots: d.maxSlots ?? 32 },
    create: { id: 'default', minDays: d.minDays ?? 2, maxDays: d.maxDays ?? 5, minSlots: d.minSlots ?? 4, maxSlots: d.maxSlots ?? 32 },
  })

  console.log('  schedule_limits → ScheduleConfig: migrated')
}

async function main() {
  console.log('Grace Academy — SiteContent migration\n')

  await migrateSchedules()
  await migrateSlotRequests()
  await migrateNotifications()
  await migrateAssessorPrefs()
  await migrateScheduleLimits()

  console.log('\nDone.')
}

main()
  .catch(e => { console.error('\nMigration failed:', e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
