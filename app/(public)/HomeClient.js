'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useLang } from '@/context/LangContext'
import AnimatedCounter from '@/components/ui/AnimatedCounter'

const COURSE_ICONS = [
  <svg key="chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  <svg key="brief" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>,
  <svg key="code" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  <svg key="book" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  <svg key="star" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  <svg key="award" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
]

const COURSES = [
  { titleKey: 'course1Title', bodyKey: 'course1Body', tagKey: 'tagAllLevels' },
  { titleKey: 'course2Title', bodyKey: 'course2Body', tagKey: 'tagProfessional' },
  { titleKey: 'course3Title', bodyKey: 'course3Body', tagKey: 'tagSpecialized' },
  { titleKey: 'course4Title', bodyKey: 'course4Body', tagKey: 'tagAcademic' },
  { titleKey: 'course5Title', bodyKey: 'course5Body', tagKey: 'tagKids' },
  { titleKey: 'course6Title', bodyKey: 'course6Body', tagKey: 'tagExam' },
]

const AUDIENCE = [
  { range: '6–17', titleKey: 'aud1Title', bodyKey: 'aud1Body' },
  { range: '18–25', titleKey: 'aud2Title', bodyKey: 'aud2Body' },
  { range: '26–35', titleKey: 'aud3Title', bodyKey: 'aud3Body' },
  { range: '35+', titleKey: 'aud4Title', bodyKey: 'aud4Body' },
]

const EXP_FEATURES = ['expF1', 'expF2', 'expF3', 'expF4', 'expF5', 'expF6']
const PILLAR_ICONS = [
  <svg key="globe" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  <svg key="clock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  <svg key="sprout" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 1 3.9 7.8c-1.7.6-3.4.8-5.1.6-1.5-.2-3-1-4.6-2.8 1.9-1.9 4.1-2.9 5.8-5.6z"/></svg>,
]

const PILLARS = [
  { titleKey: 'pillar1Title', bodyKey: 'pillar1Body' },
  { titleKey: 'pillar2Title', bodyKey: 'pillar2Body' },
  { titleKey: 'pillar3Title', bodyKey: 'pillar3Body' },
]

export default function HomeClient({ stats }) {
  const { t } = useLang()
  const heroLogoWrap = useRef(null)
  const manifestoRef = useRef(null)

  useEffect(() => {
    function setupReveal() {
      const els = document.querySelectorAll('[data-reveal]')
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            observer.unobserve(entry.target)
          }
        })
      }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' })
      els.forEach(el => observer.observe(el))
      return observer
    }

    function onScroll() {
      const y = window.scrollY
      if (heroLogoWrap.current) {
        heroLogoWrap.current.style.transform = y < window.innerHeight ? `translateX(${y * 0.09}px)` : ''
      }
      if (manifestoRef.current) {
        const rect = manifestoRef.current.closest('.manifesto')?.getBoundingClientRect()
        if (rect) {
          const ratio = Math.max(0, Math.min(1, -rect.top / (rect.height + window.innerHeight)))
          manifestoRef.current.style.transform = `translateY(${(ratio - 0.5) * -24}px)`
        }
      }
    }

    const obs = setupReveal()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      obs.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  const STRIP_ITEMS = ['stripText1', 'stripText2', 'stripText3', 'stripText4']

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero__glow hero__glow--1" />
        <div className="hero__glow hero__glow--2" />
        <div className="hero__grid-overlay" />
        <div className="hero__content">
          <div className="hero__logo-wrap" ref={heroLogoWrap}>
            <img src="/images/logo.png" alt="Grace Academy" className="hero__logo" />
          </div>
          <div className="hero__rule" />
          <p className="hero__subtitle">{t('heroSubtitle')}</p>
          <div className="hero__cta-group">
            <Link href="/services" className="btn btn--primary">{t('heroCta1')}</Link>
            <Link href="/about" className="btn btn--ghost">{t('heroCta2')}</Link>
          </div>
        </div>
        <div className="hero__scroll"><div className="hero__scroll-dot" /></div>
      </section>

      {/* STRIP */}
      <div className="strip">
        <div className="strip__track">
          {[...STRIP_ITEMS, ...STRIP_ITEMS].map((key, i) => (
            <span key={i}>{t(key)}<span className="strip__sep">◆</span></span>
          ))}
        </div>
      </div>

      {/* ABOUT */}
      <section className="section" id="about">
        <div className="container">
          <div className="about__grid">
            <div className="about__content" data-reveal>
              <span className="label">{t('aboutLabel')}</span>
              <h2 className="section-title">{t('aboutTitle')}</h2>
              <p className="about__lead">{t('aboutLead')}</p>
              <p className="about__body">{t('aboutBody')}</p>
              <div className="pillars">
                {PILLARS.map(({ titleKey, bodyKey }, i) => (
                  <div key={titleKey} className="pillar">
                    <span className="pillar__icon">{PILLAR_ICONS[i]}</span>
                    <div>
                      <h4>{t(titleKey)}</h4>
                      <p>{t(bodyKey)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="about__visual" data-reveal="right">
              <div className="about__emblem">
                <img src="/images/logo.png" alt="Grace Academy" />
              </div>
              <div className="stats">
                {[
                  { value: stats.reviews.value, suffix: stats.reviews.suffix, labelKey: 'stat1', word: null },
                  { value: null, suffix: null, labelKey: 'stat2', word: 'stat2word' },
                  { value: null, suffix: null, labelKey: 'stat3', word: null, text: '24/7' },
                  { value: null, suffix: null, labelKey: 'stat4', word: null, text: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:'2rem',height:'2rem'}}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> },
                ].map(({ value, suffix, labelKey, word, text }, i) => (
                  <div key={labelKey} className="stat">
                    <span className="stat__num">
                      {value ? <AnimatedCounter target={value} /> : word ? <span className="stat__word">{t(word)}</span> : text}
                    </span>
                    {suffix && <span className="stat__plus">{suffix}</span>}
                    <span className="stat__label">{t(labelKey)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="manifesto">
        <div className="container">
          <p className="manifesto__quote" ref={manifestoRef}>{t('manifesto')}</p>
        </div>
      </section>

      {/* COURSES */}
      <section className="section courses" id="courses">
        <div className="container">
          <div className="section-header" data-reveal>
            <span className="label">{t('coursesLabel')}</span>
            <h2 className="section-title">{t('coursesTitle')}</h2>
            <p className="section-sub">{t('coursesSubtitle')}</p>
          </div>
          <div className="courses__grid">
            {COURSES.map(({ titleKey, bodyKey, tagKey }, i) => (
              <div key={titleKey} className="course-card" data-reveal>
                <div className="course-card__icon">{COURSE_ICONS[i]}</div>
                <h3 className="course-card__title">{t(titleKey)}</h3>
                <p className="course-card__body">{t(bodyKey)}</p>
                <span className="tag">{t(tagKey)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AUDIENCE */}
      <section className="section" id="audience">
        <div className="container">
          <div className="section-header" data-reveal>
            <span className="label">{t('audienceLabel')}</span>
            <h2 className="section-title">{t('audienceTitle')}</h2>
          </div>
          <div className="audience__grid">
            {AUDIENCE.map(({ range, titleKey, bodyKey }) => (
              <div key={titleKey} className="audience-card" data-reveal>
                <div className="audience-card__range">{range}</div>
                <h3>{t(titleKey)}</h3>
                <p>{t(bodyKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EXPERIENCE */}
      <section className="section experience">
        <div className="experience__bg-glow" />
        <div className="container">
          <div className="experience__inner" data-reveal>
            <span className="label">{t('expLabel')}</span>
            <h2 className="section-title">{t('expTitle')}</h2>
            <p className="experience__text">{t('expText')}</p>
            <div className="experience__features">
              {EXP_FEATURES.map(key => (
                <div key={key} className="exp-feat">
                  <span className="exp-feat__dot">◆</span>
                  <span>{t(key)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta" id="cta">
        <div className="container">
          <div className="cta__inner" data-reveal>
            <div className="cta__emblem">
              <img src="/images/logo.png" alt="Grace Academy" />
            </div>
            <h2 className="cta__title">{t('ctaTitle')}</h2>
            <p className="cta__sub">{t('ctaSubtitle')}</p>
            <div className="cta__form">
              <input type="email" className="cta__input" placeholder={t('ctaPlaceholder')} />
              <Link href="/contact" className="btn btn--primary">{t('ctaBtn')}</Link>
            </div>
            <p className="cta__motto">{t('ctaTagline')}</p>
          </div>
        </div>
      </section>
    </>
  )
}
