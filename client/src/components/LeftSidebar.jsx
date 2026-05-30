import { NavLink, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'

const NAV_ITEMS = [
  { to: '/feed', icon: '📰', label: 'Feed' },
  { to: '/launches', icon: '🚀', label: 'Launches' },
  { to: '/explore', icon: '🔭', label: 'Explore' },
  { to: '/discuss', icon: '💬', label: 'Discuss' },
  { to: '/search', icon: '🔍', label: 'Search' },
]

const MY_STUFF = [
  { to: '/profile', icon: '👤', label: 'Profile' },
  { to: '/projects', icon: '📦', label: 'Projects' },
  { to: '/settings', icon: '⚙️', label: 'Settings' },
]

export default function LeftSidebar() {
  const { user } = useSelector((s) => s.auth)
  const unreadCount = useSelector((s) => s.notifications.unreadCount)

  const linkStyle = (isActive) => ({
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '8px 12px', borderRadius: '8px',
    color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
    background: isActive ? 'rgba(124,58,237,0.12)' : 'transparent',
    textDecoration: 'none', fontSize: '0.9rem', fontWeight: isActive ? 600 : 400,
    transition: 'all 0.15s ease',
  })

  return (
    <aside style={{ width: '220px', flexShrink: 0, position: 'sticky', top: '56px', height: 'calc(100vh - 56px)', overflowY: 'auto', padding: '1.25rem 0.75rem', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', padding: '0 12px', marginBottom: '0.25rem' }}>MENU</p>

      {NAV_ITEMS.map((item) => (
        <NavLink key={item.to} to={item.to} style={({ isActive }) => linkStyle(isActive)}>
          <span>{item.icon}</span>
          <span>{item.label}</span>
          {item.to === '/notifications' && unreadCount > 0 && (
            <span style={{ marginLeft: 'auto', background: '#ef4444', color: '#fff', borderRadius: '9999px', padding: '1px 7px', fontSize: '0.7rem', fontWeight: 700 }}>{unreadCount}</span>
          )}
        </NavLink>
      ))}

      <NavLink to="/notifications" style={({ isActive }) => linkStyle(isActive)}>
        <span>🔔</span>
        <span>Notifications</span>
        {unreadCount > 0 && <span style={{ marginLeft: 'auto', background: '#ef4444', color: '#fff', borderRadius: '9999px', padding: '1px 7px', fontSize: '0.7rem', fontWeight: 700 }}>{unreadCount}</span>}
      </NavLink>

      <div style={{ height: '1px', background: 'var(--border)', margin: '0.75rem 0' }} />

      <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', padding: '0 12px', marginBottom: '0.25rem' }}>MY STUFF</p>

      {MY_STUFF.map((item) => (
        <NavLink key={item.to} to={item.to === '/profile' ? `/profile/${user?.username}` : item.to} style={({ isActive }) => linkStyle(isActive)}>
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}

      <div style={{ flex: 1 }} />

      {user && (
        <Link to={`/profile/${user.username}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', background: 'var(--surface)', border: '1px solid var(--border)', textDecoration: 'none', marginTop: '0.5rem' }}>
          {user.avatar ? <img src={user.avatar} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%' }} /> : <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>{user.name?.[0]}</div>}
          <div>
            <div style={{ color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 600 }}>{user.name}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>@{user.username}</div>
          </div>
        </Link>
      )}
    </aside>
  )
}
