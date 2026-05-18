import { readData } from '@/lib/db'

export default function AdminOverviewPage() {
  const stats = readData('stats.json')
  const services = readData('services.json')
  const portfolio = readData('portfolio.json')
  const blog = readData('blog.json')
  const faq = readData('faq.json')
  const messages = readData('contact.json')
  const unread = messages.filter(m => !m.read).length

  const tiles = [
    { label: 'Reviews', value: `${stats.reviews.value}${stats.reviews.suffix}`, color: 'var(--gold)' },
    { label: 'Services', value: services.length },
    { label: 'Portfolio Cases', value: portfolio.length },
    { label: 'Blog Posts', value: blog.filter(b => b.published).length },
    { label: 'FAQ Items', value: faq.length },
    { label: 'Unread Messages', value: unread, color: unread > 0 ? '#e8a020' : undefined },
  ]

  return (
    <>
      <div className="admin-header">
        <h1>Overview</h1>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {tiles.map(({ label, value, color }) => (
          <div key={label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '24px', borderBottom: `3px solid ${color || 'var(--gold)'}` }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: color || 'var(--gold)', fontFamily: 'var(--font-en)' }}>{value}</div>
            <div style={{ fontSize: '.8rem', color: 'var(--text-60)', textTransform: 'uppercase', letterSpacing: '.06em', marginTop: '4px' }}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '24px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '12px' }}>Recent Messages</h2>
        {messages.slice(-5).reverse().map(msg => (
          <div key={msg.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            {!msg.read && <span className="badge-unread">NEW</span>}
            <div>
              <div style={{ fontSize: '.875rem', fontWeight: 600, color: 'var(--text)' }}>{msg.name}</div>
              <div style={{ fontSize: '.8rem', color: 'var(--text-60)' }}>{msg.email} · {new Date(msg.submittedAt).toLocaleDateString()}</div>
            </div>
          </div>
        ))}
        {messages.length === 0 && <p style={{ color: 'var(--text-40)', fontSize: '.875rem' }}>No messages yet.</p>}
      </div>
    </>
  )
}
