import axios from 'axios'
import store from '../store'
import { setCredentials, clearCredentials } from '../store/authSlice'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
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
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
          { refreshToken }
        )

        const { accessToken } = data
        const { user } = store.getState().auth
        store.dispatch(setCredentials({ user, accessToken }))

        processQueue(null, accessToken)
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        store.dispatch(clearCredentials())
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
