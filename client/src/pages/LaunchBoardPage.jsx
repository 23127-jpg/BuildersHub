import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import axiosInstance from '../services/axiosInstance'
import LeftSidebar from '../components/LeftSidebar'
import { ProjectCardSkeleton } from '../components/SkeletonLoader'

const FILTERS = ['today', 'this week', 'all time']
const TAGS = ['AI', 'Web3', 'SaaS', 'Open Source', 'Dev Tools', 'Mobile', 'Game', 'Other']
const TAG_COLORS = { AI: '#7c3aed', SaaS: '#2563eb', 'Dev Tools': '#d97706', 'Open Source': '#16a34a', Web3: '#0891b2', Mobile: '#db2777' }

export default function LaunchBoardPage() {
  const [filter, setFilter] = useState('today')
  const [tag, setTag] = useState('')

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects', filter, tag],
    queryFn: () => axiosInstance.get(`/projects?date=${encodeURIComponent(filter)}${tag ? `&tag=${tag}` : ''}`).then((r) => r.data),
  })

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', paddingTop: '56px' }}>
      <LeftSidebar />
      <main style={{ flex: 1, padding: '1.5rem 2rem', maxWidth: '900px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>🚀 Launch Board</h1>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: '5px 14px', borderRadius: '9999px', border: `1px solid ${filter === f ? 'var(--accent)' : 'var(--border)'}`, background: filter === f ? 'rgba(124,58,237,0.15)' : 'transparent', color: filter === f ? 'var(--accent)' : 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', textTransform: 'capitalize' }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Tag filters */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <button onClick={() => setTag('')} style={{ padding: '4px 12px', borderRadius: '9999px', border: `1px solid ${!tag ? 'var(--accent)' : 'var(--border)'}`, background: !tag ? 'rgba(124,58,237,0.15)' : 'transparent', color: !tag ? 'var(--accent)' : 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer' }}>All</button>
          {TAGS.map((t) => (
            <button key={t} onClick={() => setTag(t === tag ? '' : t)} style={{ padding: '4px 12px', borderRadius: '9999px', border: `1px solid ${tag === t ? (TAG_COLORS[t] || 'var(--accent)') : 'var(--border)'}`, background: tag === t ? `${TAG_COLORS[t] || '#7c3aed'}22` : 'transparent', color: tag === t ? (TAG_COLORS[t] || 'var(--accent)') : 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer' }}>{t}</button>
          ))}
        </div>

        {/* Project grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <ProjectCardSkeleton key={i} />)
            : projects.map((p, i) => (
                <Link key={p._id} to={`/projects/${p._id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', transition: 'border-color 0.2s ease', height: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>#{i + 1}</span>
                        {p.logo ? <img src={p.logo} alt={p.title} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} /> : <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>{p.title[0]}</div>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', border: '1px solid var(--accent)', borderRadius: '8px', color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 600 }}>▲ {p.upvotes?.length || 0}</div>
                    </div>
                    <h3 style={{ fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{p.title}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.75rem', lineHeight: 1.4 }}>{p.tagline}</p>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                      {p.tags?.map((t) => <span key={t} style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '0.75rem', background: `${TAG_COLORS[t] || '#374151'}22`, color: TAG_COLORS[t] || 'var(--text-muted)', border: `1px solid ${TAG_COLORS[t] || '#374151'}44` }}>{t}</span>)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>by {p.maker?.username}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>💬 {p.commentsCount || 0}</span>
                    </div>
                  </div>
                </Link>
              ))}
        </div>

        {!isLoading && projects.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🚀</p>
            <p>No projects launched {filter}. Be the first!</p>
            <Link to="/submit" style={{ display: 'inline-block', marginTop: '1rem', padding: '8px 20px', background: 'var(--accent)', borderRadius: '9999px', color: '#fff', textDecoration: 'none', fontWeight: 600 }}>Submit your project</Link>
          </div>
        )}
      </main>
    </div>
  )
}
