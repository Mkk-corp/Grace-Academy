const { PrismaClient } = require('../lib/generated/prisma')
const { readFileSync } = require('fs')
const { join } = require('path')

const prisma = new PrismaClient()

function readJson(filename) {
  try {
    return JSON.parse(readFileSync(join(process.cwd(), 'data', filename), 'utf8'))
  } catch {
    return null
  }
}

async function main() {
  console.log('Seeding database from JSON files...')

  // 1. Roles
  const roles = readJson('roles.json') || []
  for (const role of roles) {
    await prisma.role.upsert({
      where: { id: role.id },
      update: { name: role.name, description: role.description || '', permissions: role.permissions || [] },
      create: { id: role.id, name: role.name, description: role.description || '', permissions: role.permissions || [] },
    })
  }
  console.log(`  ✓ ${roles.length} roles`)

  // 2. Users (roles must exist first)
  const users = readJson('users.json') || []
  for (const raw of users) {
    const { updatedAt, passwordHistory, createdAt, ...fields } = raw
    // Ensure nullable fields are explicitly null if missing
    const data = {
      name: fields.name || '',
      username: fields.username || '',
      email: fields.email,
      phone: fields.phone || '',
      password: fields.password ?? null,
      googleId: fields.googleId ?? null,
      avatar: fields.avatar ?? null,
      roleId: fields.roleId ?? null,
      source: fields.source || 'website',
      forcePasswordReset: fields.forcePasswordReset || false,
      passwordHistory: passwordHistory || [],
      createdAt: createdAt ? new Date(createdAt) : new Date(),
    }
    await prisma.user.upsert({
      where: { id: raw.id },
      update: data,
      create: { id: raw.id, ...data },
    })
  }
  console.log(`  ✓ ${users.length} users`)

  // 3. Site content (blog, services, portfolio, faq, pricing, stats, content)
  const contentKeys = ['blog', 'services', 'portfolio', 'faq', 'pricing', 'stats', 'content']
  let seededContent = 0
  for (const key of contentKeys) {
    const data = readJson(`${key}.json`)
    if (data !== null) {
      await prisma.siteContent.upsert({
        where: { key },
        update: { data },
        create: { key, data },
      })
      seededContent++
    }
  }
  console.log(`  ✓ ${seededContent} content collections`)

  // 4. Contact messages
  const contacts = readJson('contact.json') || []
  for (const c of contacts) {
    const { submittedAt, id, ...fields } = c
    await prisma.contactMessage.upsert({
      where: { id: id || `msg${Date.now()}` },
      update: {
        name: fields.name || '',
        email: fields.email || '',
        phone: fields.phone || '',
        message: fields.message || '',
        read: fields.read || false,
        submittedAt: submittedAt ? new Date(submittedAt) : new Date(),
      },
      create: {
        id: id || `msg${Date.now()}`,
        name: fields.name || '',
        email: fields.email || '',
        phone: fields.phone || '',
        message: fields.message || '',
        read: fields.read || false,
        submittedAt: submittedAt ? new Date(submittedAt) : new Date(),
      },
    })
  }
  console.log(`  ✓ ${contacts.length} contact messages`)

  console.log('Seed complete.')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
