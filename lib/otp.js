import crypto from 'crypto'
import { prisma } from '@/lib/db'

const OTP_TTL_MS = 3 * 60 * 1000    // 3 minutes
const LOCK_MS    = 15 * 60 * 1000   // 15 minutes
const MAX_RESENDS = 3

function hashOtp(otp) {
  return crypto.createHash('sha256').update(otp).digest('hex')
}

export async function checkLock(email) {
  const s = await prisma.otpSession.findUnique({ where: { email: email.toLowerCase() } })
  if (!s?.lockedUntil) return null
  const remaining = s.lockedUntil.getTime() - Date.now()
  if (remaining > 0) return Math.ceil(remaining / 1000)
  return null
}

export async function generateAndStoreOtp(email, existingSession = null) {
  const otp = String(Math.floor(10000000 + Math.random() * 90000000))
  const resendCount = existingSession ? existingSession.resendCount + 1 : 0
  const lockedUntil = resendCount >= MAX_RESENDS ? new Date(Date.now() + LOCK_MS) : null

  await prisma.otpSession.upsert({
    where: { email: email.toLowerCase() },
    update: {
      otpHash: hashOtp(otp),
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
      resendCount,
      lockedUntil,
      createdAt: new Date(),
    },
    create: {
      email: email.toLowerCase(),
      otpHash: hashOtp(otp),
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
      resendCount,
      lockedUntil,
    },
  })

  return { otp, locked: !!lockedUntil, resendCount }
}

export async function verifyOtp(email, otp) {
  const s = await prisma.otpSession.findUnique({ where: { email: email.toLowerCase() } })
  if (!s) return { ok: false, error: 'No OTP request found for this email.' }

  if (s.lockedUntil && s.lockedUntil > new Date()) {
    const secs = Math.ceil((s.lockedUntil.getTime() - Date.now()) / 1000)
    return { ok: false, error: 'locked', lockedSeconds: secs }
  }

  if (s.expiresAt < new Date()) return { ok: false, error: 'OTP has expired.' }
  if (s.otpHash !== hashOtp(otp))  return { ok: false, error: 'OTP does not match.' }

  await prisma.otpSession.update({
    where: { email: email.toLowerCase() },
    data: { otpHash: '', expiresAt: new Date(0) },
  })

  return { ok: true }
}

export async function clearSession(email) {
  await prisma.otpSession.deleteMany({ where: { email: email.toLowerCase() } })
}

export async function getResendInfo(email) {
  const s = await prisma.otpSession.findUnique({ where: { email: email.toLowerCase() } })
  if (!s) return { resendCount: 0, canResend: true }
  const resendCount = s.resendCount || 0
  const isLocked = s.lockedUntil && s.lockedUntil > new Date()
  return {
    resendCount,
    canResend: resendCount < MAX_RESENDS && !isLocked,
    lockedUntil: s.lockedUntil || null,
  }
}
