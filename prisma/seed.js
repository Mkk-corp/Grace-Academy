const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const ROLES = [
  { id: 'r_admin',    name: 'Administrator',  description: 'Full access to all features',                           permissions: ['manage_users','manage_roles','manage_content','manage_blog','manage_services','manage_portfolio','manage_faq','manage_pricing','manage_stats','view_messages','access_student_portal'] },
  { id: 'r_editor',   name: 'Content Editor', description: 'Can manage website content and media',                  permissions: ['manage_content','manage_blog','manage_services','manage_portfolio','manage_faq','manage_pricing','manage_stats'] },
  { id: 'r_viewer',   name: 'Viewer',         description: 'Can view contact messages only',                        permissions: ['view_messages'] },
  { id: 'r_student',  name: 'Student',        description: 'Enrolled students with access to the student portal',   permissions: ['access_student_portal'] },
  { id: 'r_assessor', name: 'Academic Consultant', description: 'Academic consultants who conduct and manage assessments', permissions: ['access_assessor_portal'] },
  { id: 'r_teacher',  name: 'Teacher',        description: 'Teachers who deliver courses and manage student learning',permissions: ['access_teacher_portal'] },
]

async function main() {
  console.log('Seeding database...')

  for (const role of ROLES) {
    await prisma.role.upsert({
      where: { id: role.id },
      update: { name: role.name, description: role.description, permissions: role.permissions },
      create: role,
    })
  }
  console.log(`  ✓ ${ROLES.length} roles`)

  console.log('Seed complete. Users and content are managed via the admin panel.')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
