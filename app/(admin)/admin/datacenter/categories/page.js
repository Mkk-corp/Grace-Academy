'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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
const PURPLE = '#8b5cf6'
const RED    = '#ef4444'
const PAGE_SIZE = 25

const S = {
  en: {
    back: 'Data Center',
    title: 'Course Categories',
    subtitle: 'Manage categories used to organise courses on the platform',
    addBtn: '+ Add Category',
    importBtn: 'Import',
    colNameEn: 'Category (English)',
    colNameAr: 'Category (Arabic)',
    colCourses: 'Courses',
    colDate: 'Date Added',
    colActions: 'Actions',
    emptyTitle: 'No categories yet',
    emptyDesc: 'Create course categories to organise your content. Each category can hold multiple courses.',
    emptyAction: 'Add Category',
    edit: 'Edit',
    delete: 'Delete',
    modalAdd: 'Add Category',
    modalEdit: 'Edit Category',
    fldNameEn: 'Category Name (English)',
    fldNameAr: 'Category Name (Arabic)',
    phEn: 'e.g. Business English',
    phAr: 'مثال: الإنجليزية للأعمال',
    cancel: 'Cancel',
    save: 'Save Changes',
    create: 'Create Category',
    deleteTitle: 'Delete category',
    deleteMsg: 'Are you sure you want to delete this category? This cannot be undone.',
    deleteBtn: 'Delete',
    required: '*',
    searchPh: 'Search categories…',
    totalCats: 'Total categories',
    catsWithCourses: 'With courses',
    courses: (n) => n === 1 ? '1 course' : `${n} courses`,
    noCourses: 'No courses yet',
  },
  ar: {
    back: 'مركز البيانات',
    title: 'فئات الدورات',
    subtitle: 'إدارة الفئات المستخدمة لتنظيم الدورات على المنصة',
    addBtn: '+ إضافة فئة',
    importBtn: 'استيراد',
    colNameEn: 'الفئة (إنجليزي)',
    colNameAr: 'الفئة (عربي)',
    colCourses: 'الدورات',
    colDate: 'تاريخ الإضافة',
    colActions: 'الإجراءات',
    emptyTitle: 'لا توجد فئات بعد',
    emptyDesc: 'أنشئ فئات الدورات لتنظيم المحتوى. يمكن لكل فئة أن تضم دورات متعددة.',
    emptyAction: 'إضافة فئة',
    edit: 'تعديل',
    delete: 'حذف',
    modalAdd: 'إضافة فئة',
    modalEdit: 'تعديل الفئة',
    fldNameEn: 'اسم الفئة (إنجليزي)',
    fldNameAr: 'اسم الفئة (عربي)',
    phEn: 'e.g. Business English',
    phAr: 'مثال: الإنجليزية للأعمال',
    cancel: 'إلغاء',
    save: 'حفظ التغييرات',
    create: 'إنشاء فئة',
    deleteTitle: 'حذف الفئة',
    deleteMsg: 'هل أنت متأكد من حذف هذه الفئة؟ لا يمكن التراجع عن هذا الإجراء.',
    deleteBtn: 'حذف',
    required: '*',
    searchPh: 'ابحث عن فئة…',
    totalCats: 'إجمالي الفئات',
    catsWithCourses: 'تحتوي دورات',
    courses: (n) => `${n} دورة`,
    noCourses: 'لا دورات بعد',
  },
}

/* ─── Import helpers (browser-only, loaded lazily) ─────────────────── */

async function downloadTemplate() {
  const XLSX = (await import('xlsx')).default
  const wsData = [
    ['Category Name (English)', 'Category Name (Arabic)'],
    ['Business English', 'الإنجليزية للأعمال'],
    ['Spoken English', 'الإنجليزية المحكية'],
    ['General English', 'الإنجليزية العامة'],
  ]
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(wsData)
  ws['!cols'] = [{ wch: 32 }, { wch: 32 }]
  XLSX.utils.book_append_sheet(wb, ws, 'Categories')
  XLSX.writeFile(wb, 'categories-import-template.xlsx')
}

async function parseImportFile(file) {
  const XLSX = (await import('xlsx')).default
  const buf  = await file.arrayBuffer()
  const wb   = XLSX.read(buf, { type: 'array' })
  const ws   = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(ws, { defval: '' })
  return rows.map((row, i) => {
    const nameEn = String(row['Category Name (English)'] ?? row['nameEn'] ?? '').trim()
    const nameAr = String(row['Category Name (Arabic)']  ?? row['nameAr'] ?? '').trim()
    return { _row: i + 2, nameEn, nameAr, _valid: !!nameEn }
  })
}

/* ─── ImportModal ───────────────────────────────────────────────────── */

function ImportModal({ onClose, onImportDone, isAr, isDark }) {
  // step: 'setup' | 'preview' | 'importing' | 'done'
  const [step,       setStep]       = useState('setup')
  const [rows,       setRows]       = useState([])
  const [results,    setResults]    = useState([])
  const [dragOver,   setDragOver]   = useState(false)
  const [parseError, setParseError] = useState('')
  const fileRef = useRef(null)

  const border  = isDark ? 'rgba(255,255,255,.09)' : '#e5e7eb'
  const surf    = isDark ? '#10222b' : '#fff'
  const text    = isDark ? '#f1f5f9' : '#111827'
  const muted   = isDark ? 'rgba(255,255,255,.45)' : '#6b7280'
  const bg      = isDark ? 'rgba(255,255,255,.04)' : '#f9fafb'

  async function handleFile(file) {
    if (!file) return
    setParseError('')
    try {
      const parsed = await parseImportFile(file)
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
        const res  = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nameEn: row.nameEn, nameAr: row.nameAr }),
        })
        const data = await res.json()
        if (res.ok)           out.push({ ...row, status: 'created' })
        else if (res.status === 400 && data.error?.toLowerCase().includes('already'))
                              out.push({ ...row, status: 'duplicate' })
        else                  out.push({ ...row, status: 'error', msg: data.error || '' })
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
  const duplicates  = results.filter(r => r.status === 'duplicate').length
  const errors      = results.filter(r => r.status === 'error').length

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: surf, border: `1px solid ${border}`, borderRadius: 20, width: '100%', maxWidth: 560, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: isDark ? '0 24px 60px rgba(0,0,0,.6)' : '0 24px 60px rgba(0,0,0,.15)' }}>

        {/* Modal header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="1.8" width="17" height="17">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '.95rem', color: text }}>
                {step === 'done'
                  ? (isAr ? 'اكتمل الاستيراد' : 'Import Complete')
                  : step === 'preview' || step === 'importing'
                  ? (isAr ? `مراجعة الاستيراد — ${validRows.length} صف` : `Review Import — ${validRows.length} rows`)
                  : (isAr ? 'استيراد الفئات' : 'Import Categories')}
              </div>
              {step === 'setup' && (
                <div style={{ fontSize: '.72rem', color: muted, marginTop: 2 }}>
                  {isAr ? 'نزّل القالب، عبّئه، ثم ارفعه' : 'Download the template, fill it in, then upload'}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${border}`, background: 'none', color: muted, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="15" height="15">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Modal body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

          {/* ── SETUP STEP ── */}
          {step === 'setup' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Step 1: Download template */}
              <div style={{ border: `1px solid ${border}`, borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ padding: '12px 18px', borderBottom: `1px solid ${border}`, background: isDark ? 'rgba(16,185,129,.06)' : 'rgba(16,185,129,.04)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: GREEN, color: '#fff', fontSize: '.72rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>1</span>
                  <span style={{ fontWeight: 700, fontSize: '.88rem', color: GREEN }}>{isAr ? 'نزّل قالب الاستيراد' : 'Download the import template'}</span>
                </div>
                <div style={{ padding: '16px 18px' }}>
                  <p style={{ fontSize: '.84rem', color: muted, margin: '0 0 14px', lineHeight: 1.6 }}>
                    {isAr
                      ? 'سيتم تحميل ملف Excel يحتوي على الأعمدة الصحيحة وصفوف مثالية توضح كيفية ملء البيانات.'
                      : 'Downloads an Excel file with the correct column headers and example rows showing how to fill in the data.'}
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
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[
                      { col: 'Category Name (English)', req: true, note: isAr ? 'مطلوب' : 'Required' },
                      { col: 'Category Name (Arabic)',  req: false, note: isAr ? 'اختياري' : 'Optional' },
                    ].map(c => (
                      <div key={c.col} style={{ padding: '10px 12px', borderRadius: 9, border: `1px solid ${border}`, background: isDark ? 'rgba(255,255,255,.02)' : '#fafafa' }}>
                        <div style={{ fontSize: '.72rem', fontWeight: 700, color: text, marginBottom: 3 }}>{c.col}</div>
                        <div style={{ fontSize: '.68rem', color: c.req ? RED : PURPLE, fontWeight: 600 }}>{c.note}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 10, fontSize: '.76rem', color: muted, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" width="13" height="13" style={{ flexShrink: 0, marginTop: 2 }}>
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {isAr ? 'لا تحذف صف الترويسة. الصفوف بدون اسم إنجليزي سيتم تخطيها تلقائياً.' : 'Do not delete the header row. Rows without an English name will be skipped automatically.'}
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
                      borderRadius: 12,
                      padding: '32px 20px',
                      textAlign: 'center',
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
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".xlsx,.xls"
                    style={{ display: 'none' }}
                    onChange={e => handleFile(e.target.files[0])}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── PREVIEW STEP ── */}
          {(step === 'preview' || step === 'importing') && (
            <div>
              {invalidRows.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 9, background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.25)', color: '#d97706', fontSize: '.82rem', marginBottom: 16 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" style={{ flexShrink: 0 }}>
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  {isAr
                    ? `${invalidRows.length} صف بدون اسم إنجليزي — سيتم تخطيها`
                    : `${invalidRows.length} row${invalidRows.length !== 1 ? 's' : ''} without an English name — will be skipped`}
                </div>
              )}

              <div style={{ border: `1px solid ${border}`, borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${border}`, background: bg, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: muted }}>
                    {isAr ? `${validRows.length} فئة ستُستورد` : `${validRows.length} categories to import`}
                  </span>
                  {step === 'importing' && (
                    <span style={{ fontSize: '.72rem', color: GOLD, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 11, height: 11, borderRadius: '50%', border: `2px solid rgba(201,147,44,.3)`, borderTopColor: GOLD, animation: 'catSpin .7s linear infinite' }} />
                      {isAr ? 'جارٍ الاستيراد…' : 'Importing…'}
                    </span>
                  )}
                </div>
                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.82rem' }}>
                    <thead>
                      <tr>
                        <th style={{ padding: '8px 14px', textAlign: isAr ? 'right' : 'left', fontWeight: 700, fontSize: '.68rem', letterSpacing: '.08em', textTransform: 'uppercase', color: muted, borderBottom: `1px solid ${border}`, background: bg }}>
                          {isAr ? 'الاسم (إنجليزي)' : 'English Name'}
                        </th>
                        <th style={{ padding: '8px 14px', textAlign: isAr ? 'left' : 'right', fontWeight: 700, fontSize: '.68rem', letterSpacing: '.06em', textTransform: 'uppercase', color: muted, borderBottom: `1px solid ${border}`, background: bg }}>
                          {isAr ? 'الاسم (عربي)' : 'Arabic Name'}
                        </th>
                        <th style={{ padding: '8px 10px', width: 30, borderBottom: `1px solid ${border}`, background: bg }} />
                      </tr>
                    </thead>
                    <tbody>
                      {validRows.map((row, i) => (
                        <tr key={i} style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,.04)' : '#f3f4f6'}` }}>
                          <td style={{ padding: '9px 14px', color: text, fontWeight: 500 }}>{row.nameEn}</td>
                          <td style={{ padding: '9px 14px', color: muted, direction: 'rtl', textAlign: isAr ? 'left' : 'right' }}>{row.nameAr || '—'}</td>
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

          {/* ── DONE STEP ── */}
          {step === 'done' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { count: created,    label: isAr ? 'تم الإنشاء' : 'Created',         color: GREEN,   icon: <polyline points="20 6 9 17 4 12"/> },
                { count: duplicates, label: isAr ? 'موجودة مسبقاً (تخطّيت)' : 'Already existed (skipped)', color: GOLD, icon: <><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/><circle cx="12" cy="12" r="10"/></> },
                { count: errors,     label: isAr ? 'أخطاء' : 'Errors',               color: RED,     icon: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> },
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

        {/* Modal footer */}
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
                {isAr ? `استيراد ${validRows.length} فئة` : `Import ${validRows.length} categories`}
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
      <style>{`@keyframes catSpin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

/* ─── CategoryModal ─────────────────────────────────────────────────── */

function CategoryModal({ cat, onSave, onClose, s, error, isAr, isDark }) {
  const [form, setForm] = useState({ nameEn: cat.nameEn || '', nameAr: cat.nameAr || '', id: cat.id })
  const isNew = cat.id.startsWith('new')
  const nameEnRef = useRef(null)

  useEffect(() => { nameEnRef.current?.focus() }, [])

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }
  function onKeyDown(e) { if (e.key === 'Enter') onSave(form) }

  const border = isDark ? 'rgba(255,255,255,.09)' : '#e5e7eb'
  const text   = isDark ? '#f1f5f9' : '#111827'
  const muted  = isDark ? 'rgba(255,255,255,.45)' : '#6b7280'
  const bg     = isDark ? 'rgba(255,255,255,.05)' : '#f9fafb'

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 9,
    border: `1px solid ${border}`, background: bg,
    color: text, fontSize: '.88rem', fontFamily: 'inherit', outline: 'none',
    transition: 'border-color .15s',
  }

  return (
    <div className="admin-modal">
      <div className="admin-modal__box">
        <div className="admin-modal__header">
          <h2 className="admin-modal__title">{isNew ? s.modalAdd : s.modalEdit}</h2>
          <button className="admin-modal__close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: RED, fontSize: '.85rem' }}>
            {error}
          </div>
        )}

        <div className="admin-field">
          <label>{s.fldNameEn} <span style={{ color: RED }}>{s.required}</span></label>
          <input ref={nameEnRef} value={form.nameEn} onChange={e => set('nameEn', e.target.value)} onKeyDown={onKeyDown} placeholder={s.phEn} dir="ltr" style={inputStyle} onFocus={e => e.target.style.borderColor = GOLD} onBlur={e => e.target.style.borderColor = border} />
        </div>

        <div className="admin-field">
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {s.fldNameAr}
            <span style={{ fontSize: '.65rem', fontWeight: 700, padding: '1px 7px', borderRadius: 100, background: 'rgba(139,92,246,.1)', border: '1px solid rgba(139,92,246,.25)', color: PURPLE }}>
              {isAr ? 'اختياري' : 'Optional'}
            </span>
          </label>
          <input value={form.nameAr} onChange={e => set('nameAr', e.target.value)} onKeyDown={onKeyDown} placeholder={s.phAr} dir="rtl" style={inputStyle} onFocus={e => e.target.style.borderColor = GOLD} onBlur={e => e.target.style.borderColor = border} />
        </div>

        {!isNew && (cat.courseCount ?? 0) > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 9, marginBottom: 4, background: 'rgba(139,92,246,.07)', border: '1px solid rgba(139,92,246,.2)', fontSize: '.82rem', color: PURPLE }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {isAr
              ? `هذه الفئة تحتوي على ${cat.courseCount} دورة. تعديل الاسم لن يؤثر على الدورات.`
              : `This category has ${cat.courseCount} course${cat.courseCount !== 1 ? 's' : ''} assigned. Renaming will not affect them.`}
          </div>
        )}

        <div className="admin-actions">
          <button className="admin-btn" onClick={onClose}>{s.cancel}</button>
          <button className="admin-btn admin-btn--primary" onClick={() => onSave(form)}>
            {isNew ? s.create : s.save}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Main page ─────────────────────────────────────────────────────── */

export default function CategoriesPage() {
  const { lang }  = useLang()
  const { theme } = useTheme()
  const router    = useRouter()
  const s         = S[lang] || S.en
  const isAr      = lang === 'ar'
  const isDark    = theme === 'dark'

  const [cats,         setCats]    = useState([])
  const [loading,      setLoading] = useState(true)
  const [editing,      setEditing] = useState(null)
  const [showImport,   setImport]  = useState(false)
  const [deleteTarget, setDelete]  = useState(null)
  const [deleteError,  setDelErr]  = useState('')
  const [search,       setSearch]  = useState('')
  const [error,        setError]   = useState('')
  const [page,         setPage]    = useState(1)
  const [dateFrom,     setDateFrom] = useState('')
  const [dateTo,       setDateTo]   = useState('')

  function loadCats() {
    return fetch('/api/admin/categories').then(r => r.json()).then(d => {
      setCats(d.categories || [])
      setLoading(false)
    })
  }
  useEffect(() => { loadCats() }, [])

  async function save(form) {
    setError('')
    const isNew = form.id.startsWith('new')
    const res  = await fetch('/api/admin/categories', {
      method: isNew ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || (isAr ? 'فشل الحفظ' : 'Save failed')); return }
    setError('')
    await loadCats()
    setEditing(null)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    const res  = await fetch('/api/admin/categories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: deleteTarget }),
    })
    const data = await res.json()
    if (!res.ok) { setDelErr(data.error || (isAr ? 'فشل الحذف' : 'Delete failed')); return }
    setCats(prev => prev.filter(c => c.id !== deleteTarget))
    setDelete(null); setDelErr('')
  }

  function formatDate(iso) {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString(isAr ? 'ar-SA' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const filtered = cats.filter(c => {
    const matchSearch = !search.trim() ||
      c.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      (c.nameAr || '').includes(search)
    const d = c.createdAt ? c.createdAt.substring(0, 10) : null
    return matchSearch &&
      (!dateFrom || (d && d >= dateFrom)) &&
      (!dateTo   || (d && d <= dateTo))
  })

  const exportCols = [
    { header: 'Category (EN)', value: r => r.nameEn || '' },
    { header: 'Category (AR)', value: r => r.nameAr || '' },
    { header: 'Courses',       value: r => r.courseCount ?? 0 },
    { header: 'Date Added',    value: r => r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-GB') : '' },
  ]

  const withCourses = cats.filter(c => (c.courseCount ?? 0) > 0).length
  const newBlank    = () => setEditing({ id: `new${Date.now()}`, nameEn: '', nameAr: '' })

  return (
    <>
      {/* Header */}
      <div className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => router.push('/admin/datacenter')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 9, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-60)', fontSize: '.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color .15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = GOLD}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="13" height="13" style={{ transform: isAr ? 'none' : 'rotate(180deg)' }}>
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
            {s.back}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: s.totalCats,       value: loading ? '…' : cats.length, color: GOLD   },
          { label: s.catsWithCourses, value: loading ? '…' : withCourses,  color: PURPLE },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: '.76rem', color: 'var(--text-60)', marginTop: 6, fontWeight: 500 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>

        {/* Card header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px', borderBottom: '1px solid var(--border)', background: isDark ? 'rgba(139,92,246,.05)' : 'rgba(139,92,246,.03)' }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: 'rgba(139,92,246,.1)', border: '1px solid rgba(139,92,246,.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke={PURPLE} strokeWidth="1.8" width="18" height="18"><path d="M4 7h16M4 12h10M4 17h7"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '.98rem', fontWeight: 700, color: PURPLE }}>{s.title}</div>
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
            <button className="admin-btn admin-btn--primary" onClick={newBlank}>{s.addBtn}</button>
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
          {!loading && cats.length > 0 && (
            <TableToolbar
              dateFrom={dateFrom} dateTo={dateTo}
              onDateChange={(f, t) => { setDateFrom(f); setDateTo(t); setPage(1) }}
              exportData={filtered}
              exportCols={exportCols}
              exportFilename="categories"
              exportTitle="Course Categories"
              isAr={isAr}
            />
          )}
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', padding: '10px 20px', color: RED, fontSize: '.88rem' }}>
            {error}
          </div>
        )}

        {!loading && cats.length === 0 && (
          <div style={{ padding: 20 }}>
            <EmptyState title={s.emptyTitle} description={s.emptyDesc} actionLabel={s.emptyAction} onAction={newBlank} />
          </div>
        )}

        {(loading || cats.length > 0) && (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ borderRadius: 0 }}>
              <thead>
                <tr>
                  <th>{s.colNameEn}</th>
                  <th>{s.colNameAr}</th>
                  <th style={{ textAlign: 'center' }}>{s.colCourses}</th>
                  <th>{s.colDate}</th>
                  <th>{s.colActions}</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? <AdminTableSkeleton cols={5} rows={8} />
                  : filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(c => {
                      const count = c.courseCount ?? 0
                      return (
                        <tr key={c.id}>
                          <td style={{ fontWeight: 500 }}>{c.nameEn}</td>
                          <td style={{ direction: 'rtl', textAlign: 'right' }}>{c.nameAr || '—'}</td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 5,
                              padding: '3px 12px', borderRadius: 100, fontSize: '.72rem', fontWeight: 700,
                              background: count > 0 ? 'rgba(139,92,246,.1)' : 'rgba(0,0,0,.04)',
                              border: `1px solid ${count > 0 ? 'rgba(139,92,246,.3)' : 'var(--border)'}`,
                              color: count > 0 ? PURPLE : 'var(--text-40)',
                            }}>
                              {count > 0 ? s.courses(count) : s.noCourses}
                            </span>
                          </td>
                          <td style={{ fontSize: '.82rem', color: 'var(--text-60)' }}>{formatDate(c.createdAt)}</td>
                          <td>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button className="admin-btn" onClick={() => { setEditing({ ...c }); setError('') }}>{s.edit}</button>
                              <button className="admin-btn admin-btn--danger" onClick={() => { setDelete(c.id); setDelErr('') }}>{s.delete}</button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                }
              </tbody>
            </table>
          </div>
        )}

        {!loading && cats.length > 0 && (
          <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
        )}
        {!loading && search.trim() && filtered.length === 0 && cats.length > 0 && (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-60)', fontSize: '.88rem' }}>
            {isAr ? 'لا توجد نتائج مطابقة للبحث' : 'No categories match your search'}
          </div>
        )}
      </div>

      {/* Import modal */}
      {showImport && (
        <ImportModal
          onClose={() => setImport(false)}
          onImportDone={() => { loadCats(); }}
          isAr={isAr}
          isDark={isDark}
        />
      )}

      {/* Add/Edit modal */}
      {editing && (
        <CategoryModal
          cat={editing}
          onSave={save}
          onClose={() => { setEditing(null); setError('') }}
          s={s} error={error} isAr={isAr} isDark={isDark}
        />
      )}

      {/* Delete confirm */}
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
