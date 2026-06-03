import { createSlice } from '@reduxjs/toolkit'

// Rehydrate user from localStorage on startup
const savedUser = (() => {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
})()

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: savedUser,
    accessToken: null,          // access token stays in memory only (security)
    isAuthenticated: !!savedUser && !!localStorage.getItem('refreshToken'),
  },
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      state.isAuthenticated = true
      // Persist user to localStorage so page refresh keeps auth state
      try {
        localStorage.setItem('user', JSON.stringify(action.payload.user))
      } catch {}
    },
    clearCredentials: (state) => {
      state.user = null
      state.accessToken = null
      state.isAuthenticated = false
      localStorage.removeItem('user')
      localStorage.removeItem('refreshToken')
    },
  },
})

export const { setCredentials, clearCredentials } = authSlice.actions
export default authSlice.reducer
