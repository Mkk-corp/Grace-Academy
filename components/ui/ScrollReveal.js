'use client'

import { useEffect, useRef } from 'react'

export default function ScrollReveal({ children, direction = '', delay = 0, className = '', tag: Tag = 'div' }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      setTimeout(() => el.classList.add('revealed'), delay)
      observer.disconnect()
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' })

    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  return (
    <Tag
      ref={ref}
      data-reveal={direction || true}
      className={className}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  )
}
