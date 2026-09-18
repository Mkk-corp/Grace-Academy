import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/guard'
import { encryptId } from '@/lib/urlCrypto'

async function getAdminUser() { return requireAdmin() }

export async function GET() {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const bookings = await prisma.booking.findMany({
    include: {
      report: true,
      student: {
        select: {
          id: true, name: true, email: true, phone: true, avatar: true,
          dob: true, gender: true, country: true, city: true,
          educationLevel: true, coursesTaken: true, expectedLevel: true,
          isEmployed: true, jobTitle: true, employer: true,
          faculty: true, university: true, englishLevel: true, bio: true,
        },
      },
      assessor: {
        select: {
          id: true, name: true, email: true, phone: true, avatar: true,
          bio: true, country: true, city: true,
        },
      },
    },
    orderBy: [{ date: 'desc' }, { slotMin: 'asc' }],
  })

  return NextResponse.json({ bookings: bookings.map(b => ({ ...b, encId: encryptId(b.id) })) })
}
