'use client'

import { useState, useEffect } from 'react'
import { useLang } from '@/context/LangContext'

const KEYS = ['reviews', 'students', 'courses', 'instructors']

const KEY_LABELS = {
  reviews:     { en: 'Reviews',     ar: 'التقييمات'   },
  students:    { en: 'Students',    ar: 'الطلاب'      },
  courses:     { en: 'Courses',     ar: 'الدورات'     },
  instructors: { en: 'Instructors', ar: 'المدرّبون'   },
}

const S = {
  en: { title: 'Stats', save: 'Save Changes', saved: 'Saved ✓', value: 'Value', suffix: 'Suffix' },
  ar: { title: 'الإحصائيات', save: 'حفظ التغييرات', saved: 'تم الحفظ ✓', value: 'القيمة', suffix: 'اللاحقة' },
}

function StatCardSkeleton() {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '24px' }}>
      <span className="skeleton skeleton-text--sm" style={{ width: '60px', display: 'block', marginBottom: '16px' }} />
      <span className="skeleton skeleton-field" style={{ width: '100%', display: 'block', marginBottom: '10px' }} />
      <span className="skeleton skeleton-field" style={{ width: '100%', display: 'block' }} />
    </div>
  )
}

export default function AdminStatsPage() {
  const { lang } = useLang()
  const isAr = lang === 'ar'
  const s = S[lang] || S.en
  const [stats, setStats] = useState(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats)
  }, [])

  async function save() {
    await fetch('/api/stats', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(stats) })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <>
      <div className="admin-header">
        <h1>{s.title}</h1>
        {stats && <button className="admin-btn admin-btn--primary" onClick={save}>{saved ? s.saved : s.save}</button>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        {!stats
          ? KEYS.map(k => <StatCardSkeleton key={k} />)
          : KEYS.map(key => (
            <div key={key} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '24px' }}>
              <h3 style={{ fontSize: '.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--gold)', marginBottom: '16px' }}>
                {isAr ? KEY_LABELS[key]?.ar : KEY_LABELS[key]?.en || key}
              </h3>
              <div className="admin-field">
                <label>{s.value}</label>
                <input type="number" value={stats[key].value} onChange={e => setStats(s => ({ ...s, [key]: { ...s[key], value: parseInt(e.target.value) || 0 } }))} />
              </div>
              <div className="admin-field">
                <label>{s.suffix}</label>
                <input value={stats[key].suffix} onChange={e => setStats(s => ({ ...s, [key]: { ...s[key], suffix: e.target.value } }))} />
              </div>
            </div>
          ))
        }
      </div>
    </>
  )
}
