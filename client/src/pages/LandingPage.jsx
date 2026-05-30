import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import axiosInstance from '../services/axiosInstance'

const STATS = [
  { value: '3,247', label: 'builders' },
  { value: '891', label: 'projects launched' },
  { value: '12.4k', label: 'upvotes given' },
]

const TAG_COLORS = {
  AI: '#7c3aed', SaaS: '#2563eb', 'Dev Tools': '#d97706',
  'Open Source': '#16a34a', Web3: '#0891b2', Mobile: '#db2777',
}

export default function LandingPage() {
  const { data: projects = [] } = useQuery({
    queryKey: ['launches', 'today'],
    queryFn: () => axiosInstance.get('/projects?date=today').then((r) => r.data.slice(0, 3)),
  })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text-primary)' }}>
      {/* Navbar */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, borderBottom: '1px solid var(--border)', background: 'rgba(13,13,13,0.9)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 1.5rem', height: '56px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '0.5rem' }}>
          <div style={{ width: '28px', height: '28px', background: 'var(--accent)', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>B</div>
          <span style={{ fontWeight: 700, fontSize: '1rem' }}>BuildersHub</span>
        </div>
        {['Feed', 'Launches', 'Discuss', 'Explore'].map((item) => (
          <Link key={item} to={`/${item.toLowerCase()}`} style={{ padding: '5px 14px', border: '1px solid var(--border)', borderRadius: '9999px', color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none', transition: 'all 0.2s ease' }}>
            {item}
          </Link>
        ))}
        <div style={{ flex: 1 }} />
        <Link to="/login" style={{ padding: '5px 14px', border: '1px solid var(--border)', borderRadius: '9999px', color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>Sign in</Link>
        <Link to="/register" style={{ padding: '5px 16px', background: 'var(--accent)', borderRadius: '9999px', color: '#fff', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>Sign up</Link>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: '120px', paddingBottom: '80px', textAlign: 'center', maxWidth: '700px', margin: '0 auto', padding: '120px 1.5rem 80px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 14px', border: '1px solid var(--accent)', borderRadius: '9999px', fontSize: '0.8rem', color: 'var(--accent)', marginBottom: '1.5rem' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
          Now in public beta · 3,200+ builders
        </div>

        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.25rem' }}>
          Where builders<br />
          ship <span style={{ color: 'var(--accent)' }}>in public</span>
        </h1>

        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
          Share your journey, launch your projects, get real feedback from developers who actually build things.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
          <Link to="/register" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 24px', background: 'var(--accent)', borderRadius: '9999px', color: '#fff', fontWeight: 600, textDecoration: 'none', fontSize: '0.95rem' }}>
            🚀 Start building
          </Link>
          <Link to="/launches" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 24px', border: '1px solid var(--border)', borderRadius: '9999px', color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'none', fontSize: '0.95rem' }}>
            🔍 Explore projects
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '1.5rem 0' }}>
          {STATS.map((s, i) => (
            <div key={s.label} style={{ flex: 1, textAlign: 'center', borderRight: i < STATS.length - 1 ? '1px solid var(--border)' : 'none', padding: '0 1.5rem' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{s.value}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Today's Launches */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--accent)' }}>▣</span> Today's launches
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {['Today', 'This week', 'All time'].map((f) => (
              <span key={f} style={{ padding: '4px 12px', borderRadius: '9999px', fontSize: '0.8rem', background: f === 'Today' ? 'var(--accent)' : 'transparent', color: f === 'Today' ? '#fff' : 'var(--text-muted)', cursor: 'pointer' }}>{f}</span>
            ))}
            <Link to="/launches" style={{ color: 'var(--accent)', fontSize: '0.85rem', textDecoration: 'none', marginLeft: '0.5rem' }}>See all →</Link>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {projects.length === 0
            ? [1, 2, 3].map((i) => (
                <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', height: '200px', animation: 'pulse 1.5s infinite' }} />
              ))
            : projects.map((p, i) => (
                <Link key={p._id} to={`/projects/${p._id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', transition: 'border-color 0.2s ease', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>#{i + 1}</span>
                        {p.logo ? <img src={p.logo} alt={p.title} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} /> : <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>{p.title[0]}</div>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', border: '1px solid var(--accent)', borderRadius: '8px', color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 600 }}>
                        ▲ {p.upvotes?.length || 0}
                      </div>
                    </div>
                    <h3 style={{ fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{p.title}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.75rem', lineHeight: 1.4 }}>{p.tagline}</p>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                      {p.tags?.map((tag) => (
                        <span key={tag} style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '0.75rem', background: `${TAG_COLORS[tag] || '#374151'}22`, color: TAG_COLORS[tag] || 'var(--text-muted)', border: `1px solid ${TAG_COLORS[tag] || '#374151'}44` }}>{tag}</span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {p.maker?.avatar ? <img src={p.maker.avatar} alt="" style={{ width: '20px', height: '20px', borderRadius: '50%' }} /> : <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--accent)' }} />}
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>by {p.maker?.username}</span>
                      </div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>💬 {p.commentsCount || 0}</span>
                    </div>
                  </div>
                </Link>
              ))}
        </div>
      </section>
    </div>
  )
}
