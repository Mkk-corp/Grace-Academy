'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import AdminTableSkeleton from '@/components/admin/AdminTableSkeleton'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import { useLang } from '@/context/LangContext'
import { useTheme } from '@/context/ThemeContext'
import Pagination from '@/components/ui/Pagination'
import TableToolbar from '@/components/ui/TableToolbar'

const GOLD   = '#c9932c'
const GREEN  = '#10b981'
const BLUE   = '#3b82f6'
const PURPLE = '#8b5cf6'
const RED    = '#ef4444'
const PAGE_SIZE = 25

const LIBRARY_VALID = ['videos', 'links', 'pdf', 'word', 'audio', 'others']

const S = {
  en: {
    title: 'Courses Catalog',
    subtitle: 'Manage all courses offered on the platform',
    addBtn: '+ Add Course',
    importBtn: 'Import',
    colName: 'Course', colSessions: 'Sessions', colSpeaking: 'Speaking',
    colLibrary: 'Library', colTeachers: 'Teachers', colStudents: 'Students',
    colDate: 'Date Added', colActions: 'Actions',
    emptyTitle: 'No courses yet',
    emptyDesc: 'Start building your course catalog. Click "Add Course" to create the first one.',
    emptyAction: 'Add Course',
    delete: 'Delete',
    deleteTitle: 'Delete course',
    deleteMsg: 'Are you sure you want to delete this course? This action cannot be undone.',
    deleteBtn: 'Delete',
    cancel: 'Cancel',
    searchPh: 'Search courses…',
    totalCourses: 'Total courses',
    withSpeaking: 'With speaking',
    sessions: (n) => `${n} session${n !== 1 ? 's' : ''}`,
    yes: 'Yes', no: 'No',
  },
  ar: {
    title: 'كتالوج الدورات',
    subtitle: 'إدارة جميع الدورات المقدَّمة على المنصة',
    addBtn: '+ إضافة دورة',
    importBtn: 'استيراد',
    colName: 'الدورة', colSessions: 'الجلسات', colSpeaking: 'محادثة',
    colLibrary: 'المكتبة', colTeachers: 'المعلمون', colStudents: 'الطلاب',
    colDate: 'تاريخ الإضافة', colActions: 'الإجراءات',
    emptyTitle: 'لا توجد دورات بعد',
    emptyDesc: 'ابدأ ببناء كتالوج الدورات. اضغط "إضافة دورة" لإنشاء أول دورة.',
    emptyAction: 'إضافة دورة',
    delete: 'حذف',
    deleteTitle: 'حذف الدورة',
    deleteMsg: 'هل أنت متأكد من حذف هذه الدورة؟ لا يمكن التراجع عن هذا الإجراء.',
    deleteBtn: 'حذف',
    cancel: 'إلغاء',
    searchPh: 'ابحث عن دورة…',
    totalCourses: 'إجمالي الدورات',
    withSpeaking: 'تتضمن محادثة',
    sessions: (n) => `${n} جلسة`,
    yes: 'نعم', no: 'لا',
  },
}

/* ─── Import helpers ────────────────────────────────────────────────── */

function parseBool(val) {
  const v = String(val ?? '').trim().toLowerCase()
  return v === 'yes' || v === 'true' || v === '1'
}

function parseLibraryTypes(val) {
  if (!val) return []
  return String(val).split(',').map(t => t.trim().toLowerCase()).filter(t => LIBRARY_VALID.includes(t))
}

function validateRow(row) {
  const errors = []
  if (!row.nameEn)              errors.push('Course Name (English) is required')
  if (!row.descEn)              errors.push('Description (English) is required')
  if (!row.marketingEn)         errors.push('Marketing (English) is required')
  if (!row.durationSessions || Number(row.durationSessions) < 1) errors.push('Total Sessions must be ≥ 1')
  if (row.needsSpeaking && (!row.speakingSessions || Number(row.speakingSessions) < 1))
    errors.push('No. of Speaking Sessions required when speaking is Yes')
  if (row.needsLibrary && row.libraryTypes.length === 0)
    errors.push('At least one Library Type required when library is Yes')
  return errors
}

async function downloadTemplate() {
  const XLSX = (await import('xlsx')).default
  const headers = [
    'Course Name (English)',
    'Course Name (Arabic)',
    'Category',
    'Description (English)',
    'Description (Arabic)',
    'Marketing Message (English)',
    'Marketing Message (Arabic)',
    'Duration (Months)',
    'Total Sessions',
    'Has Speaking Sessions (Yes/No)',
    'No. of Speaking Sessions',
    'Has Library (Yes/No)',
    'Library Types (comma-separated: videos, links, pdf, word, audio, others)',
  ]
  const examples = [
    [
      'Business Communication', 'التواصل التجاري', 'Business English',
      'Learn professional English for the workplace.',
      'تعلم الإنجليزية المهنية لبيئة العمل.',
      'Advance your career with Business Communication.',
      'طوّر مسيرتك المهنية بالتواصل التجاري.',
      '3', '24', 'Yes', '6', 'Yes', 'videos, pdf',
    ],
    [
      'Spoken English', 'الإنجليزية المحكية', 'Spoken English',
      'Develop fluent conversational English skills.',
      'طوّر مهاراتك في الحديث باللغة الإنجليزية بطلاقة.',
      'Speak confidently in any situation.',
      'تحدث بثقة في أي موقف.',
      '', '18', 'Yes', '18', 'No', '',
    ],
  ]
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet([headers, ...examples])
  ws['!cols'] = headers.map((h, i) => ({ wch: i === 12 ? 52 : Math.max(h.length, 22) }))
  XLSX.utils.book_append_sheet(wb, ws, 'Courses')
  XLSX.writeFile(wb, 'courses-import-template.xlsx')
}

async function parseImportFile(file, categories) {
  const XLSX = (await import('xlsx')).default
  const buf  = await file.arrayBuffer()
  const wb   = XLSX.read(buf, { type: 'array' })
  const ws   = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(ws, { defval: '' })

  // Build category name → id lookup (case-insensitive)
  const catMap = {}
  ;(categories || []).forEach(c => {
    catMap[c.nameEn.toLowerCase()] = c.id
    if (c.nameAr) catMap[c.nameAr.toLowerCase()] = c.id
  })

  return rows.map((row, i) => {
    const nameEn      = String(row['Course Name (English)']                        ?? '').trim()
    const nameAr      = String(row['Course Name (Arabic)']                         ?? '').trim()
    const catName     = String(row['Category']                                     ?? '').trim()
    const descEn      = String(row['Description (English)']                        ?? '').trim()
    const descAr      = String(row['Description (Arabic)']                         ?? '').trim()
    const marketingEn = String(row['Marketing Message (English)']                  ?? '').trim()
    const marketingAr = String(row['Marketing Message (Arabic)']                   ?? '').trim()
    const durationMonths   = String(row['Duration (Months)']                       ?? '').trim()
    const durationSessions = String(row['Total Sessions']                          ?? '').trim()
    const needsSpeaking    = parseBool(row['Has Speaking Sessions (Yes/No)'])
    const speakingSessions = String(row['No. of Speaking Sessions']                ?? '').trim()
    const needsLibrary     = parseBool(row['Has Library (Yes/No)'])
    const libraryTypes     = parseLibraryTypes(row['Library Types (comma-separated: videos, links, pdf, word, audio, others)'])

    const categoryId = catName ? (catMap[catName.toLowerCase()] || null) : null
    const parsed = {
      _row: i + 2, nameEn, nameAr, categoryId, _catName: catName,
      descEn, descAr, marketingEn, marketingAr,
      durationMonths: durationMonths || null,
      durationSessions,
      needsSpeaking, speakingSessions: needsSpeaking ? speakingSessions : '',
      needsLibrary,  libraryTypes:    needsLibrary  ? libraryTypes     : [],
    }
    parsed._errors = validateRow(parsed)
    parsed._valid  = parsed._errors.length === 0
    return parsed
  })
}

/* ─── ImportModal ───────────────────────────────────────────────────── */

function ImportModal({ onClose, onImportDone, isAr, isDark }) {
  const [step,       setStep]       = useState('setup')
  const [rows,       setRows]       = useState([])
  const [results,    setResults]    = useState([])
  const [dragOver,   setDragOver]   = useState(false)
  const [parseError, setParseError] = useState('')
  const [categories, setCategories] = useState([])
  const fileRef = useRef(null)

  useEffect(() => {
    fetch('/api/admin/categories').then(r => r.json()).then(d => setCategories(d.categories || [])).catch(() => {})
  }, [])

  const border = isDark ? 'rgba(255,255,255,.09)' : '#e5e7eb'
  const surf   = isDark ? '#10222b' : '#fff'
  const text   = isDark ? '#f1f5f9' : '#111827'
  const muted  = isDark ? 'rgba(255,255,255,.45)' : '#6b7280'
  const bg     = isDark ? 'rgba(255,255,255,.04)' : '#f9fafb'

  async function handleFile(file) {
    if (!file) return
    setParseError('')
    try {
      const parsed = await parseImportFile(file, categories)
      if (!parsed.length) { setParseError(isAr ? 'الملف فارغ أو لا يحتوي على بيانات.' : 'The file is empty or has no data rows.'); return }
      setRows(parsed)
      setStep('preview')
    } catch {
      setParseError(isAr ? 'تعذّر قراءة الملف. تأكد من أنه ملف Excel صحيح (.xlsx).' : 'Could not read the file. Make sure it is a valid Excel file (.xlsx).')
    }
  }

  function onDrop(e) {
    e.preventDefault(); setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  async function runImport() {
    setStep('importing')
    const out = []
    for (const row of rows.filter(r => r._valid)) {
      try {
        const res  = await fetch('/api/admin/courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nameEn: row.nameEn, nameAr: row.nameAr,
            categoryId: row.categoryId,
            descEn: row.descEn, descAr: row.descAr,
            marketingEn: row.marketingEn, marketingAr: row.marketingAr,
            durationMonths: row.durationMonths ? Number(row.durationMonths) : null,
            durationSessions: Number(row.durationSessions),
            needsSpeaking: row.needsSpeaking,
            speakingSessions: row.needsSpeaking ? Number(row.speakingSessions) : null,
            needsLibrary: row.needsLibrary,
            libraryTypes: row.libraryTypes,
          }),
        })
        const data = await res.json()
        if (res.ok) out.push({ ...row, status: 'created' })
        else        out.push({ ...row, status: 'error', msg: data.error || '' })
      } catch {
        out.push({ ...row, status: 'error', msg: 'Network error' })
      }
    }
    setResults(out)
    setStep('done')
    onImportDone()
  }

  const validRows   = rows.filter(r => r._valid)
  const invalidRows = rows.filter(r => !r._valid)
  const created     = results.filter(r => r.status === 'created').length
  const errors      = results.filter(r => r.status === 'error').length

  const COLS_GUIDE = [
    { col: 'Course Name (English)',       req: true,  note: isAr ? 'مطلوب' : 'Required' },
    { col: 'Course Name (Arabic)',        req: false, note: isAr ? 'اختياري' : 'Optional' },
    { col: 'Category',                   req: false, note: isAr ? 'اسم الفئة (اختياري)' : 'Category name (optional)' },
    { col: 'Description (English)',       req: true,  note: isAr ? 'مطلوب' : 'Required' },
    { col: 'Description (Arabic)',        req: false, note: isAr ? 'اختياري' : 'Optional' },
    { col: 'Marketing Message (English)', req: true,  note: isAr ? 'مطلوب' : 'Required' },
    { col: 'Marketing Message (Arabic)',  req: false, note: isAr ? 'اختياري' : 'Optional' },
    { col: 'Duration (Months)',           req: false, note: isAr ? 'رقم اختياري' : 'Number, optional' },
    { col: 'Total Sessions',             req: true,  note: isAr ? 'رقم ≥ 1، مطلوب' : 'Number ≥ 1, required' },
    { col: 'Has Speaking Sessions',      req: false, note: 'Yes / No' },
    { col: 'No. of Speaking Sessions',   req: false, note: isAr ? 'مطلوب إذا كانت المحادثة = Yes' : 'Required if Speaking = Yes' },
    { col: 'Has Library',               req: false, note: 'Yes / No' },
    { col: 'Library Types',             req: false, note: 'videos, links, pdf, word, audio, others' },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: surf, border: `1px solid ${border}`, borderRadius: 20, width: '100%', maxWidth: 620, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: isDark ? '0 24px 60px rgba(0,0,0,.6)' : '0 24px 60px rgba(0,0,0,.15)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="1.8" width="17" height="17">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '.95rem', color: text }}>
                {step === 'done'
                  ? (isAr ? 'اكتمل الاستيراد' : 'Import Complete')
                  : step === 'preview' || step === 'importing'
                  ? (isAr ? `مراجعة الاستيراد — ${validRows.length} دورة` : `Review Import — ${validRows.length} courses`)
                  : (isAr ? 'استيراد الدورات' : 'Import Courses')}
              </div>
              {step === 'setup' && (
                <div style={{ fontSize: '.72rem', color: muted, marginTop: 2 }}>
                  {isAr ? 'نزّل القالب، عبّئه في Excel، ثم ارفعه' : 'Download the template, fill it in Excel, then upload'}
                </div>
              )}
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${border}`, background: 'none', color: muted, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="15" height="15">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

          {/* ── SETUP ── */}
          {step === 'setup' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Step 1: Download */}
              <div style={{ border: `1px solid ${border}`, borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ padding: '12px 18px', borderBottom: `1px solid ${border}`, background: isDark ? 'rgba(16,185,129,.06)' : 'rgba(16,185,129,.04)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: GREEN, color: '#fff', fontSize: '.72rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>1</span>
                  <span style={{ fontWeight: 700, fontSize: '.88rem', color: GREEN }}>{isAr ? 'نزّل قالب الاستيراد' : 'Download the import template'}</span>
                </div>
                <div style={{ padding: '16px 18px' }}>
                  <p style={{ fontSize: '.84rem', color: muted, margin: '0 0 14px', lineHeight: 1.6 }}>
                    {isAr
                      ? 'يحتوي القالب على جميع الأعمدة المطلوبة وصفوف مثالية توضح كيفية ملء كل حقل.'
                      : 'The template includes all required columns and example rows showing the correct format for every field.'}
                  </p>
                  <button
                    onClick={downloadTemplate}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 9, background: GREEN, border: 'none', color: '#fff', fontWeight: 700, fontSize: '.84rem', cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    {isAr ? 'تنزيل القالب (.xlsx)' : 'Download Template (.xlsx)'}
                  </button>
                </div>
              </div>

              {/* Step 2: Fill */}
              <div style={{ border: `1px solid ${border}`, borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ padding: '12px 18px', borderBottom: `1px solid ${border}`, background: bg, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: GOLD, color: '#fff', fontSize: '.72rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>2</span>
                  <span style={{ fontWeight: 700, fontSize: '.88rem', color: GOLD }}>{isAr ? 'عبّئ البيانات في Excel' : 'Fill in the data in Excel'}</span>
                </div>
                <div style={{ padding: '14px 18px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
                    {COLS_GUIDE.map(c => (
                      <div key={c.col} style={{ padding: '8px 11px', borderRadius: 8, border: `1px solid ${border}`, background: isDark ? 'rgba(255,255,255,.02)' : '#fafafa' }}>
                        <div style={{ fontSize: '.7rem', fontWeight: 700, color: text, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.col}</div>
                        <div style={{ fontSize: '.65rem', color: c.req ? RED : PURPLE, fontWeight: 600 }}>{c.note}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 12, fontSize: '.76rem', color: muted, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" width="13" height="13" style={{ flexShrink: 0, marginTop: 2 }}>
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {isAr
                      ? 'لا تحذف صف الترويسة. قيم Yes/No تقبل أيضاً: 1/0 أو true/false.'
                      : 'Do not delete the header row. Yes/No fields also accept: 1/0 or true/false.'}
                  </div>
                </div>
              </div>

              {/* Step 3: Upload */}
              <div style={{ border: `1px solid ${border}`, borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ padding: '12px 18px', borderBottom: `1px solid ${border}`, background: isDark ? 'rgba(139,92,246,.06)' : 'rgba(139,92,246,.03)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: PURPLE, color: '#fff', fontSize: '.72rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>3</span>
                  <span style={{ fontWeight: 700, fontSize: '.88rem', color: PURPLE }}>{isAr ? 'ارفع الملف المعبّأ' : 'Upload the filled file'}</span>
                </div>
                <div style={{ padding: '16px 18px' }}>
                  {parseError && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 9, background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', color: RED, fontSize: '.82rem', marginBottom: 12 }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" style={{ flexShrink: 0 }}>
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      {parseError}
                    </div>
                  )}
                  <div
                    onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={onDrop}
                    onClick={() => fileRef.current?.click()}
                    style={{
                      border: `2px dashed ${dragOver ? PURPLE : (isDark ? 'rgba(139,92,246,.3)' : 'rgba(139,92,246,.25)')}`,
                      borderRadius: 12, padding: '32px 20px', textAlign: 'center',
                      cursor: 'pointer',
                      background: dragOver ? (isDark ? 'rgba(139,92,246,.08)' : 'rgba(139,92,246,.04)') : 'transparent',
                      transition: 'all .2s',
                    }}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(139,92,246,.1)', border: '1px solid rgba(139,92,246,.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke={PURPLE} strokeWidth="1.8" width="20" height="20">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '.88rem', color: PURPLE, marginBottom: 5 }}>
                      {isAr ? 'اسحب وأفلت هنا أو انقر للتصفح' : 'Drag & drop here or click to browse'}
                    </div>
                    <div style={{ fontSize: '.75rem', color: muted }}>
                      {isAr ? 'يقبل .xlsx و .xls' : 'Accepts .xlsx and .xls'}
                    </div>
                  </div>
                  <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
                </div>
              </div>
            </div>
          )}

          {/* ── PREVIEW ── */}
          {(step === 'preview' || step === 'importing') && (
            <div>
              {invalidRows.length > 0 && (
                <div style={{ marginBottom: 16, border: `1px solid rgba(245,158,11,.3)`, borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(245,158,11,.08)', color: '#d97706', fontSize: '.82rem', fontWeight: 600 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" style={{ flexShrink: 0 }}>
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    {isAr
                      ? `${invalidRows.length} صف به أخطاء — سيتم تخطيها`
                      : `${invalidRows.length} row${invalidRows.length !== 1 ? 's' : ''} with errors — will be skipped`}
                  </div>
                  {invalidRows.map((row, i) => (
                    <div key={i} style={{ padding: '8px 14px', borderTop: `1px solid rgba(245,158,11,.15)`, fontSize: '.78rem', color: muted }}>
                      <span style={{ color: '#d97706', fontWeight: 600 }}>Row {row._row}:</span>{' '}
                      {row.nameEn || '(no name)'} — {row._errors.join(', ')}
                    </div>
                  ))}
                </div>
              )}

              <div style={{ border: `1px solid ${border}`, borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${border}`, background: bg, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: muted }}>
                    {isAr ? `${validRows.length} دورة ستُستورد` : `${validRows.length} courses to import`}
                  </span>
                  {step === 'importing' && (
                    <span style={{ fontSize: '.72rem', color: GOLD, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 11, height: 11, borderRadius: '50%', border: `2px solid rgba(201,147,44,.3)`, borderTopColor: GOLD, animation: 'csSpin .7s linear infinite' }} />
                      {isAr ? 'جارٍ الاستيراد…' : 'Importing…'}
                    </span>
                  )}
                </div>
                <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.82rem' }}>
                    <thead>
                      <tr>
                        <th style={{ padding: '8px 14px', textAlign: 'left', fontWeight: 700, fontSize: '.68rem', letterSpacing: '.08em', textTransform: 'uppercase', color: muted, borderBottom: `1px solid ${border}`, background: bg }}>
                          {isAr ? 'الدورة' : 'Course'}
                        </th>
                        <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700, fontSize: '.68rem', letterSpacing: '.08em', textTransform: 'uppercase', color: muted, borderBottom: `1px solid ${border}`, background: bg }}>
                          {isAr ? 'الجلسات' : 'Sessions'}
                        </th>
                        <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700, fontSize: '.68rem', letterSpacing: '.08em', textTransform: 'uppercase', color: muted, borderBottom: `1px solid ${border}`, background: bg }}>
                          {isAr ? 'محادثة' : 'Speaking'}
                        </th>
                        <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700, fontSize: '.68rem', letterSpacing: '.08em', textTransform: 'uppercase', color: muted, borderBottom: `1px solid ${border}`, background: bg }}>
                          {isAr ? 'مكتبة' : 'Library'}
                        </th>
                        <th style={{ padding: '8px 10px', width: 28, borderBottom: `1px solid ${border}`, background: bg }} />
                      </tr>
                    </thead>
                    <tbody>
                      {validRows.map((row, i) => (
                        <tr key={i} style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,.04)' : '#f3f4f6'}` }}>
                          <td style={{ padding: '9px 14px' }}>
                            <div style={{ fontWeight: 600, color: text }}>{row.nameEn}</div>
                            {row.nameAr && <div style={{ fontSize: '.74rem', color: muted, direction: 'rtl' }}>{row.nameAr}</div>}
                            {row._catName && (
                              <div style={{ fontSize: '.7rem', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span style={{ color: row.categoryId ? PURPLE : '#d97706' }}>
                                  {row.categoryId ? '●' : '○'}
                                </span>
                                <span style={{ color: row.categoryId ? PURPLE : '#d97706' }}>
                                  {row._catName}
                                  {!row.categoryId && (isAr ? ' — الفئة غير موجودة' : ' — category not found')}
                                </span>
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '9px 10px', textAlign: 'center', color: BLUE, fontWeight: 700, fontSize: '.8rem' }}>
                            {row.durationSessions}
                          </td>
                          <td style={{ padding: '9px 10px', textAlign: 'center' }}>
                            <span style={{ fontSize: '.7rem', fontWeight: 700, color: row.needsSpeaking ? GREEN : muted }}>
                              {row.needsSpeaking ? (isAr ? 'نعم' : 'Yes') : (isAr ? 'لا' : 'No')}
                            </span>
                          </td>
                          <td style={{ padding: '9px 10px', textAlign: 'center' }}>
                            <span style={{ fontSize: '.7rem', fontWeight: 700, color: row.needsLibrary ? GREEN : muted }}>
                              {row.needsLibrary ? (isAr ? 'نعم' : 'Yes') : (isAr ? 'لا' : 'No')}
                            </span>
                          </td>
                          <td style={{ padding: '9px 10px', textAlign: 'center' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5" width="13" height="13">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── DONE ── */}
          {step === 'done' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { count: created, label: isAr ? 'تم الإنشاء' : 'Created', color: GREEN, icon: <polyline points="20 6 9 17 4 12"/> },
                { count: invalidRows.length, label: isAr ? 'تخطّيت (أخطاء في البيانات)' : 'Skipped (validation errors)', color: '#d97706', icon: <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></> },
                { count: errors, label: isAr ? 'أخطاء في الإنشاء' : 'Creation errors', color: RED, icon: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> },
              ].map(({ count, label, color, icon }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 12, border: `1px solid ${color}25`, background: `${color}08` }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${color}18`, border: `1.5px solid ${color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" width="15" height="15">{icon}</svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 900, color, lineHeight: 1 }}>{count}</div>
                    <div style={{ fontSize: '.76rem', color: muted, marginTop: 3 }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: `1px solid ${border}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
          {step === 'setup' && (
            <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: 9, background: 'none', border: `1px solid ${border}`, color: muted, fontWeight: 600, fontSize: '.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
          )}
          {step === 'preview' && (
            <>
              <button onClick={() => { setRows([]); setStep('setup') }} style={{ padding: '9px 20px', borderRadius: 9, background: 'none', border: `1px solid ${border}`, color: muted, fontWeight: 600, fontSize: '.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                {isAr ? '← رجوع' : '← Back'}
              </button>
              <button
                onClick={runImport}
                disabled={!validRows.length}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 22px', borderRadius: 9, background: validRows.length ? GREEN : 'rgba(16,185,129,.3)', border: 'none', color: '#fff', fontWeight: 700, fontSize: '.85rem', cursor: validRows.length ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                {isAr ? `استيراد ${validRows.length} دورة` : `Import ${validRows.length} courses`}
              </button>
            </>
          )}
          {step === 'importing' && (
            <button disabled style={{ padding: '9px 20px', borderRadius: 9, background: 'rgba(16,185,129,.3)', border: 'none', color: '#fff', fontWeight: 600, fontSize: '.85rem', cursor: 'not-allowed', fontFamily: 'inherit' }}>
              {isAr ? 'جارٍ الاستيراد…' : 'Importing…'}
            </button>
          )}
          {step === 'done' && (
            <button onClick={onClose} style={{ padding: '9px 22px', borderRadius: 9, background: GOLD, border: 'none', color: '#fff', fontWeight: 700, fontSize: '.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>
              {isAr ? 'إغلاق' : 'Close'}
            </button>
          )}
        </div>
      </div>
      <style>{`@keyframes csSpin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

/* ─── BoolBadge ─────────────────────────────────────────────────────── */

function BoolBadge({ on, yes, no }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 100, fontSize: '.72rem', fontWeight: 700,
      background: on ? 'rgba(16,185,129,.1)' : 'rgba(0,0,0,.04)',
      border: `1px solid ${on ? 'rgba(16,185,129,.3)' : 'var(--border)'}`,
      color: on ? '#10b981' : 'var(--text-40)',
    }}>
      {on ? yes : no}
    </span>
  )
}

/* ─── Main page ─────────────────────────────────────────────────────── */

export default function CoursesPage() {
  const { lang }  = useLang()
  const { theme } = useTheme()
  const router    = useRouter()
  const s         = S[lang] || S.en
  const isAr      = lang === 'ar'
  const isDark    = theme === 'dark'

  const [courses,      setCourses]  = useState([])
  const [loading,      setLoading]  = useState(true)
  const [showImport,   setImport]   = useState(false)
  const [deleteTarget, setDelete]   = useState(null)
  const [deleteError,  setDelErr]   = useState('')
  const [search,       setSearch]   = useState('')
  const [page,         setPage]     = useState(1)
  const [dateFrom,     setDateFrom] = useState('')
  const [dateTo,       setDateTo]   = useState('')

  function load() {
    return fetch('/api/admin/courses').then(r => r.json()).then(d => {
      setCourses(d.courses || [])
      setLoading(false)
    })
  }
  useEffect(() => { load() }, [])

  async function confirmDelete() {
    if (!deleteTarget) return
    const res  = await fetch(`/api/admin/courses/${deleteTarget}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) { setDelErr(data.error || (isAr ? 'فشل الحذف' : 'Delete failed')); return }
    setCourses(prev => prev.filter(c => c.id !== deleteTarget))
    setDelete(null); setDelErr('')
  }

  function formatDate(iso) {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString(isAr ? 'ar-SA' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const filtered = courses.filter(c => {
    const matchSearch = !search.trim() ||
      c.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      (c.nameAr || '').includes(search)
    const d = c.createdAt ? c.createdAt.substring(0, 10) : null
    return matchSearch &&
      (!dateFrom || (d && d >= dateFrom)) &&
      (!dateTo   || (d && d <= dateTo))
  })

  const exportCols = [
    { header: 'Course (EN)',        value: r => r.nameEn || '' },
    { header: 'Course (AR)',        value: r => r.nameAr || '' },
    { header: 'Sessions',           value: r => r.durationSessions ?? 0 },
    { header: 'Duration (months)',  value: r => r.durationMonths ?? '' },
    { header: 'Speaking',           value: r => r.needsSpeaking ? 'Yes' : 'No' },
    { header: 'Speaking Sessions',  value: r => r.speakingSessions ?? '' },
    { header: 'Library',            value: r => r.needsLibrary ? 'Yes' : 'No' },
    { header: 'Library Types',      value: r => (r.libraryTypes || []).join(', ') },
    { header: 'Teachers',           value: r => r.teacherCount ?? 0 },
    { header: 'Students',           value: r => r.studentCount ?? 0 },
    { header: 'Date Added',         value: r => r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-GB') : '' },
  ]

  const withSpeaking = courses.filter(c => c.needsSpeaking).length

  return (
    <>
      {/* Header */}
      <div className="admin-header">
        <div>
          <h1>{s.title}</h1>
          <div style={{ fontSize: '.8rem', color: 'var(--text-60)', marginTop: 2 }}>{s.subtitle}</div>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={() => router.push('/admin/courses/new')}>
          {s.addBtn}
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: s.totalCourses, value: loading ? '…' : courses.length, color: GOLD },
          { label: s.withSpeaking, value: loading ? '…' : withSpeaking,   color: BLUE },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: '.76rem', color: 'var(--text-60)', marginTop: 6, fontWeight: 500 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>

        {/* Card header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px', borderBottom: '1px solid var(--border)', background: isDark ? 'rgba(201,147,44,.05)' : 'rgba(201,147,44,.03)' }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: 'rgba(201,147,44,.1)', border: '1px solid rgba(201,147,44,.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8" width="18" height="18">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '.98rem', fontWeight: 700, color: GOLD }}>{s.title}</div>
            <div style={{ fontSize: '.76rem', color: 'var(--text-60)', marginTop: 2 }}>{s.subtitle}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setImport(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 9, background: isDark ? 'rgba(16,185,129,.1)' : 'rgba(16,185,129,.07)', border: '1px solid rgba(16,185,129,.25)', color: GREEN, fontWeight: 700, fontSize: '.83rem', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,.15)'; e.currentTarget.style.borderColor = 'rgba(16,185,129,.5)' }}
              onMouseLeave={e => { e.currentTarget.style.background = isDark ? 'rgba(16,185,129,.1)' : 'rgba(16,185,129,.07)'; e.currentTarget.style.borderColor = 'rgba(16,185,129,.25)' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              {s.importBtn}
            </button>
          </div>
        </div>

        {/* Search + toolbar */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-40)" strokeWidth="2" width="14" height="14" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder={s.searchPh}
              style={{ width: '100%', padding: '8px 12px 8px 32px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: '.85rem', fontFamily: 'inherit', outline: 'none' }}
              onFocus={e => e.target.style.borderColor = GOLD}
              onBlur={e  => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          {!loading && courses.length > 0 && (
            <TableToolbar
              dateFrom={dateFrom} dateTo={dateTo}
              onDateChange={(f, t) => { setDateFrom(f); setDateTo(t); setPage(1) }}
              exportData={filtered}
              exportCols={exportCols}
              exportFilename="courses"
              exportTitle="Courses Catalog"
              isAr={isAr}
            />
          )}
        </div>

        {!loading && courses.length === 0 && (
          <div style={{ padding: 20 }}>
            <EmptyState title={s.emptyTitle} description={s.emptyDesc} actionLabel={s.emptyAction} onAction={() => router.push('/admin/courses/new')} />
          </div>
        )}

        {(loading || courses.length > 0) && (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ borderRadius: 0 }}>
              <thead>
                <tr>
                  <th>{s.colName}</th>
                  <th style={{ textAlign: 'center' }}>{s.colSessions}</th>
                  <th style={{ textAlign: 'center' }}>{s.colSpeaking}</th>
                  <th style={{ textAlign: 'center' }}>{s.colLibrary}</th>
                  <th style={{ textAlign: 'center' }}>{s.colTeachers}</th>
                  <th style={{ textAlign: 'center' }}>{s.colStudents}</th>
                  <th>{s.colDate}</th>
                  <th>{s.colActions}</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? <AdminTableSkeleton cols={8} rows={8} />
                  : filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(c => (
                    <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/admin/courses/${c.id}`)}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {c.image
                            ? <img src={c.image} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border)' }} onError={e => { e.currentTarget.style.display = 'none' }} />
                            : <div style={{ width: 40, height: 40, borderRadius: 8, flexShrink: 0, background: 'rgba(201,147,44,.1)', border: '1px solid rgba(201,147,44,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8" width="18" height="18"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                              </div>
                          }
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '.88rem', color: 'var(--text)' }}>{c.nameEn}</div>
                            {c.nameAr && <div style={{ fontSize: '.75rem', color: 'var(--text-60)', direction: 'rtl', textAlign: 'right', marginTop: 2 }}>{c.nameAr}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 100, fontSize: '.72rem', fontWeight: 700, background: 'rgba(59,130,246,.1)', border: '1px solid rgba(59,130,246,.25)', color: BLUE }}>
                          {s.sessions(c.durationSessions ?? 0)}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}><BoolBadge on={c.needsSpeaking} yes={s.yes} no={s.no} /></td>
                      <td style={{ textAlign: 'center' }}><BoolBadge on={c.needsLibrary}  yes={s.yes} no={s.no} /></td>
                      <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text)' }}>{c.teacherCount ?? 0}</td>
                      <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text)' }}>{c.studentCount ?? 0}</td>
                      <td style={{ fontSize: '.82rem', color: 'var(--text-60)' }}>{formatDate(c.createdAt)}</td>
                      <td onClick={e => e.stopPropagation()}>
                        <button className="admin-btn admin-btn--danger" onClick={() => { setDelete(c.id); setDelErr('') }}>{s.delete}</button>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        )}

        {!loading && courses.length > 0 && (
          <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
        )}
        {!loading && search.trim() && filtered.length === 0 && courses.length > 0 && (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-60)', fontSize: '.88rem' }}>
            {isAr ? 'لا توجد نتائج مطابقة للبحث' : 'No courses match your search'}
          </div>
        )}
      </div>

      {showImport && (
        <ImportModal
          onClose={() => setImport(false)}
          onImportDone={() => load()}
          isAr={isAr}
          isDark={isDark}
        />
      )}

      <Modal
        open={!!deleteTarget}
        onClose={() => { setDelete(null); setDelErr('') }}
        onConfirm={confirmDelete}
        variant="delete"
        title={s.deleteTitle}
        message={deleteError || s.deleteMsg}
        confirmText={s.deleteBtn}
        cancelText={s.cancel}
      />
    </>
  )
}
