import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axiosInstance from '../services/axiosInstance'

const TYPE_COLORS = { update: '#3b82f6', question: '#eab308', resource: '#22c55e', poll: '#7c3aed' }

export default function PostCard({ post, onUpdate }) {
  const { user, isAuthenticated } = useSelector((s) => s.auth)
  const [liked, setLiked] = useState(post.likes?.includes(user?._id))
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0)
  const [bookmarked, setBookmarked] = useState(false)

  const handleLike = async () => {
    if (!isAuthenticated) return
    try {
      const { data } = await axiosInstance.post(`/posts/${post._id}/like`)
      setLiked(data.liked)
      setLikeCount(data.likeCount)
    } catch {}
  }

  const handleBookmark = async () => {
    if (!isAuthenticated) return
    try {
      await axiosInstance.post('/bookmarks', { targetType: 'post', targetId: post._id })
      setBookmarked((b) => !b)
    } catch {}
  }

  const timeAgo = (date) => {
    const diff = (Date.now() - new Date(date)) / 1000
    if (diff < 60) return `${Math.floor(diff)}s`
    if (diff < 3600) return `${Math.floor(diff / 60)}m`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`
    return `${Math.floor(diff / 86400)}d`
  }

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', transition: 'border-color 0.2s ease' }}>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Link to={`/profile/${post.author?.username}`} style={{ flexShrink: 0 }}>
          {post.author?.avatar ? <img src={post.author.avatar} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%' }} /> : <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>{post.author?.name?.[0]}</div>}
        </Link>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <Link to={`/profile/${post.author?.username}`} style={{ fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.9rem' }}>{post.author?.name}</Link>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>@{post.author?.username}</span>
            <span style={{ padding: '1px 8px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 600, background: `${TYPE_COLORS[post.type]}22`, color: TYPE_COLORS[post.type] }}>{post.type}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginLeft: 'auto' }}>{timeAgo(post.createdAt)}</span>
          </div>

          <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '0.75rem', whiteSpace: 'pre-wrap' }}>{post.content}</p>

          {post.images?.[0] && <img src={post.images[0]} alt="" style={{ width: '100%', borderRadius: '8px', marginBottom: '0.75rem', maxHeight: '300px', objectFit: 'cover' }} />}

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={handleLike} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: liked ? '#f87171' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', padding: 0 }}>
              {liked ? '❤️' : '🤍'} {likeCount}
            </button>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>💬 0</span>
            <button onClick={handleBookmark} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: bookmarked ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem', padding: 0 }}>
              {bookmarked ? '🔖' : '🏷️'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
