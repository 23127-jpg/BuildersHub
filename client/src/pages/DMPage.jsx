import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '../services/axiosInstance'
import LeftSidebar from '../components/LeftSidebar'
import { useSelector } from 'react-redux'

export default function DMPage() {
  const { user } = useSelector((s) => s.auth)
  const queryClient = useQueryClient()
  const [activeThread, setActiveThread] = useState(null)
  const [message, setMessage] = useState('')

  const { data: threads = [] } = useQuery({
    queryKey: ['dm-threads'],
    queryFn: () => axiosInstance.get('/dm/threads').then((r) => r.data),
  })

  const { data: messages = [] } = useQuery({
    queryKey: ['dm-messages', activeThread?._id],
    queryFn: () => axiosInstance.get(`/dm/threads/${activeThread._id}`).then((r) => r.data),
    enabled: !!activeThread,
  })

  const sendMutation = useMutation({
    mutationFn: () => {
      const other = activeThread.participants.find((p) => p._id !== user?._id)
      return axiosInstance.post(`/dm/threads/${other._id}`, { content: message })
    },
    onSuccess: () => {
      setMessage('')
      queryClient.invalidateQueries(['dm-messages', activeThread?._id])
    },
  })

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', paddingTop: '56px' }}>
      <LeftSidebar />
      <div style={{ flex: 1, display: 'flex', maxHeight: 'calc(100vh - 56px)' }}>
        {/* Thread list */}
        <div style={{ width: '280px', borderRight: '1px solid var(--border)', overflowY: 'auto', padding: '1rem' }}>
          <h2 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>✉️ Messages</h2>
          {threads.map((t) => {
            const other = t.participants?.find((p) => p._id !== user?._id)
            return (
              <div key={t._id} onClick={() => setActiveThread(t)} style={{ display: 'flex', gap: '10px', padding: '10px', borderRadius: '8px', cursor: 'pointer', background: activeThread?._id === t._id ? 'rgba(124,58,237,0.1)' : 'transparent', marginBottom: '4px' }}>
                {other?.avatar ? <img src={other.avatar} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%' }} /> : <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>{other?.name?.[0]}</div>}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{other?.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.lastMessage?.content || 'No messages yet'}</div>
                </div>
                {t.unreadCount > 0 && <span style={{ background: 'var(--accent)', color: '#fff', borderRadius: '9999px', padding: '1px 7px', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>{t.unreadCount}</span>}
              </div>
            )
          })}
          {threads.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No conversations yet.</p>}
        </div>

        {/* Message thread */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {activeThread ? (
            <>
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {messages.map((m) => {
                  const isMe = m.sender?._id === user?._id || m.sender === user?._id
                  return (
                    <div key={m._id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                      <div style={{ maxWidth: '70%', padding: '10px 14px', borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px', background: isMe ? 'var(--accent)' : 'var(--surface)', color: isMe ? '#fff' : 'var(--text-primary)', fontSize: '0.9rem', border: isMe ? 'none' : '1px solid var(--border)' }}>
                        {m.content}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.75rem' }}>
                <input value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && message.trim() && sendMutation.mutate()} placeholder="Type a message…" style={{ flex: 1, padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '9999px', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }} />
                <button onClick={() => message.trim() && sendMutation.mutate()} style={{ padding: '10px 20px', background: 'var(--accent)', borderRadius: '9999px', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer' }}>Send</button>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
