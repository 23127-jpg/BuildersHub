import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { addNotification, setUnreadCount } from './store/notificationSlice'
import { setUnreadDMCount } from './store/dmSlice'
import { restoreSession } from './services/axiosInstance'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import OAuthCallbackPage from './pages/OAuthCallbackPage'
import FeedPage from './pages/FeedPage'
import ExplorePage from './pages/ExplorePage'
import LaunchBoardPage from './pages/LaunchBoardPage'
import SubmitProjectPage from './pages/SubmitProjectPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import DiscussionsPage from './pages/DiscussionsPage'
import ProfilePage from './pages/ProfilePage'
import NotificationsPage from './pages/NotificationsPage'
import SearchPage from './pages/SearchPage'
import SettingsPage from './pages/SettingsPage'
import BookmarksPage from './pages/BookmarksPage'
import DMPage from './pages/DMPage'
import CollectionsPage from './pages/CollectionsPage'
import LeaderboardPage from './pages/LeaderboardPage'
import EmbedCardPage from './pages/EmbedCardPage'

// Shared
import Navbar from './components/Navbar'

function ProtectedRoute({ children, sessionReady }) {
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated)

  // Wait for session restore before making auth decision
  if (!sessionReady) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading…</div>
      </div>
    )
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />
}

/** Manages Socket.io connection lifecycle tied to auth state */
function SocketManager() {
  const dispatch = useDispatch()
  const { user, isAuthenticated } = useSelector((s) => s.auth)

  useEffect(() => {
    if (!isAuthenticated || !user) return

    const userId = user._id || user.id
    const socket = io(
      import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000',
      { withCredentials: true }
    )

    socket.emit('join', { userId })
    socket.on('notification:new', (n) => dispatch(addNotification(n)))
    socket.on('notification:count', ({ count }) => dispatch(setUnreadCount(count)))
    socket.on('dm:new', () => dispatch(setUnreadDMCount((c) => (typeof c === 'number' ? c + 1 : 1))))

    return () => {
      socket.emit('leave', { userId })
      socket.disconnect()
    }
  }, [isAuthenticated, user?._id])

  return null
}

export default function App() {
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    restoreSession().finally(() => setSessionReady(true))
  }, [])

  const pr = (children) => <ProtectedRoute sessionReady={sessionReady}>{children}</ProtectedRoute>

  return (
    <>
      <SocketManager />
      <Navbar />
      <Routes>
        {/* ── Public ─────────────────────────────────────────── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/callback" element={<OAuthCallbackPage />} />
        <Route path="/embed/projects/:id" element={<EmbedCardPage />} />
        <Route path="/launches" element={<LaunchBoardPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/explore" element={<ExplorePage />} />

        {/* ── Protected ──────────────────────────────────────── */}
        <Route path="/feed" element={pr(<FeedPage />)} />
        <Route path="/submit" element={pr(<SubmitProjectPage />)} />
        <Route path="/discuss" element={pr(<DiscussionsPage />)} />
        <Route path="/profile/:username" element={pr(<ProfilePage />)} />
        <Route path="/notifications" element={pr(<NotificationsPage />)} />
        <Route path="/settings" element={pr(<SettingsPage />)} />
        <Route path="/bookmarks" element={pr(<BookmarksPage />)} />
        <Route path="/messages" element={pr(<DMPage />)} />
        <Route path="/collections" element={pr(<CollectionsPage />)} />

        {/* ── Fallback ───────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
