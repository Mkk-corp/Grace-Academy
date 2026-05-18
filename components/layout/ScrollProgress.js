'use client'

import { useEffect, useRef } from 'react'

export default function ScrollProgress() {
  const barRef = useRef(null)

  useEffect(() => {
    function update() {
      const bar = barRef.current
      if (!bar) return
      const docH = document.documentElement.scrollHeight - window.innerHeight
      bar.style.transform = docH > 0 ? `scaleX(${window.scrollY / docH})` : 'scaleX(0)'
    }
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return <div ref={barRef} className="scroll-progress" />
}
