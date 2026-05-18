'use client'

import Link from 'next/link'
import { useLang } from '@/context/LangContext'
import PageHero from '@/components/sections/PageHero'

const COVERS = [
  'linear-gradient(135deg, #10222b 0%, #1a3545 60%, rgba(201,147,44,0.3) 100%)',
  'linear-gradient(135deg, #141f10 0%, #1e2e18 60%, rgba(201,147,44,0.25) 100%)',
  'linear-gradient(150deg, #10222b 0%, rgba(201,147,44,0.35) 100%)',
  'linear-gradient(120deg, rgba(201,147,44,0.18) 0%, #10222b 55%, #1a2535 100%)',
  'linear-gradient(135deg, #0e1e2b 0%, #162636 55%, rgba(73,80,65,0.5) 100%)',
  'linear-gradient(135deg, #1a1a10 0%, #10222b 60%, rgba(201,147,44,0.2) 100%)',
]

const BLOG_ICONS = [
  <svg key="book" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  <svg key="edit" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  <svg key="user" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  <svg key="mic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
  <svg key="list" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  <svg key="home" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
]

export default function BlogClient({ posts }) {
  const { t, lang } = useLang()

  return (
    <>
      <PageHero titleKey="blogHeroTitle" subKey="blogHeroSub" breadcrumbKey="blogBreadCurrent" />

      <section className="blog-section">
        <div className="container">
          <div data-reveal>
            <span className="label">{t('blogLabel')}</span>
            <h2 className="section-title">{t('blogTitle')}</h2>
          </div>
          <div className="blog-grid">
            {posts.map((post, i) => (
              <article key={post.id} className="blog-card revealed" style={{ transitionDelay: `${i * 70}ms` }}>
                <Link href={`/blog/${post.slug}`} className="blog-card__cover">
                  {post.image
                    ? <img src={post.image} alt={post.title[lang]} />
                    : (
                      <div className="blog-card__cover-gradient" style={{ background: COVERS[i % COVERS.length] }}>
                        <div className="blog-card__cover-icon">{BLOG_ICONS[i % BLOG_ICONS.length]}</div>
                        <span className="blog-card__cover-cat">{post.category[lang]}</span>
                      </div>
                    )
                  }
                </Link>
                <div className="blog-card__body">
                  <div className="blog-card__meta">
                    <span>{post.category[lang]}</span>
                    <span>·</span>
                    <span>{post.date[lang]}</span>
                  </div>
                  <h3 className="blog-card__title">{post.title[lang]}</h3>
                  <p className="blog-card__excerpt">{post.excerpt[lang]}</p>
                  <Link href={`/blog/${post.slug}`} className="blog-card__readmore">
                    {t('readMore')}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
