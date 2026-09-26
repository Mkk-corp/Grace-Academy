'use client'

import { useState, useEffect } from 'react'
import { useLang } from '@/context/LangContext'

/* ── helpers ──────────────────────────────────────────────────────────── */
const DEFAULT = {
  kpis: [], story: [],
  vision: { en: '', ar: '' }, mission: { en: '', ar: '' },
  goals: [], whyUs: [], team: [],
}
function uid() { return `_${Math.random().toString(36).slice(2, 9)}` }

/* ── i18n ─────────────────────────────────────────────────────────────── */
const S = {
  en: {
    title: 'About Page',
    save: 'Save Changes', saved: '✓ Saved',
    tabs: ['KPIs', 'Story', 'Mission', 'Vision', 'Goals', 'Why Us', 'Team'],
    add: '+ Add', remove: '×',
    valueLabel: 'Display Value', labelEn: 'Label (EN)', labelAr: 'Label (AR)',
    paragraphEn: 'Paragraph (EN)', paragraphAr: 'Paragraph (AR)',
    textEn: 'Text (EN)', textAr: 'Text (AR)',
    goalEn: 'Goal (EN)', goalAr: 'Goal (AR)',
    titleEn: 'Title (EN)', titleAr: 'Title (AR)',
    bodyEn: 'Body (EN)', bodyAr: 'Body (AR)',
    name: 'Full Name', roleEn: 'Role (EN)', roleAr: 'Role (AR)',
    empty: 'No items yet.',
    kpisNote: 'Displayed as stat cards on the About page.',
    storyNote: 'Each entry is one paragraph of the story.',
    missionNote: 'The academy\'s mission statement.',
    visionNote: 'The academy\'s vision statement.',
    goalsNote: 'The academy\'s goals, shown as a list.',
    whyNote: 'Reasons to choose Grace Academy (displayed as cards).',
    teamNote: 'Team members displayed on the About page.',
  },
  ar: {
    title: 'صفحة عن الأكاديمية',
    save: 'حفظ التغييرات', saved: '✓ تم الحفظ',
    tabs: ['المؤشرات', 'القصة', 'المهمة', 'الرؤية', 'الأهداف', 'لماذا نحن', 'الفريق'],
    add: '+ إضافة', remove: '×',
    valueLabel: 'القيمة', labelEn: 'التسمية (إنجليزي)', labelAr: 'التسمية (عربي)',
    paragraphEn: 'الفقرة (إنجليزي)', paragraphAr: 'الفقرة (عربي)',
    textEn: 'النص (إنجليزي)', textAr: 'النص (عربي)',
    goalEn: 'الهدف (إنجليزي)', goalAr: 'الهدف (عربي)',
    titleEn: 'العنوان (إنجليزي)', titleAr: 'العنوان (عربي)',
    bodyEn: 'الوصف (إنجليزي)', bodyAr: 'الوصف (عربي)',
    name: 'الاسم الكامل', roleEn: 'الدور (إنجليزي)', roleAr: 'الدور (عربي)',
    empty: 'لا توجد عناصر بعد.',
    kpisNote: 'تظهر كبطاقات إحصائية في صفحة عن الأكاديمية.',
    storyNote: 'كل عنصر يمثل فقرة من قصة الأكاديمية.',
    missionNote: 'رسالة الأكاديمية.',
    visionNote: 'رؤية الأكاديمية.',
    goalsNote: 'أهداف الأكاديمية، تظهر كقائمة.',
    whyNote: 'أسباب اختيار أكاديمية جريس (تظهر كبطاقات).',
    teamNote: 'أعضاء الفريق المعروضون في صفحة عن الأكاديمية.',
  },
}

const TABS_KEYS = ['kpis', 'story', 'mission', 'vision', 'goals', 'whyUs', 'team']
const GOLD = '#c9932c'

/* ── sub-components ───────────────────────────────────────────────────── */
function SectionNote({ text }) {
  return (
    <p style={{ fontSize: '.82rem', color: 'var(--text-60)', background: 'var(--accent-dim)', border: '1px solid rgba(201,147,44,.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 20 }}>
      {text}
    </p>
  )
}

function Field({ label, value, onChange, type = 'input', rows = 3 }) {
  const base = {
    width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: '.88rem',
    background: 'var(--surface-2)', border: '1px solid var(--border)',
    color: 'var(--text)', fontFamily: 'inherit', outline: 'none',
    transition: 'border-color .15s', resize: 'vertical',
  }
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: '.72rem', fontWeight: 700, color: 'var(--text-60)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</label>
      {type === 'textarea'
        ? <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} style={base} onFocus={e => e.target.style.borderColor = GOLD} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
        : <input value={value} onChange={e => onChange(e.target.value)} style={base} onFocus={e => e.target.style.borderColor = GOLD} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
      }
    </div>
  )
}

function ItemCard({ children, onRemove, removeLabel }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 20px 8px', marginBottom: 14, position: 'relative' }}>
      {children}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4 }}>
        <button onClick={onRemove} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid rgba(239,68,68,.3)', background: 'rgba(239,68,68,.06)', color: '#ef4444', fontSize: '.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          {removeLabel}
        </button>
      </div>
    </div>
  )
}

/* ── Main ─────────────────────────────────────────────────────────────── */
export default function AdminAboutPage() {
  const { lang } = useLang()
  const isAr  = lang === 'ar'
  const s     = S[isAr ? 'ar' : 'en']

  const [data,    setData]    = useState(DEFAULT)
  const [tab,     setTab]     = useState('kpis')
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)

  useEffect(() => {
    fetch('/api/about').then(r => r.json()).then(d => { setData({ ...DEFAULT, ...d }); setLoading(false) })
  }, [])

  async function save() {
    setSaving(true)
    await fetch('/api/about', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  /* array helpers */
  const addItem    = (key, blank) => setData(d => ({ ...d, [key]: [...(d[key] || []), { id: uid(), ...blank }] }))
  const removeItem = (key, id)    => setData(d => ({ ...d, [key]: d[key].filter(x => x.id !== id) }))
  const updateItem = (key, id, field, val) => setData(d => ({ ...d, [key]: d[key].map(x => x.id === id ? { ...x, [field]: val } : x) }))
  const updateSingle = (key, field, val)   => setData(d => ({ ...d, [key]: { ...(d[key] || {}), [field]: val } }))

  /* ── Tab content renderers ── */
  function renderKpis() {
    return (
      <>
        <SectionNote text={s.kpisNote} />
        {data.kpis.map(kpi => (
          <ItemCard key={kpi.id} onRemove={() => removeItem('kpis', kpi.id)} removeLabel={s.remove}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <Field label={s.valueLabel} value={kpi.value || ''} onChange={v => updateItem('kpis', kpi.id, 'value', v)} />
              <Field label={s.labelEn}    value={kpi.labelEn || ''} onChange={v => updateItem('kpis', kpi.id, 'labelEn', v)} />
              <Field label={s.labelAr}    value={kpi.labelAr || ''} onChange={v => updateItem('kpis', kpi.id, 'labelAr', v)} />
            </div>
          </ItemCard>
        ))}
        <button onClick={() => addItem('kpis', { value: '', labelEn: '', labelAr: '' })} style={addBtn}>{s.add}</button>
      </>
    )
  }

  function renderStory() {
    return (
      <>
        <SectionNote text={s.storyNote} />
        {data.story.map((p, i) => (
          <ItemCard key={p.id} onRemove={() => removeItem('story', p.id)} removeLabel={s.remove}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label={`${s.paragraphEn} ${i + 1}`} value={p.en || ''} onChange={v => updateItem('story', p.id, 'en', v)} type="textarea" rows={4} />
              <Field label={`${s.paragraphAr} ${i + 1}`} value={p.ar || ''} onChange={v => updateItem('story', p.id, 'ar', v)} type="textarea" rows={4} />
            </div>
          </ItemCard>
        ))}
        <button onClick={() => addItem('story', { en: '', ar: '' })} style={addBtn}>{s.add}</button>
      </>
    )
  }

  function renderSingle(key, note) {
    return (
      <>
        <SectionNote text={note} />
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label={s.textEn} value={(data[key] || {}).en || ''} onChange={v => updateSingle(key, 'en', v)} type="textarea" rows={5} />
            <Field label={s.textAr} value={(data[key] || {}).ar || ''} onChange={v => updateSingle(key, 'ar', v)} type="textarea" rows={5} />
          </div>
        </div>
      </>
    )
  }

  function renderGoals() {
    return (
      <>
        <SectionNote text={s.goalsNote} />
        {data.goals.map((g, i) => (
          <ItemCard key={g.id} onRemove={() => removeItem('goals', g.id)} removeLabel={s.remove}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label={`${s.goalEn} ${i + 1}`} value={g.en || ''} onChange={v => updateItem('goals', g.id, 'en', v)} />
              <Field label={`${s.goalAr} ${i + 1}`} value={g.ar || ''} onChange={v => updateItem('goals', g.id, 'ar', v)} />
            </div>
          </ItemCard>
        ))}
        <button onClick={() => addItem('goals', { en: '', ar: '' })} style={addBtn}>{s.add}</button>
      </>
    )
  }

  function renderWhyUs() {
    return (
      <>
        <SectionNote text={s.whyNote} />
        {data.whyUs.map((w, i) => (
          <ItemCard key={w.id} onRemove={() => removeItem('whyUs', w.id)} removeLabel={s.remove}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label={`${s.titleEn} ${i + 1}`}   value={w.titleEn || ''} onChange={v => updateItem('whyUs', w.id, 'titleEn', v)} />
              <Field label={`${s.titleAr} ${i + 1}`}   value={w.titleAr || ''} onChange={v => updateItem('whyUs', w.id, 'titleAr', v)} />
              <Field label={s.bodyEn}                   value={w.bodyEn || ''}  onChange={v => updateItem('whyUs', w.id, 'bodyEn', v)}  type="textarea" rows={3} />
              <Field label={s.bodyAr}                   value={w.bodyAr || ''}  onChange={v => updateItem('whyUs', w.id, 'bodyAr', v)}  type="textarea" rows={3} />
            </div>
          </ItemCard>
        ))}
        <button onClick={() => addItem('whyUs', { titleEn: '', titleAr: '', bodyEn: '', bodyAr: '' })} style={addBtn}>{s.add}</button>
      </>
    )
  }

  function renderTeam() {
    return (
      <>
        <SectionNote text={s.teamNote} />
        {data.team.map((m, i) => (
          <ItemCard key={m.id} onRemove={() => removeItem('team', m.id)} removeLabel={s.remove}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <Field label={s.name}   value={m.name   || ''} onChange={v => updateItem('team', m.id, 'name', v)} />
              <Field label={s.roleEn} value={m.roleEn || ''} onChange={v => updateItem('team', m.id, 'roleEn', v)} />
              <Field label={s.roleAr} value={m.roleAr || ''} onChange={v => updateItem('team', m.id, 'roleAr', v)} />
            </div>
          </ItemCard>
        ))}
        <button onClick={() => addItem('team', { name: '', roleEn: '', roleAr: '' })} style={addBtn}>{s.add}</button>
      </>
    )
  }

  const RENDER = {
    kpis:    renderKpis,
    story:   renderStory,
    mission: () => renderSingle('mission', s.missionNote),
    vision:  () => renderSingle('vision',  s.visionNote),
    goals:   renderGoals,
    whyUs:   renderWhyUs,
    team:    renderTeam,
  }

  const addBtn = {
    padding: '9px 20px', borderRadius: 8, border: `1px dashed ${GOLD}`,
    background: 'rgba(201,147,44,.06)', color: GOLD, fontSize: '.85rem',
    fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginTop: 4,
  }

  return (
    <>
      <style>{`
        .ab-tabs { display:flex; gap:4px; flex-wrap:wrap; background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:6px; margin-bottom:20px; }
        .ab-tab  { padding:8px 16px; border-radius:8px; border:none; background:none; color:var(--text-60); font-size:.85rem; font-weight:600; cursor:pointer; font-family:inherit; transition:all .15s; white-space:nowrap; }
        .ab-tab:hover  { color:var(--text); background:var(--accent-dim); }
        .ab-tab.active { background:rgba(201,147,44,.12); color:#c9932c; border-bottom:2px solid #c9932c; }
        .ab-body { animation: abFadeIn .2s ease; }
        @keyframes abFadeIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:none} }
        @media(max-width:640px){ .ab-tab{ padding:7px 10px; font-size:.78rem; } }
      `}</style>

      {/* Header */}
      <div className="admin-header" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(201,147,44,.1)', border: '1px solid rgba(201,147,44,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8" width="20" height="20">
              <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
          </div>
          <div>
            <h1 style={{ fontSize: 'clamp(1rem,2vw,1.3rem)', fontWeight: 900, color: 'var(--text)', margin: 0 }}>{s.title}</h1>
          </div>
        </div>
        <button
          className="admin-btn admin-btn--primary"
          onClick={save}
          disabled={saving}
          style={{ minWidth: 130 }}
        >
          {saving ? '…' : saved ? s.saved : s.save}
        </button>
      </div>

      {/* Tabs */}
      <nav className="ab-tabs">
        {TABS_KEYS.map((key, i) => (
          <button key={key} className={`ab-tab${tab === key ? ' active' : ''}`} onClick={() => setTab(key)}>
            {s.tabs[i]}
          </button>
        ))}
      </nav>

      {/* Content */}
      <div className="ab-body" key={tab}>
        {loading
          ? <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-60)' }}>Loading…</div>
          : RENDER[tab]?.()
        }
      </div>
    </>
  )
}
