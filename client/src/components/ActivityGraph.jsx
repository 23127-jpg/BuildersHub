const getColor = (count) => {
  if (!count) return 'var(--border)'
  if (count <= 2) return '#4c1d95'
  if (count <= 5) return '#6d28d9'
  return '#7c3aed'
}

export default function ActivityGraph({ data = [] }) {
  const dataMap = {}
  data.forEach((d) => { dataMap[d.date] = d.count })

  // Build 52 weeks × 7 days grid
  const today = new Date()
  const days = []
  for (let i = 363; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    days.push({ date: key, count: dataMap[key] || 0 })
  }

  const weeks = []
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7))

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
      <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>ACTIVITY</h3>
      <div style={{ display: 'flex', gap: '3px', overflowX: 'auto' }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {week.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.count} post${day.count !== 1 ? 's' : ''}`}
                style={{ width: '11px', height: '11px', borderRadius: '2px', background: getColor(day.count), cursor: 'default', transition: 'opacity 0.15s ease' }}
              />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '0.75rem' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Less</span>
        {[0, 1, 3, 6].map((c) => <div key={c} style={{ width: '11px', height: '11px', borderRadius: '2px', background: getColor(c) }} />)}
        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>More</span>
      </div>
    </div>
  )
}
