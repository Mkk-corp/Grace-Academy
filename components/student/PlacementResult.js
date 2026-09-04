'use client'

import { useState, useEffect, useRef } from 'react'

/* ── level config ──────────────────────────────────────────────── */
const LEVEL_META = {
  A1: { label: 'Beginner',           ar: 'مبتدئ',        color: '#10b981', bar: 1 },
  A2: { label: 'Elementary',         ar: 'أساسي',        color: '#06b6d4', bar: 2 },
  B1: { label: 'Intermediate',       ar: 'متوسط',        color: '#3b82f6', bar: 3 },
  B2: { label: 'Upper-Intermediate', ar: 'فوق المتوسط',  color: '#6366f1', bar: 4 },
  C1: { label: 'Advanced',           ar: 'متقدم',        color: '#8b5cf6', bar: 5 },
  C2: { label: 'Proficiency',        ar: 'احترافي',      color: '#c9932c', bar: 6 },
}
const LEVELS = ['A1','A2','B1','B2','C1','C2']

/* ── level icon set (outlined SVG per CEFR level) ──────────────── */
function LevelIcon({ level, size = 20, color = 'currentColor' }) {
  const sw = '1.8'
  const p  = { viewBox: '0 0 24 24', width: size, height: size, fill: 'none', stroke: color, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (level) {
    case 'A1': return <svg {...p}><path d="M12 22v-9"/><path d="M9.5 9.5C9.5 6.5 12 3 12 3s2.5 3.5 2.5 6.5a2.5 2.5 0 0 1-5 0z"/></svg>
    case 'A2': return <svg {...p}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
    case 'B1': return <svg {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
    case 'B2': return <svg {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
    case 'C1': return <svg {...p}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
    case 'C2': return <svg {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
    default:   return <svg {...p}><circle cx="12" cy="12" r="9"/></svg>
  }
}

/* ── generic icon helpers ──────────────────────────────────────── */
const Ic = ({ d, size = 20, color = 'currentColor', sw = '1.8', children, ...rest }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...rest}>
    {d && <path d={d}/>}
    {children}
  </svg>
)

const IcFileText  = p => <Ic {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></Ic>
const IcClock     = p => <Ic {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Ic>
const IcTarget    = p => <Ic {...p}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></Ic>
const IcBarChart  = p => <Ic {...p}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></Ic>
const IcAward     = p => <Ic {...p}><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></Ic>
const IcStar      = p => <Ic {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></Ic>
const IcBook      = p => <Ic {...p}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></Ic>
const IcMail      = p => <Ic {...p}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></Ic>
const IcClipboard = p => <Ic {...p}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></Ic>
const IcCheck     = p => <Ic {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></Ic>
const IcSpark     = p => <Ic {...p}><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></Ic>

/* ── floating icon particle ────────────────────────────────────── */
function FloatIcon({ children, style }) {
  return (
    <div style={{
      position: 'absolute', animation: 'pfFloat 3s ease-in-out infinite',
      color: 'rgba(201,147,44,.22)', pointerEvents: 'none', ...style,
    }}>
      {children}
    </div>
  )
}

/* ── confetti ──────────────────────────────────────────────────── */
function Confetti({ active }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!active || !ref.current) return
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight
    const pieces = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: -20,
      r: 4 + Math.random() * 6,
      rot: Math.random() * 360,
      speed: 2 + Math.random() * 4,
      drift: (Math.random() - .5) * 2,
      color: ['#c9932c','#f0b429','#10b981','#3b82f6','#8b5cf6','#ef4444','#fff'][Math.floor(Math.random() * 7)],
      shape: Math.random() > .5 ? 'circle' : 'rect',
      alpha: 1,
    }))
    let running = true
    function draw() {
      if (!running) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      pieces.forEach(p => {
        ctx.save()
        ctx.globalAlpha = p.alpha
        ctx.fillStyle = p.color
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot * Math.PI / 180)
        if (p.shape === 'circle') { ctx.beginPath(); ctx.arc(0, 0, p.r, 0, Math.PI * 2); ctx.fill() }
        else { ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r) }
        ctx.restore()
        p.x += p.drift; p.y += p.speed; p.rot += 2
        if (p.y > canvas.height + 20) { p.y = -20; p.x = Math.random() * canvas.width; p.alpha = 1 }
        if (p.y > canvas.height * .6) p.alpha = Math.max(0, p.alpha - .01)
      })
      requestAnimationFrame(draw)
    }
    draw()
    const t = setTimeout(() => { running = false; ctx.clearRect(0, 0, canvas.width, canvas.height) }, 4500)
    return () => { running = false; clearTimeout(t) }
  }, [active])
  if (!active) return null
  return <canvas ref={ref} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9000 }} />
}

/* ── report pending screen ─────────────────────────────────────── */
function PendingScreen({ isAr, isDark, booking, onRefresh }) {
  const [dots, setDots] = useState(1)
  const [elapsed, setElapsed] = useState(0)
  const [funLine, setFunLine] = useState(0)

  const funLinesEn = [
    "Our consultant is polishing your results to a golden shine",
    "They're writing with their finest quill right now",
    "Almost done — good things take a little time",
    "Your level is being carefully calibrated",
    "Wrapping it all up with care",
  ]
  const funLinesAr = [
    "مستشارنا يُلمّع نتائجك حتى تبرق",
    "يكتب الآن بأجمل قلم لديه",
    "تقريباً اكتمل — الأشياء الجيدة تستحق الانتظار",
    "مستواك يُعايَر بدقة شديدة الآن",
    "يُلفّها لك بكل اعتناء",
  ]

  useEffect(() => {
    const t1 = setInterval(() => setDots(d => (d % 3) + 1), 600)
    const t2 = setInterval(() => setElapsed(e => e + 1), 1000)
    const t3 = setInterval(() => setFunLine(l => (l + 1) % funLinesEn.length), 4000)
    return () => { clearInterval(t1); clearInterval(t2); clearInterval(t3) }
  }, [])

  useEffect(() => {
    const t = setInterval(onRefresh, 30000)
    return () => clearInterval(t)
  }, [onRefresh])

  const mins   = Math.floor(elapsed / 60)
  const secs   = elapsed % 60
  const waitStr = mins > 0 ? `${mins}m ${String(secs).padStart(2,'0')}s` : `${String(secs).padStart(2,'0')}s`

  const surface = isDark ? '#10222b' : '#fff'
  const text    = isDark ? '#f1f5f9' : '#111827'
  const muted   = isDark ? 'rgba(241,245,249,.55)' : '#6b7280'
  const gold    = '#c9932c'
  const border  = isDark ? 'rgba(255,255,255,.08)' : '#e5e7eb'

  return (
    <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes pfFloat{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-16px) rotate(4deg)}}
        @keyframes pfOrbit{from{transform:rotate(0deg) translateX(80px) rotate(0deg)}to{transform:rotate(360deg) translateX(80px) rotate(-360deg)}}
        @keyframes pfOrbit2{from{transform:rotate(180deg) translateX(60px) rotate(-180deg)}to{transform:rotate(540deg) translateX(60px) rotate(-540deg)}}
        @keyframes pfGlow{0%,100%{box-shadow:0 0 30px rgba(201,147,44,.3)}50%{box-shadow:0 0 60px rgba(201,147,44,.6)}}
        @keyframes pfSlideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
        @keyframes pfDotBounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}
        @keyframes pfSpin{to{transform:rotate(360deg)}}
      `}</style>

      {/* Ambient blobs */}
      <div style={{ position: 'absolute', top: '10%', left: '5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,147,44,.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Floating icons */}
      <FloatIcon style={{ top: '12%', left: '8%', animationDelay: '0s' }}><IcFileText size={28}/></FloatIcon>
      <FloatIcon style={{ top: '20%', right: '10%', animationDelay: '.7s' }}><IcSpark size={22}/></FloatIcon>
      <FloatIcon style={{ bottom: '20%', left: '12%', animationDelay: '1.4s' }}><IcClock size={28}/></FloatIcon>
      <FloatIcon style={{ bottom: '15%', right: '8%', animationDelay: '2.1s' }}><IcTarget size={28}/></FloatIcon>
      <FloatIcon style={{ top: '40%', left: '4%', animationDelay: '.35s' }}><IcBarChart size={22}/></FloatIcon>
      <FloatIcon style={{ top: '35%', right: '5%', animationDelay: '1.8s' }}><IcAward size={22}/></FloatIcon>

      {/* Central orbit animation */}
      <div style={{ position: 'relative', width: 180, height: 180, marginBottom: 36 }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1.5px dashed rgba(201,147,44,.25)', animation: 'pfSpin 8s linear infinite' }} />
        <div style={{ position: 'absolute', inset: 20, borderRadius: '50%', border: '1.5px dashed rgba(201,147,44,.15)', animation: 'pfSpin 5s linear infinite reverse' }} />
        <div style={{ position: 'absolute', inset: 0, animation: 'pfOrbit 4s linear infinite' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: gold, boxShadow: `0 0 12px ${gold}` }} />
        </div>
        <div style={{ position: 'absolute', inset: 0, animation: 'pfOrbit2 6s linear infinite' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1', boxShadow: '0 0 10px #6366f1' }} />
        </div>
        {/* Central icon */}
        <div style={{
          position: 'absolute', inset: 30, borderRadius: '50%',
          background: isDark ? 'linear-gradient(135deg, #0a1b22, #10222b)' : 'linear-gradient(135deg, #fffbf0, #fef9ee)',
          border: '2px solid rgba(201,147,44,.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'pfGlow 2.5s ease-in-out infinite',
        }}>
          <IcClipboard size={36} color={gold} sw="1.5"/>
        </div>
      </div>

      {/* Headline */}
      <div style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.16em', color: gold, marginBottom: 10, textTransform: 'uppercase' }}>
        {isAr ? 'تقييمك في الطريق إليك' : 'YOUR RESULTS ARE ON THE WAY'}
      </div>
      <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 900, color: text, textAlign: 'center', lineHeight: 1.25, marginBottom: 10, maxWidth: 480 }}>
        {isAr ? (
          <>تقريرك <span style={{ color: gold }}>قيد الإعداد</span> الآن{'.'.repeat(dots)}</>
        ) : (
          <>Your report is <span style={{ color: gold }}>in progress</span>{'.'.repeat(dots)}</>
        )}
      </h2>

      {/* Rotating fun line */}
      <div style={{ minHeight: 28, marginBottom: 24, textAlign: 'center', animation: 'pfSlideUp .4s ease both' }}>
        <p style={{ fontSize: '.9rem', color: muted, fontStyle: 'italic', maxWidth: 400 }}>
          {isAr ? funLinesAr[funLine] : funLinesEn[funLine]}
        </p>
      </div>

      {/* Status card */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 14, width: '100%', maxWidth: 420,
        background: surface, border: `1px solid ${border}`, borderRadius: 18, padding: '22px 24px',
        marginBottom: 28, boxShadow: isDark ? '0 4px 24px rgba(0,0,0,.4)' : '0 4px 16px rgba(0,0,0,.07)',
      }}>
        {booking && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(201,147,44,.1)', border: '1px solid rgba(201,147,44,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={gold} strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <div>
              <div style={{ fontSize: '.8rem', fontWeight: 700, color: text }}>
                {isAr ? 'تم إجراء الجلسة' : 'Session completed'} · {booking.date}
              </div>
              <div style={{ fontSize: '.73rem', color: muted }}>{isAr ? 'مع' : 'with'} {booking.assessorName}</div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '.78rem', color: muted }}>{isAr ? 'في انتظار التقرير منذ' : 'Waiting for'}</div>
          <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '.9rem', color: gold }}>{waitStr}</div>
        </div>

        {/* Dot loader */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', padding: '6px 0' }}>
          {[0,1,2,3,4].map(i => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: '50%', background: gold,
              opacity: .25 + (i === (dots - 1) ? .75 : 0), transition: 'opacity .3s',
              animation: `pfDotBounce 1.4s ${i * .16}s ease-in-out infinite`,
            }} />
          ))}
        </div>

        <button
          onClick={onRefresh}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            padding: '9px', borderRadius: 10, border: `1px solid ${border}`,
            background: 'none', color: muted, fontSize: '.8rem', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,147,44,.4)'; e.currentTarget.style.color = gold }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = muted }}
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>
          {isAr ? 'تحقق الآن' : 'Check now'}
        </button>
      </div>

      {/* Email note */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 100, background: isDark ? 'rgba(255,255,255,.04)' : '#f3f4f6', border: `1px solid ${border}` }}>
        <IcMail size={16} color={gold} sw="1.8"/>
        <span style={{ fontSize: '.78rem', color: muted }}>
          {isAr
            ? 'ستتلقى إشعاراً بالبريد الإلكتروني فور اكتمال تقريرك'
            : "You'll get an email the moment your report lands"}
        </span>
      </div>
    </div>
  )
}

/* ── level progress bar ─────────────────────────────────────────── */
function LevelProgress({ level }) {
  const meta = LEVEL_META[level] || LEVEL_META.A1
  const idx  = LEVELS.indexOf(level)
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        {LEVELS.map((l, i) => {
          const m    = LEVEL_META[l]
          const done = i <= idx
          const active = i === idx
          return (
            <div key={l} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: done ? m.color : 'rgba(255,255,255,.06)',
                border: `2px solid ${done ? m.color : 'rgba(255,255,255,.12)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all .4s',
                boxShadow: active ? `0 0 20px ${m.color}80` : 'none',
                transform: active ? 'scale(1.22)' : 'scale(1)',
              }}>
                {active
                  ? <LevelIcon level={l} size={15} color="#fff"/>
                  : <span style={{ fontSize: '.62rem', fontWeight: 900, color: done ? '#fff' : 'rgba(255,255,255,.2)' }}>{l}</span>
                }
              </div>
              <div style={{ fontSize: '.58rem', fontWeight: 700, color: done ? m.color : 'rgba(255,255,255,.2)', letterSpacing: '.04em' }}>{l}</div>
            </div>
          )
        })}
      </div>
      <div style={{ position: 'relative', height: 4, borderRadius: 2, background: 'rgba(255,255,255,.08)', marginTop: 4 }}>
        <div style={{
          height: '100%', borderRadius: 2,
          background: `linear-gradient(90deg, #10b981, ${meta.color})`,
          width: `${((idx + 1) / LEVELS.length) * 100}%`,
          transition: 'width 1.2s cubic-bezier(.34,1.56,.64,1)',
        }} />
      </div>
    </div>
  )
}

/* ── certificate ─────────────────────────────────────────────────── */
function Certificate({ studentName, level, assessorName, date, isAr }) {
  const meta    = LEVEL_META[level] || LEVEL_META.A1
  const certRef = useRef(null)

  function handlePrint() {
    const el = certRef.current
    if (!el) return
    const win = window.open('', '_blank')
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Grace Academy Certificate</title><link href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@400;700&display=swap" rel="stylesheet"><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#fff;display:flex;justify-content:center;align-items:center;min-height:100vh}@media print{body{display:block}}</style></head><body>${el.outerHTML}</body></html>`)
    win.document.close()
    setTimeout(() => { win.print(); win.close() }, 500)
  }

  const certDate = (() => {
    try { return new Date(date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) }
    catch { return date }
  })()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
      <div ref={certRef} style={{
        width: '100%', maxWidth: 760,
        background: 'linear-gradient(145deg, #0a1520 0%, #0f1e2d 40%, #0a1b22 100%)',
        borderRadius: 20, position: 'relative', overflow: 'hidden',
        fontFamily: "'Comfortaa', var(--font-comfortaa), cursive",
        boxShadow: '0 24px 80px rgba(0,0,0,.6), 0 0 0 1px rgba(201,147,44,.3)',
      }}>
        {/* Gold borders */}
        <div style={{ position: 'absolute', inset: 8, borderRadius: 14, border: '1.5px solid rgba(201,147,44,.35)', pointerEvents: 'none', zIndex: 2 }} />
        <div style={{ position: 'absolute', inset: 12, borderRadius: 11, border: '.5px solid rgba(201,147,44,.15)', pointerEvents: 'none', zIndex: 2 }} />

        {/* Corner ornaments */}
        {[{ top: 16, left: 16 }, { top: 16, right: 16 }, { bottom: 16, left: 16 }, { bottom: 16, right: 16 }].map((pos, i) => (
          <svg key={i} viewBox="0 0 40 40" width="40" height="40" style={{ position: 'absolute', ...pos, zIndex: 3 }}>
            <path d="M4 4 L16 4 M4 4 L4 16" stroke="rgba(201,147,44,.7)" strokeWidth="2" fill="none" strokeLinecap="round"/>
            <circle cx="4" cy="4" r="2" fill="rgba(201,147,44,.5)"/>
          </svg>
        ))}

        {/* Background glows */}
        <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,147,44,.06) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, ${meta.color}0a 0%, transparent 65%)`, pointerEvents: 'none' }} />

        {/* Watermark */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .025, pointerEvents: 'none' }}>
          <defs>
            <pattern id="certPat" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="20" stroke="#c9932c" strokeWidth=".5" fill="none"/>
              <circle cx="30" cy="30" r="10" stroke="#c9932c" strokeWidth=".5" fill="none"/>
              <line x1="0" y1="30" x2="60" y2="30" stroke="#c9932c" strokeWidth=".3"/>
              <line x1="30" y1="0" x2="30" y2="60" stroke="#c9932c" strokeWidth=".3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#certPat)"/>
        </svg>

        <div style={{ position: 'relative', zIndex: 4, padding: '44px 56px 40px' }}>
          {/* Header */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(201,147,44,.12)', border: '1px solid rgba(201,147,44,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/images/logo.png" alt="Grace Academy" style={{ width: 30, height: 30, objectFit: 'contain' }} />
              </div>
              <div>
                <div style={{ fontSize: '.8rem', fontWeight: 700, letterSpacing: '.22em', color: '#c9932c' }}>GRACE ACADEMY</div>
                <div style={{ fontSize: '.52rem', letterSpacing: '.14em', color: 'rgba(255,255,255,.35)', marginTop: 2 }}>ENGLISH LANGUAGE INSTITUTE</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '70%', marginTop: 6 }}>
              <div style={{ flex: 1, height: '.5px', background: 'linear-gradient(90deg, transparent, rgba(201,147,44,.4))' }} />
              <svg viewBox="0 0 20 20" width="14" height="14"><polygon points="10,2 12,8 18,8 13,12 15,18 10,14 5,18 7,12 2,8 8,8" fill="rgba(201,147,44,.7)"/></svg>
              <div style={{ flex: 1, height: '.5px', background: 'linear-gradient(90deg, rgba(201,147,44,.4), transparent)' }} />
            </div>
          </div>

          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: '.2em', color: 'rgba(255,255,255,.35)', marginBottom: 6 }}>CERTIFICATE OF</div>
            <div style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 700, color: '#c9932c', letterSpacing: '.06em', lineHeight: 1.1 }}>
              English Placement Assessment
            </div>
          </div>

          {/* Student name */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.4)', letterSpacing: '.08em', marginBottom: 8 }}>
              {isAr ? 'نُشهد بأن الطالب / الطالبة' : 'This is to certify that'}
            </div>
            <div style={{
              fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 700, color: '#fff',
              letterSpacing: '.02em', lineHeight: 1.2,
              borderBottom: '.5px solid rgba(201,147,44,.25)', paddingBottom: 12, marginBottom: 12,
            }}>
              {studentName}
            </div>
            <div style={{ fontSize: '.82rem', color: 'rgba(255,255,255,.5)', lineHeight: 1.7, maxWidth: 500, margin: '0 auto' }}>
              {isAr
                ? 'قد أتمّ بنجاح اختبار التحديد في اللغة الإنجليزية في أكاديمية Grace، وتم تقييمه وفق الإطار المرجعي الأوروبي المشترك للغات (CEFR)'
                : 'has successfully completed the English Placement Assessment at Grace Academy and has been evaluated according to the Common European Framework of Reference for Languages (CEFR)'}
            </div>
          </div>

          {/* Level badge */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, margin: '24px 0' }}>
            <div style={{ fontSize: '.63rem', fontWeight: 700, letterSpacing: '.15em', color: 'rgba(255,255,255,.35)', marginBottom: 4 }}>
              {isAr ? 'المستوى المُحدَّد' : 'ASSESSED LEVEL'}
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '16px 36px', borderRadius: 16,
              background: `linear-gradient(135deg, ${meta.color}22, ${meta.color}0a)`,
              border: `1.5px solid ${meta.color}50`,
              boxShadow: `0 0 40px ${meta.color}20`,
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: `${meta.color}18`, border: `1.5px solid ${meta.color}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <LevelIcon level={level} size={26} color={meta.color}/>
              </div>
              <div>
                <div style={{ fontSize: '2.8rem', fontWeight: 900, color: meta.color, lineHeight: 1, letterSpacing: '-.02em' }}>{level}</div>
                <div style={{ fontSize: '.78rem', fontWeight: 700, color: 'rgba(255,255,255,.55)', letterSpacing: '.06em' }}>
                  {isAr ? meta.ar : meta.label}
                </div>
              </div>
            </div>
          </div>

          {/* Separator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: '.5px', background: 'rgba(201,147,44,.18)' }} />
            <svg viewBox="0 0 24 24" width="12" height="12" fill="rgba(201,147,44,.4)"><polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9"/></svg>
            <div style={{ flex: 1, height: '.5px', background: 'rgba(201,147,44,.18)' }} />
          </div>

          {/* Footer */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 8 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderTop: '.5px solid rgba(255,255,255,.15)', paddingTop: 10, marginTop: 20 }}>
                <div style={{ fontSize: '.82rem', fontWeight: 700, color: 'rgba(255,255,255,.7)' }}>{assessorName}</div>
                <div style={{ fontSize: '.6rem', color: 'rgba(255,255,255,.3)', letterSpacing: '.1em', marginTop: 3 }}>
                  {isAr ? 'المستشار الأكاديمي' : 'ACADEMIC CONSULTANT'}
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderTop: '.5px solid rgba(255,255,255,.15)', paddingTop: 10, marginTop: 20 }}>
                <div style={{ fontSize: '.82rem', fontWeight: 700, color: 'rgba(255,255,255,.7)' }}>{certDate}</div>
                <div style={{ fontSize: '.6rem', color: 'rgba(255,255,255,.3)', letterSpacing: '.1em', marginTop: 3 }}>
                  {isAr ? 'تاريخ الإصدار' : 'DATE ISSUED'}
                </div>
              </div>
            </div>
          </div>

          {/* Seal */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 20px', borderRadius: 100,
              background: 'rgba(201,147,44,.07)', border: '1px solid rgba(201,147,44,.2)',
            }}>
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="rgba(201,147,44,.6)" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <div style={{ fontSize: '.58rem', fontWeight: 700, letterSpacing: '.15em', color: 'rgba(201,147,44,.6)' }}>GRACE ACADEMY · OFFICIAL</div>
            </div>
          </div>
        </div>
      </div>

      {/* Print */}
      <button
        onClick={handlePrint}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 24px', borderRadius: 10,
          border: '1px solid rgba(201,147,44,.35)',
          background: 'rgba(201,147,44,.08)', color: '#c9932c',
          fontSize: '.82rem', fontWeight: 700, cursor: 'pointer',
          fontFamily: 'inherit', transition: 'all .15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,147,44,.15)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(201,147,44,.08)' }}
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
        {isAr ? 'طباعة الشهادة' : 'Print Certificate'}
      </button>
    </div>
  )
}

/* ── report ready screen ─────────────────────────────────────────── */
function ReadyScreen({ isAr, isDark, report, booking }) {
  const [showConfetti, setShowConfetti] = useState(false)
  const [revealed,     setRevealed]     = useState(false)
  const [activeSection, setActiveSection] = useState('results')

  useEffect(() => {
    const lsKey = `ga_cert_seen_${report.id}`
    if (!localStorage.getItem(lsKey)) {
      setShowConfetti(true)
      localStorage.setItem(lsKey, '1')
      setTimeout(() => setShowConfetti(false), 5000)
    }
    setTimeout(() => setRevealed(true), 100)
  }, [report.id])

  const meta    = LEVEL_META[report.englishLevel] || LEVEL_META.A1
  const text    = isDark ? '#f1f5f9' : '#111827'
  const muted   = isDark ? 'rgba(241,245,249,.55)' : '#6b7280'
  const surface = isDark ? '#10222b' : '#fff'
  const border  = isDark ? 'rgba(255,255,255,.08)' : '#e5e7eb'
  const gold    = '#c9932c'

  const badges = [
    { Icon: IcCheck,   en: 'Assessment Complete',                   ar: 'اكتمل التقييم',         color: '#10b981' },
    { Icon: IcBook,    en: `Level ${report.englishLevel} Unlocked`, ar: `تم فتح مستوى ${report.englishLevel}`, color: meta.color },
    { Icon: IcTarget,  en: 'Course Recommended',                    ar: 'كورس موصى به',           color: '#3b82f6' },
    { Icon: IcStar,    en: 'Report Ready',                          ar: 'التقرير جاهز',           color: '#f59e0b' },
  ]

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '8px 0 40px' }}>
      <Confetti active={showConfetti} />
      <style>{`
        @keyframes rsSlideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
        @keyframes rsBounce{0%{transform:scale(.5);opacity:0}60%{transform:scale(1.12);opacity:1}80%{transform:scale(.96)}100%{transform:scale(1)}}
        @keyframes rsGlow{0%,100%{box-shadow:0 0 20px ${meta.color}30}50%{box-shadow:0 0 50px ${meta.color}60}}
        @keyframes rsPop{from{transform:scale(0) rotate(-20deg);opacity:0}to{transform:scale(1) rotate(0);opacity:1}}
      `}</style>

      {/* Hero banner */}
      <div style={{
        borderRadius: 20, overflow: 'hidden', marginBottom: 24, position: 'relative',
        background: 'linear-gradient(135deg, #0a1520 0%, #0f1e2d 60%, #0a1b22 100%)',
        boxShadow: isDark ? '0 8px 40px rgba(0,0,0,.5)' : '0 8px 32px rgba(0,0,0,.15)',
        opacity: revealed ? 1 : 0, transition: 'opacity .5s',
        animation: revealed ? 'rsSlideUp .6s ease both' : 'none',
      }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${meta.color}18, transparent 70%)` }} />
          <div style={{ position: 'absolute', bottom: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,147,44,.12), transparent 70%)' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, padding: '36px 40px', display: 'flex', alignItems: 'center', gap: 36, flexWrap: 'wrap' }}>
          {/* Level orb */}
          <div style={{
            width: 110, height: 110, borderRadius: '50%', flexShrink: 0,
            background: `linear-gradient(135deg, ${meta.color}40, ${meta.color}15)`,
            border: `2.5px solid ${meta.color}60`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
            animation: 'rsBounce .7s .3s cubic-bezier(.34,1.56,.64,1) both, rsGlow 3s 1s ease-in-out infinite',
          }}>
            <LevelIcon level={report.englishLevel} size={28} color={meta.color}/>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: meta.color, lineHeight: 1 }}>{report.englishLevel}</div>
          </div>

          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: '.16em', color: 'rgba(201,147,44,.7)', marginBottom: 8 }}>
              {isAr ? 'نتيجة اختبار التحديد' : 'PLACEMENT ASSESSMENT RESULT'}
            </div>
            <h2 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.9rem)', fontWeight: 900, color: '#fff', lineHeight: 1.2, marginBottom: 6 }}>
              {isAr ? (
                <>مرحباً! مستواك <span style={{ color: meta.color }}>{report.englishLevel} — {meta.ar}</span></>
              ) : (
                <>You're <span style={{ color: meta.color }}>{report.englishLevel} — {meta.label}</span></>
              )}
            </h2>
            <p style={{ fontSize: '.85rem', color: 'rgba(255,255,255,.5)', lineHeight: 1.6, marginBottom: 14 }}>
              {isAr
                ? `تهانينا! تم تحديد مستواك بنجاح. الكورس الموصى به لك: ${report.suggestedCourse}`
                : `Congratulations! Your English level has been assessed. Recommended course: ${report.suggestedCourse}`}
            </p>
            <LevelProgress level={report.englishLevel}/>
          </div>
        </div>
      </div>

      {/* Achievement badges */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap', animation: 'rsSlideUp .6s .15s ease both' }}>
        {badges.map(badge => (
          <div key={badge.en} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '7px 14px', borderRadius: 100,
            background: `${badge.color}12`, border: `1px solid ${badge.color}30`,
            animation: 'rsPop .5s cubic-bezier(.34,1.56,.64,1) both',
          }}>
            <badge.Icon size={13} color={badge.color} sw="2.2"/>
            <span style={{ fontSize: '.72rem', fontWeight: 700, color: badge.color }}>
              {isAr ? badge.ar : badge.en}
            </span>
          </div>
        ))}
      </div>

      {/* Tab switcher */}
      <div style={{
        display: 'inline-flex', gap: 4, padding: 4,
        background: isDark ? 'rgba(255,255,255,.05)' : '#f3f4f6',
        borderRadius: 12, marginBottom: 20,
      }}>
        {[
          { key: 'results',     en: 'Results & Feedback', ar: 'النتائج والتقييم', Icon: IcFileText },
          { key: 'certificate', en: 'Certificate',        ar: 'الشهادة',          Icon: IcAward   },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveSection(t.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 18px', borderRadius: 9, border: 'none', cursor: 'pointer',
              background: activeSection === t.key ? (isDark ? '#10222b' : '#fff') : 'none',
              color: activeSection === t.key ? text : muted,
              fontWeight: activeSection === t.key ? 700 : 500, fontSize: '.83rem',
              fontFamily: 'inherit',
              boxShadow: activeSection === t.key ? (isDark ? '0 1px 6px rgba(0,0,0,.4)' : '0 1px 4px rgba(0,0,0,.1)') : 'none',
              transition: 'all .15s',
            }}
          >
            <t.Icon size={14} color="currentColor" sw="2.2"/>
            {isAr ? t.ar : t.en}
          </button>
        ))}
      </div>

      {activeSection === 'results' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'rsSlideUp .35s ease both' }}>
          {/* Suggested course */}
          <div style={{
            background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: '20px 24px',
            display: 'flex', alignItems: 'center', gap: 18,
            boxShadow: isDark ? '0 2px 12px rgba(0,0,0,.35)' : '0 2px 8px rgba(0,0,0,.06)',
          }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(59,130,246,.1)', border: '1px solid rgba(59,130,246,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <IcBook size={22} color="#3b82f6" sw="1.8"/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '.63rem', fontWeight: 700, letterSpacing: '.1em', color: muted, marginBottom: 4 }}>
                {isAr ? 'الكورس الموصى به' : 'RECOMMENDED COURSE'}
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: text }}>{report.suggestedCourse}</div>
              <div style={{ fontSize: '.75rem', color: muted, marginTop: 3 }}>
                {isAr ? `مناسب لمستوى ${report.englishLevel}` : `Matched to your ${report.englishLevel} level`}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 100, background: 'rgba(59,130,246,.1)', border: '1px solid rgba(59,130,246,.25)', color: '#3b82f6', fontSize: '.72rem', fontWeight: 700, flexShrink: 0 }}>
              {isAr ? 'ابدأ الآن' : 'Start Now'}
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>

          {/* EN feedback */}
          <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: '22px 24px', boxShadow: isDark ? '0 2px 12px rgba(0,0,0,.35)' : '0 2px 8px rgba(0,0,0,.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <IcFileText size={15} color={muted} sw="2"/>
              <div style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '.1em', color: muted, textTransform: 'uppercase' }}>
                {isAr ? 'تقييم المستشار — الإنجليزية' : "Academic Consultant's Feedback — English"}
              </div>
            </div>
            <div style={{
              fontSize: '.88rem', color: text, lineHeight: 1.85,
              whiteSpace: 'pre-wrap', direction: 'ltr', textAlign: 'left',
              padding: '16px 18px', borderRadius: 10,
              background: isDark ? 'rgba(255,255,255,.03)' : '#f9fafb',
              border: `1px solid ${border}`,
            }}>
              {report.feedback}
            </div>
          </div>

          {/* AR feedback */}
          {report.feedbackAr && (
            <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: '22px 24px', boxShadow: isDark ? '0 2px 12px rgba(0,0,0,.35)' : '0 2px 8px rgba(0,0,0,.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexDirection: 'row-reverse' }}>
                <IcFileText size={15} color={muted} sw="2"/>
                <div style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '.06em', color: muted, textTransform: 'uppercase', direction: 'rtl' }}>
                  تقييم المستشار — العربية
                </div>
              </div>
              <div style={{
                fontSize: '.88rem', color: text, lineHeight: 1.9,
                whiteSpace: 'pre-wrap', direction: 'rtl', textAlign: 'right',
                padding: '16px 18px', borderRadius: 10,
                background: isDark ? 'rgba(255,255,255,.03)' : '#f9fafb',
                border: `1px solid ${isDark ? 'rgba(201,147,44,.15)' : 'rgba(201,147,44,.1)'}`,
              }}>
                {report.feedbackAr}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ animation: 'rsSlideUp .35s ease both' }}>
          <Certificate
            studentName={report.studentName}
            level={report.englishLevel}
            assessorName={report.assessorName}
            date={report.date}
            isAr={isAr}
          />
        </div>
      )}
    </div>
  )
}

/* ── main export ─────────────────────────────────────────────────── */
export default function PlacementResult({ isAr, isDark }) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const res = await fetch('/api/placement/my-report')
      const d   = await res.json()
      setData(d)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const muted = isDark ? 'rgba(241,245,249,.55)' : '#6b7280'
  const gold  = '#c9932c'

  if (loading) return (
    <div style={{ padding: 80, textAlign: 'center' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', margin: '0 auto', border: `3px solid ${isDark ? 'rgba(255,255,255,.1)' : '#e5e7eb'}`, borderTopColor: gold, animation: 'prSpin .7s linear infinite' }}/>
      <style>{`@keyframes prSpin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!data || data.status === 'none' || data.status === 'booked') return null

  if (data.status === 'report_pending') {
    return <PendingScreen isAr={isAr} isDark={isDark} booking={data.booking} onRefresh={load} />
  }

  return <ReadyScreen isAr={isAr} isDark={isDark} report={data.report} booking={data.booking} />
}
