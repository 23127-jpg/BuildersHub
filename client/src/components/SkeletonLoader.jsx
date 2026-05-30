const shimmer = {
  background: 'linear-gradient(90deg, var(--surface) 25%, rgba(255,255,255,0.05) 50%, var(--surface) 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite',
  borderRadius: '6px',
}

export function PostSkeleton() {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem' }}>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div style={{ ...shimmer, width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ ...shimmer, height: '14px', width: '40%', marginBottom: '6px' }} />
          <div style={{ ...shimmer, height: '12px', width: '25%' }} />
        </div>
      </div>
      <div style={{ ...shimmer, height: '14px', width: '100%', marginBottom: '6px' }} />
      <div style={{ ...shimmer, height: '14px', width: '80%', marginBottom: '6px' }} />
      <div style={{ ...shimmer, height: '14px', width: '60%' }} />
    </div>
  )
}

export function ProjectCardSkeleton() {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ ...shimmer, width: '40px', height: '40px', borderRadius: '8px' }} />
        <div style={{ ...shimmer, width: '60px', height: '32px', borderRadius: '8px' }} />
      </div>
      <div style={{ ...shimmer, height: '16px', width: '60%', marginBottom: '8px' }} />
      <div style={{ ...shimmer, height: '12px', width: '90%', marginBottom: '6px' }} />
      <div style={{ ...shimmer, height: '12px', width: '70%' }} />
    </div>
  )
}

// Inject shimmer keyframes once
if (typeof document !== 'undefined' && !document.getElementById('shimmer-style')) {
  const style = document.createElement('style')
  style.id = 'shimmer-style'
  style.textContent = '@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }'
  document.head.appendChild(style)
}
