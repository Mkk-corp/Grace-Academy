const STRINGS = {
  en: {
    slot_request: {
      title: () => 'New Schedule Change Request',
      body:  (m) => `${m?.assessorName || 'An assessor'} has submitted a schedule change request.`,
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
    slot_request: {
      title: () => 'طلب تغيير جدول جديد',
      body:  (m) => `قدّم ${m?.assessorName || 'مُقيّم'} طلب تغيير جدول.`,
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
