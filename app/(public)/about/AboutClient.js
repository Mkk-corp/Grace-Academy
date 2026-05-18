'use client'

import { useLang } from '@/context/LangContext'
import PageHero from '@/components/sections/PageHero'
import StatsSection from '@/components/sections/StatsSection'

const WHY = ['why1', 'why2', 'why3', 'why4', 'why5', 'why6']
const TEAM = ['team1', 'team2', 'team3', 'team4']

const WHY_ICONS = [
  <svg key="1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  <svg key="2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  <svg key="3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  <svg key="4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  <svg key="5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  <svg key="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
]

export default function AboutClient({ stats }) {
  const { t } = useLang()

  return (
    <>
      <PageHero titleKey="aboutHeroTitle" subKey="aboutHeroSub" breadcrumbKey="aboutBreadCurrent" />
      <StatsSection stats={stats} />

      {/* Story */}
      <section className="story-section">
        <div className="container">
          <div className="story__grid">
            <div className="story__content" data-reveal>
              <span className="label">{t('storyLabel')}</span>
              <h2 className="section-title">{t('storyTitle')}</h2>
              <p>{t('storyP1')}</p>
              <p>{t('storyP2')}</p>
              <p>{t('storyP3')}</p>
            </div>
            <div className="story__visual" data-reveal="right">
              <div className="story__visual-box">GA</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="mv-section">
        <div className="container">
          <div data-reveal>
            <span className="label">{t('mvLabel')}</span>
            <h2 className="section-title">{t('mvTitle')}</h2>
          </div>
          <div className="mv-grid">
            {[
              { iconPath: <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>, titleKey: 'missionTitle', bodyKey: 'missionBody' },
              { iconPath: <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>, titleKey: 'visionTitle', bodyKey: 'visionBody' },
            ].map(({ iconPath, titleKey, bodyKey }) => (
              <div key={titleKey} className="mv-card">
                <div className="mv-card__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{iconPath}</svg>
                </div>
                <h3 className="mv-card__title">{t(titleKey)}</h3>
                <p className="mv-card__body">{t(bodyKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-section">
        <div className="container">
          <div data-reveal>
            <span className="label">{t('whyLabel')}</span>
            <h2 className="section-title">{t('whyTitle')}</h2>
          </div>
          <div className="why-grid">
            {WHY.map((key, i) => (
              <div key={key} className="why-card revealed" style={{ transitionDelay: `${i * 70}ms` }}>
                <div className="why-card__icon">{WHY_ICONS[i]}</div>
                <h3 className="why-card__title">{t(`${key}Title`)}</h3>
                <p className="why-card__body">{t(`${key}Body`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="team-section">
        <div className="container">
          <div data-reveal>
            <span className="label">{t('teamLabel')}</span>
            <h2 className="section-title">{t('teamTitle')}</h2>
          </div>
          <div className="team-grid">
            {TEAM.map((key, i) => (
              <div key={key} className="team-card revealed" style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="team-card__avatar">{t(`${key}Name`).charAt(0)}</div>
                <div className="team-card__info">
                  <div className="team-card__name">{t(`${key}Name`)}</div>
                  <div className="team-card__role">{t(`${key}Role`)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
