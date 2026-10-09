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
      { id: 'placement.view',            labelEn: 'View sessions',                    labelAr: 'عرض الجلسات' },
      { id: 'placement.attend',          labelEn: 'Attend a session',                 labelAr: 'حضور جلسة' },
      { id: 'placement.request',         labelEn: 'Request a session slot',           labelAr: 'طلب موعد جلسة' },
      { id: 'placement.conduct',         labelEn: 'Conduct sessions',                 labelAr: 'إجراء جلسات التقييم' },
      { id: 'placement.add_report',      labelEn: 'Write a report',                   labelAr: 'كتابة تقرير تقييم' },
      { id: 'placement.edit_report',     labelEn: 'Edit a report',                    labelAr: 'تعديل تقرير' },
      { id: 'placement.delete_report',   labelEn: 'Delete a report',                  labelAr: 'حذف تقرير' },
      { id: 'placement.view_own_reports',labelEn: 'View own reports',                 labelAr: 'عرض تقاريري الخاصة' },
      { id: 'placement.view_all_reports',labelEn: 'View all reports',                 labelAr: 'عرض جميع التقارير' },
      { id: 'placement.accept_request',  labelEn: 'Accept session requests',          labelAr: 'قبول طلبات الجلسات' },
      { id: 'placement.reject_request',  labelEn: 'Reject session requests',          labelAr: 'رفض طلبات الجلسات' },
      { id: 'placement.manage_schedule', labelEn: 'Manage availability schedule',     labelAr: 'إدارة جدول التوفر' },
      { id: 'placement.cancel_session',  labelEn: 'Cancel a session',                 labelAr: 'إلغاء جلسة' },
      { id: 'placement.skip_test',       labelEn: 'Start without a placement test',   labelAr: 'البدء بدون اختبار تحديد المستوى' },
    ],
  },
  {
    id: 'students',
    labelEn: 'Students',
    labelAr: 'الطلاب',
    icon: 'student',
    permissions: [
      { id: 'students.view',         labelEn: 'View all students',      labelAr: 'عرض جميع الطلاب' },
      { id: 'students.view_profile', labelEn: 'View student profile',   labelAr: 'عرض ملف الطالب' },
      { id: 'students.add',          labelEn: 'Add a student',          labelAr: 'إضافة طالب' },
      { id: 'students.edit',         labelEn: 'Edit student info',      labelAr: 'تعديل بيانات الطالب' },
      { id: 'students.delete',       labelEn: 'Delete a student',       labelAr: 'حذف طالب' },
      { id: 'students.export',       labelEn: 'Export students list',   labelAr: 'تصدير قائمة الطلاب' },
    ],
  },
  {
    id: 'teachers',
    labelEn: 'Teachers',
    labelAr: 'المعلمون',
    icon: 'teacher',
    permissions: [
      { id: 'teachers.view',         labelEn: 'View all teachers',      labelAr: 'عرض جميع المعلمين' },
      { id: 'teachers.view_profile', labelEn: 'View teacher profile',   labelAr: 'عرض ملف المعلم' },
      { id: 'teachers.add',          labelEn: 'Add a teacher',          labelAr: 'إضافة معلم' },
      { id: 'teachers.edit',         labelEn: 'Edit teacher info',      labelAr: 'تعديل بيانات المعلم' },
      { id: 'teachers.delete',       labelEn: 'Delete a teacher',       labelAr: 'حذف معلم' },
      { id: 'teachers.export',       labelEn: 'Export teachers list',   labelAr: 'تصدير قائمة المعلمين' },
    ],
  },
  {
    id: 'consultants',
    labelEn: 'Academic Consultants',
    labelAr: 'المستشارون الأكاديميون',
    icon: 'consultant',
    permissions: [
      { id: 'consultants.view',         labelEn: 'View all consultants',    labelAr: 'عرض جميع المستشارين' },
      { id: 'consultants.view_profile', labelEn: 'View consultant profile', labelAr: 'عرض ملف المستشار' },
      { id: 'consultants.add',          labelEn: 'Add a consultant',        labelAr: 'إضافة مستشار' },
      { id: 'consultants.edit',         labelEn: 'Edit consultant info',    labelAr: 'تعديل بيانات المستشار' },
      { id: 'consultants.delete',       labelEn: 'Delete a consultant',     labelAr: 'حذف مستشار' },
      { id: 'consultants.export',       labelEn: 'Export consultants list', labelAr: 'تصدير قائمة المستشارين' },
    ],
  },
  {
    id: 'roles_access',
    labelEn: 'Roles & Access',
    labelAr: 'الأدوار والوصول',
    icon: 'key',
    permissions: [
      { id: 'roles.view',   labelEn: 'View roles',   labelAr: 'عرض الأدوار' },
      { id: 'roles.add',    labelEn: 'Add a role',   labelAr: 'إضافة دور' },
      { id: 'roles.edit',   labelEn: 'Edit a role',  labelAr: 'تعديل دور' },
      { id: 'roles.delete', labelEn: 'Delete a role',labelAr: 'حذف دور' },
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
      { id: 'payroll.view_own', labelEn: 'View own payroll',       labelAr: 'عرض الراتب الخاص' },
      { id: 'payroll.view_all', labelEn: 'View all payroll',       labelAr: 'عرض جميع الرواتب' },
      { id: 'payroll.add',      labelEn: 'Add a payroll entry',    labelAr: 'إضافة قيد راتب' },
      { id: 'payroll.edit',     labelEn: 'Edit a payroll entry',   labelAr: 'تعديل قيد راتب' },
      { id: 'payroll.delete',   labelEn: 'Delete a payroll entry', labelAr: 'حذف قيد راتب' },
    ],
  },
  {
    id: 'administration',
    labelEn: 'Administration',
    labelAr: 'الإدارة',
    icon: 'shield',
    permissions: [
      { id: 'audit.view',               labelEn: 'View audit log',                      labelAr: 'عرض سجل المراجعة' },
      { id: 'schedule.configure_limits',labelEn: 'Configure schedule slot thresholds',  labelAr: 'ضبط حدود خانات الجدول' },
    ],
  },
]

// All permission IDs flattened
export const ALL_PERMISSION_IDS = PERMISSION_GROUPS.flatMap(g => g.permissions.map(p => p.id))

// Permissions that grant access to the admin panel (/admin)
export const ADMIN_PANEL_PERMS = new Set([
  'students.view', 'students.view_profile', 'students.add', 'students.edit', 'students.delete', 'students.export',
  'teachers.view', 'teachers.view_profile', 'teachers.add', 'teachers.edit', 'teachers.delete', 'teachers.export',
  'consultants.view', 'consultants.view_profile', 'consultants.add', 'consultants.edit', 'consultants.delete', 'consultants.export',
  'roles.view', 'roles.add', 'roles.edit', 'roles.delete',
  'courses.add', 'courses.edit', 'courses.delete',
  'categories.view', 'categories.add', 'categories.edit', 'categories.delete',
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
  'schedule.configure_limits',
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
