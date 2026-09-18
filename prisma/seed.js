const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const ROLES = [
  {
    id: 'r_admin',
    name: 'Administrator',
    description: 'Full access to all features and administration',
    isSystem: true,
    permissions: [
      'manage_users', 'manage_roles', 'manage_content', 'manage_blog',
      'manage_services', 'manage_portfolio', 'manage_faq', 'manage_pricing',
      'manage_stats', 'view_messages', 'audit.view', 'payroll.manage',
      'access_student_portal', 'access_assessor_portal', 'access_teacher_portal',
      'placement.conduct', 'placement.write_report', 'placement.view_all_reports',
      'placement.manage_schedule', 'placement.manage_requests', 'placement.manage_sessions',
      'courses.view', 'courses.manage', 'categories.manage',
      'payroll.view_own',
    ],
  },
  {
    id: 'r_student',
    name: 'Student',
    description: 'Enrolled students with access to the student portal',
    isSystem: true,
    permissions: [
      'access_student_portal',
      'placement.attend',
      'placement.view_own_reports',
      'courses.view',
    ],
  },
  {
    id: 'r_assessor',
    name: 'Academic Consultant',
    description: 'Academic consultants who conduct and manage placement assessments',
    isSystem: true,
    permissions: [
      'access_assessor_portal',
      'placement.conduct',
      'placement.write_report',
      'placement.view_own_reports',
      'placement.manage_schedule',
      'placement.manage_requests',
      'courses.view',
      'payroll.view_own',
    ],
  },
  {
    id: 'r_teacher',
    name: 'Teacher',
    description: 'Teachers who deliver courses and support student learning',
    isSystem: true,
    permissions: [
      'access_teacher_portal',
      'courses.view',
    ],
  },
]

async function main() {
  console.log('Seeding database...')

  for (const role of ROLES) {
    await prisma.role.upsert({
      where: { id: role.id },
      update: {
        name: role.name,
        description: role.description,
        permissions: role.permissions,
        isSystem: role.isSystem,
      },
      create: role,
    })
  }
  console.log(`  ✓ ${ROLES.length} system roles`)

  console.log('Seed complete. Users and content are managed via the admin panel.')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
