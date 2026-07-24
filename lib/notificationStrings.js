const STRINGS = {
  en: {
    google_calendar_synced: {
      title: () => 'Google Calendar Connected',
      body:  () => 'Your account is now synced with Google Calendar. Your events will appear in the Calendar tab.',
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
  },
  ar: {
    google_calendar_synced: {
      title: () => 'تم ربط Google Calendar',
      body:  () => 'تم مزامنة حسابك مع Google Calendar. ستظهر أحداثك في تبويب التقويم.',
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
