'use client'

import { useLang } from '@/context/LangContext'
import PageHero from '@/components/sections/PageHero'
import StatsSection from '@/components/sections/StatsSection'

export default function PortfolioClient({ projects, stats }) {
  const { t, lang } = useLang()

  return (
    <>
      <PageHero titleKey="portfolioHeroTitle" subKey="portfolioHeroSub" breadcrumbKey="portfolioBreadCurrent" />
      <StatsSection stats={stats} />

      <section className="portfolio-section">
        <div className="container">
          <div data-reveal>
            <span className="label">{t('portfolioLabel')}</span>
            <h2 className="section-title">{t('portfolioTitle')}</h2>
          </div>
          <div className="portfolio-grid">
            {projects.map((proj, i) => (
              <div key={proj.id} className="project-card revealed" style={{ transitionDelay: `${i * 70}ms` }}>
                <div className="project-card__thumb">{proj.thumbLabel}</div>
                <div className="project-card__details">
                  <div className="project-card__category">{proj.category[lang]}</div>
                  <h3 className="project-card__title">{proj.title[lang]}</h3>
                  <div className="project-detail">
                    <span className="project-detail__label">{t('projProblem')}</span>
                    <span className="project-detail__value">{proj.challenge[lang]}</span>
                  </div>
                  <div className="project-detail">
                    <span className="project-detail__label">{t('projSolution')}</span>
                    <span className="project-detail__value">{proj.approach[lang]}</span>
                  </div>
                  <div className="project-detail">
                    <span className="project-detail__label">{t('projResult')}</span>
                    <span className="project-detail__value">{proj.outcome[lang]}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
