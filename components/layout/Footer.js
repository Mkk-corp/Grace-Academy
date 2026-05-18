'use client'

import Link from 'next/link'
import { useLang } from '@/context/LangContext'

export default function Footer() {
  const { t } = useLang()

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <img src="/images/logo.png" alt="Grace Academy" className="footer__logo" />
            <div>
              <div className="footer__name">{t('brandName')} ACADEMY</div>
              <div className="footer__motto">{t('footerMotto')}</div>
            </div>
          </div>

          <nav className="footer__nav">
            <div className="footer__col">
              <h4>{t('footerCourses')}</h4>
              <ul>
                <li><Link href="/services">{t('footerConvo')}</Link></li>
                <li><Link href="/services">{t('footerBusiness')}</Link></li>
                <li><Link href="/services">{t('footerTech')}</Link></li>
                <li><Link href="/services">{t('footerAcademic')}</Link></li>
              </ul>
            </div>
            <div className="footer__col">
              <h4>{t('footerCompany')}</h4>
              <ul>
                <li><Link href="/about">{t('footerAbout')}</Link></li>
                <li><Link href="/services">{t('navServices')}</Link></li>
                <li><Link href="/portfolio">{t('footerWhoFor')}</Link></li>
                <li><Link href="/contact">{t('footerContact')}</Link></li>
              </ul>
            </div>
            <div className="footer__col">
              <h4>{t('footerPagesCol') || 'Pages'}</h4>
              <ul>
                <li><Link href="/">{t('navHome')}</Link></li>
                <li><Link href="/blog">{t('navBlog')}</Link></li>
                <li><Link href="/faq">{t('navFaq')}</Link></li>
                <li><Link href="/pricing">{t('navPricing')}</Link></li>
              </ul>
            </div>
          </nav>
        </div>

        <div className="footer__bottom">
          <span>{t('footerCopy')}</span>
          <div className="footer__dev">
            <span>{t('footerDev')}</span>
            <img src="/images/dev-logo.png" alt="Developer" className="footer__dev-logo" />
          </div>
        </div>
      </div>
    </footer>
  )
}
