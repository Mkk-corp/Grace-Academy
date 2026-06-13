'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLang } from '@/context/LangContext'

export default function RegisterPage() {
  const { lang } = useLang()
  const isAr = lang === 'ar'

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function submit(e) {
    e.preventDefault()
    setError('')

    if (!form.name || !form.email || !form.password) {
      setError(isAr ? 'الاسم والبريد الإلكتروني وكلمة المرور مطلوبة' : 'Name, email and password are required')
      return
    }
    if (form.password !== form.confirm) {
      setError(isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      setError(isAr ? 'كلمة المرور يجب أن تكون ٦ أحرف على الأقل' : 'Password must be at least 6 characters')
      return
    }

    setLoading(true)
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, password: form.password }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || (isAr ? 'حدث خطأ. حاول مجدداً.' : 'Something went wrong. Please try again.'))
      return
    }
    setSuccess(true)
  }

  return (
    <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ display: 'inline-block' }}>
            <img src="/images/logo.png" alt="Grace Academy" style={{ height: 48, marginBottom: 8 }} />
          </Link>
          <div style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.18em', color: 'var(--gold)', fontFamily: 'var(--font)' }}>
            GRACE ACADEMY
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '36px 32px', boxShadow: '0 4px 24px rgba(0,0,0,.06)' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(74,222,128,.1)', border: '2px solid rgba(74,222,128,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" width="28" height="28"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)', marginBottom: 10, fontFamily: 'var(--font)' }}>
                {isAr ? 'تم إنشاء حسابك!' : 'Account Created!'}
              </h2>
              <p style={{ color: 'var(--text-60)', fontSize: '.9rem', lineHeight: 1.7, marginBottom: 24, fontFamily: 'var(--font)' }}>
                {isAr
                  ? 'تم تسجيل طلبك بنجاح. سيراجع فريقنا حسابك ويفعّله قريباً.'
                  : "Your registration was successful. Our team will review and activate your account shortly."
                }
              </p>
              <Link href="/" className="btn btn--primary" style={{ textDecoration: 'none' }}>
                {isAr ? 'العودة للرئيسية' : 'Back to Home'}
              </Link>
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)', marginBottom: 6, fontFamily: 'var(--font)', textAlign: 'center' }}>
                {isAr ? 'إنشاء حساب جديد' : 'Create Your Account'}
              </h1>
              <p style={{ textAlign: 'center', color: 'var(--text-60)', fontSize: '.9rem', marginBottom: 28, fontFamily: 'var(--font)' }}>
                {isAr ? 'انضم إلى أكاديمية جريس اليوم' : 'Join Grace Academy today'}
              </p>

              {error && (
                <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 20, color: '#ef4444', fontSize: '.88rem', fontFamily: 'var(--font)' }}>
                  {error}
                </div>
              )}

              <form onSubmit={submit}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 600, color: 'var(--text-80)', marginBottom: 6, fontFamily: 'var(--font)' }}>
                    {isAr ? 'الاسم الكامل' : 'Full Name'} <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder={isAr ? 'اسمك الكامل' : 'Your full name'}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface-2)', color: 'var(--text)', fontSize: '.9rem', fontFamily: 'var(--font)', outline: 'none', boxSizing: 'border-box' }}
                    required
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 600, color: 'var(--text-80)', marginBottom: 6, fontFamily: 'var(--font)' }}>
                    {isAr ? 'البريد الإلكتروني' : 'Email Address'} <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    placeholder={isAr ? 'بريدك@example.com' : 'your@email.com'}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface-2)', color: 'var(--text)', fontSize: '.9rem', fontFamily: 'var(--font)', outline: 'none', boxSizing: 'border-box' }}
                    required
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 600, color: 'var(--text-80)', marginBottom: 6, fontFamily: 'var(--font)' }}>
                    {isAr ? 'رقم الهاتف' : 'Phone Number'}
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => set('phone', e.target.value)}
                    placeholder="+966 5xx xxx xxxx"
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface-2)', color: 'var(--text)', fontSize: '.9rem', fontFamily: 'var(--font)', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px', marginBottom: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 600, color: 'var(--text-80)', marginBottom: 6, fontFamily: 'var(--font)' }}>
                      {isAr ? 'كلمة المرور' : 'Password'} <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={e => set('password', e.target.value)}
                      placeholder="••••••••"
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface-2)', color: 'var(--text)', fontSize: '.9rem', fontFamily: 'var(--font)', outline: 'none', boxSizing: 'border-box' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 600, color: 'var(--text-80)', marginBottom: 6, fontFamily: 'var(--font)' }}>
                      {isAr ? 'تأكيد كلمة المرور' : 'Confirm Password'} <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="password"
                      value={form.confirm}
                      onChange={e => set('confirm', e.target.value)}
                      placeholder="••••••••"
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface-2)', color: 'var(--text)', fontSize: '.9rem', fontFamily: 'var(--font)', outline: 'none', boxSizing: 'border-box' }}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn--primary"
                  style={{ width: '100%', justifyContent: 'center', marginTop: 8, opacity: loading ? .7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                >
                  {loading
                    ? (isAr ? 'جارٍ الإنشاء…' : 'Creating Account…')
                    : (isAr ? 'إنشاء الحساب' : 'Create Account')
                  }
                </button>
              </form>

              <p style={{ textAlign: 'center', marginTop: 20, fontSize: '.85rem', color: 'var(--text-60)', fontFamily: 'var(--font)' }}>
                {isAr ? 'لديك حساب بالفعل؟ ' : 'Already have an account? '}
                <Link href="/contact" style={{ color: 'var(--gold)', fontWeight: 600, textDecoration: 'none' }}>
                  {isAr ? 'تواصل معنا' : 'Contact Us'}
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
