'use client'

import { useState } from 'react'

export default function FaqAccordion({ items }) {
  const [openId, setOpenId] = useState(null)

  function toggle(id) {
    setOpenId(prev => prev === id ? null : id)
  }

  return (
    <div className="faq-list">
      {items.map((item, i) => {
        const isOpen = openId === item.id
        return (
          <div
            key={item.id}
            className={`faq-item revealed${isOpen ? ' open' : ''}`}
            style={{ transitionDelay: `${i * 60}ms` }}
          >
            <button className="faq-item__trigger" onClick={() => toggle(item.id)}>
              <span className="faq-item__question">{item.question}</span>
              <span className="faq-item__chevron">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </span>
            </button>
            <div className="faq-item__body">
              <p className="faq-item__answer">{item.answer}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
