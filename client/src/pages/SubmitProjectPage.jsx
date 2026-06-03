import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import axiosInstance from '../services/axiosInstance'
import LeftSidebar from '../components/LeftSidebar'

const VALID_TAGS = ['AI', 'Web3', 'SaaS', 'Open Source', 'Dev Tools', 'Mobile', 'Game', 'Other']
const TAG_COLORS = { AI: '#7c3aed', SaaS: '#2563eb', 'Dev Tools': '#d97706', 'Open Source': '#16a34a', Web3: '#0891b2', Mobile: '#db2777', Game: '#dc2626', Other: '#6b7280' }

export default function SubmitProjectPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', tagline: '', description: '', liveUrl: '', githubUrl: '' })
  const [selectedTags, setSelectedTags] = useState([])
  const [logo, setLogo] = useState(null)
  const [screenshots, setScreenshots] = useState([])
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')

  // AI states
  const [bulletPoints, setBulletPoints] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [tagAiLoading, setTagAiLoading] = useState(false)

  const submitMutation = useMutation({
    mutationFn: () => {
      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('tagline', form.tagline)
      fd.append('description', form.description)
      fd.append('liveUrl', form.liveUrl)
      fd.append('githubUrl', form.githubUrl)
      fd.append('tags', JSON.stringify(selectedTags))
      if (logo) fd.append('logo', logo)
      screenshots.forEach((f) => fd.append('screenshots', f))
      return axiosInstance.post('/projects', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    },
    onSuccess: (res) => navigate(`/projects/${res.data._id}`),
    onError: (err) => setServerError(err.response?.data?.message || 'Submission failed.'),
  })

  const validate = () => {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Title is required.'
    if (!form.tagline.trim()) errs.tagline = 'Tagline is required.'
    if (!form.description.trim()) errs.description = 'Description is required.'
    if (!logo) errs.logo = 'Logo is required.'
    if (selectedTags.length === 0) errs.tags = 'Select at least one tag.'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setServerError('')
    submitMutation.mutate()
  }

  const toggleTag = (tag) => {
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])
  }

  const generateDescription = async () => {
    if (!bulletPoints.trim()) return
    setAiLoading(true)
    setServerError('')
    try {
      // Accept both plain text and bullet points — split by newlines or treat as single point
      const lines = bulletPoints.split('\n').map((b) => b.replace(/^[-*•]\s*/, '').trim()).filter(Boolean)
      const points = lines.length > 0 ? lines : [bulletPoints.trim()]
      const { data } = await axiosInstance.post('/ai/generate-description', { bulletPoints: points })
      setForm((f) => ({ ...f, description: data.description }))
    } catch (err) {
      setServerError(err.response?.data?.message || 'AI service unavailable. Check GEMINI_API_KEY in Render.')
    } finally {
      setAiLoading(false)
    }
  }

  const suggestTags = async () => {
    if (!form.title || !form.description) return
    setTagAiLoading(true)
    try {
      const { data } = await axiosInstance.post('/ai/suggest-tags', { title: form.title, description: form.description })
      setSelectedTags(data.tags)
    } catch {
      // silent fail
    } finally {
      setTagAiLoading(false)
    }
  }

  const inputStyle = { width: '100%', padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', paddingTop: '56px' }}>
      <LeftSidebar />
      <main style={{ flex: 1, padding: '1.5rem 2rem', maxWidth: '700px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>🚀 Submit your project</h1>

        {serverError && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px 14px', color: '#f87171', fontSize: '0.875rem', marginBottom: '1rem' }}>{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          {/* Title */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.4rem' }}>Project name *</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. PromptBase Studio" maxLength={100} style={{ ...inputStyle, borderColor: errors.title ? '#f87171' : 'var(--border)' }} />
            {errors.title && <p style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '0.25rem' }}>{errors.title}</p>}
          </div>

          {/* Tagline */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.4rem' }}>Tagline *</label>
            <input type="text" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} placeholder="One-line description" maxLength={150} style={{ ...inputStyle, borderColor: errors.tagline ? '#f87171' : 'var(--border)' }} />
            {errors.tagline && <p style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '0.25rem' }}>{errors.tagline}</p>}
          </div>

          {/* Description with AI */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Description *</label>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>or generate with AI ↓</span>
            </div>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe your project…" rows={5} maxLength={2000} style={{ ...inputStyle, resize: 'vertical', borderColor: errors.description ? '#f87171' : 'var(--border)' }} />
            {errors.description && <p style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '0.25rem' }}>{errors.description}</p>}

            {/* AI description generator */}
            <div style={{ marginTop: '0.75rem', padding: '0.875rem', background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '8px' }}>
              <p style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>✨ Generate with Gemini AI</p>
              <textarea value={bulletPoints} onChange={(e) => setBulletPoints(e.target.value)} placeholder="Describe your project in a few words or bullet points&#10;e.g. blood donation management system that connects donors with hospitals" rows={4} style={{ ...inputStyle, resize: 'vertical', fontSize: '0.85rem' }} />
              <button type="button" onClick={generateDescription} disabled={aiLoading || !bulletPoints.trim()} style={{ marginTop: '0.5rem', padding: '6px 16px', background: 'var(--accent)', borderRadius: '9999px', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '0.85rem', opacity: aiLoading || !bulletPoints.trim() ? 0.6 : 1 }}>
                {aiLoading ? 'Generating…' : '✨ Generate description'}
              </button>
            </div>
          </div>

          {/* Logo */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.4rem' }}>Logo * (JPEG/PNG, max 5MB)</label>
            <input type="file" accept="image/jpeg,image/png" onChange={(e) => setLogo(e.target.files[0])} style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }} />
            {errors.logo && <p style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '0.25rem' }}>{errors.logo}</p>}
          </div>

          {/* Screenshots */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.4rem' }}>Screenshots (max 5, JPEG/PNG)</label>
            <input type="file" accept="image/jpeg,image/png" multiple onChange={(e) => setScreenshots(Array.from(e.target.files).slice(0, 5))} style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }} />
            {screenshots.length > 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.25rem' }}>{screenshots.length} file(s) selected</p>}
          </div>

          {/* URLs */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.4rem' }}>Live URL</label>
            <input type="url" value={form.liveUrl} onChange={(e) => setForm({ ...form, liveUrl: e.target.value })} placeholder="https://yourproject.com" style={inputStyle} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.4rem' }}>GitHub URL</label>
            <input type="url" value={form.githubUrl} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} placeholder="https://github.com/you/project" style={inputStyle} />
          </div>

          {/* Tags */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Tags * (select at least one)</label>
              <button type="button" onClick={suggestTags} disabled={tagAiLoading || !form.title || !form.description} style={{ padding: '3px 12px', background: 'transparent', border: '1px solid rgba(124,58,237,0.4)', borderRadius: '9999px', color: 'var(--accent)', fontSize: '0.75rem', cursor: 'pointer', opacity: tagAiLoading || !form.title || !form.description ? 0.5 : 1 }}>
                {tagAiLoading ? 'Suggesting…' : '✨ Suggest tags'}
              </button>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {VALID_TAGS.map((tag) => (
                <button key={tag} type="button" onClick={() => toggleTag(tag)} style={{ padding: '5px 14px', borderRadius: '9999px', border: `1px solid ${selectedTags.includes(tag) ? (TAG_COLORS[tag] || 'var(--accent)') : 'var(--border)'}`, background: selectedTags.includes(tag) ? `${TAG_COLORS[tag] || '#7c3aed'}22` : 'transparent', color: selectedTags.includes(tag) ? (TAG_COLORS[tag] || 'var(--accent)') : 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer' }}>
                  {tag}
                </button>
              ))}
            </div>
            {errors.tags && <p style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '0.25rem' }}>{errors.tags}</p>}
          </div>

          <button type="submit" disabled={submitMutation.isPending} style={{ width: '100%', padding: '12px', background: 'var(--accent)', borderRadius: '9999px', color: '#fff', fontWeight: 700, fontSize: '1rem', border: 'none', cursor: 'pointer', opacity: submitMutation.isPending ? 0.7 : 1 }}>
            {submitMutation.isPending ? 'Submitting…' : '🚀 Launch project'}
          </button>
        </form>
      </main>
    </div>
  )
}
