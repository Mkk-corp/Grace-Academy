import crypto from 'crypto'
import { readData, writeData } from '@/lib/db'

const FILE = 'otp-sessions.json'
const OTP_TTL_MS = 3 * 60 * 1000    // 3 minutes
const LOCK_MS = 15 * 60 * 1000      // 15 minutes
const MAX_RESENDS = 3

function hashOtp(otp) {
  return crypto.createHash('sha256').update(otp).digest('hex')
}

function loadSessions() {
  try { return readData(FILE) } catch { return [] }
}

function saveSession(session) {
  const sessions = loadSessions().filter(s => s.email !== session.email)
  sessions.push(session)
  writeData(FILE, sessions)
}

function getSession(email) {
  return loadSessions().find(s => s.email.toLowerCase() === email.toLowerCase()) || null
}

export function checkLock(email) {
  const s = getSession(email)
  if (!s || !s.lockedUntil) return null
  const remaining = new Date(s.lockedUntil) - Date.now()
  if (remaining > 0) return Math.ceil(remaining / 1000)
  return null
}

export function generateAndStoreOtp(email, existingSession = null) {
  const otp = String(Math.floor(10000000 + Math.random() * 90000000)) // 8 digits
  const resendCount = existingSession ? existingSession.resendCount + 1 : 0

  const lockedUntil = resendCount >= MAX_RESENDS
    ? new Date(Date.now() + LOCK_MS).toISOString()
    : null

  saveSession({
    email: email.toLowerCase(),
    otpHash: hashOtp(otp),
    expiresAt: new Date(Date.now() + OTP_TTL_MS).toISOString(),
    resendCount,
    lockedUntil,
    createdAt: new Date().toISOString(),
  })

  return { otp, locked: !!lockedUntil, resendCount }
}

export function verifyOtp(email, otp) {
  const s = getSession(email.toLowerCase())
  if (!s) return { ok: false, error: 'No OTP request found for this email.' }

  if (s.lockedUntil && new Date(s.lockedUntil) > new Date()) {
    const secs = Math.ceil((new Date(s.lockedUntil) - Date.now()) / 1000)
    return { ok: false, error: 'locked', lockedSeconds: secs }
  }

  if (new Date(s.expiresAt) < new Date()) return { ok: false, error: 'OTP has expired.' }
  if (s.otpHash !== hashOtp(otp)) return { ok: false, error: 'OTP does not match.' }

  // Invalidate after successful use
  saveSession({ ...s, otpHash: '', expiresAt: new Date(0).toISOString() })
  return { ok: true }
}

export function clearSession(email) {
  const sessions = loadSessions().filter(s => s.email !== email.toLowerCase())
  writeData(FILE, sessions)
}

export function getResendInfo(email) {
  const s = getSession(email.toLowerCase())
  if (!s) return { resendCount: 0, canResend: true }
  const resendCount = s.resendCount || 0
  return {
    resendCount,
    canResend: resendCount < MAX_RESENDS && !s.lockedUntil,
    lockedUntil: s.lockedUntil || null,
  }
}
