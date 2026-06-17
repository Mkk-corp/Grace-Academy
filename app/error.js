'use client'

import Link from 'next/link'
import { useLang } from '@/context/LangContext'
import { useTheme } from '@/context/ThemeContext'

export default function ErrorPage({ reset }) {
  const { lang, dir } = useLang()
  const { theme } = useTheme()
  const isAr = lang === 'ar'
  const isDark = theme === 'dark'

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: isDark ? '#0d1b24' : '#f8fafc',
      padding: '40px 24px',
      direction: dir,
      fontFamily: isAr ? "var(--font-tajawal,'Tajawal',sans-serif)" : "var(--font-montserrat,'Montserrat',sans-serif)",
    }}>
      <style>{`
        @keyframes errFadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
        .err-btn-primary{display:inline-flex;align-items:center;justify-content:center;padding:13px 32px;border-radius:12px;background:#c9932c;color:#fff;font-weight:800;font-size:.95rem;border:none;cursor:pointer;text-decoration:none;transition:background .15s,transform .12s;font-family:inherit}
        .err-btn-primary:hover{background:#b07e22;transform:translateY(-1px)}
        .err-btn-outline{display:inline-flex;align-items:center;justify-content:center;padding:13px 32px;border-radius:12px;background:transparent;color:${isDark ? 'rgba(255,255,255,.7)' : '#374151'};font-weight:700;font-size:.95rem;border:1.5px solid ${isDark ? 'rgba(255,255,255,.15)' : '#d1d5db'};cursor:pointer;text-decoration:none;transition:all .15s;font-family:inherit}
        .err-btn-outline:hover{background:${isDark ? 'rgba(255,255,255,.06)' : '#f3f4f6'};border-color:${isDark ? 'rgba(255,255,255,.3)' : '#9ca3af'}}
      `}</style>

      <img
        src="/images/error-500.svg"
        alt=""
        style={{ width: 'min(360px, 72vw)', height: 'min(360px, 72vw)', objectFit: 'contain' }}
      />

      <div style={{ textAlign: 'center', animation: 'errFadeUp .55s ease both', marginTop: 12 }}>
        <div style={{
          fontSize: 'clamp(4.5rem, 14vw, 8rem)',
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: '-.04em',
          background: 'linear-gradient(135deg, #c9932c 0%, #e8b84b 60%, #c9932c 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: 8,
          fontFamily: "'Montserrat',sans-serif",
        }}>
          500
        </div>

        <div style={{
          fontSize: 'clamp(1.4rem, 3.5vw, 2rem)',
          fontWeight: 900,
          color: isDark ? '#f1f5f9' : '#111827',
          letterSpacing: isAr ? 0 : '-.02em',
          lineHeight: 1.15,
          marginBottom: 12,
        }}>
          {isAr ? 'خطأ في الخادم' : 'Internal Server Error'}
        </div>

        <p style={{
          fontSize: 'clamp(.9rem, 2vw, 1.05rem)',
          color: isDark ? 'rgba(255,255,255,.45)' : '#6b7280',
          maxWidth: 400,
          margin: '0 auto 32px',
          lineHeight: 1.7,
        }}>
          {isAr
            ? 'حدث خطأ من جهتنا. نعتذر عن الإزعاج، يرجى المحاولة مرة أخرى.'
            : "Something went wrong on our end. We're sorry for the inconvenience — please try again."}
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={reset} className="err-btn-primary">
            {isAr ? 'حاول مرة أخرى' : 'Try Again'}
          </button>
          <Link href="/" className="err-btn-outline">
            {isAr ? 'الصفحة الرئيسية' : 'Go Home'}
          </Link>
        </div>
      </div>
    </div>
  )
}
