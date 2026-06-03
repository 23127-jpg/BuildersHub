import axios from 'axios'
import store from '../store'
import { setCredentials, clearCredentials } from '../store/authSlice'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
})

// Attach access token to every request
axiosInstance.interceptors.request.use((config) => {
  const { accessToken } = store.getState().auth
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

// On 401 — attempt silent token refresh, then retry
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return axiosInstance(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('refreshToken')

      if (!refreshToken) {
        store.dispatch(clearCredentials())
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken })
        const { accessToken } = data
        const { user } = store.getState().auth
        store.dispatch(setCredentials({ user, accessToken }))
        processQueue(null, accessToken)
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        store.dispatch(clearCredentials())
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

/**
 * Call this once on app startup to restore the access token.
 * If refreshToken exists in localStorage, exchange it for a fresh accessToken.
 */
export const restoreSession = async () => {
  const refreshToken = localStorage.getItem('refreshToken')
  const savedUser = (() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })()

  if (!refreshToken || !savedUser) return

  try {
    const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken })
    store.dispatch(setCredentials({ user: savedUser, accessToken: data.accessToken }))
  } catch {
    // Refresh token expired — clear everything
    store.dispatch(clearCredentials())
  }
}

export default axiosInstance
