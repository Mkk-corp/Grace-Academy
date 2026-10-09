const STRINGS = {
  en: {
    report_submitted: {
      title: () => 'Assessment Report Ready',
      body:  (m) => `Your placement test report is ready. Your English level: ${m?.level || '—'}. Suggested course: ${m?.course || '—'}.`,
    },
    pending_report_reminder: {
      title: () => 'Pending Reports Reminder',
      body:  (m) => `You have ${m?.count ?? '?'} report${m?.count !== 1 ? 's' : ''} awaiting submission. Please complete them before the end of the day.`,
    },
    account_setup_complete: {
      title: () => 'Account Setup Complete',
      body:  () => 'Your account is fully configured and ready to receive assessment bookings.',
    },
    placement_booked: {
      title: () => 'New Placement Assessment Booked',
      body:  (m) => `A student has booked a placement session on ${m?.date || '—'} at ${m?.time || '—'}.`,
    },
    placement_reminder: {
      title: () => 'Session Starting Soon',
      body:  (m) => `Your placement assessment starts in 3 minutes on ${m?.date || '—'} at ${m?.time || '—'}.`,
    },
    slot_request: {
      title: () => 'New Schedule Change Request',
      body:  (m) => `${m?.assessorName || 'An academic consultant'} has submitted a schedule change request.`,
    },
    slot_request_approved: {
      title: () => 'Schedule Change Approved',
      body:  () => 'Your schedule change request has been approved. Your new schedule is now active.',
    },
    slot_request_rejected: {
      title: () => 'Schedule Change Rejected',
      body:  (m) => `Your schedule change request has been rejected.${m?.adminNote ? ` Reason: ${m.adminNote}` : ''}`,
    },
    course_assigned: {
      title: () => 'New Course Assigned',
      body:  (m) => `You have been assigned to teach "${m?.courseNameEn || 'a new course'}".`,
    },
    course_unassigned: {
      title: () => 'Course Removed',
      body:  (m) => `You have been removed from "${m?.courseNameEn || 'a course'}".`,
    },
    schedule_limits_updated: {
      title: () => 'Schedule Limits Updated',
      body:  (m) => m?.compliant === true
        ? `Slot limits updated. Your schedule already meets the new requirements.`
        : m?.compliant === false
        ? `Slot limits updated. Your schedule requires adjustment: ${m?.minSlots}–${m?.maxSlots} slots, ${m?.minDays}–${m?.maxDays} days.`
        : `The academy has updated schedule requirements: ${m?.minSlots}–${m?.maxSlots} slots across ${m?.minDays}–${m?.maxDays} days.`,
    },
    schedule_compliance_required: {
      title: () => 'Schedule Update Required',
      body:  (m) => `Your schedule no longer meets the requirements. Please submit a change request. Required: ${m?.minSlots}–${m?.maxSlots} slots, ${m?.minDays}–${m?.maxDays} days.`,
    },
  },
  ar: {
    report_submitted: {
      title: () => 'تقرير التقييم جاهز',
      body:  (m) => `تقرير اختبار تحديد مستواك جاهز. مستواك في اللغة الإنجليزية: ${m?.level || '—'}. الدورة المقترحة: ${m?.course || '—'}.`,
    },
    pending_report_reminder: {
      title: () => 'تذكير بالتقارير المعلّقة',
      body:  (m) => `لديك ${m?.count ?? '?'} تقرير${m?.count !== 1 ? '' : ''} بانتظار الإرسال. يرجى إكمالها قبل نهاية اليوم.`,
    },
    account_setup_complete: {
      title: () => 'اكتمل إعداد الحساب',
      body:  () => 'حسابك مُهيَّأ بالكامل وجاهز لاستقبال حجوزات التقييم.',
    },
    placement_booked: {
      title: () => 'تم حجز جلسة تقييم تحديد المستوى',
      body:  (m) => `حجز طالب جلسة تقييم بتاريخ ${m?.date || '—'} الساعة ${m?.time || '—'}.`,
    },
    placement_reminder: {
      title: () => 'الجلسة على وشك البدء',
      body:  (m) => `جلسة تقييمك تبدأ خلال ٣ دقائق بتاريخ ${m?.date || '—'} الساعة ${m?.time || '—'}.`,
    },
    slot_request: {
      title: () => 'طلب تغيير جدول جديد',
      body:  (m) => `قدّم ${m?.assessorName || 'مستشار أكاديمي'} طلب تغيير جدول.`,
    },
    slot_request_approved: {
      title: () => 'تمت الموافقة على تغيير الجدول',
      body:  () => 'تمت الموافقة على طلب تغيير جدولك. جدولك الجديد مفعّل الآن.',
    },
    slot_request_rejected: {
      title: () => 'تم رفض طلب تغيير الجدول',
      body:  (m) => `تم رفض طلب تغيير جدولك.${m?.adminNote ? ` السبب: ${m.adminNote}` : ''}`,
    },
    course_assigned: {
      title: () => 'تم تعيينك في دورة جديدة',
      body:  (m) => `تم تعيينك لتدريس "${m?.courseNameAr || m?.courseNameEn || 'دورة جديدة'}".`,
    },
    course_unassigned: {
      title: () => 'تمت إزالتك من دورة',
      body:  (m) => `تمت إزالتك من دورة "${m?.courseNameAr || m?.courseNameEn || 'دورة'}".`,
    },
    schedule_limits_updated: {
      title: () => 'تم تحديث حدود الجدول',
      body:  (m) => m?.compliant === true
        ? 'تم تحديث حدود الخانات. جدولك الحالي يستوفي المتطلبات الجديدة.'
        : m?.compliant === false
        ? `تم تحديث حدود الخانات. يلزم تعديل جدولك: ${m?.minSlots}–${m?.maxSlots} خانة، ${m?.minDays}–${m?.maxDays} أيام.`
        : `تم تحديث متطلبات الجدول: ${m?.minSlots}–${m?.maxSlots} خانة على مدى ${m?.minDays}–${m?.maxDays} أيام.`,
    },
    schedule_compliance_required: {
      title: () => 'يلزم تحديث الجدول',
      body:  (m) => `جدولك لا يستوفي المتطلبات الحالية. يرجى تقديم طلب تغيير. المطلوب: ${m?.minSlots}–${m?.maxSlots} خانة، ${m?.minDays}–${m?.maxDays} أيام.`,
    },
  },
}

export function localizeNotification(notif, lang = 'en') {
  const l = STRINGS[lang] ? lang : 'en'
  const meta = notif?.meta || {}

  let typeKey = notif?.type
  if (typeKey === 'slot_request_resolved') {
    typeKey = meta?.action === 'approve' ? 'slot_request_approved' : 'slot_request_rejected'
  }

  const s = STRINGS[l]?.[typeKey]
  if (!s) return { title: notif?.title ?? '', body: notif?.body ?? '' }

  return { title: s.title(meta), body: s.body(meta) }
}
