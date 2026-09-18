'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLang } from '@/context/LangContext'
import { useTheme } from '@/context/ThemeContext'
import CountrySelect from '@/components/ui/CountrySelect'

const GOLD   = '#c9932c'
const BLUE   = '#3b82f6'
const GREEN  = '#10b981'
const RED    = '#ef4444'
const PURPLE = '#8b5cf6'

export const COUNTRIES = [
  { code: 'SA', en: 'Saudi Arabia',   ar: 'المملكة العربية السعودية' },
  { code: 'EG', en: 'Egypt',          ar: 'مصر'                      },
  { code: 'AE', en: 'UAE',            ar: 'الإمارات'                 },
  { code: 'KW', en: 'Kuwait',         ar: 'الكويت'                   },
  { code: 'QA', en: 'Qatar',          ar: 'قطر'                      },
  { code: 'BH', en: 'Bahrain',        ar: 'البحرين'                  },
  { code: 'OM', en: 'Oman',           ar: 'عُمان'                    },
  { code: 'JO', en: 'Jordan',         ar: 'الأردن'                   },
  { code: 'LB', en: 'Lebanon',        ar: 'لبنان'                    },
  { code: 'SY', en: 'Syria',          ar: 'سوريا'                    },
  { code: 'IQ', en: 'Iraq',           ar: 'العراق'                   },
  { code: 'YE', en: 'Yemen',          ar: 'اليمن'                    },
  { code: 'LY', en: 'Libya',          ar: 'ليبيا'                    },
  { code: 'TN', en: 'Tunisia',        ar: 'تونس'                     },
  { code: 'DZ', en: 'Algeria',        ar: 'الجزائر'                  },
  { code: 'MA', en: 'Morocco',        ar: 'المغرب'                   },
  { code: 'SD', en: 'Sudan',          ar: 'السودان'                  },
  { code: 'PS', en: 'Palestine',      ar: 'فلسطين'                   },
  { code: 'GB', en: 'United Kingdom', ar: 'المملكة المتحدة'          },
  { code: 'US', en: 'United States',  ar: 'الولايات المتحدة'         },
  { code: 'CA', en: 'Canada',         ar: 'كندا'                     },
  { code: 'AU', en: 'Australia',      ar: 'أستراليا'                 },
  { code: 'DE', en: 'Germany',        ar: 'ألمانيا'                  },
  { code: 'FR', en: 'France',         ar: 'فرنسا'                    },
  { code: 'OTHER', en: 'Other / Global', ar: 'أخرى / عالمي'         },
]

const BLANK = {
  nameEn: '', nameAr: '', price: '', currency: 'USD',
  durationEn: '', durationAr: '', country: '',
  visible: true, popular: false,
  badgeEn: '', badgeAr: '',
  descEn: '', descAr: '',
  ctaTextEn: 'Get Started', ctaTextAr: 'ابدأ الآن', ctaUrl: '/contact',
  benefits: [],
}

function countryLabel(code, lang) {
  const c = COUNTRIES.find(x => x.code === code)
  if (!c) return code || '—'
  return lang === 'ar' ? c.ar : c.en
}

function newBenefit() {
  return { id: Math.random().toString(36).slice(2), textEn: '', textAr: '', included: true }
}

/* ─── Reusable small components ──────────────────────────────────── */
function Field({ label, lang: langTag, required, children, muted }) {
  const tagColor = langTag === 'ar' ? GOLD : BLUE
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        {langTag && (
          <span style={{ fontSize: '.56rem', fontWeight: 800, padding: '1px 6px', borderRadius: 4, background: `${tagColor}18`, color: tagColor, letterSpacing: '.06em', textTransform: 'uppercase', flexShrink: 0 }}>
            {langTag === 'ar' ? 'AR' : 'EN'}
          </span>
        )}
        <span style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: muted }}>{label}</span>
        {required && <span style={{ color: RED, fontSize: '.8rem' }}>*</span>}
      </div>
      {children}
    </div>
  )
}

function Toggle({ on, onChange, label, color = GREEN, border, bg, text }) {
  return (
    <div onClick={() => onChange(!on)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 14px', borderRadius: 9, border: `1px solid ${on ? color + '40' : border}`, background: on ? `${color}09` : bg, cursor: 'pointer', transition: 'all .2s', userSelect: 'none' }}>
      <span style={{ fontSize: '.85rem', fontWeight: 600, color: on ? color : text }}>{label}</span>
      <div style={{ width: 38, height: 20, borderRadius: 100, padding: 2, background: on ? color : (border), transition: 'background .2s', position: 'relative', flexShrink: 0 }}>
        <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.25)', position: 'absolute', top: 2, left: on ? 20 : 2, transition: 'left .2s' }} />
      </div>
    </div>
  )
}

function SectionCard({ title, icon, color, surf, border, isDark, children }) {
  const c = color || GOLD
  return (
    <div style={{ background: surf, border: `1px solid ${border}`, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', borderBottom: `1px solid ${border}`, background: isDark ? `${c}0d` : `${c}07` }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, background: `${c}16`, border: `1px solid ${c}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c }}>{icon}</div>
        <span style={{ fontWeight: 700, fontSize: '.84rem', color: c }}>{title}</span>
      </div>
      <div style={{ padding: '16px 18px' }}>{children}</div>
    </div>
  )
}

/* ─── Plan Drawer (Add / Edit) ────────────────────────────────────── */
function PlanDrawer({ plan, onClose, onSave, saving, isDark, isAr }) {
  const [form, setForm] = useState(plan)
  const [error, setError] = useState('')

  const surf   = isDark ? '#10222b' : '#fff'
  const border = isDark ? 'rgba(255,255,255,.09)' : '#e5e7eb'
  const text   = isDark ? '#f1f5f9' : '#111827'
  const muted  = isDark ? 'rgba(255,255,255,.45)' : '#6b7280'
  const bg     = isDark ? 'rgba(255,255,255,.04)' : '#f9fafb'

  const inp = { width: '100%', padding: '9px 12px', borderRadius: 8, border: `1px solid ${border}`, background: bg, color: text, fontSize: '.86rem', fontFamily: 'inherit', outline: 'none', transition: 'border-color .15s', boxSizing: 'border-box' }
  const ta  = { ...inp, resize: 'vertical', minHeight: 90, lineHeight: 1.6 }

  const set = useCallback((k, v) => setForm(f => ({ ...f, [k]: v })), [])

  function addBenefit() {
    setForm(f => ({ ...f, benefits: [...f.benefits, newBenefit()] }))
  }
  function removeBenefit(id) {
    setForm(f => ({ ...f, benefits: f.benefits.filter(b => b.id !== id) }))
  }
  function setBenefit(id, k, v) {
    setForm(f => ({ ...f, benefits: f.benefits.map(b => b.id === id ? { ...b, [k]: v } : b) }))
  }
  function moveBenefit(id, dir) {
    setForm(f => {
      const arr = [...f.benefits]
      const i = arr.findIndex(b => b.id === id)
      const j = i + dir
      if (j < 0 || j >= arr.length) return f
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
      return { ...f, benefits: arr }
    })
  }

  async function submit() {
    if (!form.nameEn.trim()) { setError(isAr ? 'الاسم (إنجليزي) مطلوب' : 'Plan name (English) is required'); return }
    if (!form.country) { setError(isAr ? 'الدولة مطلوبة' : 'Country is required'); return }
    if (!form.price.trim()) { setError(isAr ? 'السعر مطلوب' : 'Price is required'); return }
    setError('')
    await onSave(form)
  }

  const fp = { muted, border, bg, text }
  const cp = { surf, border, isDark }

  return (
    <>
      <style>{`@keyframes drawerIn{from{transform:translateX(100%)}to{transform:translateX(0)}} @keyframes prSpin{to{transform:rotate(360deg)}}`}</style>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 1000 }} />
      {/* Panel */}
      <div style={{ position: 'fixed', top: 0, right: 0, height: '100vh', width: 580, maxWidth: '95vw', background: isDark ? '#0d1f28' : '#f8fafc', zIndex: 1001, display: 'flex', flexDirection: 'column', animation: 'drawerIn .25s ease' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
          <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: text }}>
            {plan.id ? (isAr ? 'تعديل الخطة' : 'Edit Plan') : (isAr ? 'إضافة خطة جديدة' : 'New Plan')}
          </h2>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${border}`, background: 'none', cursor: 'pointer', color: muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 9, background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', color: RED, fontSize: '.84rem', marginBottom: 16 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          {/* Visibility + Popular */}
          <SectionCard {...cp} color={GREEN} title={isAr ? 'الإعدادات' : 'Settings'}
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Toggle {...fp} on={form.visible} onChange={v => set('visible', v)} label={isAr ? 'مرئي على الموقع' : 'Visible on website'} color={GREEN} />
              <Toggle {...fp} on={form.popular} onChange={v => set('popular', v)} label={isAr ? 'علامة "الأكثر شيوعاً"' : 'Mark as "Most Popular"'} color={GOLD} />
            </div>
          </SectionCard>

          {/* Plan name + Country */}
          <SectionCard {...cp} color={GOLD} title={isAr ? 'هوية الخطة' : 'Plan Identity'}
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field {...fp} label={isAr ? 'اسم الخطة' : 'Plan Name'} lang="en" required>
                <input value={form.nameEn} onChange={e => set('nameEn', e.target.value)} placeholder="e.g. Standard" dir="ltr" style={inp} onFocus={e => e.target.style.borderColor = GOLD} onBlur={e => e.target.style.borderColor = border} />
              </Field>
              <Field {...fp} label={isAr ? 'اسم الخطة' : 'Plan Name'} lang="ar">
                <input value={form.nameAr} onChange={e => set('nameAr', e.target.value)} placeholder="مثال: الخطة المعيارية" dir="rtl" style={inp} onFocus={e => e.target.style.borderColor = GOLD} onBlur={e => e.target.style.borderColor = border} />
              </Field>
            </div>

            <Field {...fp} label={isAr ? 'الدولة' : 'Country'} required>
              <CountrySelect
                value={form.country}
                onChange={v => set('country', v)}
                countries={COUNTRIES}
                isAr={isAr}
                isDark={isDark}
                variant="admin"
              />
            </Field>

            <div style={{ display: 'flex', gap: 12 }}>
              <Field {...fp} label={isAr ? 'السعر' : 'Price'} required>
                <input value={form.price} onChange={e => set('price', e.target.value)} placeholder="e.g. 299" dir="ltr" style={inp} onFocus={e => e.target.style.borderColor = GOLD} onBlur={e => e.target.style.borderColor = border} />
              </Field>
              <Field {...fp} label={isAr ? 'العملة' : 'Currency'}>
                <input value={form.currency} onChange={e => set('currency', e.target.value)} placeholder="USD" dir="ltr" style={{ ...inp, width: 90 }} onFocus={e => e.target.style.borderColor = GOLD} onBlur={e => e.target.style.borderColor = border} />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field {...fp} label={isAr ? 'المدة' : 'Duration'} lang="en">
                <input value={form.durationEn} onChange={e => set('durationEn', e.target.value)} placeholder="e.g. per month" dir="ltr" style={inp} onFocus={e => e.target.style.borderColor = GOLD} onBlur={e => e.target.style.borderColor = border} />
              </Field>
              <Field {...fp} label={isAr ? 'المدة' : 'Duration'} lang="ar">
                <input value={form.durationAr} onChange={e => set('durationAr', e.target.value)} placeholder="مثال: شهريًا" dir="rtl" style={inp} onFocus={e => e.target.style.borderColor = GOLD} onBlur={e => e.target.style.borderColor = border} />
              </Field>
            </div>
          </SectionCard>

          {/* Badge (optional) */}
          <SectionCard {...cp} color={PURPLE} title={isAr ? 'الشارة (اختياري)' : 'Badge (optional)'}
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field {...fp} label={isAr ? 'نص الشارة' : 'Badge text'} lang="en">
                <input value={form.badgeEn} onChange={e => set('badgeEn', e.target.value)} placeholder="e.g. Most Popular" dir="ltr" style={inp} onFocus={e => e.target.style.borderColor = PURPLE} onBlur={e => e.target.style.borderColor = border} />
              </Field>
              <Field {...fp} label={isAr ? 'نص الشارة' : 'Badge text'} lang="ar">
                <input value={form.badgeAr} onChange={e => set('badgeAr', e.target.value)} placeholder="مثال: الأكثر شيوعاً" dir="rtl" style={inp} onFocus={e => e.target.style.borderColor = GOLD} onBlur={e => e.target.style.borderColor = border} />
              </Field>
            </div>
          </SectionCard>

          {/* Description */}
          <SectionCard {...cp} color={BLUE} title={isAr ? 'وصف الخطة' : 'Plan Description'}
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>}
          >
            <Field {...fp} label={isAr ? 'الوصف' : 'Description'} lang="en">
              <textarea value={form.descEn} onChange={e => set('descEn', e.target.value)} placeholder="Brief description of this plan…" dir="ltr" style={ta} onFocus={e => e.target.style.borderColor = BLUE} onBlur={e => e.target.style.borderColor = border} />
            </Field>
            <Field {...fp} label={isAr ? 'الوصف' : 'Description'} lang="ar">
              <textarea value={form.descAr} onChange={e => set('descAr', e.target.value)} placeholder="وصف مختصر للخطة…" dir="rtl" style={ta} onFocus={e => e.target.style.borderColor = GOLD} onBlur={e => e.target.style.borderColor = border} />
            </Field>
          </SectionCard>

          {/* CTA */}
          <SectionCard {...cp} color={GREEN} title={isAr ? 'زر الدعوة إلى الإجراء (CTA)' : 'Call to Action (CTA)'}
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field {...fp} label={isAr ? 'نص الزر' : 'Button text'} lang="en">
                <input value={form.ctaTextEn} onChange={e => set('ctaTextEn', e.target.value)} placeholder="Get Started" dir="ltr" style={inp} onFocus={e => e.target.style.borderColor = GREEN} onBlur={e => e.target.style.borderColor = border} />
              </Field>
              <Field {...fp} label={isAr ? 'نص الزر' : 'Button text'} lang="ar">
                <input value={form.ctaTextAr} onChange={e => set('ctaTextAr', e.target.value)} placeholder="ابدأ الآن" dir="rtl" style={inp} onFocus={e => e.target.style.borderColor = GOLD} onBlur={e => e.target.style.borderColor = border} />
              </Field>
            </div>
            <Field {...fp} label={isAr ? 'رابط الزر' : 'Button URL'}>
              <input value={form.ctaUrl} onChange={e => set('ctaUrl', e.target.value)} placeholder="/contact" dir="ltr" style={inp} onFocus={e => e.target.style.borderColor = GREEN} onBlur={e => e.target.style.borderColor = border} />
            </Field>
          </SectionCard>

          {/* Benefits */}
          <SectionCard {...cp} color={GOLD} title={isAr ? 'المزايا والميزات' : 'Benefits & Features'}
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>}
          >
            {form.benefits.length === 0 && (
              <div style={{ textAlign: 'center', padding: '14px 0', color: muted, fontSize: '.82rem' }}>
                {isAr ? 'لا توجد مزايا بعد' : 'No benefits yet'}
              </div>
            )}

            {form.benefits.map((b, i) => (
              <div key={b.id} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: '12px 14px', marginBottom: 10 }}>
                {/* included toggle + move + delete */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => setBenefit(b.id, 'included', !b.included)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 100, border: `1px solid ${b.included ? GREEN + '40' : RED + '40'}`, background: b.included ? `${GREEN}12` : `${RED}0a`, color: b.included ? GREEN : RED, fontSize: '.72rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '.04em' }}>
                      {b.included
                        ? <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="10" height="10"><polyline points="20 6 9 17 4 12"/></svg>{isAr ? 'مضمّن' : 'Included'}</>
                        : <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="10" height="10"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>{isAr ? 'غير مضمّن' : 'Not included'}</>
                      }
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <button onClick={() => moveBenefit(b.id, -1)} disabled={i === 0} style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${border}`, background: 'none', color: muted, cursor: i === 0 ? 'default' : 'pointer', opacity: i === 0 ? .35 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="11" height="11"><polyline points="18 15 12 9 6 15"/></svg>
                    </button>
                    <button onClick={() => moveBenefit(b.id, 1)} disabled={i === form.benefits.length - 1} style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${border}`, background: 'none', color: muted, cursor: i === form.benefits.length - 1 ? 'default' : 'pointer', opacity: i === form.benefits.length - 1 ? .35 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="11" height="11"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                    <button onClick={() => removeBenefit(b.id)} style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid rgba(239,68,68,.25)`, background: 'rgba(239,68,68,.06)', color: RED, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="11" height="11"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div>
                    <div style={{ fontSize: '.6rem', fontWeight: 700, color: BLUE, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 4 }}>EN</div>
                    <input value={b.textEn} onChange={e => setBenefit(b.id, 'textEn', e.target.value)} placeholder="e.g. Unlimited sessions" dir="ltr" style={{ ...inp, marginBottom: 0, fontSize: '.82rem' }} onFocus={e => e.target.style.borderColor = BLUE} onBlur={e => e.target.style.borderColor = border} />
                  </div>
                  <div>
                    <div style={{ fontSize: '.6rem', fontWeight: 700, color: GOLD, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 4 }}>AR</div>
                    <input value={b.textAr} onChange={e => setBenefit(b.id, 'textAr', e.target.value)} placeholder="مثال: جلسات غير محدودة" dir="rtl" style={{ ...inp, marginBottom: 0, fontSize: '.82rem' }} onFocus={e => e.target.style.borderColor = GOLD} onBlur={e => e.target.style.borderColor = border} />
                  </div>
                </div>
              </div>
            ))}

            <button onClick={addBenefit} style={{ width: '100%', padding: '9px 0', borderRadius: 9, border: `1.5px dashed ${border}`, background: 'none', color: muted, fontSize: '.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: form.benefits.length ? 4 : 0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              {isAr ? 'إضافة ميزة' : 'Add benefit'}
            </button>
          </SectionCard>

        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, padding: '14px 24px', borderTop: `1px solid ${border}`, flexShrink: 0, background: isDark ? '#0d1f28' : '#f8fafc' }}>
          <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: 9, border: `1px solid ${border}`, background: 'none', color: muted, fontWeight: 600, fontSize: '.86rem', cursor: 'pointer', fontFamily: 'inherit' }}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>
          <button onClick={submit} disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 24px', borderRadius: 9, background: saving ? `${GOLD}70` : GOLD, border: 'none', color: '#fff', fontWeight: 700, fontSize: '.88rem', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
            {saving
              ? <><div style={{ width: 13, height: 13, borderRadius: '50%', border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', animation: 'prSpin .6s linear infinite' }} />{isAr ? 'جارٍ الحفظ…' : 'Saving…'}</>
              : isAr ? 'حفظ الخطة' : 'Save Plan'
            }
          </button>
        </div>
      </div>
    </>
  )
}

/* ─── Delete confirmation ─────────────────────────────────────────── */
function DeleteModal({ plan, onClose, onConfirm, isDark, isAr }) {
  const border = isDark ? 'rgba(255,255,255,.09)' : '#e5e7eb'
  const text   = isDark ? '#f1f5f9' : '#111827'
  const muted  = isDark ? 'rgba(255,255,255,.45)' : '#6b7280'
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 420, background: isDark ? '#10222b' : '#fff', borderRadius: 16, padding: 28, border: `1px solid ${border}` }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" width="20" height="20"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </div>
        <h3 style={{ margin: '0 0 8px', fontSize: '1rem', fontWeight: 800, color: text }}>{isAr ? 'حذف الخطة' : 'Delete Plan'}</h3>
        <p style={{ margin: '0 0 20px', fontSize: '.85rem', color: muted }}>{isAr ? `هل أنت متأكد من حذف خطة "${plan.nameEn}"؟ لا يمكن التراجع عن هذا الإجراء.` : `Delete plan "${plan.nameEn}"? This cannot be undone.`}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '9px 0', borderRadius: 9, border: `1px solid ${border}`, background: 'none', color: muted, fontWeight: 600, fontSize: '.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>{isAr ? 'إلغاء' : 'Cancel'}</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: '9px 0', borderRadius: 9, border: 'none', background: RED, color: '#fff', fontWeight: 700, fontSize: '.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>{isAr ? 'نعم، احذف' : 'Delete'}</button>
        </div>
      </div>
    </div>
  )
}

/* ─── Main page ───────────────────────────────────────────────────── */
export default function AdminPricingPage() {
  const { lang }  = useLang()
  const { theme } = useTheme()
  const isAr  = lang === 'ar'
  const isDark = theme === 'dark'

  const [plans,    setPlans]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [drawer,   setDrawer]   = useState(null)   // null | plan object (with id = existing, without = new)
  const [delTarget, setDelTarget] = useState(null)
  const [saving,   setSaving]   = useState(false)

  const surf   = isDark ? '#10222b' : '#fff'
  const border = isDark ? 'rgba(255,255,255,.09)' : '#e5e7eb'
  const text   = isDark ? '#f1f5f9' : '#111827'
  const muted  = isDark ? 'rgba(255,255,255,.45)' : '#6b7280'
  const bg     = isDark ? 'rgba(255,255,255,.04)' : '#f9fafb'

  async function load() {
    const d = await fetch('/api/pricing').then(r => r.json())
    setPlans(d.plans || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function savePlan(form) {
    setSaving(true)
    const isNew = !form.id
    const res = await fetch('/api/pricing', {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) return
    await load()
    setDrawer(null)
  }

  async function deletePlan(id) {
    await fetch('/api/pricing', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setDelTarget(null)
    await load()
  }

  async function toggleVisible(plan) {
    await fetch('/api/pricing', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...plan, visible: !plan.visible }),
    })
    setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, visible: !p.visible } : p))
  }

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        .pr-row:hover { background: ${isDark ? 'rgba(255,255,255,.03)' : 'rgba(201,147,44,.03)'} !important; }
      `}</style>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: text }}>{isAr ? 'خطط الأسعار' : 'Pricing Plans'}</h1>
          <p style={{ margin: '4px 0 0', fontSize: '.82rem', color: muted }}>{isAr ? 'إدارة خطط الأسعار لكل دولة' : 'Manage pricing plans per country'}</p>
        </div>
        <button onClick={() => setDrawer({ ...BLANK })} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 20px', borderRadius: 10, background: GOLD, border: 'none', color: '#fff', fontWeight: 700, fontSize: '.86rem', cursor: 'pointer', fontFamily: 'inherit' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          {isAr ? 'إضافة خطة' : 'Add Plan'}
        </button>
      </div>

      {/* Plans table */}
      <div style={{ background: surf, border: `1px solid ${border}`, borderRadius: 16, overflow: 'hidden' }}>
        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr auto', gap: 0, padding: '10px 20px', background: bg, borderBottom: `1px solid ${border}` }}>
          {[
            isAr ? 'اسم الخطة' : 'Plan',
            isAr ? 'الدولة' : 'Country',
            isAr ? 'السعر' : 'Price',
            isAr ? 'الظهور' : 'Visible',
            isAr ? 'الإجراءات' : 'Actions',
          ].map((h, i) => (
            <div key={h} style={{ fontSize: '.68rem', fontWeight: 700, letterSpacing: '.09em', textTransform: 'uppercase', color: muted, textAlign: i >= 3 ? 'center' : 'left' }}>{h}</div>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0', gap: 10, color: muted }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" style={{ animation: 'spin .7s linear infinite' }}>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            {isAr ? 'جارٍ التحميل…' : 'Loading…'}
          </div>
        ) : plans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: muted }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="36" height="36" style={{ marginBottom: 12, opacity: .4 }}>
              <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            <div style={{ fontWeight: 700, fontSize: '.9rem', marginBottom: 6 }}>{isAr ? 'لا توجد خطط بعد' : 'No plans yet'}</div>
            <div style={{ fontSize: '.8rem', opacity: .7 }}>{isAr ? 'أضف أول خطة سعر' : 'Add your first pricing plan'}</div>
          </div>
        ) : (
          plans.map((plan, i) => (
            <div key={plan.id} className="pr-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr auto', gap: 0, padding: '14px 20px', borderBottom: i < plans.length - 1 ? `1px solid ${border}` : 'none', alignItems: 'center', transition: 'background .15s' }}>
              {/* Name */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {plan.popular && (
                    <span style={{ fontSize: '.6rem', fontWeight: 800, padding: '2px 7px', borderRadius: 100, background: `${GOLD}18`, border: `1px solid ${GOLD}35`, color: GOLD, letterSpacing: '.06em' }}>
                      ★ {isAr ? 'الأشهر' : 'POPULAR'}
                    </span>
                  )}
                  <span style={{ fontWeight: 700, fontSize: '.9rem', color: text }}>{plan.nameEn}</span>
                </div>
                {plan.nameAr && <div style={{ fontSize: '.78rem', color: muted, marginTop: 2, direction: 'rtl', textAlign: 'right' }}>{plan.nameAr}</div>}
              </div>

              {/* Country */}
              <div style={{ fontSize: '.84rem', color: muted }}>{countryLabel(plan.country, lang)}</div>

              {/* Price */}
              <div style={{ fontWeight: 700, fontSize: '.9rem', color: GOLD }}>
                {plan.price} <span style={{ fontSize: '.72rem', fontWeight: 600, color: muted }}>{plan.currency}</span>
              </div>

              {/* Visible toggle */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button onClick={() => toggleVisible(plan)} title={plan.visible ? (isAr ? 'مرئي — انقر للإخفاء' : 'Visible — click to hide') : (isAr ? 'مخفي — انقر للإظهار' : 'Hidden — click to show')} style={{ width: 38, height: 20, borderRadius: 100, padding: 2, background: plan.visible ? GREEN : border, border: 'none', cursor: 'pointer', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.25)', position: 'absolute', top: 2, left: plan.visible ? 20 : 2, transition: 'left .2s' }} />
                </button>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                <button onClick={() => setDrawer({ ...plan })} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 8, border: `1px solid ${border}`, background: 'none', color: muted, fontSize: '.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  {isAr ? 'تعديل' : 'Edit'}
                </button>
                <button onClick={() => setDelTarget(plan)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(239,68,68,.3)', background: 'rgba(239,68,68,.06)', color: RED, fontSize: '.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                  {isAr ? 'حذف' : 'Delete'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats summary */}
      {!loading && plans.length > 0 && (
        <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
          {[
            { label: isAr ? 'إجمالي الخطط' : 'Total plans', value: plans.length, color: GOLD },
            { label: isAr ? 'مرئية' : 'Visible', value: plans.filter(p => p.visible).length, color: GREEN },
            { label: isAr ? 'مخفية' : 'Hidden', value: plans.filter(p => !p.visible).length, color: muted },
            { label: isAr ? 'دول' : 'Countries', value: new Set(plans.map(p => p.country).filter(Boolean)).size, color: BLUE },
          ].map(stat => (
            <div key={stat.label} style={{ flex: '1 1 100px', background: surf, border: `1px solid ${border}`, borderRadius: 12, padding: '12px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: '.7rem', color: muted, marginTop: 4, fontWeight: 500 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Drawer */}
      {drawer && (
        <PlanDrawer
          plan={drawer}
          onClose={() => setDrawer(null)}
          onSave={savePlan}
          saving={saving}
          isDark={isDark}
          isAr={isAr}
        />
      )}

      {/* Delete modal */}
      {delTarget && (
        <DeleteModal
          plan={delTarget}
          onClose={() => setDelTarget(null)}
          onConfirm={() => deletePlan(delTarget.id)}
          isDark={isDark}
          isAr={isAr}
        />
      )}
    </>
  )
}
