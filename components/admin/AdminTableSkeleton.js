'use client'

import { useEffect } from 'react'
import { useLang } from '@/context/LangContext'

export default function AdminTableSkeleton({ cols = 3 }) {
  const { lang, dir } = useLang()
  const isAr = lang === 'ar'

  useEffect(() => {
    if (!document.getElementById('ld-kf')) {
      const s = document.createElement('style')
      s.id = 'ld-kf'
      s.textContent = '@keyframes ldFloat{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-18px) scale(1.03)}}@keyframes ldFadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}'
      document.head.appendChild(s)
    }
  }, [])

  return (
    <tr>
      <td colSpan={cols} style={{ textAlign: 'center', padding: '48px 0', border: 'none' }}>
        <img
          src="/images/loading.svg" alt=""
          style={{ width: 260, height: 260, objectFit: 'contain', display: 'block', margin: '0 auto', animation: 'ldFloat 2.8s ease-in-out infinite' }}
        />
        <div style={{ marginTop: 8, animation: 'ldFadeUp .55s ease both', direction: dir }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#c9932c', letterSpacing: isAr ? 0 : '-.01em', fontFamily: isAr ? "'Tajawal',sans-serif" : "'Gotham',sans-serif" }}>
            {isAr ? 'الصبر ... بيحمل' : 'Hold your horses'}
          </div>
        </div>
      </td>
    </tr>
  )
}
