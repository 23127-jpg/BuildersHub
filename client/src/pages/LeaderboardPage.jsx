import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import axiosInstance from '../services/axiosInstance'
import LeftSidebar from '../components/LeftSidebar'

const RANK_COLORS = ['#f59e0b', '#9ca3af', '#d97706']

export default function LeaderboardPage() {
  const { data: leaders = [], isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => axiosInstance.get('/leaderboard').then((r) => r.data),
  })

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', paddingTop: '56px' }}>
      <LeftSidebar />
      <main style={{ flex: 1, padding: '1.5rem 2rem', maxWidth: '700px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>🏆 Builder Leaderboard</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Top builders by upvotes received in the past 7 days. Resets every Monday.</p>

        {isLoading && <p style={{ color: 'var(--text-muted)' }}>Loading…</p>}

        {leaders.map((entry, i) => (
          <Link key={entry.user?.id || i} to={`/profile/${entry.user?.username}`} style={{ textDecoration: 'none', display: 'block', marginBottom: '0.75rem' }}>
            <div style={{ background: 'var(--surface)', border: `1px solid ${i < 3 ? RANK_COLORS[i] + '44' : 'var(--border)'}`, borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'border-color 0.2s ease' }}>
              {/* Rank */}
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: i < 3 ? `${RANK_COLORS[i]}22` : 'var(--bg)', border: `2px solid ${i < 3 ? RANK_COLORS[i] : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem', color: i < 3 ? RANK_COLORS[i] : 'var(--text-muted)', flexShrink: 0 }}>
                {entry.rank}
              </div>

              {/* Avatar */}
              {entry.user?.avatar ? <img src={entry.user.avatar} alt="" style={{ width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0 }} /> : <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, flexShrink: 0 }}>{entry.user?.name?.[0]}</div>}

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{entry.user?.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>@{entry.user?.username}</div>
              </div>

              {/* Stats */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '1.1rem' }}>▲ {entry.totalUpvotes}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>upvotes this week</div>
              </div>
            </div>
          </Link>
        ))}

        {!isLoading && leaders.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏆</p>
            <p>No data yet. Launch a project and get upvotes to appear here!</p>
          </div>
        )}
      </main>
    </div>
  )
}
