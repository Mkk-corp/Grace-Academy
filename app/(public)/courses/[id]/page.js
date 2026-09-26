'use client'

import Link from 'next/link'
import { useLang } from '@/context/LangContext'
import CourseDetailView from '@/components/shared/CourseDetailView'

export default function PublicCourseDetailPage() {
  const { t, lang } = useLang()
  const isAr = lang === 'ar'

  return (
    <>
      {/* breadcrumb bar — sits below the fixed public Navbar */}
      <div className="cpub-breadcrumb">
        <div className="container">
          <Link href="/courses" className="cpub-breadcrumb__back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              {isAr
                ? <polyline points="9 18 15 12 9 6"/>
                : <polyline points="15 18 9 12 15 6"/>
              }
            </svg>
            {t('coursesDetailBack')}
          </Link>
        </div>
      </div>

      {/* course detail — noNav hides the portal-style mini top bar */}
      <CourseDetailView noNav stickyTop={90} />

      {/* enroll CTA strip */}
      <section className="cpub-enroll">
        <div className="container">
          <div className="cpub-enroll__inner" data-reveal>
            <div className="cpub-enroll__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="28" height="28">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div>
              <h2 className="cpub-enroll__title">{t('coursesDetailEnrollTitle')}</h2>
              <p className="cpub-enroll__sub">{t('coursesDetailEnrollSub')}</p>
            </div>
            <Link href="/contact" className="cpub-enroll__btn">
              {t('coursesPageEnroll')}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        /* ── Public course detail breadcrumb ── */
        .cpub-breadcrumb {
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          padding: 80px 0 10px;
        }
        .cpub-breadcrumb__back {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: .82rem; font-weight: 600; color: var(--text-60);
          text-decoration: none;
          transition: color .15s;
        }
        .cpub-breadcrumb__back:hover { color: var(--gold); }

        /* ── Enroll CTA strip ── */
        .cpub-enroll {
          padding: 80px 0;
          background: var(--surface);
          border-top: 1px solid var(--border);
        }
        .cpub-enroll__inner {
          display: flex; align-items: center; gap: 28px; flex-wrap: wrap;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 36px 40px;
          position: relative; overflow: hidden;
          opacity: 0; transform: translateY(20px);
          transition: opacity .5s ease, transform .5s ease;
        }
        .cpub-enroll__inner.revealed { opacity: 1; transform: translateY(0); }
        .cpub-enroll__inner::before {
          content: '';
          position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(ellipse 60% 80% at 0% 50%, rgba(201,147,44,.08) 0%, transparent 70%);
        }
        .cpub-enroll__icon {
          width: 60px; height: 60px; border-radius: 16px; flex-shrink: 0;
          background: rgba(201,147,44,.1); border: 1px solid rgba(201,147,44,.25);
          display: flex; align-items: center; justify-content: center;
          color: var(--gold);
        }
        .cpub-enroll__title {
          font-size: clamp(1.1rem, 2.5vw, 1.4rem); font-weight: 700;
          color: var(--text); margin-bottom: .35rem;
          font-family: var(--font-en);
        }
        .cpub-enroll__sub {
          font-size: .88rem; color: var(--text-60); line-height: 1.6;
          max-width: 520px;
        }
        .cpub-enroll__btn {
          display: inline-flex; align-items: center; gap: .5rem; flex-shrink: 0;
          padding: .95rem 2.2rem; border-radius: 999px;
          background: linear-gradient(135deg, #c9932c, #e8b84b);
          color: var(--azure, #fff); font-weight: 700; font-size: .9rem;
          text-decoration: none; letter-spacing: .04em; margin-inline-start: auto;
          box-shadow: 0 4px 20px rgba(201,147,44,.35);
          transition: transform .2s, box-shadow .2s;
        }
        .cpub-enroll__btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(201,147,44,.45);
        }
        @media(max-width: 768px) {
          .cpub-enroll__inner { padding: 28px 24px; }
          .cpub-enroll__btn { margin-inline-start: 0; width: 100%; justify-content: center; }
        }
      `}</style>
    </>
  )
}
