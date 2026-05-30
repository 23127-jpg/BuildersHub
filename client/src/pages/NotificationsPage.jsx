import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useDispatch } from 'react-redux'
import axiosInstance from '../services/axiosInstance'
import LeftSidebar from '../components/LeftSidebar'
import { markAllRead } from '../store/notificationSlice'

const TYPE_ICONS = { like: '❤️', comment: '💬', follow: '👤', upvote: '▲', repost: '🔁', reaction: '🔥', streak_milestone: '🔥', changelog: '📋' }

export default function NotificationsPage() {
  const dispatch = useDispatch()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => axiosInstance.get('/notifications').then((r) => r.data.notifications),
  })

  const markAll = useMutation({
    mutationFn: () => axiosInstance.put('/notifications/read-all'),
    onSuccess: () => {
      dispatch(markAllRead())
      queryClient.invalidateQueries(['notifications'])
    },
  })

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', paddingTop: '56px' }}>
      <LeftSidebar />
      <main style={{ flex: 1, padding: '1.5rem 2rem', maxWidth: '700px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>🔔 Notifications</h1>
          <button onClick={() => markAll.mutate()} style={{ padding: '6px 16px', border: '1px solid var(--border)', borderRadius: '9999px', background: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}>Mark all read</button>
        </div>

        {isLoading && <p style={{ color: 'var(--text-muted)' }}>Loading…</p>}

        {(data || []).map((n) => (
          <div key={n._id} style={{ display: 'flex', gap: '0.75rem', padding: '0.875rem', background: n.isRead ? 'transparent' : 'rgba(124,58,237,0.06)', border: '1px solid var(--border)', borderRadius: '10px', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{TYPE_ICONS[n.type] || '🔔'}</span>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{n.sender?.name}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}> {n.type === 'like' ? 'liked your post' : n.type === 'comment' ? 'commented on your post' : n.type === 'follow' ? 'followed you' : n.type === 'upvote' ? 'upvoted your project' : n.type === 'streak_milestone' ? `🔥 ${n.metadata?.milestoneValue} day streak!` : 'sent a notification'}</span>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>{new Date(n.createdAt).toLocaleDateString()}</div>
            </div>
            {!n.isRead && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, marginTop: '6px' }} />}
          </div>
        ))}

        {!isLoading && (!data || data.length === 0) && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>No notifications yet.</p>}
      </main>
    </div>
  )
}
