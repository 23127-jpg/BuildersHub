import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import axiosInstance from '../services/axiosInstance'

const TAG_COLORS = { AI: '#7c3aed', SaaS: '#2563eb', 'Dev Tools': '#d97706', 'Open Source': '#16a34a' }

export default function EmbedCardPage() {
  const { id } = useParams()

  const { data: project, isLoading, isError } = useQuery({
    queryKey: ['project-embed', id],
    queryFn: () => axiosInstance.get(`/projects/${id}`).then((r) => r.data),
  })

  useEffect(() => {
    if (!project) return
    // Inject Open Graph meta tags
    const setMeta = (property, content) => {
      let el = document.querySelector(`meta[property="${property}"]`)
      if (!el) { el = document.createElement('meta'); el.setAttribute('property', property); document.head.appendChild(el) }
      el.setAttribute('content', content)
    }
    setMeta('og:title', project.title)
    setMeta('og:description', project.tagline)
    setMeta('og:image', project.logo)
    setMeta('og:url', window.location.href)
    document.title = `${project.title} — BuildersHub`
  }, [project])

  if (isLoading) return <div style={{ minHeight: '100vh', background: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a1a1aa' }}>Loading…</div>
  if (isError || !project) return <div style={{ minHeight: '100vh', background: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a1a1aa' }}>Project not found.</div>

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '560px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          {project.logo ? <img src={project.logo} alt="" style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover' }} /> : <div style={{ width: '64px', height: '64px', borderRadius: '12px', background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1.5rem' }}>{project.title[0]}</div>}
          <div>
            <h1 style={{ color: '#f5f5f5', fontSize: '1.4rem', fontWeight: 800, marginBottom: '4px' }}>{project.title}</h1>
            <p style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>{project.tagline}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {project.tags?.map((t) => <span key={t} style={{ padding: '3px 10px', borderRadius: '9999px', fontSize: '0.78rem', background: `${TAG_COLORS[t] || '#374151'}22`, color: TAG_COLORS[t] || '#a1a1aa', border: `1px solid ${TAG_COLORS[t] || '#374151'}44` }}>{t}</span>)}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#7c3aed', fontWeight: 700, fontSize: '1.1rem' }}>
            ▲ {project.upvotes?.length || 0} <span style={{ color: '#a1a1aa', fontWeight: 400, fontSize: '0.85rem' }}>upvotes</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '20px', height: '20px', background: '#7c3aed', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.7rem' }}>B</div>
            <span style={{ color: '#a1a1aa', fontSize: '0.8rem' }}>BuildersHub</span>
          </div>
        </div>
      </div>
    </div>
  )
}
