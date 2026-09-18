export const PERMISSION_GROUPS = [
  {
    id: 'portal_access',
    labelEn: 'Portal Access',
    labelAr: 'الوصول للبوابات',
    icon: 'door',
    permissions: [
      { id: 'access_student_portal',  labelEn: 'Access Student Portal',              labelAr: 'الوصول لبوابة الطالب' },
      { id: 'access_assessor_portal', labelEn: 'Access Academic Consultant Portal',  labelAr: 'الوصول لبوابة المستشار الأكاديمي' },
      { id: 'access_teacher_portal',  labelEn: 'Access Teacher Portal',              labelAr: 'الوصول لبوابة المعلم' },
    ],
  },
  {
    id: 'placement',
    labelEn: 'Placement Test Sessions',
    labelAr: 'جلسات اختبار تحديد المستوى',
    icon: 'clipboard',
    permissions: [
      { id: 'placement.attend',           labelEn: 'Attend a placement test session',  labelAr: 'حضور جلسة اختبار تحديد المستوى' },
      { id: 'placement.conduct',          labelEn: 'Conduct placement sessions',       labelAr: 'إجراء جلسات التقييم' },
      { id: 'placement.write_report',     labelEn: 'Write an assessment report',       labelAr: 'كتابة تقرير تقييم' },
      { id: 'placement.view_own_reports', labelEn: 'View own reports',                 labelAr: 'عرض تقاريري الخاصة' },
      { id: 'placement.view_all_reports', labelEn: 'View all reports',                 labelAr: 'عرض جميع التقارير' },
      { id: 'placement.manage_schedule',  labelEn: 'Manage availability schedule',     labelAr: 'إدارة جدول التوفر' },
      { id: 'placement.manage_requests',  labelEn: 'Review & approve slot requests',   labelAr: 'مراجعة وقبول طلبات المواعيد' },
      { id: 'placement.manage_sessions',  labelEn: 'Manage & cancel sessions',         labelAr: 'إدارة وإلغاء الجلسات' },
    ],
  },
  {
    id: 'courses',
    labelEn: 'Course Catalog',
    labelAr: 'كتالوج الدورات',
    icon: 'book',
    permissions: [
      { id: 'courses.view',       labelEn: 'View course catalog',           labelAr: 'عرض كتالوج الدورات' },
      { id: 'courses.manage',     labelEn: 'Create, edit & delete courses', labelAr: 'إنشاء وتعديل وحذف الدورات' },
      { id: 'categories.manage',  labelEn: 'Manage course categories',      labelAr: 'إدارة تصنيفات الدورات' },
    ],
  },
  {
    id: 'users',
    labelEn: 'Users & Roles',
    labelAr: 'المستخدمون والأدوار',
    icon: 'users',
    permissions: [
      { id: 'manage_users', labelEn: 'Manage users (create, edit, delete)', labelAr: 'إدارة المستخدمين (إنشاء وتعديل وحذف)' },
      { id: 'manage_roles', labelEn: 'Manage roles & permissions',          labelAr: 'إدارة الأدوار والصلاحيات' },
    ],
  },
  {
    id: 'content',
    labelEn: 'Website Content',
    labelAr: 'محتوى الموقع',
    icon: 'file',
    permissions: [
      { id: 'manage_content',   labelEn: 'Edit website content',  labelAr: 'تعديل محتوى الموقع' },
      { id: 'manage_blog',      labelEn: 'Manage blog posts',      labelAr: 'إدارة المدونة' },
      { id: 'manage_services',  labelEn: 'Manage services',        labelAr: 'إدارة الخدمات' },
      { id: 'manage_portfolio', labelEn: 'Manage portfolio',       labelAr: 'إدارة الأعمال' },
      { id: 'manage_faq',       labelEn: 'Manage FAQ',             labelAr: 'إدارة الأسئلة الشائعة' },
      { id: 'manage_pricing',   labelEn: 'Manage pricing',         labelAr: 'إدارة الأسعار' },
      { id: 'manage_stats',     labelEn: 'Manage statistics',      labelAr: 'إدارة الإحصائيات' },
    ],
  },
  {
    id: 'communications',
    labelEn: 'Communications',
    labelAr: 'التواصل',
    icon: 'mail',
    permissions: [
      { id: 'view_messages', labelEn: 'View contact messages', labelAr: 'عرض رسائل التواصل' },
    ],
  },
  {
    id: 'payroll',
    labelEn: 'Payroll',
    labelAr: 'الرواتب',
    icon: 'dollar',
    permissions: [
      { id: 'payroll.view_own', labelEn: 'View own payroll',   labelAr: 'عرض الراتب الخاص' },
      { id: 'payroll.manage',   labelEn: 'Manage all payroll', labelAr: 'إدارة جميع الرواتب' },
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

// Permissions that grant access to the admin panel
export const ADMIN_PANEL_PERMS = new Set([
  'manage_users', 'manage_roles', 'manage_content', 'manage_blog',
  'manage_services', 'manage_portfolio', 'manage_faq', 'manage_pricing',
  'manage_stats', 'view_messages', 'payroll.manage', 'audit.view',
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
