import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/guard'
import { decryptId, encryptId } from '@/lib/urlCrypto'

async function getAdminUser() { return requireAdmin() }

export async function GET(request, { params }) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: rawId } = await params
  const id = decryptId(rawId) || rawId

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      report: true,
      student: {
        select: {
          id: true, name: true, email: true, phone: true, avatar: true,
          dob: true, gender: true, country: true, city: true, nationalId: true,
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
  })

  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ booking: { ...booking, encId: encryptId(booking.id) } })
}
