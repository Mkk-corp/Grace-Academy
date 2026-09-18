export const PERMISSION_GROUPS = [
  {
    id: 'portal_access',
    labelEn: 'Portal Access',
    labelAr: 'الوصول للبوابات',
    icon: 'door',
    permissions: [
      { id: 'access_student_portal',  labelEn: 'Access Student Portal',             labelAr: 'الوصول لبوابة الطالب' },
      { id: 'access_assessor_portal', labelEn: 'Access Academic Consultant Portal', labelAr: 'الوصول لبوابة المستشار الأكاديمي' },
      { id: 'access_teacher_portal',  labelEn: 'Access Teacher Portal',             labelAr: 'الوصول لبوابة المعلم' },
    ],
  },
  {
    id: 'placement',
    labelEn: 'Placement Test Sessions',
    labelAr: 'جلسات اختبار تحديد المستوى',
    icon: 'clipboard',
    permissions: [
      { id: 'placement.view',            labelEn: 'View sessions',               labelAr: 'عرض الجلسات' },
      { id: 'placement.attend',          labelEn: 'Attend a session',            labelAr: 'حضور جلسة' },
      { id: 'placement.request',         labelEn: 'Request a session slot',      labelAr: 'طلب موعد جلسة' },
      { id: 'placement.conduct',         labelEn: 'Conduct sessions',            labelAr: 'إجراء جلسات التقييم' },
      { id: 'placement.add_report',      labelEn: 'Write a report',              labelAr: 'كتابة تقرير تقييم' },
      { id: 'placement.edit_report',     labelEn: 'Edit a report',               labelAr: 'تعديل تقرير' },
      { id: 'placement.delete_report',   labelEn: 'Delete a report',             labelAr: 'حذف تقرير' },
      { id: 'placement.view_own_reports',labelEn: 'View own reports',            labelAr: 'عرض تقاريري الخاصة' },
      { id: 'placement.view_all_reports',labelEn: 'View all reports',            labelAr: 'عرض جميع التقارير' },
      { id: 'placement.accept_request',  labelEn: 'Accept session requests',     labelAr: 'قبول طلبات الجلسات' },
      { id: 'placement.reject_request',  labelEn: 'Reject session requests',     labelAr: 'رفض طلبات الجلسات' },
      { id: 'placement.manage_schedule', labelEn: 'Manage availability schedule',labelAr: 'إدارة جدول التوفر' },
      { id: 'placement.cancel_session',  labelEn: 'Cancel a session',            labelAr: 'إلغاء جلسة' },
    ],
  },
  {
    id: 'courses',
    labelEn: 'Course Catalog',
    labelAr: 'كتالوج الدورات',
    icon: 'book',
    permissions: [
      { id: 'courses.view',      labelEn: 'View courses',      labelAr: 'عرض الدورات' },
      { id: 'courses.add',       labelEn: 'Add a course',      labelAr: 'إضافة دورة' },
      { id: 'courses.edit',      labelEn: 'Edit a course',     labelAr: 'تعديل دورة' },
      { id: 'courses.delete',    labelEn: 'Delete a course',   labelAr: 'حذف دورة' },
      { id: 'categories.view',   labelEn: 'View categories',   labelAr: 'عرض التصنيفات' },
      { id: 'categories.add',    labelEn: 'Add a category',    labelAr: 'إضافة تصنيف' },
      { id: 'categories.edit',   labelEn: 'Edit a category',   labelAr: 'تعديل تصنيف' },
      { id: 'categories.delete', labelEn: 'Delete a category', labelAr: 'حذف تصنيف' },
    ],
  },
  {
    id: 'users',
    labelEn: 'Users & Roles',
    labelAr: 'المستخدمون والأدوار',
    icon: 'users',
    permissions: [
      { id: 'users.view',   labelEn: 'View users',    labelAr: 'عرض المستخدمين' },
      { id: 'users.add',    labelEn: 'Add a user',    labelAr: 'إضافة مستخدم' },
      { id: 'users.edit',   labelEn: 'Edit a user',   labelAr: 'تعديل مستخدم' },
      { id: 'users.delete', labelEn: 'Delete a user', labelAr: 'حذف مستخدم' },
      { id: 'roles.view',   labelEn: 'View roles',    labelAr: 'عرض الأدوار' },
      { id: 'roles.add',    labelEn: 'Add a role',    labelAr: 'إضافة دور' },
      { id: 'roles.edit',   labelEn: 'Edit a role',   labelAr: 'تعديل دور' },
      { id: 'roles.delete', labelEn: 'Delete a role', labelAr: 'حذف دور' },
    ],
  },
  {
    id: 'blog',
    labelEn: 'Blog',
    labelAr: 'المدونة',
    icon: 'file',
    permissions: [
      { id: 'blog.view',   labelEn: 'View blog posts',    labelAr: 'عرض المقالات' },
      { id: 'blog.add',    labelEn: 'Add a blog post',    labelAr: 'إضافة مقال' },
      { id: 'blog.edit',   labelEn: 'Edit a blog post',   labelAr: 'تعديل مقال' },
      { id: 'blog.delete', labelEn: 'Delete a blog post', labelAr: 'حذف مقال' },
    ],
  },
  {
    id: 'website_content',
    labelEn: 'Website Content',
    labelAr: 'محتوى الموقع',
    icon: 'globe',
    permissions: [
      { id: 'content.view',      labelEn: 'View website content',  labelAr: 'عرض محتوى الموقع' },
      { id: 'content.edit',      labelEn: 'Edit website content',  labelAr: 'تعديل محتوى الموقع' },
      { id: 'services.view',     labelEn: 'View services',         labelAr: 'عرض الخدمات' },
      { id: 'services.add',      labelEn: 'Add a service',         labelAr: 'إضافة خدمة' },
      { id: 'services.edit',     labelEn: 'Edit a service',        labelAr: 'تعديل خدمة' },
      { id: 'services.delete',   labelEn: 'Delete a service',      labelAr: 'حذف خدمة' },
      { id: 'portfolio.view',    labelEn: 'View portfolio',        labelAr: 'عرض الأعمال' },
      { id: 'portfolio.add',     labelEn: 'Add portfolio item',    labelAr: 'إضافة عمل' },
      { id: 'portfolio.edit',    labelEn: 'Edit portfolio item',   labelAr: 'تعديل عمل' },
      { id: 'portfolio.delete',  labelEn: 'Delete portfolio item', labelAr: 'حذف عمل' },
      { id: 'faq.view',          labelEn: 'View FAQ entries',      labelAr: 'عرض الأسئلة الشائعة' },
      { id: 'faq.add',           labelEn: 'Add an FAQ entry',      labelAr: 'إضافة سؤال' },
      { id: 'faq.edit',          labelEn: 'Edit an FAQ entry',     labelAr: 'تعديل سؤال' },
      { id: 'faq.delete',        labelEn: 'Delete an FAQ entry',   labelAr: 'حذف سؤال' },
      { id: 'pricing.view',      labelEn: 'View pricing',          labelAr: 'عرض الأسعار' },
      { id: 'pricing.edit',      labelEn: 'Edit pricing',          labelAr: 'تعديل الأسعار' },
      { id: 'stats.view',        labelEn: 'View statistics',       labelAr: 'عرض الإحصائيات' },
      { id: 'stats.edit',        labelEn: 'Edit statistics',       labelAr: 'تعديل الإحصائيات' },
    ],
  },
  {
    id: 'communications',
    labelEn: 'Communications',
    labelAr: 'التواصل',
    icon: 'mail',
    permissions: [
      { id: 'messages.view',   labelEn: 'View contact messages', labelAr: 'عرض رسائل التواصل' },
      { id: 'messages.delete', labelEn: 'Delete messages',       labelAr: 'حذف الرسائل' },
    ],
  },
  {
    id: 'payroll',
    labelEn: 'Payroll',
    labelAr: 'الرواتب',
    icon: 'dollar',
    permissions: [
      { id: 'payroll.view_own', labelEn: 'View own payroll',      labelAr: 'عرض الراتب الخاص' },
      { id: 'payroll.view_all', labelEn: 'View all payroll',      labelAr: 'عرض جميع الرواتب' },
      { id: 'payroll.add',      labelEn: 'Add a payroll entry',   labelAr: 'إضافة قيد راتب' },
      { id: 'payroll.edit',     labelEn: 'Edit a payroll entry',  labelAr: 'تعديل قيد راتب' },
      { id: 'payroll.delete',   labelEn: 'Delete a payroll entry',labelAr: 'حذف قيد راتب' },
    ],
  },
  {
    id: 'administration',
    labelEn: 'Administration',
    labelAr: 'الإدارة',
    icon: 'shield',
    permissions: [
      { id: 'audit.view', labelEn: 'View audit log', labelAr: 'عرض سجل المراجعة' },
    ],
  },
]

// All permission IDs flattened
export const ALL_PERMISSION_IDS = PERMISSION_GROUPS.flatMap(g => g.permissions.map(p => p.id))

// Permissions that grant access to the admin panel (/admin)
export const ADMIN_PANEL_PERMS = new Set([
  'courses.add', 'courses.edit', 'courses.delete',
  'categories.view', 'categories.add', 'categories.edit', 'categories.delete',
  'users.view', 'users.add', 'users.edit', 'users.delete',
  'roles.view', 'roles.add', 'roles.edit', 'roles.delete',
  'blog.view', 'blog.add', 'blog.edit', 'blog.delete',
  'content.view', 'content.edit',
  'services.view', 'services.add', 'services.edit', 'services.delete',
  'portfolio.view', 'portfolio.add', 'portfolio.edit', 'portfolio.delete',
  'faq.view', 'faq.add', 'faq.edit', 'faq.delete',
  'pricing.view', 'pricing.edit',
  'stats.view', 'stats.edit',
  'messages.view', 'messages.delete',
  'payroll.view_all', 'payroll.add', 'payroll.edit', 'payroll.delete',
  'audit.view',
])

// System role IDs that cannot be edited or deleted
export const SYSTEM_ROLE_IDS = ['r_admin', 'r_student', 'r_assessor', 'r_teacher']

// Helper: find a permission's label
export function permLabel(id, isAr = false) {
  for (const g of PERMISSION_GROUPS) {
    const p = g.permissions.find(p => p.id === id)
    if (p) return isAr ? p.labelAr : p.labelEn
  }
  return id
}
