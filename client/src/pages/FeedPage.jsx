import { useState } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import axiosInstance from '../services/axiosInstance'
import LeftSidebar from '../components/LeftSidebar'
import PostComposer from '../components/PostComposer'
import PostCard from '../components/PostCard'
import { PostSkeleton } from '../components/SkeletonLoader'

const TABS = ['Following', 'Trending', 'For you']

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState('Following')

  const feedQuery = useInfiniteQuery({
    queryKey: ['feed', activeTab],
    queryFn: ({ pageParam = 1 }) => {
      const url = activeTab === 'Trending' ? `/posts/trending` : `/posts/feed?page=${pageParam}`
      return axiosInstance.get(url).then((r) => r.data)
    },
    getNextPageParam: (last) => last.nextPage || undefined,
    enabled: true,
  })

  const { data: tags } = useQuery({
    queryKey: ['trending-tags'],
    queryFn: () => axiosInstance.get('/search?q=a&type=posts').then(() => [
      { tag: '#AI', count: 284 }, { tag: '#DevTools', count: 167 },
      { tag: '#SaaS', count: 134 }, { tag: '#OpenSource', count: 98 }, { tag: '#Web3', count: 71 },
    ]),
    staleTime: 300_000,
  })

  const { data: suggestions } = useQuery({
    queryKey: ['suggestions'],
    queryFn: () => axiosInstance.get('/users/suggestions').then((r) => r.data),
  })

  const posts = feedQuery.data?.pages?.flatMap((p) => (Array.isArray(p) ? p : p.posts || [])) || []

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', paddingTop: '56px' }}>
      <LeftSidebar />

      {/* Center */}
      <main style={{ flex: 1, maxWidth: '640px', padding: '1.5rem 1rem', margin: '0 auto' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--border)', marginBottom: '1.25rem' }}>
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '10px 20px', background: 'none', border: 'none', borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent', color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: activeTab === tab ? 600 : 400, cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.15s ease' }}>
              {tab}
            </button>
          ))}
        </div>

        <PostComposer onPosted={() => feedQuery.refetch()} />

        {feedQuery.isLoading
          ? Array.from({ length: 4 }).map((_, i) => <PostSkeleton key={i} />)
          : posts.map((post) => <div key={post._id} style={{ marginBottom: '0.75rem' }}><PostCard post={post} /></div>)
        }

        {feedQuery.hasNextPage && (
          <button onClick={() => feedQuery.fetchNextPage()} style={{ width: '100%', padding: '10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-muted)', cursor: 'pointer', marginTop: '0.75rem' }}>
            Load more
          </button>
        )}
      </main>

      {/* Right sidebar */}
      <aside style={{ width: '280px', flexShrink: 0, padding: '1.5rem 1rem', display: 'none', '@media(min-width:1024px)': { display: 'block' } }}>
        {/* Trending tags */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>TRENDING TAGS</h3>
          {(tags || []).map((t) => (
            <div key={t.tag} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--accent)', fontSize: '0.9rem', fontWeight: 500 }}>{t.tag}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{t.count} posts</span>
            </div>
          ))}
        </div>

        {/* Builders to follow */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>BUILDERS TO FOLLOW</h3>
          {(suggestions || []).map((u) => (
            <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              {u.avatar ? <img src={u.avatar} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%' }} /> : <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>{u.name?.[0]}</div>}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{u.skills?.slice(0, 2).join(' · ')}</div>
              </div>
              <button style={{ padding: '4px 12px', border: '1px solid var(--border)', borderRadius: '9999px', background: 'none', color: 'var(--text-primary)', fontSize: '0.8rem', cursor: 'pointer' }}>Follow</button>
            </div>
          ))}
        </div>
      </aside>
    </div>
  )
}
