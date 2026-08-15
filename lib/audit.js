import { prisma } from '@/lib/db'

export async function logAudit({
  actorId   = null,
  actorName = null,
  actorRole = null,
  action,
  entity    = null,
  entityId  = null,
  meta      = {},
  ip        = null,
} = {}) {
  return prisma.auditLog.create({
    data: { actorId, actorName, actorRole, action, entity, entityId, meta, ip },
  }).catch(e => console.error('[audit]', e.message))
}
