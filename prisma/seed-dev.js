const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const crypto = require('crypto')
const fs   = require('fs')
const path = require('path')

// Load .env.local (Next.js doesn't expose it to node scripts automatically)
function loadEnvLocal() {
  const envPath = path.join(__dirname, '..', '.env.local')
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq  = trimmed.indexOf('=')
    if (eq < 0) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim()
    if (!process.env[key]) process.env[key] = val
  }
}

loadEnvLocal()

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma  = new PrismaClient({ adapter })

const ROLES = [
  { id: 'r_admin',    name: 'Administrator',        description: 'Full access to all features',                              permissions: ['manage_users','manage_roles','manage_content','manage_blog','manage_services','manage_portfolio','manage_faq','manage_pricing','manage_stats','view_messages','access_student_portal'] },
  { id: 'r_editor',   name: 'Content Editor',       description: 'Can manage website content and media',                     permissions: ['manage_content','manage_blog','manage_services','manage_portfolio','manage_faq','manage_pricing','manage_stats'] },
  { id: 'r_viewer',   name: 'Viewer',               description: 'Can view contact messages only',                           permissions: ['view_messages'] },
  { id: 'r_student',  name: 'Student',              description: 'Enrolled students with access to the student portal',      permissions: ['access_student_portal'] },
  { id: 'r_assessor', name: 'Academic Consultant',  description: 'Academic consultants who conduct and manage assessments',  permissions: ['access_assessor_portal'] },
  { id: 'r_teacher',  name: 'Teacher',              description: 'Teachers who deliver courses and manage student learning',  permissions: ['access_teacher_portal'] },
]

const DEV_ADMIN = {
  id:       'dev_admin_001',
  name:     process.env.DEV_ADMIN_NAME     || 'Dev Admin',
  username: process.env.DEV_ADMIN_USERNAME || 'devadmin',
  email:    process.env.DEV_ADMIN_EMAIL    || 'devadmin@grace.local',
  password: process.env.DEV_ADMIN_PASSWORD || 'DevAdmin@Grace2024',
  roleId:   'r_admin',
}

async function main() {
  console.log('\nSeeding dev database...\n')

  for (const role of ROLES) {
    await prisma.role.upsert({
      where:  { id: role.id },
      update: { name: role.name, description: role.description, permissions: role.permissions },
      create: role,
    })
  }
  console.log(`  ✓ ${ROLES.length} roles`)

  await prisma.user.upsert({
    where:  { email: DEV_ADMIN.email },
    update: { name: DEV_ADMIN.name, username: DEV_ADMIN.username, roleId: DEV_ADMIN.roleId },
    create: {
      id:       DEV_ADMIN.id,
      name:     DEV_ADMIN.name,
      username: DEV_ADMIN.username,
      email:    DEV_ADMIN.email,
      password: hashPassword(DEV_ADMIN.password),
      roleId:   DEV_ADMIN.roleId,
    },
  })
  console.log('  ✓ Admin user\n')

  console.log('─────────────────────────────────────')
  console.log('  DEV ADMIN CREDENTIALS')
  console.log('─────────────────────────────────────')
  console.log(`  Email    : ${DEV_ADMIN.email}`)
  console.log(`  Username : ${DEV_ADMIN.username}`)
  console.log(`  Password : ${DEV_ADMIN.password}`)
  console.log(`  Role     : Administrator (full access)`)
  console.log('─────────────────────────────────────\n')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
