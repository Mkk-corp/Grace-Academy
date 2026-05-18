'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import translations from '@/lib/translations'

const LangContext = createContext(null)

export function LangProvider({ children }) {
  const [lang, setLang] = useState('en')

  useEffect(() => {
    const stored = localStorage.getItem('ga-lang') || 'en'
    setLang(stored)
    const data = translations[stored]
    document.documentElement.lang = data._lang
    document.documentElement.dir  = data._dir
  }, [])

  function toggleLang() {
    const next = lang === 'en' ? 'ar' : 'en'
    const data = translations[next]
    setLang(next)
    localStorage.setItem('ga-lang', next)
    document.documentElement.lang = data._lang
    document.documentElement.dir  = data._dir
  }

  function t(key) {
    return translations[lang]?.[key] ?? key
  }

  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  return (
    <LangContext.Provider value={{ lang, dir, t, toggleLang }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used inside LangProvider')
  return ctx
}
