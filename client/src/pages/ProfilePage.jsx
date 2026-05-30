import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import axiosInstance from '../services/axiosInstance'
import LeftSidebar from '../components/LeftSidebar'
import PostCard from '../components/PostCard'
import ActivityGraph from '../components/ActivityGraph'

export default function ProfilePage() {
  const { username } = useParams()
  const { user: me } = useSelector((s) => s.auth)
  const queryClient = useQueryClient()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => axiosInstance.get(`/users/${username}`).then((r) => r.data),
  })

  const followMutation = useMutation({
    mutationFn: () => axiosInstance.post(`/users/${profile._id}/follow`),
    onSuccess: () => queryClient.invalidateQueries(['profile', username]),
  })

  const unfollowMutation = useMutation({
    mutationFn: () => axiosInstance.delete(`/users/${profile._id}/follow`),
    onSuccess: () => queryClient.invalidateQueries(['profile', username]),
  })

  const isOwnProfile = me?.username === username
  const isFollowing = profile?.followers?.map(String).includes(me?._id)

  if (isLoading) return <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', paddingTop: '56px' }}><LeftSidebar /><main style={{ flex: 1, padding: '2rem' }}><p style={{ color: 'var(--text-muted)' }}>Loading…</p></main></div>

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', paddingTop: '56px' }}>
      <LeftSidebar />
      <main style={{ flex: 1, padding: '1.5rem 2rem', maxWidth: '800px' }}>
        {/* Header */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
            {profile?.avatar ? <img src={profile.avatar} alt="" style={{ width: '80px', height: '80px', borderRadius: '50%', border: '3px solid var(--accent)' }} /> : <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '2rem' }}>{profile?.name?.[0]}</div>}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{profile?.name}</h1>
                {profile?.currentStreak > 0 && <span style={{ padding: '3px 10px', background: 'rgba(251,146,60,0.15)', border: '1px solid rgba(251,146,60,0.3)', borderRadius: '9999px', color: '#fb923c', fontSize: '0.8rem', fontWeight: 600 }}>🔥 {profile.currentStreak} day streak</span>}
                {!isOwnProfile && me && (
                  <button onClick={() => isFollowing ? unfollowMutation.mutate() : followMutation.mutate()} style={{ padding: '6px 18px', background: isFollowing ? 'transparent' : 'var(--accent)', border: `1px solid ${isFollowing ? 'var(--border)' : 'var(--accent)'}`, borderRadius: '9999px', color: isFollowing ? 'var(--text-muted)' : '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </button>
                )}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>@{profile?.username}</p>
              {profile?.bio && <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', marginTop: '0.5rem', lineHeight: 1.5 }}>{profile.bio}</p>}
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}><strong style={{ color: 'var(--text-primary)' }}>{profile?.followerCount || 0}</strong> followers</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}><strong style={{ color: 'var(--text-primary)' }}>{profile?.followingCount || 0}</strong> following</span>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                {profile?.skills?.map((s) => <span key={s} style={{ padding: '2px 10px', borderRadius: '9999px', fontSize: '0.78rem', background: 'rgba(124,58,237,0.12)', color: 'var(--accent)', border: '1px solid rgba(124,58,237,0.25)' }}>{s}</span>)}
              </div>
            </div>
          </div>
        </div>

        {/* Activity Graph */}
        {profile?.activityData && <ActivityGraph data={profile.activityData} />}

        {/* Projects */}
        {profile?.projects?.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>🚀 Projects</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem' }}>
              {profile.projects.map((p) => (
                <div key={p._id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>{p.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{p.tagline}</p>
                  <span style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 600 }}>▲ {p.upvotes?.length || 0}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent posts */}
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>📝 Recent Posts</h2>
        {profile?.recentPosts?.map((p) => <div key={p._id} style={{ marginBottom: '0.75rem' }}><PostCard post={{ ...p, author: profile }} /></div>)}
      </main>
    </div>
  )
}
