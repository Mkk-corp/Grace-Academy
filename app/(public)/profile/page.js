'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useLang } from '@/context/LangContext'
import { useTheme } from '@/context/ThemeContext'
import DatePicker from '@/components/ui/DatePicker'

const AVATARS = [
  { id: 'user1', label: 'Avatar 1' },
  { id: 'user2', label: 'Avatar 2' },
  { id: 'user3', label: 'Avatar 3' },
  { id: 'user4', label: 'Avatar 4' },
  { id: 'user5', label: 'Avatar 5' },
]

const GENDERS = [
  { value: 'male',   en: 'Male',   ar: 'ذكر' },
  { value: 'female', en: 'Female', ar: 'أنثى' },
  { value: 'other',  en: 'Other',  ar: 'أخرى' },
]

const COUNTRIES = [
  'Saudi Arabia', 'Egypt', 'UAE', 'Kuwait', 'Qatar', 'Bahrain', 'Oman', 'Jordan',
  'Lebanon', 'Iraq', 'Libya', 'Tunisia', 'Morocco', 'Sudan', 'Yemen', 'Syria',
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Other',
]

function Icon({ name, size = 18, color = 'currentColor' }) {
  const s = { stroke: color, fill: 'none', strokeWidth: '1.8', width: size, height: size, style: { flexShrink: 0 } }
  switch (name) {
    case 'arrowLeft':  return <svg viewBox="0 0 24 24" {...s}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
    case 'save':       return <svg viewBox="0 0 24 24" {...s}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
    case 'user':       return <svg viewBox="0 0 24 24" {...s}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    case 'mail':       return <svg viewBox="0 0 24 24" {...s}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
    case 'phone':      return <svg viewBox="0 0 24 24" {...s}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.7A16 16 0 0 0 16 16.73l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
    case 'calendar':   return <svg viewBox="0 0 24 24" {...s}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
    case 'globe':      return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
    case 'mapPin':     return <svg viewBox="0 0 24 24" {...s}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
    case 'info':       return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
    case 'shield':     return <svg viewBox="0 0 24 24" {...s}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    case 'id':         return <svg viewBox="0 0 24 24" {...s}><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
    case 'heart':      return <svg viewBox="0 0 24 24" {...s}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
    case 'check':      return <svg viewBox="0 0 24 24" {...s}><polyline points="20 6 9 17 4 12"/></svg>
    case 'sun':        return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
    case 'moon':       return <svg viewBox="0 0 24 24" {...s}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
    default:           return null
  }
}

export default function ProfilePage() {
  const router = useRouter()
  const { lang, dir, toggleLang } = useLang()
  const { theme, toggleTheme } = useTheme()
  const isAr = lang === 'ar'
  const isDark = theme === 'dark'

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('personal')

  // Form state
  const [form, setForm] = useState({
    name: '', username: '', phone: '', dob: '', gender: '',
    bio: '', country: '', city: '', nationalId: '', emergencyContact: '',
    avatar: 'user1',
  })

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(me => {
      if (!me.user) { router.replace('/login'); return }
      return fetch('/api/profile')
    }).then(r => r?.json()).then(data => {
      if (!data) return
      setUser(data)
      setForm({
        name: data.name || '',
        username: data.username || '',
        phone: data.phone || '',
        dob: data.dob || '',
        gender: data.gender || '',
        bio: data.bio || '',
        country: data.country || '',
        city: data.city || '',
        nationalId: data.nationalId || '',
        emergencyContact: data.emergencyContact || '',
        avatar: data.avatar || 'user1',
      })
      setLoading(false)
    }).catch(() => { router.replace('/login') })
  }, [router])

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }))
    setSaved(false)
  }

  async function handleSave() {
    setError('')
    setSaving(true)
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error); return }
    setUser(data)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: isDark ? '#0d1b24' : '#f8fafc', padding: '40px 24px',
      }}>
        <style>{`
          @keyframes ldFloat{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-22px) scale(1.03)}}
          @keyframes ldFadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
        `}</style>
        <img
          src="/images/loading.svg" alt=""
          style={{ width: 'min(500px,82vw)', height: 'min(500px,82vw)', objectFit: 'contain', animation: 'ldFloat 2.8s ease-in-out infinite' }}
        />
        <div style={{ textAlign: 'center', marginTop: 4, animation: 'ldFadeUp .55s ease both' }}>
          <div style={{ fontSize: 'clamp(1.7rem,4vw,2.5rem)', fontWeight: 900, color: '#c9932c', letterSpacing: isAr ? 0 : '-.02em', lineHeight: 1.1, fontFamily: isAr ? "'Tajawal',sans-serif" : "'Gotham',sans-serif", direction: dir }}>
            {isAr ? 'الصبر ... بيحمل' : 'Hold your horses'}
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'personal', labelEn: 'Personal Info',  labelAr: 'المعلومات الشخصية', icon: 'user'    },
    { id: 'contact',  labelEn: 'Contact',         labelAr: 'بيانات الاتصال',    icon: 'phone'   },
    { id: 'avatar',   labelEn: 'Avatar',           labelAr: 'الصورة الرمزية',   icon: 'shield'  },
    { id: 'account',  labelEn: 'Account',          labelAr: 'الحساب',            icon: 'info'    },
  ]

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        @keyframes pfSpin{to{transform:rotate(360deg)}}
        @keyframes pfFadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}

        :root{
          --pf-bg:#f8fafc;--pf-surface:#fff;--pf-border:#e5e7eb;
          --pf-text:#111827;--pf-muted:#6b7280;--pf-xmuted:#9ca3af;
          --pf-shadow:0 1px 3px rgba(0,0,0,.07);--pf-shadow-md:0 4px 20px rgba(0,0,0,.08);
          --pf-hover:#f3f4f6;--pf-gold:#c9932c;
          --pf-gold-bg:rgba(201,147,44,.08);--pf-gold-bd:rgba(201,147,44,.22);
          --pf-input-bg:#f9fafb;--pf-input-bd:#d1d5db;
          --pf-active-bg:rgba(201,147,44,.1);
        }
        [data-theme="dark"]{
          --pf-bg:#0d1b24;--pf-surface:#10222b;--pf-border:rgba(255,255,255,.07);
          --pf-text:#f1f5f9;--pf-muted:rgba(255,255,255,.45);--pf-xmuted:rgba(255,255,255,.22);
          --pf-shadow:0 1px 4px rgba(0,0,0,.35);--pf-shadow-md:0 4px 20px rgba(0,0,0,.35);
          --pf-hover:rgba(255,255,255,.04);
          --pf-input-bg:rgba(255,255,255,.05);--pf-input-bd:rgba(255,255,255,.1);
        }

        .pf-root{min-height:100vh;background:var(--pf-bg);color:var(--pf-text);
          font-family:${isAr?"var(--font-tajawal,'Tajawal',sans-serif)":"var(--font-gotham,'Gotham',sans-serif)"};
          direction:${dir}}

        /* ── TOPBAR ── */
        .pf-top{height:64px;background:var(--pf-surface);border-bottom:1px solid var(--pf-border);
          display:flex;align-items:center;gap:12px;padding:0 24px;
          position:sticky;top:0;z-index:50;box-shadow:var(--pf-shadow)}
        .pf-back-btn{display:flex;align-items:center;gap:7px;padding:8px 14px;border-radius:9px;
          background:none;border:1px solid var(--pf-border);color:var(--pf-muted);
          font-size:.82rem;font-weight:600;cursor:pointer;font-family:inherit;
          transition:all .15s}
        .pf-back-btn:hover{background:var(--pf-hover);color:var(--pf-text);border-color:transparent}
        .pf-top-title{font-size:.95rem;font-weight:800;color:var(--pf-text);letter-spacing:-.01em}
        .pf-top-spacer{flex:1}
        .pf-top-actions{display:flex;align-items:center;gap:8px}
        .pf-ic-btn{width:36px;height:36px;border-radius:9px;background:none;border:1px solid var(--pf-border);
          color:var(--pf-muted);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s}
        .pf-ic-btn:hover{background:var(--pf-hover);color:var(--pf-text);border-color:transparent}
        .pf-lang-btn{height:36px;padding:0 12px;border-radius:9px;background:none;border:1px solid var(--pf-border);
          color:var(--pf-muted);font-size:.72rem;font-weight:700;letter-spacing:.06em;cursor:pointer;
          font-family:inherit;transition:all .15s}
        .pf-lang-btn:hover{background:var(--pf-hover);color:var(--pf-text)}
        .pf-save-btn{display:flex;align-items:center;gap:7px;padding:8px 18px;border-radius:9px;
          background:linear-gradient(135deg,#c9932c,#ae6d0c);border:none;color:#fff;
          font-size:.85rem;font-weight:700;cursor:pointer;font-family:inherit;transition:opacity .15s}
        .pf-save-btn:hover:not(:disabled){opacity:.88}
        .pf-save-btn:disabled{opacity:.5;cursor:not-allowed}
        .pf-saved{display:flex;align-items:center;gap:7px;padding:8px 14px;border-radius:9px;
          background:rgba(74,222,128,.1);border:1px solid rgba(74,222,128,.3);
          color:#4ade80;font-size:.82rem;font-weight:600}

        /* ── LAYOUT ── */
        .pf-body{max-width:1100px;margin:0 auto;padding:32px 24px 64px;
          display:grid;grid-template-columns:280px 1fr;gap:24px;
          animation:pfFadeUp .28s ease both}
        @media(max-width:900px){.pf-body{grid-template-columns:1fr}}
        @media(max-width:600px){.pf-body{padding:20px 16px 48px}}

        /* ── LEFT PANEL ── */
        .pf-left{display:flex;flex-direction:column;gap:16px}
        .pf-avatar-card{background:var(--pf-surface);border:1px solid var(--pf-border);
          border-radius:16px;padding:28px 20px;text-align:center;box-shadow:var(--pf-shadow)}
        .pf-av-img{width:120px;height:120px;border-radius:50%;overflow:hidden;
          margin:0 auto 14px;border:3px solid var(--pf-gold-bd);
          box-shadow:0 0 0 6px var(--pf-gold-bg);background:var(--pf-bg)}
        .pf-av-name{font-size:1rem;font-weight:800;color:var(--pf-text);margin-bottom:3px}
        .pf-av-role{font-size:.75rem;color:var(--pf-xmuted);letter-spacing:.06em;text-transform:uppercase;margin-bottom:4px}
        .pf-av-source{display:inline-block;font-size:.65rem;font-weight:700;letter-spacing:.06em;
          background:var(--pf-gold-bg);border:1px solid var(--pf-gold-bd);border-radius:100px;
          padding:2px 10px;color:var(--pf-gold);margin-top:4px}

        /* tabs */
        .pf-tabs{background:var(--pf-surface);border:1px solid var(--pf-border);
          border-radius:14px;overflow:hidden;box-shadow:var(--pf-shadow)}
        .pf-tab{display:flex;align-items:center;gap:10px;padding:13px 16px;cursor:pointer;
          border-bottom:1px solid var(--pf-border);transition:all .14s;
          font-size:.84rem;font-weight:500;color:var(--pf-muted)}
        .pf-tab:last-child{border-bottom:none}
        .pf-tab:hover{background:var(--pf-hover);color:var(--pf-text)}
        .pf-tab.active{background:var(--pf-active-bg);color:var(--pf-gold);font-weight:700}
        .pf-tab.active svg{stroke:var(--pf-gold) !important}

        /* ── RIGHT PANEL ── */
        .pf-right{display:flex;flex-direction:column;gap:0}
        .pf-card{background:var(--pf-surface);border:1px solid var(--pf-border);
          border-radius:16px;overflow:hidden;box-shadow:var(--pf-shadow)}
        .pf-card-hd{padding:20px 24px;border-bottom:1px solid var(--pf-border);
          display:flex;align-items:center;gap:10px}
        .pf-card-hd-title{font-size:.95rem;font-weight:800;color:var(--pf-text)}
        .pf-card-hd-sub{font-size:.78rem;color:var(--pf-muted);margin-top:2px}
        .pf-card-hd-icon{width:36px;height:36px;border-radius:10px;flex-shrink:0;
          background:var(--pf-gold-bg);border:1px solid var(--pf-gold-bd);
          display:flex;align-items:center;justify-content:center}
        .pf-card-body{padding:24px}

        /* form */
        .pf-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}
        @media(max-width:640px){.pf-grid{grid-template-columns:1fr}}
        .pf-full{grid-column:1/-1}
        .pf-field{display:flex;flex-direction:column;gap:6px}
        .pf-label{font-size:.7rem;font-weight:700;letter-spacing:.1em;color:var(--pf-muted);text-transform:uppercase}
        .pf-input{width:100%;padding:11px 14px;background:var(--pf-input-bg);
          border:1px solid var(--pf-input-bd);border-radius:10px;
          color:var(--pf-text);font-size:.88rem;font-family:inherit;outline:none;
          transition:border-color .15s,box-shadow .15s}
        .pf-input:focus{border-color:var(--pf-gold-bd);box-shadow:0 0 0 3px var(--pf-gold-bg)}
        .pf-input:disabled{opacity:.5;cursor:not-allowed}
        .pf-input::placeholder{color:var(--pf-xmuted)}
        .pf-textarea{resize:vertical;min-height:88px;line-height:1.6}
        .pf-select{appearance:none;cursor:pointer}
        .pf-readonly-badge{display:inline-flex;align-items:center;gap:5px;
          font-size:.65rem;color:var(--pf-xmuted);margin-top:2px}
        .pf-hint{font-size:.72rem;color:var(--pf-xmuted);margin-top:3px}

        /* avatar selector */
        .pf-av-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}
        @media(max-width:640px){.pf-av-grid{grid-template-columns:repeat(3,1fr)}}
        .pf-av-option{cursor:pointer;border-radius:14px;overflow:hidden;
          border:2.5px solid transparent;transition:all .18s;position:relative;
          aspect-ratio:1;background:var(--pf-bg)}
        .pf-av-option:hover{border-color:rgba(201,147,44,.4);transform:translateY(-2px)}
        .pf-av-option.selected{border-color:var(--pf-gold);box-shadow:0 0 0 3px var(--pf-gold-bg)}
        .pf-av-check{position:absolute;bottom:6px;right:6px;
          width:20px;height:20px;border-radius:50%;
          background:#c9932c;display:flex;align-items:center;justify-content:center}
        .pf-av-label{text-align:center;font-size:.7rem;color:var(--pf-muted);margin-top:5px;font-weight:500}

        /* account info */
        .pf-info-row{display:flex;justify-content:space-between;align-items:center;
          padding:13px 0;border-bottom:1px solid var(--pf-border)}
        .pf-info-row:last-child{border-bottom:none}
        .pf-info-key{font-size:.78rem;color:var(--pf-muted);font-weight:500}
        .pf-info-val{font-size:.82rem;color:var(--pf-text);font-weight:600;text-align:end}
        .pf-pill{display:inline-flex;align-items:center;padding:3px 10px;border-radius:100px;
          font-size:.68rem;font-weight:700;letter-spacing:.05em}
        .pf-pill-gold{background:var(--pf-gold-bg);border:1px solid var(--pf-gold-bd);color:var(--pf-gold)}
        .pf-pill-green{background:rgba(74,222,128,.1);border:1px solid rgba(74,222,128,.3);color:#4ade80}

        /* error */
        .pf-error{display:flex;align-items:center;gap:8px;margin-bottom:18px;
          background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.22);
          border-radius:10px;padding:11px 14px;color:#f87171;font-size:.84rem}

        .pf-spinner{width:15px;height:15px;border:2px solid rgba(255,255,255,.3);
          border-top-color:#fff;border-radius:50%;animation:pfSpin .7s linear infinite}
      `}</style>

      <div className="pf-root">

        {/* ── TOPBAR ── */}
        <header className="pf-top">
          <button className="pf-back-btn" onClick={() => router.push('/portal')}>
            <Icon name={isAr ? 'arrowLeft' : 'arrowLeft'} size={15} color="currentColor" />
            {isAr ? 'العودة إلى البوابة' : 'Back to Portal'}
          </button>

          <span className="pf-top-title">{isAr ? 'الملف الشخصي' : 'My Profile'}</span>

          <div className="pf-top-spacer" />

          <div className="pf-top-actions">
            <button className="pf-lang-btn" onClick={toggleLang}>{lang === 'en' ? 'عربي' : 'EN'}</button>
            <button className="pf-ic-btn" onClick={toggleTheme}>
              <Icon name={isDark ? 'sun' : 'moon'} size={16} color="currentColor" />
            </button>

            {saved
              ? <div className="pf-saved"><Icon name="check" size={14} color="#4ade80" />{isAr ? 'تم الحفظ' : 'Saved!'}</div>
              : (
                <button className="pf-save-btn" onClick={handleSave} disabled={saving}>
                  {saving
                    ? <><span className="pf-spinner" />{isAr ? 'جارٍ الحفظ…' : 'Saving…'}</>
                    : <><Icon name="save" size={15} color="#fff" />{isAr ? 'حفظ التغييرات' : 'Save Changes'}</>
                  }
                </button>
              )
            }
          </div>
        </header>

        {/* ── BODY ── */}
        <div className="pf-body">

          {/* ── LEFT ── */}
          <div className="pf-left">
            {/* Avatar preview card */}
            <div className="pf-avatar-card">
              <div className="pf-av-img">
                <Image
                  src={`/images/avatar-${form.avatar}.svg`}
                  alt="Profile avatar"
                  width={120} height={120}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div className="pf-av-name">{form.name || user?.name || '—'}</div>
              <div className="pf-av-role">{user?.roleName || 'Student'}</div>
              <div className="pf-av-source">{user?.source === 'google' ? 'Google' : user?.source === 'admin' ? 'Admin Created' : 'Self Registered'}</div>
            </div>

            {/* Tab list */}
            <div className="pf-tabs">
              {tabs.map(tab => (
                <div
                  key={tab.id}
                  className={`pf-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon name={tab.icon} size={16} color="currentColor" />
                  {isAr ? tab.labelAr : tab.labelEn}
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT ── */}
          <div className="pf-right">
            {error && (
              <div className="pf-error" style={{ marginBottom: 0, borderRadius: '14px 14px 0 0' }}>
                <Icon name="info" size={15} color="#f87171" />{error}
              </div>
            )}

            {/* ─── PERSONAL INFO ─── */}
            {activeTab === 'personal' && (
              <div className="pf-card">
                <div className="pf-card-hd">
                  <div className="pf-card-hd-icon"><Icon name="user" size={18} color="#c9932c" /></div>
                  <div>
                    <div className="pf-card-hd-title">{isAr ? 'المعلومات الشخصية' : 'Personal Information'}</div>
                    <div className="pf-card-hd-sub">{isAr ? 'بياناتك الأساسية' : 'Your basic details'}</div>
                  </div>
                </div>
                <div className="pf-card-body">
                  <div className="pf-grid">
                    <div className="pf-field">
                      <label className="pf-label">{isAr ? 'الاسم الكامل' : 'Full Name'} *</label>
                      <input className="pf-input" value={form.name} onChange={e => set('name', e.target.value)}
                        placeholder={isAr ? 'الاسم الكامل' : 'Your full name'} />
                    </div>
                    <div className="pf-field">
                      <label className="pf-label">{isAr ? 'اسم المستخدم' : 'Username'}</label>
                      <input className="pf-input" value={form.username} disabled
                        placeholder={isAr ? 'اسم المستخدم' : 'Username'} />
                      <span className="pf-hint">{isAr ? 'لا يمكن تغييره' : 'Cannot be changed'}</span>
                    </div>
                    <div className="pf-field">
                      <DatePicker
                        value={form.dob}
                        onChange={val => set('dob', val)}
                        label={isAr ? 'تاريخ الميلاد' : 'Date of Birth'}
                      />
                    </div>
                    <div className="pf-field">
                      <label className="pf-label">{isAr ? 'الجنس' : 'Gender'}</label>
                      <select className="pf-input pf-select" value={form.gender} onChange={e => set('gender', e.target.value)}>
                        <option value="">{isAr ? 'اختر…' : 'Select…'}</option>
                        {GENDERS.map(g => <option key={g.value} value={g.value}>{isAr ? g.ar : g.en}</option>)}
                      </select>
                    </div>
                    <div className="pf-field pf-full">
                      <label className="pf-label">{isAr ? 'نبذة شخصية' : 'Bio / About Me'}</label>
                      <textarea className="pf-input pf-textarea" value={form.bio}
                        onChange={e => set('bio', e.target.value)}
                        placeholder={isAr ? 'اكتب نبذة قصيرة عن نفسك…' : 'Write a short bio about yourself…'} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── CONTACT ─── */}
            {activeTab === 'contact' && (
              <div className="pf-card">
                <div className="pf-card-hd">
                  <div className="pf-card-hd-icon"><Icon name="phone" size={18} color="#c9932c" /></div>
                  <div>
                    <div className="pf-card-hd-title">{isAr ? 'بيانات الاتصال' : 'Contact Details'}</div>
                    <div className="pf-card-hd-sub">{isAr ? 'بريدك ورقم هاتفك وعنوانك' : 'Your email, phone, and address'}</div>
                  </div>
                </div>
                <div className="pf-card-body">
                  <div className="pf-grid">
                    <div className="pf-field">
                      <label className="pf-label">{isAr ? 'البريد الإلكتروني' : 'Email Address'}</label>
                      <input className="pf-input" value={user?.email || ''} disabled />
                      <span className="pf-hint">{isAr ? 'لا يمكن تغيير البريد الإلكتروني' : 'Email cannot be changed'}</span>
                    </div>
                    <div className="pf-field">
                      <label className="pf-label">{isAr ? 'رقم الهاتف' : 'Phone Number'}</label>
                      <input className="pf-input" type="tel" value={form.phone}
                        onChange={e => set('phone', e.target.value)}
                        placeholder={isAr ? 'رقم الهاتف' : '+1 234 567 8900'} />
                    </div>
                    <div className="pf-field">
                      <label className="pf-label">{isAr ? 'البلد' : 'Country'}</label>
                      <select className="pf-input pf-select" value={form.country} onChange={e => set('country', e.target.value)}>
                        <option value="">{isAr ? 'اختر البلد…' : 'Select country…'}</option>
                        {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="pf-field">
                      <label className="pf-label">{isAr ? 'المدينة' : 'City'}</label>
                      <input className="pf-input" value={form.city}
                        onChange={e => set('city', e.target.value)}
                        placeholder={isAr ? 'المدينة' : 'Your city'} />
                    </div>
                    <div className="pf-field">
                      <label className="pf-label">{isAr ? 'رقم الهوية الوطنية' : 'National ID'}</label>
                      <input className="pf-input" value={form.nationalId}
                        onChange={e => set('nationalId', e.target.value)}
                        placeholder={isAr ? 'رقم الهوية (اختياري)' : 'ID number (optional)'} />
                    </div>
                    <div className="pf-field">
                      <label className="pf-label">{isAr ? 'جهة الاتصال في حالات الطوارئ' : 'Emergency Contact'}</label>
                      <input className="pf-input" value={form.emergencyContact}
                        onChange={e => set('emergencyContact', e.target.value)}
                        placeholder={isAr ? 'الاسم ورقم الهاتف' : 'Name & phone number'} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── AVATAR ─── */}
            {activeTab === 'avatar' && (
              <div className="pf-card">
                <div className="pf-card-hd">
                  <div className="pf-card-hd-icon"><Icon name="shield" size={18} color="#c9932c" /></div>
                  <div>
                    <div className="pf-card-hd-title">{isAr ? 'الصورة الرمزية' : 'Choose Your Avatar'}</div>
                    <div className="pf-card-hd-sub">{isAr ? 'اختر صورة رمزية من المجموعة المتاحة' : 'Select one of the available avatars'}</div>
                  </div>
                </div>
                <div className="pf-card-body">
                  <div style={{ marginBottom: 20, padding: 14, background: 'var(--pf-gold-bg)', border: '1px solid var(--pf-gold-bd)', borderRadius: 10, fontSize: '.82rem', color: 'var(--pf-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon name="info" size={15} color="#c9932c" />
                    {isAr ? 'لا يمكن رفع صورة شخصية. يرجى الاختيار من الصور الرمزية أدناه فقط.' : 'Photo uploads are not allowed. Please choose from the avatars below only.'}
                  </div>
                  <div className="pf-av-grid">
                    {AVATARS.map(av => (
                      <div key={av.id}>
                        <div
                          className={`pf-av-option ${form.avatar === av.id ? 'selected' : ''}`}
                          onClick={() => set('avatar', av.id)}
                        >
                          <Image
                            src={`/images/avatar-${av.id}.svg`}
                            alt={av.label}
                            width={160} height={160}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          />
                          {form.avatar === av.id && (
                            <div className="pf-av-check">
                              <Icon name="check" size={11} color="#fff" />
                            </div>
                          )}
                        </div>
                        <div className="pf-av-label">{isAr ? `صورة ${av.id.replace('user', '')}` : av.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ─── ACCOUNT ─── */}
            {activeTab === 'account' && (
              <div className="pf-card">
                <div className="pf-card-hd">
                  <div className="pf-card-hd-icon"><Icon name="info" size={18} color="#c9932c" /></div>
                  <div>
                    <div className="pf-card-hd-title">{isAr ? 'معلومات الحساب' : 'Account Information'}</div>
                    <div className="pf-card-hd-sub">{isAr ? 'بيانات حسابك على المنصة' : 'Your platform account details'}</div>
                  </div>
                </div>
                <div className="pf-card-body">
                  <div className="pf-info-row">
                    <span className="pf-info-key">{isAr ? 'معرّف المستخدم' : 'User ID'}</span>
                    <span className="pf-info-val" style={{ fontSize: '.72rem', fontFamily: 'monospace', opacity: .65 }}>{user?.id}</span>
                  </div>
                  <div className="pf-info-row">
                    <span className="pf-info-key">{isAr ? 'البريد الإلكتروني' : 'Email'}</span>
                    <span className="pf-info-val">{user?.email}</span>
                  </div>
                  <div className="pf-info-row">
                    <span className="pf-info-key">{isAr ? 'اسم المستخدم' : 'Username'}</span>
                    <span className="pf-info-val">{user?.username || '—'}</span>
                  </div>
                  <div className="pf-info-row">
                    <span className="pf-info-key">{isAr ? 'الدور' : 'Role'}</span>
                    <span className="pf-info-val"><span className="pf-pill pf-pill-gold">{user?.roleName || 'Student'}</span></span>
                  </div>
                  <div className="pf-info-row">
                    <span className="pf-info-key">{isAr ? 'طريقة التسجيل' : 'Registration Method'}</span>
                    <span className="pf-info-val">
                      <span className="pf-pill pf-pill-green">
                        {user?.source === 'google' ? 'Google OAuth' : user?.source === 'admin' ? 'Admin Created' : 'Self Registered'}
                      </span>
                    </span>
                  </div>
                  <div className="pf-info-row">
                    <span className="pf-info-key">{isAr ? 'تاريخ الانضمام' : 'Member Since'}</span>
                    <span className="pf-info-val">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                    </span>
                  </div>
                  {user?.updatedAt && (
                    <div className="pf-info-row">
                      <span className="pf-info-key">{isAr ? 'آخر تحديث' : 'Last Updated'}</span>
                      <span className="pf-info-val">
                        {new Date(user.updatedAt).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                  )}
                  {user?.dob && (
                    <div className="pf-info-row">
                      <span className="pf-info-key">{isAr ? 'تاريخ الميلاد' : 'Date of Birth'}</span>
                      <span className="pf-info-val">
                        {new Date(user.dob).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
