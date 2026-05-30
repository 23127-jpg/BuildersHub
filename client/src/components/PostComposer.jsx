import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '../services/axiosInstance'

const TYPES = ['update', 'question', 'resource', 'poll']
const TYPE_ICONS = { update: '📝', question: '❓', resource: '🔗', poll: '📊' }

export default function PostComposer({ onPosted }) {
  const { user } = useSelector((s) => s.auth)
  const queryClient = useQueryClient()
  const [content, setContent] = useState('')
  const [type, setType] = useState('update')
  const [pollOptions, setPollOptions] = useState(['', ''])
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData()
      formData.append('content', content)
      formData.append('type', type)
      if (type === 'poll') formData.append('pollOptions', JSON.stringify(pollOptions.filter(Boolean)))
      return axiosInstance.post('/posts', formData)
    },
    onSuccess: () => {
      setContent('')
      setType('update')
      setPollOptions(['', ''])
      setError('')
      queryClient.invalidateQueries(['feed'])
      onPosted?.()
    },
    onError: (err) => setError(err.response?.data?.message || 'Failed to post.'),
  })

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        {user?.avatar ? <img src={user.avatar} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0 }} /> : <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, flexShrink: 0 }}>{user?.name?.[0]}</div>}

        <div style={{ flex: 1 }}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What are you building today?"
            maxLength={280}
            rows={3}
            style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.95rem', resize: 'none', lineHeight: 1.5, fontFamily: 'inherit' }}
          />

          {type === 'poll' && (
            <div style={{ marginTop: '0.75rem' }}>
              {pollOptions.map((opt, i) => (
                <input key={i} value={opt} onChange={(e) => { const o = [...pollOptions]; o[i] = e.target.value; setPollOptions(o) }} placeholder={`Option ${i + 1}`} style={{ display: 'block', width: '100%', padding: '6px 10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.85rem', marginBottom: '6px', outline: 'none' }} />
              ))}
              {pollOptions.length < 4 && <button onClick={() => setPollOptions([...pollOptions, ''])} style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>+ Add option</button>}
            </div>
          )}

          {error && <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.5rem' }}>{error}</p>}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
            {TYPES.map((t) => (
              <button key={t} onClick={() => setType(t)} style={{ padding: '4px 12px', borderRadius: '9999px', border: `1px solid ${type === t ? 'var(--accent)' : 'var(--border)'}`, background: type === t ? 'rgba(124,58,237,0.15)' : 'transparent', color: type === t ? 'var(--accent)' : 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {TYPE_ICONS[t]} {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
            <div style={{ flex: 1 }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{content.length}/280</span>
            <button onClick={() => mutation.mutate()} disabled={!content.trim() || mutation.isPending} style={{ padding: '6px 18px', background: 'var(--accent)', borderRadius: '9999px', color: '#fff', fontWeight: 600, fontSize: '0.85rem', border: 'none', cursor: 'pointer', opacity: !content.trim() || mutation.isPending ? 0.6 : 1 }}>
              {mutation.isPending ? 'Posting…' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
