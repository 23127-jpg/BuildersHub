import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setCredentials } from '../store/authSlice'
import axiosInstance from '../services/axiosInstance'

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    const token = searchParams.get('token')
    const refreshToken = searchParams.get('refreshToken')

    if (!token || !refreshToken) {
      navigate('/login?error=oauth_failed')
      return
    }

    // Fetch user profile with the new access token
    axiosInstance
      .get('/users/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => {
        localStorage.setItem('refreshToken', refreshToken)
        dispatch(setCredentials({ user: data, accessToken: token }))
        navigate('/feed')
      })
      .catch(() => {
        navigate('/login?error=oauth_failed')
      })
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--text-muted)' }}>Signing you in…</p>
    </div>
  )
}
