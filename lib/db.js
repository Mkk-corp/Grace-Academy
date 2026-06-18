import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function readContent(key) {
  const row = await prisma.siteContent.findUnique({ where: { key } })
  return row?.data ?? null
}

export async function writeContent(key, data) {
  await prisma.siteContent.upsert({
    where: { key },
    update: { data },
    create: { key, data },
  })
}
