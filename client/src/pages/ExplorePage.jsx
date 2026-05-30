import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import axiosInstance from '../services/axiosInstance'
import LeftSidebar from '../components/LeftSidebar'
import PostCard from '../components/PostCard'
import { PostSkeleton, ProjectCardSkeleton } from '../components/SkeletonLoader'

const TAG_COLORS = { AI: '#7c3aed', SaaS: '#2563eb', 'Dev Tools': '#d97706', 'Open Source': '#16a34a', Web3: '#0891b2', Mobile: '#db2777' }
const RANK_COLORS = ['#f59e0b', '#9ca3af', '#d97706']

export default function ExplorePage() {
  const { data: trending = [], isLoading: trendingLoading } = useQuery({
    queryKey: ['trending'],
    queryFn: () => axiosInstance.get('/posts/trending').then((r) => r.data),
  })

  const { data: topProjects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['projects', 'this week', ''],
    queryFn: () => axiosInstance.get('/projects?date=this week').then((r) => r.data.slice(0, 6)),
  })

  const { data: leaders = [] } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => axiosInstance.get('/leaderboard').then((r) => r.data),
  })

  const { data: suggestions = [] } = useQuery({
    queryKey: ['suggestions'],
    queryFn: () => axiosInstance.get('/users/suggestions').then((r) => r.data),
  })

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', paddingTop: '56px' }}>
      <LeftSidebar />

      {/* Center */}
      <main style={{ flex: 1, padding: '1.5rem 1rem', maxWidth: '640px' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>🔭 Explore</h1>

        {/* Trending posts */}
        <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>TRENDING POSTS (LAST 24H)</h2>
        {trendingLoading ? Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />) : trending.slice(0, 10).map((p) => <div key={p._id} style={{ marginBottom: '0.75rem' }}><PostCard post={p} /></div>)}
        {!trendingLoading && trending.length === 0 && <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>No trending posts yet.</p>}

        {/* Top projects this week */}
        <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', marginTop: '1.5rem', marginBottom: '0.75rem' }}>TOP PROJECTS THIS WEEK</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {projectsLoading ? Array.from({ length: 4 }).map((_, i) => <ProjectCardSkeleton key={i} />) : topProjects.map((p, i) => (
            <Link key={p._id} to={`/projects/${p._id}`} style={{ textDecoration: 'none' }}>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>#{i + 1}</span>
                    {p.logo ? <img src={p.logo} alt="" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} /> : <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>{p.title?.[0]}</div>}
                  </div>
                  <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '0.9rem' }}>▲ {p.upvotes?.length || 0}</span>
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '2px', color: 'var(--text-primary)' }}>{p.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.4 }}>{p.tagline}</p>
                <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  {p.tags?.slice(0, 2).map((t) => <span key={t} style={{ padding: '1px 7px', borderRadius: '9999px', fontSize: '0.72rem', background: `${TAG_COLORS[t] || '#374151'}22`, color: TAG_COLORS[t] || 'var(--text-muted)' }}>{t}</span>)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Right sidebar */}
      <aside style={{ width: '280px', flexShrink: 0, padding: '1.5rem 1rem' }}>
        {/* Leaderboard widget */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>🏆 LEADERBOARD</h3>
            <Link to="/leaderboard" style={{ color: 'var(--accent)', fontSize: '0.78rem', textDecoration: 'none' }}>See all →</Link>
          </div>
          {leaders.slice(0, 5).map((entry, i) => (
            <Link key={entry.user?.id || i} to={`/profile/${entry.user?.username}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontWeight: 800, fontSize: '0.85rem', color: i < 3 ? RANK_COLORS[i] : 'var(--text-muted)', width: '18px', textAlign: 'center' }}>#{entry.rank}</span>
              {entry.user?.avatar ? <img src={entry.user.avatar} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%' }} /> : <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.75rem' }}>{entry.user?.name?.[0]}</div>}
              <span style={{ flex: 1, color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.user?.name}</span>
              <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '0.82rem' }}>▲{entry.totalUpvotes}</span>
            </Link>
          ))}
        </div>

        {/* Suggested builders */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>BUILDERS TO FOLLOW</h3>
          {suggestions.map((u) => (
            <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              {u.avatar ? <img src={u.avatar} alt="" style={{ width: '34px', height: '34px', borderRadius: '50%' }} /> : <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.8rem' }}>{u.name?.[0]}</div>}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: 'var(--text-primary)', fontSize: '0.82rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{u.skills?.slice(0, 2).join(' · ')}</div>
              </div>
              <button style={{ padding: '3px 10px', border: '1px solid var(--border)', borderRadius: '9999px', background: 'none', color: 'var(--text-primary)', fontSize: '0.78rem', cursor: 'pointer' }}>Follow</button>
            </div>
          ))}
        </div>
      </aside>
    </div>
  )
}
