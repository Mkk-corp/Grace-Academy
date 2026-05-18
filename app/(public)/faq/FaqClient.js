'use client'

import { useLang } from '@/context/LangContext'
import PageHero from '@/components/sections/PageHero'
import FaqAccordion from '@/components/ui/FaqAccordion'

export default function FaqClient({ faqs }) {
  const { t, lang } = useLang()

  const items = faqs.map(f => ({
    id: f.id,
    question: f.question[lang],
    answer: f.answer[lang],
  }))

  return (
    <>
      <PageHero titleKey="faqHeroTitle" subKey="faqHeroSub" breadcrumbKey="faqBreadCurrent" />

      <section className="faq-section">
        <div className="container">
          <div data-reveal>
            <span className="label">{t('faqLabel')}</span>
            <h2 className="section-title section-title--center">{t('faqTitle')}</h2>
          </div>
          <FaqAccordion items={items} />
        </div>
      </section>
    </>
  )
}
