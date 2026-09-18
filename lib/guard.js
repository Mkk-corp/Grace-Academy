import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { ADMIN_PANEL_PERMS } from '@/lib/permissions'

async function getPayload() {
  const jar = await cookies()
  const token = jar.get('ga-admin')?.value
  if (!token) return null
  return verifyToken(token) || null
}

// Any authenticated user
export async function requireAuth() {
  return getPayload()
}

// Admin panel access — r_admin role OR has admin panel permissions
export async function requireAdmin() {
  const payload = await getPayload()
  if (!payload) return null
  if (payload.roleId === 'r_admin' || payload.adm === 1) return payload
  return null
}

// Assessor portal access
export async function requireAssessor() {
  const payload = await getPayload()
  if (!payload) return null
  if (payload.roleId === 'r_admin' || payload.adm === 1) return payload // admins can access all
  if (payload.asr === 1 || payload.roleId === 'r_assessor') return payload
  return null
}

// Teacher portal access
export async function requireTeacher() {
  const payload = await getPayload()
  if (!payload) return null
  if (payload.roleId === 'r_admin' || payload.adm === 1) return payload
  if (payload.tch === 1 || payload.roleId === 'r_teacher') return payload
  return null
}
