import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import axiosInstance from '../services/axiosInstance'
import LeftSidebar from '../components/LeftSidebar'
import { PostSkeleton } from '../components/SkeletonLoader'

const TAG_COLORS = { AI: '#7c3aed', SaaS: '#2563eb', 'Dev Tools': '#d97706', 'Open Source': '#16a34a', Web3: '#0891b2', Mobile: '#db2777' }

function CommentThread({ targetType, targetId }) {
  const { user, isAuthenticated } = useSelector((s) => s.auth)
  const queryClient = useQueryClient()
  const [text, setText] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['comments', targetType, targetId],
    queryFn: () => axiosInstance.get(`/comments/${targetType}/${targetId}`).then((r) => r.data),
  })

  const postComment = useMutation({
    mutationFn: () => axiosInstance.post('/comments', { content: text, targetType, targetId }),
    onSuccess: () => { setText(''); queryClient.invalidateQueries(['comments', targetType, targetId]) },
  })

  return (
    <div>
      {isAuthenticated && (
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a comment…" rows={2} style={{ flex: 1, padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.9rem', resize: 'none', outline: 'none', fontFamily: 'inherit' }} />
          <button onClick={() => text.trim() && postComment.mutate()} disabled={!text.trim() || postComment.isPending} style={{ padding: '8px 18px', background: 'var(--accent)', borderRadius: '9999px', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer', alignSelf: 'flex-end', opacity: !text.trim() ? 0.6 : 1 }}>Post</button>
        </div>
      )}

      {isLoading && <PostSkeleton />}

      {(data?.comments || []).map((c) => (
        <div key={c._id} style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', padding: '0.875rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px' }}>
            {c.author?.avatar ? <img src={c.author.avatar} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0 }} /> : <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>{c.author?.name?.[0]}</div>}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{c.author?.name}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>@{c.author?.username}</span>
              </div>
              <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.5 }}>{c.content}</p>
            </div>
          </div>
          {c.replies?.map((r) => (
            <div key={r._id} style={{ marginLeft: '2.5rem', marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(124,58,237,0.04)', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', gap: '0.75rem' }}>
              {r.author?.avatar ? <img src={r.author.avatar} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0 }} /> : <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 }}>{r.author?.name?.[0]}</div>}
              <div>
                <span style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)' }}>{r.author?.name} </span>
                <span style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>{r.content}</span>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default function ProjectDetailPage() {
  const { id } = useParams()
  const { user, isAuthenticated } = useSelector((s) => s.auth)
  const queryClient = useQueryClient()
  const [imgIndex, setImgIndex] = useState(0)

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => axiosInstance.get(`/projects/${id}`).then((r) => r.data),
  })

  const { data: changelogs = [] } = useQuery({
    queryKey: ['changelogs', id],
    queryFn: () => axiosInstance.get(`/projects/${id}/changelogs`).then((r) => r.data),
  })

  const upvoteMutation = useMutation({
    mutationFn: () => axiosInstance.post(`/projects/${id}/upvote`),
    onSuccess: () => queryClient.invalidateQueries(['project', id]),
  })

  if (isLoading) return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', paddingTop: '56px' }}>
      <LeftSidebar />
      <main style={{ flex: 1, padding: '2rem' }}><PostSkeleton /></main>
    </div>
  )

  if (!project) return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', paddingTop: '56px' }}>
      <LeftSidebar />
      <main style={{ flex: 1, padding: '2rem', color: 'var(--text-muted)' }}>Project not found.</main>
    </div>
  )

  const hasUpvoted = project.upvotes?.some((u) => (u._id || u) === user?._id || (u._id || u) === user?.id)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', paddingTop: '56px' }}>
      <LeftSidebar />
      <main style={{ flex: 1, padding: '1.5rem 2rem', maxWidth: '860px' }}>
        {/* Header */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
            {project.logo ? <img src={project.logo} alt="" style={{ width: '72px', height: '72px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }} /> : <div style={{ width: '72px', height: '72px', borderRadius: '12px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1.75rem', flexShrink: 0 }}>{project.title?.[0]}</div>}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '4px' }}>{project.title}</h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>{project.tagline}</p>
                </div>
                <button onClick={() => isAuthenticated && upvoteMutation.mutate()} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', border: `1px solid ${hasUpvoted ? 'var(--accent)' : 'var(--border)'}`, borderRadius: '9999px', background: hasUpvoted ? 'rgba(124,58,237,0.15)' : 'transparent', color: hasUpvoted ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}>
                  ▲ {project.upvotes?.length || 0}
                </button>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                {project.tags?.map((t) => <span key={t} style={{ padding: '3px 10px', borderRadius: '9999px', fontSize: '0.78rem', background: `${TAG_COLORS[t] || '#374151'}22`, color: TAG_COLORS[t] || 'var(--text-muted)', border: `1px solid ${TAG_COLORS[t] || '#374151'}44` }}>{t}</span>)}
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontSize: '0.85rem', textDecoration: 'none' }}>🌐 Live site</a>}
                {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>⌥ GitHub</a>}
                <Link to={`/embed/projects/${project._id}`} style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>🔗 Share card</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Screenshots gallery */}
        {project.screenshots?.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <img src={project.screenshots[imgIndex]} alt="" style={{ width: '100%', borderRadius: '10px', maxHeight: '400px', objectFit: 'cover', marginBottom: '0.5rem' }} />
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
              {project.screenshots.map((s, i) => (
                <img key={i} src={s} alt="" onClick={() => setImgIndex(i)} style={{ width: '80px', height: '56px', borderRadius: '6px', objectFit: 'cover', cursor: 'pointer', border: `2px solid ${i === imgIndex ? 'var(--accent)' : 'transparent'}`, flexShrink: 0 }} />
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '1rem' }}>About</h2>
          <p style={{ color: 'var(--text-primary)', lineHeight: 1.7, fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>{project.description}</p>
        </div>

        {/* Maker */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to={`/profile/${project.maker?.username}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            {project.maker?.avatar ? <img src={project.maker.avatar} alt="" style={{ width: '44px', height: '44px', borderRadius: '50%' }} /> : <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>{project.maker?.name?.[0]}</div>}
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{project.maker?.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>@{project.maker?.username}</div>
            </div>
          </Link>
        </div>

        {/* Changelogs */}
        {changelogs.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '1rem' }}>📋 Changelog</h2>
            {changelogs.map((c) => (
              <div key={c._id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{ padding: '2px 10px', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '9999px', color: 'var(--accent)', fontSize: '0.78rem', fontWeight: 700 }}>{c.version}</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{c.title}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginLeft: 'auto' }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5 }}>{c.body}</p>
              </div>
            ))}
          </div>
        )}

        {/* Comments */}
        <div>
          <h2 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>💬 Comments ({project.commentsCount || 0})</h2>
          <CommentThread targetType="project" targetId={id} />
        </div>
      </main>
    </div>
  )
}
