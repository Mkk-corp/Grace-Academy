import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis

function createPrisma() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrisma()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function readContent(key) {
  try {
    const row = await prisma.siteContent.findUnique({ where: { key } })
    return row?.data ?? null
  } catch (err) {
    console.error(`[readContent] key=${key}`, err.message)
    return null
  }
}

export async function writeContent(key, data) {
  await prisma.siteContent.upsert({
    where: { key },
    update: { data },
    create: { key, data },
  })
}
