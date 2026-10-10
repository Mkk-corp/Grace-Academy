import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/guard'
import { logAudit } from '@/lib/audit'
import { sendCourseAssignmentEmail } from '@/lib/mailer'
import { headers } from 'next/headers'
import { decryptId } from '@/lib/urlCrypto'

// GET ?courseId=xxx — all teachers with assignment status for a course
export async function GET(req) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const rawCourseId = searchParams.get('courseId')
  if (!rawCourseId) return NextResponse.json({ error: 'courseId required' }, { status: 400 })
  const courseId = decryptId(rawCourseId) || rawCourseId

  const teacherRoles = await prisma.role.findMany({
    where: { permissions: { has: 'access_teacher_portal' } },
    select: { id: true },
  })
  const teacherRoleIds = teacherRoles.map(r => r.id)

  const [teachers, assigned, course] = await Promise.all([
    prisma.user.findMany({
      where: { roleId: { in: teacherRoleIds } },
      select: { id: true, name: true, email: true, avatar: true, phone: true, englishLevel: true },
      orderBy: { name: 'asc' },
    }),
    prisma.teacherCourse.findMany({
      where: { courseId },
      select: { userId: true, assignedAt: true },
    }),
    prisma.course.findUnique({ where: { id: courseId }, select: { level: true } }),
  ])

  const LEVEL_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  const courseLevel = course?.level || null
  const courseLevelIdx = LEVEL_ORDER.indexOf(courseLevel)

  function extractLevel(str) {
    if (!str) return null
    const up = str.toUpperCase().trim()
    return LEVEL_ORDER.find(l => up.startsWith(l)) || null
  }

  const assignedSet = new Map(assigned.map(a => [a.userId, a.assignedAt]))

  return NextResponse.json({
    courseLevel,
    teachers: teachers.map(t => {
      const tl = extractLevel(t.englishLevel)
      const tlIdx = LEVEL_ORDER.indexOf(tl)
      return {
        ...t,
        isAssigned: assignedSet.has(t.id),
        assignedAt: assignedSet.get(t.id) || null,
        isEligible: courseLevel === null || (tlIdx !== -1 && tlIdx >= courseLevelIdx),
      }
    }),
  })
}

// POST { courseId, userId } — assign teacher to course
export async function POST(req) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { courseId: rawCourseId, userId } = await req.json()
  if (!rawCourseId || !userId) return NextResponse.json({ error: 'courseId and userId required' }, { status: 400 })
  const courseId = decryptId(rawCourseId) || rawCourseId

  const [course, teacher] = await Promise.all([
    prisma.course.findUnique({ where: { id: courseId }, include: { category: { select: { nameEn: true, nameAr: true } } } }),
    prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true } }),
  ])
  if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  if (!teacher) return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })

  await prisma.teacherCourse.upsert({
    where: { userId_courseId: { userId, courseId } },
    create: { userId, courseId },
    update: {},
  })

  await prisma.course.update({
    where: { id: courseId },
    data: { teacherCount: { increment: 0 } }, // keep count synced via query
  })

  // Re-count teachers
  const count = await prisma.teacherCourse.count({ where: { courseId } })
  await prisma.course.update({ where: { id: courseId }, data: { teacherCount: count } })

  const hdrs = await headers()
  await logAudit({
    actorId: admin.sub, actorName: admin.name, actorRole: 'admin',
    action: 'assign_teacher', entity: 'Course', entityId: courseId,
    meta: { teacherId: userId, teacherName: teacher.name, courseNameEn: course.nameEn },
    ip: hdrs.get('x-forwarded-for') || '',
  })

  // In-app notification
  await prisma.notification.create({
    data: {
      recipientType: 'user',
      recipientId: userId,
      type: 'course_assigned',
      title: 'New Course Assigned',
      body: `You have been assigned to teach "${course.nameEn}".`,
      meta: { courseId, courseNameEn: course.nameEn, courseNameAr: course.nameAr, portalPath: '/teacher' },
    },
  })

  // Send assignment email (non-blocking)
  sendCourseAssignmentEmail({
    to: teacher.email,
    name: teacher.name,
    courseNameEn: course.nameEn,
    courseNameAr: course.nameAr,
    categoryName: course.category?.nameEn || '',
    sessions: course.durationSessions,
    months: course.durationMonths,
    level: course.level,
  }).catch(() => {})

  return NextResponse.json({ ok: true })
}

// DELETE { courseId, userId } — remove teacher from course
export async function DELETE(req) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { courseId: rawCourseId, userId } = await req.json()
  if (!rawCourseId || !userId) return NextResponse.json({ error: 'courseId and userId required' }, { status: 400 })
  const courseId = decryptId(rawCourseId) || rawCourseId

  const course = await prisma.course.findUnique({ where: { id: courseId }, select: { nameEn: true, nameAr: true } })

  await prisma.teacherCourse.deleteMany({ where: { userId, courseId } })

  const count = await prisma.teacherCourse.count({ where: { courseId } })
  await prisma.course.update({ where: { id: courseId }, data: { teacherCount: count } })

  // In-app notification
  await prisma.notification.create({
    data: {
      recipientType: 'user',
      recipientId: userId,
      type: 'course_unassigned',
      title: 'Course Removed',
      body: `You have been removed from "${course?.nameEn || 'a course'}".`,
      meta: { courseId, courseNameEn: course?.nameEn, courseNameAr: course?.nameAr, portalPath: '/teacher' },
    },
  })

  const hdrs = await headers()
  await logAudit({
    actorId: admin.sub, actorName: admin.name, actorRole: 'admin',
    action: 'unassign_teacher', entity: 'Course', entityId: courseId,
    meta: { teacherId: userId },
    ip: hdrs.get('x-forwarded-for') || '',
  })

  return NextResponse.json({ ok: true })
}
