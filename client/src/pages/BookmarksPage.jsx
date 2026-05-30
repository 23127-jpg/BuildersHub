import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import axiosInstance from '../services/axiosInstance'
import LeftSidebar from '../components/LeftSidebar'
import PostCard from '../components/PostCard'
import { PostSkeleton } from '../components/SkeletonLoader'

const TAG_COLORS = { AI: '#7c3aed', SaaS: '#2563eb', 'Dev Tools': '#d97706', 'Open Source': '#16a34a' }

export default function BookmarksPage() {
  const { data: bookmarks = [], isLoading } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: () => axiosInstance.get('/bookmarks').then((r) => r.data),
  })

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', paddingTop: '56px' }}>
      <LeftSidebar />
      <main style={{ flex: 1, padding: '1.5rem 2rem', maxWidth: '700px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>🔖 Bookmarks</h1>

        {isLoading && Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)}

        {!isLoading && bookmarks.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔖</p>
            <p>No bookmarks yet. Save posts and projects to find them here.</p>
          </div>
        )}

        {bookmarks.map((b) => {
          if (b.targetType === 'post' && b.targetId) {
            return <div key={b._id} style={{ marginBottom: '0.75rem' }}><PostCard post={b.targetId} /></div>
          }
          if (b.targetType === 'project' && b.targetId) {
            const p = b.targetId
            return (
              <Link key={b._id} to={`/projects/${p._id}`} style={{ textDecoration: 'none', display: 'block', marginBottom: '0.75rem' }}>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  {p.logo ? <img src={p.logo} alt="" style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} /> : <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, flexShrink: 0 }}>{p.title?.[0]}</div>}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>{p.title}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '6px' }}>{p.tagline}</p>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {p.tags?.map((t) => <span key={t} style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '0.75rem', background: `${TAG_COLORS[t] || '#374151'}22`, color: TAG_COLORS[t] || 'var(--text-muted)' }}>{t}</span>)}
                    </div>
                  </div>
                  <span style={{ color: 'var(--accent)', fontWeight: 600 }}>▲ {p.upvotes?.length || 0}</span>
                </div>
              </Link>
            )
          }
          return null
        })}
      </main>
    </div>
  )
}
