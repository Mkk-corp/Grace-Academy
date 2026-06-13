'use client'

export default function GlobalRootError({ reset }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0c1a22', color: '#e8dcc8', fontFamily: 'system-ui, sans-serif', padding: '24px', textAlign: 'center' }}>
        <img src="/images/logo.png" alt="Grace Academy" style={{ width: 48, height: 48, objectFit: 'contain', marginBottom: 24, opacity: .85 }} />
        <div style={{ fontSize: 'clamp(6rem, 20vw, 9rem)', fontWeight: 900, lineHeight: 1, letterSpacing: '-.04em', background: 'linear-gradient(135deg, #c9932c 20%, rgba(201,147,44,.3) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>500</div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '1rem 0 .6rem' }}>Something Went Wrong</h1>
        <p style={{ fontSize: '.95rem', color: 'rgba(232,220,200,.55)', lineHeight: 1.7, maxWidth: 420, marginBottom: '2rem' }}>An unexpected error occurred. Please try again or contact us if the problem persists.</p>
        <div style={{ display: 'flex', gap: '.8rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={reset} style={{ padding: '.7rem 1.6rem', background: '#c9932c', color: '#10222b', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: '.875rem', cursor: 'pointer' }}>Try Again</button>
          <a href="/" style={{ padding: '.7rem 1.6rem', background: 'transparent', color: 'rgba(232,220,200,.6)', border: '1px solid rgba(232,220,200,.15)', borderRadius: 6, fontWeight: 600, fontSize: '.875rem', textDecoration: 'none' }}>Go Home</a>
        </div>
      </body>
    </html>
  )
}
