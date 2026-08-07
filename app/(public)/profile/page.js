'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useLang } from '@/context/LangContext'
import { useTheme } from '@/context/ThemeContext'
import DatePicker from '@/components/ui/DatePicker'
import PhoneInput from '@/components/ui/PhoneInput'
import { DEFAULT_COUNTRY, parsePhone, COUNTRIES as DIAL_COUNTRIES } from '@/lib/countries'
import flags from 'country-flag-icons/react/3x2'
import Select from '@/components/ui/Select'

/* ── tiny helpers ────────────────────────────────────────────────── */
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
const DEGREES = [
  { en: 'High School / Secondary', ar: 'ثانوية عامة' },
  { en: 'Diploma',                  ar: 'دبلوم' },
  { en: "Associate's Degree",       ar: 'درجة مساعد' },
  { en: "Bachelor's Degree",        ar: 'بكالوريوس' },
  { en: 'Postgraduate Diploma',     ar: 'دبلوم دراسات عليا' },
  { en: "Master's Degree",          ar: 'ماجستير' },
  { en: 'Doctorate (PhD)',           ar: 'دكتوراه' },
  { en: 'Other',                     ar: 'أخرى' },
]
const EN_LEVELS = ['A1','A2','B1','B2','C1','C2']

/* ── flag image ──────────────────────────────────────────────────── */
function FlagImg({ code, width = 22 }) {
  const Svg = flags[code]
  if (!Svg) return (
    <span style={{
      display:'inline-flex',alignItems:'center',justifyContent:'center',
      width,height:Math.round(width*0.67),
      background:'#e5e7eb',borderRadius:2,flexShrink:0,
      fontSize:8,fontWeight:700,color:'#6b7280',
    }}>{code}</span>
  )
  return (
    <Svg style={{
      width,height:Math.round(width*0.67),
      borderRadius:2,display:'block',flexShrink:0,
      boxShadow:'0 0 0 1px rgba(0,0,0,.1)',
    }} />
  )
}

/* ── country select (with flag + Arabic name) ────────────────────── */
function CountrySelect({ value, onChange, isAr, isDark }) {
  const [open, setOpen]     = useState(false)
  const [search, setSearch] = useState('')
  const wrapRef   = useRef(null)
  const searchRef = useRef(null)

  useEffect(() => {
    function h(e) { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  useEffect(() => { if (open) setTimeout(() => searchRef.current?.focus(), 40) }, [open])

  const selected = DIAL_COUNTRIES.find(c => c.name === value)
  const filtered = search.trim()
    ? DIAL_COUNTRIES.filter(c => {
        const q = search.toLowerCase()
        return c.name.toLowerCase().includes(q) || (c.nameAr && c.nameAr.includes(search))
      })
    : DIAL_COUNTRIES

  const inputBg  = isDark ? 'rgba(255,255,255,.05)' : '#f9fafb'
  const inputBd  = isDark ? 'rgba(255,255,255,.1)'  : '#d1d5db'
  const focusBd  = 'rgba(201,147,44,.65)'
  const txt      = isDark ? '#f1f5f9' : '#111827'
  const muted    = isDark ? 'rgba(255,255,255,.35)' : '#9ca3af'
  const dropBg   = isDark ? '#0d2030' : '#ffffff'
  const dropBd   = isDark ? 'rgba(201,147,44,.28)' : '#e2e8f0'
  const hoverBg  = isDark ? 'rgba(255,255,255,.07)' : '#f1f5f9'
  const activeBg = 'rgba(201,147,44,.12)'
  const divider  = isDark ? 'rgba(255,255,255,.04)' : '#f8fafc'

  return (
    <div ref={wrapRef} style={{ position:'relative',width:'100%' }}>
      <button
        type="button"
        onClick={() => { setOpen(v => !v); setSearch('') }}
        style={{
          display:'flex',alignItems:'center',gap:9,
          width:'100%',padding:'10px 13px',
          background:inputBg,
          border:`1px solid ${open ? focusBd : inputBd}`,
          borderRadius:10,color:txt,
          cursor:'pointer',fontFamily:'inherit',fontSize:'.88rem',
          textAlign:isAr?'right':'left',transition:'border-color .15s',
        }}
      >
        {selected
          ? <><FlagImg code={selected.code} width={22} /><span style={{flex:1}}>{isAr && selected.nameAr ? selected.nameAr : selected.name}</span></>
          : <span style={{flex:1,color:muted}}>{isAr ? 'اختر البلد…' : 'Select country…'}</span>
        }
        <svg viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="2.5" width="11" height="11"
          style={{transform:open?'rotate(180deg)':'none',transition:'transform .2s',flexShrink:0}}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div style={{
          position:'absolute',top:'calc(100% + 4px)',left:0,right:0,zIndex:200,
          background:dropBg,border:`1.5px solid ${dropBd}`,
          borderRadius:12,overflow:'hidden',
          boxShadow:'0 16px 48px rgba(0,0,0,.28)',
        }}>
          <div style={{padding:'8px 8px 6px',borderBottom:`1px solid ${isDark?'rgba(255,255,255,.07)':'#f0f4f8'}`}}>
            <div style={{position:'relative'}}>
              <svg viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="2" width="13" height="13"
                style={{position:'absolute',left:9,top:'50%',transform:'translateY(-50%)',pointerEvents:'none'}}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)}
                placeholder={isAr ? 'ابحث بالاسم…' : 'Search country…'}
                dir={isAr ? 'rtl' : 'ltr'}
                style={{
                  width:'100%',padding:'7px 9px 7px 28px',
                  background:isDark?'rgba(255,255,255,.06)':'#f9fafb',
                  border:`1px solid ${isDark?'rgba(255,255,255,.1)':'#e2e8f0'}`,
                  borderRadius:7,color:txt,fontSize:'.82rem',fontFamily:'inherit',outline:'none',
                }}
              />
            </div>
          </div>
          <div style={{maxHeight:220,overflowY:'auto'}}>
            {filtered.length === 0
              ? <div style={{padding:'14px',textAlign:'center',color:muted,fontSize:'.82rem'}}>{isAr?'لا توجد نتائج':'No results'}</div>
              : filtered.map(c => {
                  const isSel = selected?.code === c.code
                  return (
                    <button key={c.code} type="button"
                      onClick={() => { onChange(c.name); setOpen(false) }}
                      style={{
                        display:'flex',alignItems:'center',gap:10,
                        width:'100%',padding:'9px 13px',
                        background:isSel ? activeBg : 'transparent',
                        border:'none',borderBottom:`1px solid ${divider}`,
                        cursor:'pointer',color:txt,fontFamily:'inherit',fontSize:'.84rem',
                        direction:'ltr',textAlign:'left',transition:'background .1s',
                      }}
                      onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = hoverBg }}
                      onMouseLeave={e => { e.currentTarget.style.background = isSel ? activeBg : 'transparent' }}
                    >
                      <FlagImg code={c.code} width={22} />
                      <span style={{flex:1,textAlign:isAr?'right':'left',direction:isAr?'rtl':'ltr'}}>
                        {isAr && c.nameAr ? c.nameAr : c.name}
                      </span>
                    </button>
                  )
                })
            }
          </div>
        </div>
      )}
    </div>
  )
}

/* ── icon set ────────────────────────────────────────────────────── */
function Icon({ name, size = 18, color = 'currentColor' }) {
  const s = { stroke:color,fill:'none',strokeWidth:'1.8',width:size,height:size,style:{flexShrink:0} }
  switch (name) {
    case 'arrowLeft':  return <svg viewBox="0 0 24 24" {...s}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
    case 'save':       return <svg viewBox="0 0 24 24" {...s}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
    case 'user':       return <svg viewBox="0 0 24 24" {...s}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    case 'phone':      return <svg viewBox="0 0 24 24" {...s}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.7A16 16 0 0 0 16 16.73l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
    case 'info':       return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
    case 'shield':     return <svg viewBox="0 0 24 24" {...s}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    case 'check':      return <svg viewBox="0 0 24 24" {...s}><polyline points="20 6 9 17 4 12"/></svg>
    case 'book':       return <svg viewBox="0 0 24 24" {...s}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
    case 'sun':        return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
    case 'moon':       return <svg viewBox="0 0 24 24" {...s}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
    case 'mic':        return <svg viewBox="0 0 24 24" {...s}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
    default:           return null
  }
}

/* ── section header ──────────────────────────────────────────────── */
function SectionHeader({ icon, titleEn, titleAr, subEn, subAr, isAr, isDark }) {
  return (
    <div style={{
      display:'flex',alignItems:'center',gap:16,
      padding:'20px 26px',
      background:isDark ? 'rgba(201,147,44,.06)' : 'rgba(201,147,44,.04)',
      borderBottom:`1px solid ${isDark?'rgba(255,255,255,.07)':'#f0f4f8'}`,
      borderLeft:'4px solid #c9932c',
    }}>
      <div style={{
        width:42,height:42,borderRadius:12,flexShrink:0,
        background:'rgba(201,147,44,.12)',border:'1.5px solid rgba(201,147,44,.28)',
        display:'flex',alignItems:'center',justifyContent:'center',
      }}>
        <Icon name={icon} size={20} color="#c9932c" />
      </div>
      <div>
        <div style={{fontSize:'1rem',fontWeight:800,color:'#c9932c',lineHeight:1.2}}>
          {isAr ? titleAr : titleEn}
        </div>
        <div style={{fontSize:'.78rem',color:isDark?'rgba(255,255,255,.4)':'#6b7280',marginTop:3}}>
          {isAr ? subAr : subEn}
        </div>
      </div>
    </div>
  )
}

/* ── topics multi-select dropdown (portal-based to escape overflow:hidden) ── */
function TopicsDropdown({ topics, selected, onChange, onCreateRequest, isAr, isDark, C }) {
  const [open,    setOpen]    = useState(false)
  const [search,  setSearch]  = useState('')
  const [mounted, setMounted] = useState(false)
  const [pos,     setPos]     = useState({ top: 0, left: 0, width: 300 })
  const triggerRef = useRef(null)
  const dropRef    = useRef(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!open) return
    function reposition() {
      if (triggerRef.current) {
        const r = triggerRef.current.getBoundingClientRect()
        setPos({ top: r.bottom + 4, left: r.left, width: r.width })
      }
    }
    reposition()
    function onOutside(e) {
      if (dropRef.current?.contains(e.target) || triggerRef.current?.contains(e.target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    window.addEventListener('scroll', reposition, true)
    window.addEventListener('resize', reposition)
    return () => {
      document.removeEventListener('mousedown', onOutside)
      window.removeEventListener('scroll', reposition, true)
      window.removeEventListener('resize', reposition)
    }
  }, [open])

  const selectedObjects = topics.filter(t => selected.includes(t.id))
  const filtered = search.trim()
    ? topics.filter(t => t.nameEn.toLowerCase().includes(search.toLowerCase()) || t.nameAr.includes(search))
    : topics

  function toggle(id) {
    onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id])
  }

  const dropBg  = isDark ? '#0d2030' : '#fff'
  const dropBd  = isDark ? 'rgba(201,147,44,.28)' : '#e2e8f0'
  const hoverBg = isDark ? 'rgba(255,255,255,.06)' : '#f1f5f9'
  const divider = isDark ? 'rgba(255,255,255,.04)' : '#f8fafc'

  const dropdown = open && mounted && createPortal(
    <div ref={dropRef} style={{
      position: 'fixed',
      top: pos.top,
      left: pos.left,
      width: pos.width,
      zIndex: 9999,
      background: dropBg,
      border: `1.5px solid ${dropBd}`,
      borderRadius: 12,
      overflow: 'hidden',
      boxShadow: '0 16px 48px rgba(0,0,0,.28)',
    }}>
      <div style={{ padding: '8px 8px 6px', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,.07)' : '#f0f4f8'}` }}>
        <div style={{ position: 'relative' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke={C.xmuted} strokeWidth="2" width="13" height="13"
            style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} autoFocus
            placeholder={isAr ? 'ابحث عن موضوع…' : 'Search topics…'}
            style={{
              width: '100%', padding: '7px 9px 7px 28px',
              background: isDark ? 'rgba(255,255,255,.06)' : '#f9fafb',
              border: `1px solid ${isDark ? 'rgba(255,255,255,.1)' : '#e2e8f0'}`,
              borderRadius: 7, color: C.text, fontSize: '.82rem', fontFamily: 'inherit', outline: 'none',
            }}
          />
        </div>
      </div>

      <div style={{ maxHeight: 240, overflowY: 'auto' }}>
        {filtered.length === 0
          ? <div style={{ padding: '14px', textAlign: 'center', color: C.xmuted, fontSize: '.82rem' }}>
              {isAr ? 'لا توجد نتائج' : 'No topics found'}
            </div>
          : filtered.map(t => {
              const isSel = selected.includes(t.id)
              return (
                <button key={t.id} type="button" onClick={() => toggle(t.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '9px 13px',
                  background: isSel ? 'rgba(201,147,44,.08)' : 'transparent',
                  border: 'none', borderBottom: `1px solid ${divider}`,
                  cursor: 'pointer', color: C.text, fontFamily: 'inherit', fontSize: '.84rem',
                  textAlign: isAr ? 'right' : 'left', transition: 'background .1s',
                }}
                  onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = hoverBg }}
                  onMouseLeave={e => { e.currentTarget.style.background = isSel ? 'rgba(201,147,44,.08)' : 'transparent' }}
                >
                  <div style={{
                    width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                    border: `1.5px solid ${isSel ? '#c9932c' : isDark ? 'rgba(255,255,255,.25)' : '#d1d5db'}`,
                    background: isSel ? '#c9932c' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all .12s',
                  }}>
                    {isSel && <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" width="10" height="10"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                  {isAr ? t.nameAr : t.nameEn}
                </button>
              )
            })}
      </div>

      <div style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,.07)' : '#f0f4f8'}`, padding: '6px 8px' }}>
        <button type="button" onClick={() => { setOpen(false); onCreateRequest(search) }} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          width: '100%', padding: '8px 10px',
          background: 'none', border: `1px dashed ${isDark ? 'rgba(201,147,44,.3)' : 'rgba(201,147,44,.4)'}`,
          borderRadius: 8, cursor: 'pointer', color: '#c9932c', fontSize: '.82rem', fontFamily: 'inherit',
          transition: 'background .12s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,147,44,.07)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {isAr
            ? `إنشاء موضوع جديد${search.trim() ? ` "${search.trim()}"` : ''}`
            : `Create new topic${search.trim() ? ` "${search.trim()}"` : ''}`
          }
        </button>
      </div>
    </div>,
    document.body
  )

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {selectedObjects.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {selectedObjects.map(t => (
            <span key={t.id} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 10px 4px 12px',
              background: 'rgba(201,147,44,.1)', border: '1px solid rgba(201,147,44,.3)',
              borderRadius: 100, fontSize: '.78rem', fontWeight: 600, color: '#c9932c',
            }}>
              {isAr ? t.nameAr : t.nameEn}
              <button type="button" onClick={() => onChange(selected.filter(x => x !== t.id))} style={{
                background: 'none', border: 'none', cursor: 'pointer', color: '#c9932c',
                padding: 0, lineHeight: 0, opacity: .7,
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="11" height="11">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      <button ref={triggerRef} type="button" onClick={() => { setOpen(v => !v); setSearch('') }} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 9,
        width: '100%', padding: '10px 13px',
        background: C.inputBg, border: `1px solid ${open ? 'rgba(201,147,44,.6)' : C.inputBd}`,
        borderRadius: 10, color: selected.length ? C.text : C.xmuted,
        cursor: 'pointer', fontFamily: 'inherit', fontSize: '.88rem',
        textAlign: isAr ? 'right' : 'left', transition: 'border-color .15s',
        boxShadow: open ? '0 0 0 3px rgba(201,147,44,.09)' : 'none',
      }}>
        <span>
          {selected.length === 0
            ? (isAr ? 'اختر مواضيع للمحادثة…' : 'Select conversation topics…')
            : (isAr ? `${selected.length} موضوع محدد` : `${selected.length} topic${selected.length === 1 ? '' : 's'} selected`)}
        </span>
        <svg viewBox="0 0 24 24" fill="none" stroke={C.xmuted} strokeWidth="2.5" width="11" height="11"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {dropdown}
    </div>
  )
}

/* ── page ────────────────────────────────────────────────────────── */
export default function ProfilePage() {
  const router = useRouter()
  const { lang, dir, toggleLang } = useLang()
  const { theme, toggleTheme } = useTheme()
  const isAr   = lang === 'ar'
  const isDark  = theme === 'dark'

  const [user,         setUser]         = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [saving,       setSaving]       = useState(false)
  const [saved,        setSaved]        = useState(false)
  const [error,        setError]        = useState('')
  const [phoneCountry, setPhoneCountry] = useState(DEFAULT_COUNTRY)
  const [phoneNumber,  setPhoneNumber]  = useState('')
  const [accent,          setAccent]          = useState('american')
  const [selectedTopics,  setSelectedTopics]  = useState([])
  const [availableTopics, setAvailableTopics] = useState([])
  const [newTopicModal,   setNewTopicModal]   = useState(null)
  const [newTopicEn,      setNewTopicEn]      = useState('')
  const [newTopicAr,      setNewTopicAr]      = useState('')
  const [topicCreating,   setTopicCreating]   = useState(false)
  const [topicError,      setTopicError]      = useState('')

  const [form, setForm] = useState({
    name:'', username:'', phone:'', dob:'', gender:'',
    bio:'', country:'', city:'', nationalId:'', emergencyContact:'',
    avatar:'user1',
    educationLevel:'', coursesTaken:'', expectedLevel:'',
    isEmployed:false, jobTitle:'', employer:'',
    faculty:'', university:'', teachingExperience:false, teachingWhere:'', englishLevel:'',
  })

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(me => {
      if (!me.user) { router.replace('/login'); return }
      return fetch('/api/profile')
    }).then(r => r?.json()).then(data => {
      if (!data) return
      setUser(data)
      const p = parsePhone(data.phone)
      setPhoneCountry(p.country)
      setPhoneNumber(p.number)
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
        educationLevel: data.educationLevel || '',
        coursesTaken: data.coursesTaken || '',
        expectedLevel: data.expectedLevel || '',
        isEmployed: data.isEmployed ?? false,
        jobTitle: data.jobTitle || '',
        employer: data.employer || '',
        faculty: data.faculty || '',
        university: data.university || '',
        teachingExperience: data.teachingExperience ?? false,
        teachingWhere: data.teachingWhere || '',
        englishLevel: data.englishLevel || '',
      })
      const isC = data.roleName?.toLowerCase().includes('consultant') || data.roleName?.toLowerCase().includes('assessor')
      if (isC) {
        Promise.all([
          fetch('/api/topics').then(r => r.json()),
          fetch('/api/assessor/preferences').then(r => r.json()),
        ]).then(([td, pd]) => {
          if (Array.isArray(td.topics)) setAvailableTopics(td.topics)
          if (pd.accent) setAccent(pd.accent)
          if (Array.isArray(pd.topics)) setSelectedTopics(pd.topics)
        }).catch(() => {})
      }
      setLoading(false)
    }).catch(() => { router.replace('/login') })
  }, [router])

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); setSaved(false) }

  async function handleSave() {
    setError('')
    setSaving(true)
    const phone = phoneNumber.trim() ? `${phoneCountry.dial} ${phoneNumber.trim()}` : ''
    const res   = await fetch('/api/profile', {
      method:'PUT',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ ...form, phone }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error); return }
    if (user?.roleName?.toLowerCase().includes('consultant') || user?.roleName?.toLowerCase().includes('assessor')) {
      await fetch('/api/assessor/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accent, topics: selectedTopics }),
      }).catch(() => {})
    }
    setUser(data)
    setSaved(true)
    setTimeout(() => setSaved(false), 3500)
  }

  async function handleCreateTopic() {
    if (!newTopicEn.trim() || topicCreating) return
    setTopicCreating(true)
    setTopicError('')
    try {
      const res = await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nameEn: newTopicEn.trim(), nameAr: newTopicAr.trim() || newTopicEn.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        setAvailableTopics(prev => [...prev, data.topic])
        setSelectedTopics(prev => [...prev, data.topic.id])
        setNewTopicModal(null)
        setNewTopicEn('')
        setNewTopicAr('')
      } else {
        setTopicError(data.error || 'Failed to create topic')
      }
    } catch {
      setTopicError('Network error. Please try again.')
    } finally {
      setTopicCreating(false)
    }
  }

  /* loading screen */
  if (loading) return (
    <div style={{
      minHeight:'100vh',display:'flex',flexDirection:'column',
      alignItems:'center',justifyContent:'center',
      background:isDark?'#0d1b24':'#f8fafc',padding:'40px 24px',
    }}>
      <style>{`
        @keyframes ldFloat{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-22px) scale(1.03)}}
        @keyframes ldFadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
      `}</style>
      <img src="/images/loading.svg" alt=""
        style={{width:'min(500px,82vw)',height:'min(500px,82vw)',objectFit:'contain',animation:'ldFloat 2.8s ease-in-out infinite'}} />
      <div style={{textAlign:'center',marginTop:4,animation:'ldFadeUp .55s ease both',
        fontSize:'clamp(1.7rem,4vw,2.5rem)',fontWeight:900,color:'#c9932c',
        fontFamily:isAr?"'Tajawal',sans-serif":"'Gotham',sans-serif",direction:dir}}>
        {isAr ? 'الصبر ... بيحمل' : 'Hold your horses'}
      </div>
    </div>
  )

  const isConsultant = user?.roleName?.toLowerCase().includes('consultant') || user?.roleName?.toLowerCase().includes('assessor')

  /* toggle component */
  function Toggle({ field, labelYesEn, labelYesAr, labelNoEn='No', labelNoAr='لا' }) {
    const on = form[field]
    return (
      <div style={{display:'flex',alignItems:'center',gap:12,marginTop:4}}>
        <button type="button" onClick={() => set(field, !on)} style={{
          width:44,height:24,borderRadius:12,border:'none',cursor:'pointer',
          background:on ? '#c9932c' : (isDark?'rgba(255,255,255,.15)':'#d1d5db'),
          position:'relative',transition:'background .2s',flexShrink:0,
        }}>
          <span style={{
            position:'absolute',top:3,left:on?23:3,
            width:18,height:18,borderRadius:'50%',background:'#fff',
            transition:'left .2s',display:'block',
          }}/>
        </button>
        <span style={{fontSize:'.85rem',color:isDark?'rgba(255,255,255,.6)':'#6b7280'}}>
          {on ? (isAr?labelYesAr:labelYesEn) : (isAr?labelNoAr:labelNoEn)}
        </span>
      </div>
    )
  }

  const C = {
    bg:      isDark ? '#0d1b24'                : '#f8fafc',
    surface: isDark ? '#10222b'                : '#ffffff',
    border:  isDark ? 'rgba(255,255,255,.07)'  : '#e5e7eb',
    text:    isDark ? '#f1f5f9'                : '#111827',
    muted:   isDark ? 'rgba(255,255,255,.45)'  : '#6b7280',
    xmuted:  isDark ? 'rgba(255,255,255,.22)'  : '#9ca3af',
    inputBg: isDark ? 'rgba(255,255,255,.05)'  : '#f9fafb',
    inputBd: isDark ? 'rgba(255,255,255,.1)'   : '#d1d5db',
    hover:   isDark ? 'rgba(255,255,255,.04)'  : '#f3f4f6',
    shadow:  isDark ? '0 1px 4px rgba(0,0,0,.35)' : '0 1px 3px rgba(0,0,0,.07)',
    shadowM: isDark ? '0 8px 32px rgba(0,0,0,.4)'  : '0 8px 32px rgba(0,0,0,.1)',
  }

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        @keyframes pfSpin{to{transform:rotate(360deg)}}
        @keyframes pfFadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}

        .pf-root{min-height:100vh;background:${C.bg};color:${C.text};
          font-family:${isAr?"var(--font-tajawal,'Tajawal',sans-serif)":"var(--font-gotham,'Gotham',sans-serif)"};
          direction:${dir}}

        /* topbar */
        .pf-top{height:64px;background:${C.surface};border-bottom:1px solid ${C.border};
          display:flex;align-items:center;gap:12px;padding:0 24px;
          position:sticky;top:0;z-index:50;box-shadow:${C.shadow}}
        .pf-back{display:flex;align-items:center;gap:7px;padding:8px 14px;border-radius:9px;
          background:none;border:1px solid ${C.border};color:${C.muted};
          font-size:.82rem;font-weight:600;cursor:pointer;font-family:inherit;transition:all .15s}
        .pf-back:hover{background:${C.hover};color:${C.text}}
        .pf-ic-btn{width:36px;height:36px;border-radius:9px;background:none;border:1px solid ${C.border};
          color:${C.muted};display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s}
        .pf-ic-btn:hover{background:${C.hover};color:${C.text}}
        .pf-lang-btn{height:36px;padding:0 13px;border-radius:9px;background:none;border:1px solid ${C.border};
          color:${C.muted};font-size:.72rem;font-weight:700;letter-spacing:.06em;cursor:pointer;
          font-family:inherit;transition:all .15s}
        .pf-lang-btn:hover{background:${C.hover};color:${C.text}}

        /* content */
        .pf-content{max-width:820px;margin:0 auto;padding:36px 24px 80px;
          display:flex;flex-direction:column;gap:28px;animation:pfFadeUp .3s ease both}
        @media(max-width:600px){.pf-content{padding:24px 16px 64px;gap:20px}}

        /* avatar hero */
        .pf-hero{background:${C.surface};border:1px solid ${C.border};border-radius:18px;
          padding:28px 32px;display:flex;align-items:center;gap:24px;box-shadow:${C.shadow}}
        .pf-hero__img{width:90px;height:90px;border-radius:50%;overflow:hidden;flex-shrink:0;
          border:3px solid rgba(201,147,44,.35);box-shadow:0 0 0 6px rgba(201,147,44,.08)}
        .pf-hero__name{font-size:1.25rem;font-weight:900;color:${C.text};line-height:1.2;margin-bottom:4px}
        .pf-hero__role{font-size:.72rem;font-weight:700;letter-spacing:.12em;color:${C.muted};text-transform:uppercase;margin-bottom:8px}
        .pf-pill-gold{display:inline-flex;align-items:center;padding:3px 11px;border-radius:100px;
          font-size:.68rem;font-weight:700;letter-spacing:.04em;
          background:rgba(201,147,44,.1);border:1px solid rgba(201,147,44,.25);color:#c9932c}
        .pf-pill-green{display:inline-flex;align-items:center;padding:3px 11px;border-radius:100px;
          font-size:.68rem;font-weight:700;
          background:rgba(74,222,128,.1);border:1px solid rgba(74,222,128,.3);color:#4ade80}
        @media(max-width:500px){.pf-hero{flex-direction:column;text-align:center}}

        /* section cards */
        .pf-card{background:${C.surface};border:1px solid ${C.border};border-radius:18px;
          overflow:hidden;box-shadow:${C.shadow}}
        .pf-card-body{padding:28px}

        /* form grid */
        .pf-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}
        .pf-full{grid-column:1/-1}
        @media(max-width:580px){.pf-grid{grid-template-columns:1fr}}
        .pf-field{display:flex;flex-direction:column;gap:7px}
        .pf-label{font-size:.67rem;font-weight:700;letter-spacing:.1em;color:${C.muted};text-transform:uppercase}
        .pf-input{width:100%;padding:11px 14px;background:${C.inputBg};
          border:1px solid ${C.inputBd};border-radius:10px;
          color:${C.text};font-size:.88rem;font-family:inherit;outline:none;
          transition:border-color .15s,box-shadow .15s}
        .pf-input:focus{border-color:rgba(201,147,44,.6);box-shadow:0 0 0 3px rgba(201,147,44,.09)}
        .pf-input:disabled{opacity:.5;cursor:not-allowed}
        .pf-input::placeholder{color:${C.xmuted}}
        .pf-textarea{resize:vertical;min-height:90px;line-height:1.6}
        .pf-select{appearance:none;cursor:pointer}
        .pf-hint{font-size:.72rem;color:${C.xmuted};margin-top:2px}

        /* avatar grid */
        .pf-av-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:14px}
        @media(max-width:580px){.pf-av-grid{grid-template-columns:repeat(3,1fr)}}
        .pf-av-opt{cursor:pointer;border-radius:14px;overflow:hidden;
          border:2.5px solid transparent;transition:all .18s;position:relative;
          aspect-ratio:1;background:${C.bg}}
        .pf-av-opt:hover{border-color:rgba(201,147,44,.4);transform:translateY(-2px)}
        .pf-av-opt.sel{border-color:#c9932c;box-shadow:0 0 0 3px rgba(201,147,44,.12)}
        .pf-av-lbl{text-align:center;font-size:.7rem;color:${C.muted};margin-top:6px;font-weight:500}

        /* account rows */
        .pf-info-row{display:flex;justify-content:space-between;align-items:center;
          padding:13px 0;border-bottom:1px solid ${C.border}}
        .pf-info-row:last-child{border-bottom:none}
        .pf-info-key{font-size:.78rem;color:${C.muted};font-weight:500}
        .pf-info-val{font-size:.82rem;color:${C.text};font-weight:600;text-align:end}

        /* error */
        .pf-error{display:flex;align-items:center;gap:8px;
          background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);
          border-radius:12px;padding:12px 16px;color:#f87171;font-size:.84rem}

        /* save button */
        .pf-save-row{display:flex;justify-content:center;padding-top:8px}
        .pf-save-btn{display:flex;align-items:center;gap:9px;
          padding:14px 48px;border-radius:13px;
          background:linear-gradient(135deg,#c9932c 0%,#ae6d0c 100%);
          border:none;color:#fff;font-size:.95rem;font-weight:800;
          letter-spacing:${isAr?0:'.04em'};cursor:pointer;font-family:inherit;
          transition:opacity .18s,transform .18s;box-shadow:0 4px 18px rgba(201,147,44,.35)}
        .pf-save-btn:hover:not(:disabled){opacity:.9;transform:translateY(-1px)}
        .pf-save-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}
        .pf-saved-badge{display:flex;align-items:center;gap:8px;
          padding:14px 32px;border-radius:13px;
          background:rgba(74,222,128,.1);border:1.5px solid rgba(74,222,128,.3);
          color:#4ade80;font-size:.88rem;font-weight:700}
        .pf-spinner{width:16px;height:16px;border:2px solid rgba(255,255,255,.3);
          border-top-color:#fff;border-radius:50%;animation:pfSpin .7s linear infinite}
      `}</style>

      <div className="pf-root">

        {/* ── TOPBAR (no save button here) ── */}
        <header className="pf-top">
          <button className="pf-back" onClick={() => router.push('/portal')}>
            <Icon name="arrowLeft" size={14} color="currentColor" />
            {isAr ? 'العودة إلى البوابة' : 'Back to Portal'}
          </button>
          <span style={{flex:1,textAlign:'center',fontSize:'.95rem',fontWeight:800,color:C.text}}>
            {isAr ? 'الملف الشخصي' : 'My Profile'}
          </span>
          <div style={{display:'flex',gap:8}}>
            <button className="pf-lang-btn" onClick={toggleLang}>{lang==='en'?'عربي':'EN'}</button>
            <button className="pf-ic-btn" onClick={toggleTheme}>
              <Icon name={isDark?'sun':'moon'} size={15} color="currentColor" />
            </button>
          </div>
        </header>

        {/* ── CONTENT ── */}
        <main className="pf-content">

          {error && (
            <div className="pf-error">
              <Icon name="info" size={15} color="#f87171" />{error}
            </div>
          )}

          {/* ── AVATAR HERO ── */}
          <div className="pf-hero">
            <div className="pf-hero__img">
              <Image src={`/images/avatar-${form.avatar}.svg`} alt="avatar"
                width={90} height={90} style={{width:'100%',height:'100%',objectFit:'cover'}} />
            </div>
            <div>
              <div className="pf-hero__name">{form.name || user?.name || '—'}</div>
              <div className="pf-hero__role">{user?.roleName || 'Student'}</div>
              <span className="pf-pill-gold">{user?.email || ''}</span>
            </div>
          </div>

          {/* ────────────────────────────────────────── */}
          {/* SECTION 1 — PERSONAL INFO */}
          {/* ────────────────────────────────────────── */}
          <div className="pf-card">
            <SectionHeader
              icon="user"
              titleEn="Personal Information" titleAr="المعلومات الشخصية"
              subEn="Your basic details" subAr="بياناتك الأساسية"
              isAr={isAr} isDark={isDark}
            />
            <div className="pf-card-body">
              <div className="pf-grid">
                <div className="pf-field">
                  <label className="pf-label">{isAr ? 'الاسم الكامل *' : 'FULL NAME *'}</label>
                  <input className="pf-input" value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder={isAr ? 'الاسم الكامل' : 'Your full name'} />
                </div>
                <div className="pf-field">
                  <label className="pf-label">{isAr ? 'اسم المستخدم' : 'USERNAME'}</label>
                  <input className="pf-input" value={form.username}
                    onChange={e => set('username', e.target.value)}
                    placeholder={isAr ? 'اسم المستخدم' : 'Username'} />
                </div>
                <div className="pf-field">
                  <DatePicker
                    value={form.dob}
                    onChange={val => set('dob', val)}
                    label={isAr ? 'تاريخ الميلاد' : 'Date of Birth'}
                  />
                </div>
                <div className="pf-field">
                  <label className="pf-label">{isAr ? 'الجنس' : 'GENDER'}</label>
                  <Select
                    value={form.gender} onChange={v => set('gender', v)}
                    options={GENDERS.map(g => ({ value: g.value, label: g.en, labelAr: g.ar }))}
                    placeholder="Select…" placeholderAr="اختر…"
                    isAr={isAr} isDark={isDark}
                  />
                </div>
                <div className="pf-field pf-full">
                  <label className="pf-label">{isAr ? 'نبذة شخصية' : 'BIO / ABOUT ME'}</label>
                  <textarea className="pf-input pf-textarea" value={form.bio}
                    onChange={e => set('bio', e.target.value)}
                    placeholder={isAr ? 'اكتب نبذة قصيرة عن نفسك…' : 'Write a short bio about yourself…'} />
                </div>
              </div>
            </div>
          </div>

          {/* ────────────────────────────────────────── */}
          {/* SECTION 2 — CONTACT */}
          {/* ────────────────────────────────────────── */}
          <div className="pf-card">
            <SectionHeader
              icon="phone"
              titleEn="Contact Details" titleAr="بيانات الاتصال"
              subEn="Your email, phone, and address" subAr="بريدك ورقم هاتفك وعنوانك"
              isAr={isAr} isDark={isDark}
            />
            <div className="pf-card-body">
              <div className="pf-grid">
                <div className="pf-field">
                  <label className="pf-label">{isAr ? 'البريد الإلكتروني' : 'EMAIL ADDRESS'}</label>
                  <input className="pf-input" value={user?.email || ''} disabled />
                  <span className="pf-hint">{isAr ? 'لا يمكن تغيير البريد الإلكتروني' : 'Email cannot be changed'}</span>
                </div>
                <div className="pf-field">
                  <label className="pf-label">{isAr ? 'رقم الهاتف' : 'PHONE NUMBER'}</label>
                  <PhoneInput
                    country={phoneCountry} number={phoneNumber}
                    onCountryChange={setPhoneCountry} onNumberChange={setPhoneNumber}
                    isAr={isAr} isDark={isDark}
                  />
                </div>
                <div className="pf-field">
                  <label className="pf-label">{isAr ? 'البلد' : 'COUNTRY'}</label>
                  <CountrySelect
                    value={form.country}
                    onChange={v => set('country', v)}
                    isAr={isAr} isDark={isDark}
                  />
                </div>
                <div className="pf-field">
                  <label className="pf-label">{isAr ? 'المدينة' : 'CITY'}</label>
                  <input className="pf-input" value={form.city}
                    onChange={e => set('city', e.target.value)}
                    placeholder={isAr ? 'المدينة' : 'Your city'} />
                </div>
                <div className="pf-field">
                  <label className="pf-label">{isAr ? 'رقم الهوية الوطنية' : 'NATIONAL ID'}</label>
                  <input className="pf-input" value={form.nationalId}
                    onChange={e => set('nationalId', e.target.value)}
                    placeholder={isAr ? 'رقم الهوية (اختياري)' : 'ID number (optional)'} />
                </div>
                <div className="pf-field">
                  <label className="pf-label">{isAr ? 'جهة الاتصال في حالات الطوارئ' : 'EMERGENCY CONTACT'}</label>
                  <input className="pf-input" value={form.emergencyContact}
                    onChange={e => set('emergencyContact', e.target.value)}
                    placeholder={isAr ? 'الاسم ورقم الهاتف' : 'Name & phone number'} />
                </div>
              </div>
            </div>
          </div>

          {/* ────────────────────────────────────────── */}
          {/* SECTION 3 — ACADEMIC */}
          {/* ────────────────────────────────────────── */}
          <div className="pf-card">
            <SectionHeader
              icon="book"
              titleEn="Academic Information" titleAr="المعلومات الأكاديمية"
              subEn={isConsultant ? 'Your qualifications and professional background' : 'Your educational background and expected level'}
              subAr={isConsultant ? 'مؤهلاتك وخبرتك المهنية' : 'خلفيتك التعليمية ومستواك المتوقع'}
              isAr={isAr} isDark={isDark}
            />
            <div className="pf-card-body">
              <div className="pf-grid">
                <div className="pf-field">
                  <label className="pf-label">{isAr ? 'الدرجة العلمية' : 'EDUCATION DEGREE'}</label>
                  <Select
                    value={form.educationLevel} onChange={v => set('educationLevel', v)}
                    options={DEGREES.map(d => ({ value: d.en, label: d.en, labelAr: d.ar }))}
                    placeholder="Select degree…" placeholderAr="اختر الدرجة…"
                    isAr={isAr} isDark={isDark}
                  />
                </div>
                <div className="pf-field">
                  <label className="pf-label">{isAr ? 'الكلية / التخصص' : 'FACULTY / MAJOR'}</label>
                  <input className="pf-input" value={form.faculty}
                    onChange={e => set('faculty', e.target.value)}
                    placeholder={isAr ? 'مثال: كلية الآداب…' : 'e.g. Faculty of Arts…'} />
                </div>
                <div className="pf-field">
                  <label className="pf-label">{isAr ? 'الجامعة / المعهد' : 'UNIVERSITY / INSTITUTION'}</label>
                  <input className="pf-input" value={form.university}
                    onChange={e => set('university', e.target.value)}
                    placeholder={isAr ? 'اسم الجامعة أو المعهد' : 'Name of university or institution'} />
                </div>
                {isConsultant && (
                  <div className="pf-field">
                    <label className="pf-label">{isAr ? 'مستوى اللغة الإنجليزية' : 'ENGLISH LEVEL'}</label>
                    <Select
                      value={form.englishLevel} onChange={v => set('englishLevel', v)}
                      options={EN_LEVELS.map(l => ({ value: l, label: l, labelAr: l }))}
                      placeholder="Select level…" placeholderAr="اختر المستوى…"
                      isAr={isAr} isDark={isDark}
                    />
                  </div>
                )}
                {isConsultant && (
                  <div className="pf-field pf-full">
                    <label className="pf-label">{isAr ? 'هل لديك خبرة في التدريس؟' : 'TEACHING EXPERIENCE?'}</label>
                    <Toggle field="teachingExperience"
                      labelYesEn="Yes, I have teaching experience" labelYesAr="نعم، لدي خبرة في التدريس"
                      labelNoEn="No teaching experience yet"       labelNoAr="لا توجد خبرة تدريسية بعد" />
                  </div>
                )}
                {isConsultant && form.teachingExperience && (
                  <div className="pf-field pf-full">
                    <label className="pf-label">{isAr ? 'أين درّست؟' : 'WHERE DID YOU TEACH?'}</label>
                    <input className="pf-input" value={form.teachingWhere}
                      onChange={e => set('teachingWhere', e.target.value)}
                      placeholder={isAr ? 'اسم المدرسة أو المؤسسة أو المنصة…' : 'School, institution, or platform name…'} />
                  </div>
                )}
                {isConsultant && (
                  <div className="pf-field pf-full">
                    <label className="pf-label">{isAr ? 'هل أنت موظف حالياً؟' : 'CURRENTLY EMPLOYED?'}</label>
                    <Toggle field="isEmployed"
                      labelYesEn="Yes, employed" labelYesAr="نعم، موظف" />
                  </div>
                )}
                {isConsultant && form.isEmployed && (
                  <>
                    <div className="pf-field">
                      <label className="pf-label">{isAr ? 'المسمى الوظيفي' : 'JOB TITLE'}</label>
                      <input className="pf-input" value={form.jobTitle}
                        onChange={e => set('jobTitle', e.target.value)}
                        placeholder={isAr ? 'مثال: مدرّس لغة إنجليزية' : 'e.g. English Language Instructor'} />
                    </div>
                    <div className="pf-field">
                      <label className="pf-label">{isAr ? 'جهة العمل' : 'EMPLOYER'}</label>
                      <input className="pf-input" value={form.employer}
                        onChange={e => set('employer', e.target.value)}
                        placeholder={isAr ? 'اسم الشركة أو المؤسسة' : 'Company or organization name'} />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ────────────────────────────────────────── */}
          {/* SECTION 4 — TEACHING PREFERENCES (assessors only) */}
          {/* ────────────────────────────────────────── */}
          {isConsultant && (
            <div className="pf-card">
              <SectionHeader
                icon="mic"
                titleEn="Teaching Preferences" titleAr="تفضيلات التدريس"
                subEn="Your accent and conversation topics" subAr="لهجتك ومواضيع المحادثة المفضلة"
                isAr={isAr} isDark={isDark}
              />
              <div className="pf-card-body">
                <div className="pf-grid">
                  <div className="pf-field pf-full">
                    <label className="pf-label">{isAr ? 'لهجتك الإنجليزية' : 'YOUR ENGLISH ACCENT'}</label>
                    <div style={{ display: 'flex', borderRadius: 10, overflow: 'hidden', border: `1.5px solid ${C.inputBd}`, width: 'fit-content', marginTop: 2 }}>
                      {[
                        { value: 'american', en: 'American', ar: 'أمريكية' },
                        { value: 'british',  en: 'British',  ar: 'بريطانية' },
                      ].map(a => (
                        <button key={a.value} type="button"
                          onClick={() => { setAccent(a.value); setSaved(false) }}
                          style={{
                            padding: '9px 28px', border: 'none', cursor: 'pointer',
                            background: accent === a.value ? '#c9932c' : C.inputBg,
                            color: accent === a.value ? '#fff' : C.text,
                            fontWeight: accent === a.value ? 700 : 400,
                            fontSize: '.88rem', fontFamily: 'inherit', transition: 'all .15s',
                          }}>
                          {isAr ? a.ar : a.en}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pf-field pf-full">
                    <label className="pf-label">{isAr ? 'مواضيع المحادثة المفضلة' : 'CONVERSATION TOPICS'}</label>
                    <span className="pf-hint" style={{ marginBottom: 8, display: 'block' }}>
                      {isAr
                        ? 'اختر المواضيع التي تحب التحدث عنها مع الطلاب'
                        : 'Select topics you enjoy discussing with students'}
                    </span>
                    <TopicsDropdown
                      topics={availableTopics}
                      selected={selectedTopics}
                      onChange={ids => { setSelectedTopics(ids); setSaved(false) }}
                      onCreateRequest={prefill => {
                        setNewTopicEn(prefill.trim())
                        setNewTopicAr('')
                        setTopicError('')
                        setNewTopicModal('form')
                      }}
                      isAr={isAr} isDark={isDark} C={C}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────── */}
          {/* SECTION 5 — AVATAR */}
          {/* ────────────────────────────────────────── */}
          <div className="pf-card">
            <SectionHeader
              icon="shield"
              titleEn="Choose Your Avatar" titleAr="الصورة الرمزية"
              subEn="Select one of the available avatars" subAr="اختر صورة رمزية من المجموعة المتاحة"
              isAr={isAr} isDark={isDark}
            />
            <div className="pf-card-body">
              <div style={{
                display:'flex',alignItems:'center',gap:8,
                marginBottom:22,padding:12,
                background:'rgba(201,147,44,.06)',border:'1px solid rgba(201,147,44,.2)',
                borderRadius:10,fontSize:'.81rem',color:C.muted,
              }}>
                <Icon name="info" size={14} color="#c9932c" />
                {isAr ? 'لا يمكن رفع صورة شخصية. يرجى الاختيار من الصور الرمزية أدناه فقط.' : 'Photo uploads are not allowed. Please choose from the avatars below only.'}
              </div>
              <div className="pf-av-grid">
                {AVATARS.map(av => (
                  <div key={av.id}>
                    <div
                      className={`pf-av-opt${form.avatar===av.id?' sel':''}`}
                      onClick={() => set('avatar', av.id)}
                    >
                      <Image src={`/images/avatar-${av.id}.svg`} alt={av.label}
                        width={160} height={160}
                        style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} />
                      {form.avatar===av.id && (
                        <div style={{
                          position:'absolute',bottom:6,right:6,
                          width:20,height:20,borderRadius:'50%',
                          background:'#c9932c',display:'flex',alignItems:'center',justifyContent:'center',
                        }}>
                          <Icon name="check" size={11} color="#fff" />
                        </div>
                      )}
                    </div>
                    <div className="pf-av-lbl">{isAr ? `صورة ${av.id.replace('user','')}` : av.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ────────────────────────────────────────── */}
          {/* SECTION 6 — ACCOUNT (no User ID / reg method) */}
          {/* ────────────────────────────────────────── */}
          <div className="pf-card">
            <SectionHeader
              icon="info"
              titleEn="Account Information" titleAr="معلومات الحساب"
              subEn="Your platform account details" subAr="بيانات حسابك على المنصة"
              isAr={isAr} isDark={isDark}
            />
            <div className="pf-card-body">
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
                <span className="pf-info-val">
                  <span className="pf-pill-gold">{user?.roleName || 'Student'}</span>
                </span>
              </div>
              <div className="pf-info-row">
                <span className="pf-info-key">{isAr ? 'تاريخ الانضمام' : 'Member Since'}</span>
                <span className="pf-info-val">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString(isAr?'ar-SA':'en-US',{year:'numeric',month:'long',day:'numeric'})
                    : '—'}
                </span>
              </div>
              {user?.updatedAt && (
                <div className="pf-info-row">
                  <span className="pf-info-key">{isAr ? 'آخر تحديث' : 'Last Updated'}</span>
                  <span className="pf-info-val">
                    {new Date(user.updatedAt).toLocaleDateString(isAr?'ar-SA':'en-US',{year:'numeric',month:'long',day:'numeric'})}
                  </span>
                </div>
              )}
              {user?.dob && (
                <div className="pf-info-row">
                  <span className="pf-info-key">{isAr ? 'تاريخ الميلاد' : 'Date of Birth'}</span>
                  <span className="pf-info-val">
                    {new Date(user.dob).toLocaleDateString(isAr?'ar-SA':'en-US',{year:'numeric',month:'long',day:'numeric'})}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── SAVE BUTTON (bottom of page) ── */}
          <div className="pf-save-row">
            {saved
              ? (
                <div className="pf-saved-badge">
                  <Icon name="check" size={17} color="#4ade80" />
                  {isAr ? 'تم حفظ التغييرات بنجاح' : 'Changes saved successfully'}
                </div>
              ) : (
                <button className="pf-save-btn" onClick={handleSave} disabled={saving}>
                  {saving
                    ? <><span className="pf-spinner" />{isAr ? 'جارٍ الحفظ…' : 'Saving…'}</>
                    : <><Icon name="save" size={18} color="#fff" />{isAr ? 'حفظ التغييرات' : 'Save Changes'}</>
                  }
                </button>
              )
            }
          </div>

        </main>
      </div>

      {/* ── NEW TOPIC MODAL ── */}
      {newTopicModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)',
          backdropFilter: 'blur(4px)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }}>
          <div style={{
            background: C.surface, borderRadius: 20, padding: 28,
            width: '100%', maxWidth: 440,
            boxShadow: '0 24px 64px rgba(0,0,0,.22)',
          }}>
            {newTopicModal === 'form' ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: C.text }}>
                    {isAr ? 'إنشاء موضوع جديد' : 'Create New Topic'}
                  </div>
                  <button type="button" onClick={() => setNewTopicModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 4 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
                {topicError && (
                  <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, color: '#f87171', fontSize: '.84rem' }}>
                    {topicError}
                  </div>
                )}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: '.67rem', fontWeight: 700, letterSpacing: '.1em', color: C.muted, textTransform: 'uppercase', marginBottom: 6 }}>
                    {isAr ? 'اسم الموضوع بالإنجليزية *' : 'TOPIC NAME IN ENGLISH *'}
                  </label>
                  <input className="pf-input" value={newTopicEn} onChange={e => { setNewTopicEn(e.target.value); setTopicError('') }}
                    placeholder="e.g. Science & Technology" dir="ltr" />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: '.67rem', fontWeight: 700, letterSpacing: '.1em', color: C.muted, textTransform: 'uppercase', marginBottom: 6 }}>
                    {isAr ? 'اسم الموضوع بالعربية' : 'TOPIC NAME IN ARABIC'}
                  </label>
                  <input className="pf-input" value={newTopicAr} onChange={e => setNewTopicAr(e.target.value)}
                    placeholder="مثال: العلوم والتكنولوجيا" dir="rtl" />
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setNewTopicModal(null)} style={{
                    padding: '9px 20px', borderRadius: 10, border: `1px solid ${C.inputBd}`,
                    background: C.inputBg, color: C.text, cursor: 'pointer', fontFamily: 'inherit', fontSize: '.88rem',
                  }}>
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button type="button" onClick={() => newTopicEn.trim() && setNewTopicModal('confirm')} style={{
                    padding: '9px 20px', borderRadius: 10, border: 'none',
                    background: newTopicEn.trim() ? '#c9932c' : C.inputBd,
                    color: newTopicEn.trim() ? '#fff' : C.muted,
                    cursor: newTopicEn.trim() ? 'pointer' : 'default',
                    fontFamily: 'inherit', fontSize: '.88rem', fontWeight: 700,
                  }}>
                    {isAr ? 'التالي' : 'Next'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ textAlign: 'center', padding: '8px 0 20px' }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14, margin: '0 auto 16px',
                    background: 'rgba(201,147,44,.1)', border: '1.5px solid rgba(201,147,44,.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#c9932c" strokeWidth="1.8" width="26" height="26">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                      <line x1="7" y1="7" x2="7.01" y2="7"/>
                    </svg>
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: C.text, marginBottom: 10 }}>
                    {isAr ? 'تأكيد إنشاء الموضوع' : 'Confirm New Topic'}
                  </div>
                  <div style={{ fontSize: '.88rem', color: C.muted, lineHeight: 1.65, maxWidth: 340, margin: '0 auto' }}>
                    {isAr
                      ? <>سيتم إنشاء الموضوع <strong style={{ color: C.text }}>"{newTopicEn}"</strong> وإتاحته لجميع المستشارين الأكاديميين على المنصة.</>
                      : <><strong style={{ color: C.text }}>"{newTopicEn}"</strong> will be created as a new topic and made available to all academic consultants on the platform.</>
                    }
                  </div>
                </div>
                {topicError && (
                  <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, color: '#f87171', fontSize: '.84rem', textAlign: 'center' }}>
                    {topicError}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" onClick={() => setNewTopicModal('form')} style={{
                    flex: 1, padding: '10px', borderRadius: 10, border: `1px solid ${C.inputBd}`,
                    background: C.inputBg, color: C.text, cursor: 'pointer', fontFamily: 'inherit', fontSize: '.88rem',
                  }}>
                    {isAr ? 'رجوع' : 'Go Back'}
                  </button>
                  <button type="button" onClick={handleCreateTopic} disabled={topicCreating} style={{
                    flex: 1, padding: '10px', borderRadius: 10, border: 'none',
                    background: '#c9932c', color: '#fff',
                    cursor: topicCreating ? 'wait' : 'pointer', fontFamily: 'inherit', fontSize: '.88rem', fontWeight: 700,
                    opacity: topicCreating ? .7 : 1,
                  }}>
                    {topicCreating ? (isAr ? 'جارٍ الإنشاء…' : 'Creating…') : (isAr ? 'إنشاء الموضوع' : 'Create Topic')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
