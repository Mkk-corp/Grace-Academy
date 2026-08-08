'use client'

export default function AvailabilitySettings({ user, isAr, isDark }) {
  const gold    = '#c9932c'
  const surface = isDark ? '#10222b' : '#ffffff'
  const border  = isDark ? 'rgba(255,255,255,.09)' : '#e5e7eb'
  const text    = isDark ? '#f1f5f9' : '#111827'
  const muted   = isDark ? 'rgba(255,255,255,.5)' : '#6b7280'

  const items = isAr ? [
    'جدولك الأسبوعي مُعدّ — انتقل إلى تبويب "جدولي" لعرض خاناتك أو تعديلها.',
    'عند حجز طالب لجلسة، يُنشأ رابط اجتماع تلقائياً ويُرسل إليكما في البريد الإلكتروني.',
    'يمكنك عرض جلساتك القادمة من تبويب "تقييماتي".',
  ] : [
    'Your weekly schedule is configured — go to "My Schedule" to view or update your slots.',
    'When a student books a session, a meeting link is automatically generated and sent to both of you by email.',
    'You can view your upcoming sessions from the "My Assessments" tab.',
  ]

  return (
    <>
      <style>{`
        @keyframes avFadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
      `}</style>

      <div style={{ padding: '32px 20px', maxWidth: 680, margin: '0 auto', animation: 'avFadeUp .3s ease' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: isAr ? 0 : '.14em', color: gold, marginBottom: 6 }}>
            {isAr ? 'إعدادات التوفر' : 'AVAILABILITY SETTINGS'}
          </div>
          <h2 style={{ fontSize: 'clamp(1.1rem,2vw,1.5rem)', fontWeight: 900, color: text, marginBottom: 8, lineHeight: 1.2 }}>
            {isAr ? 'إعداد حسابك' : 'Your Account Setup'}
          </h2>
          <p style={{ fontSize: '.85rem', color: muted, lineHeight: 1.65, maxWidth: 520 }}>
            {isAr
              ? 'يمكنك من هنا إدارة إعدادات توفرك وجدولك الأسبوعي.'
              : 'Manage your availability and weekly schedule settings from here.'
            }
          </p>
        </div>

        {/* Status card */}
        <div style={{
          background: isDark ? 'rgba(16,185,129,.06)' : 'rgba(16,185,129,.04)',
          border: '1.5px solid rgba(16,185,129,.3)',
          borderRadius: 16, padding: '24px 24px',
          marginBottom: 24,
          display: 'flex', alignItems: 'flex-start', gap: 16,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, flexShrink: 0,
            background: 'rgba(16,185,129,.12)', border: '1.5px solid rgba(16,185,129,.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '.82rem', fontWeight: 700, color: '#10b981', marginBottom: 4 }}>
              {isAr ? 'حسابك جاهز لاستقبال الحجوزات' : 'Your account is ready to receive bookings'}
            </div>
            <div style={{ fontSize: '.8rem', color: muted, lineHeight: 1.65 }}>
              {isAr
                ? 'ستُنشأ روابط اجتماع الفيديو تلقائياً عند حجز كل جلسة تقييم.'
                : 'Video meeting links are automatically generated for each assessment session when booked.'
              }
            </div>
          </div>
        </div>

        {/* Info items */}
        <div style={{
          background: surface, border: `1px solid ${border}`,
          borderRadius: 14, overflow: 'hidden',
        }}>
          {items.map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 14,
              padding: '18px 20px',
              borderBottom: i < items.length - 1 ? `1px solid ${border}` : 'none',
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                background: 'rgba(201,147,44,.1)', border: '1px solid rgba(201,147,44,.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '.7rem', fontWeight: 800, color: gold,
              }}>
                {i + 1}
              </div>
              <p style={{ margin: 0, fontSize: '.84rem', color: muted, lineHeight: 1.65 }}>
                {item}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom illustration */}
        <div style={{ textAlign: 'center', marginTop: 48, opacity: isDark ? 0.55 : 0.85 }}>
          <img
            src="/images/assessor-settings.svg"
            alt=""
            style={{ width: '100%', maxWidth: 420, height: 'auto' }}
          />
        </div>

      </div>
    </>
  )
}
