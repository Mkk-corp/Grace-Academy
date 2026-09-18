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
      // Portal access
      'access_student_portal', 'access_assessor_portal', 'access_teacher_portal',
      // Placement
      'placement.view', 'placement.attend', 'placement.request', 'placement.conduct',
      'placement.add_report', 'placement.edit_report', 'placement.delete_report',
      'placement.view_own_reports', 'placement.view_all_reports',
      'placement.accept_request', 'placement.reject_request',
      'placement.manage_schedule', 'placement.cancel_session',
      // Courses
      'courses.view', 'courses.add', 'courses.edit', 'courses.delete',
      'categories.view', 'categories.add', 'categories.edit', 'categories.delete',
      // Users & Roles
      'users.view', 'users.add', 'users.edit', 'users.delete',
      'roles.view', 'roles.add', 'roles.edit', 'roles.delete',
      // Blog
      'blog.view', 'blog.add', 'blog.edit', 'blog.delete',
      // Website Content
      'content.view', 'content.edit',
      'services.view', 'services.add', 'services.edit', 'services.delete',
      'portfolio.view', 'portfolio.add', 'portfolio.edit', 'portfolio.delete',
      'faq.view', 'faq.add', 'faq.edit', 'faq.delete',
      'pricing.view', 'pricing.edit',
      'stats.view', 'stats.edit',
      // Communications
      'messages.view', 'messages.delete',
      // Payroll
      'payroll.view_own', 'payroll.view_all', 'payroll.add', 'payroll.edit', 'payroll.delete',
      // Administration
      'audit.view',
    ],
  },
  {
    id: 'r_student',
    name: 'Student',
    description: 'Enrolled students with access to the student portal',
    isSystem: true,
    permissions: [
      'access_student_portal',
      'courses.view',
      'placement.attend',
      'placement.request',
      'placement.view_own_reports',
    ],
  },
  {
    id: 'r_assessor',
    name: 'Academic Consultant',
    description: 'Academic consultants who conduct and manage placement assessments',
    isSystem: true,
    permissions: [
      'access_assessor_portal',
      'placement.view',
      'placement.conduct',
      'placement.add_report',
      'placement.edit_report',
      'placement.view_own_reports',
      'placement.view_all_reports',
      'placement.accept_request',
      'placement.reject_request',
      'placement.manage_schedule',
      'placement.cancel_session',
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
      'payroll.view_own',
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
