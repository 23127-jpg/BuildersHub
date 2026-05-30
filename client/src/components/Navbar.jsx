import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { clearCredentials } from '../store/authSlice'
import { setTheme } from '../store/uiSlice'
import axiosInstance from '../services/axiosInstance'

export default function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useSelector((s) => s.auth)
  const { theme } = useSelector((s) => s.ui)
  const unreadCount = useSelector((s) => s.notifications.unreadCount)
  const unreadDMs = useSelector((s) => s.dm.unreadDMCount)

  const handleLogout = async () => {
    try { await axiosInstance.post('/auth/logout') } catch {}
    localStorage.removeItem('refreshToken')
    dispatch(clearCredentials())
    navigate('/login')
  }

  const toggleTheme = () => dispatch(setTheme(theme === 'dark' ? 'light' : 'dark'))

  return (
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, borderBottom: '1px solid var(--border)', background: 'rgba(13,13,13,0.92)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 1.5rem', height: '56px' }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', marginRight: '0.5rem' }}>
        <div style={{ width: '28px', height: '28px', background: 'var(--accent)', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>B</div>
        <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>BuildersHub</span>
      </Link>

      {['Feed', 'Launches', 'Discuss', 'Explore'].map((item) => (
        <Link key={item} to={`/${item.toLowerCase()}`} style={{ padding: '5px 14px', border: '1px solid var(--border)', borderRadius: '9999px', color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>
          {item}
        </Link>
      ))}

      <div style={{ flex: 1 }} />

      {/* Search */}
      <Link to="/search" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 14px', border: '1px solid var(--border)', borderRadius: '9999px', color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>
        🔍 Search <kbd style={{ fontSize: '0.7rem', padding: '1px 5px', border: '1px solid var(--border)', borderRadius: '4px' }}>⌘K</kbd>
      </Link>

      {/* Theme toggle */}
      <button onClick={toggleTheme} style={{ padding: '5px 10px', border: '1px solid var(--border)', borderRadius: '9999px', color: 'var(--text-muted)', fontSize: '1rem', background: 'none', cursor: 'pointer' }}>
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      {isAuthenticated ? (
        <>
          {/* DM badge */}
          <Link to="/messages" style={{ position: 'relative', padding: '5px 10px', border: '1px solid var(--border)', borderRadius: '9999px', color: 'var(--text-muted)', fontSize: '1rem', textDecoration: 'none' }}>
            ✉️
            {unreadDMs > 0 && <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'var(--accent)', color: '#fff', borderRadius: '50%', width: '16px', height: '16px', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unreadDMs}</span>}
          </Link>

          {/* Notification bell */}
          <Link to="/notifications" style={{ position: 'relative', padding: '5px 10px', border: '1px solid var(--border)', borderRadius: '9999px', color: 'var(--text-muted)', fontSize: '1rem', textDecoration: 'none' }}>
            🔔
            {unreadCount > 0 && <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: '#fff', borderRadius: '50%', width: '16px', height: '16px', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </Link>

          {/* Avatar */}
          <Link to={`/profile/${user?.username}`} style={{ textDecoration: 'none' }}>
            {user?.avatar ? <img src={user.avatar} alt="" style={{ width: '30px', height: '30px', borderRadius: '50%', border: '2px solid var(--accent)' }} /> : <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>{user?.name?.[0]}</div>}
          </Link>

          <button onClick={handleLogout} style={{ padding: '5px 14px', border: '1px solid var(--border)', borderRadius: '9999px', color: 'var(--text-muted)', fontSize: '0.85rem', background: 'none', cursor: 'pointer' }}>
            Sign out
          </button>
        </>
      ) : (
        <>
          <Link to="/login" style={{ padding: '5px 14px', border: '1px solid var(--border)', borderRadius: '9999px', color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>Sign in</Link>
          <Link to="/register" style={{ padding: '5px 16px', background: 'var(--accent)', borderRadius: '9999px', color: '#fff', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>Sign up</Link>
        </>
      )}
    </nav>
  )
}
