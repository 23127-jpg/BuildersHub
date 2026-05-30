import { createSlice } from '@reduxjs/toolkit'

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    accessToken: null,
    isAuthenticated: false,
  },
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      state.isAuthenticated = true
    },
    clearCredentials: (state) => {
      state.user = null
      state.accessToken = null
      state.isAuthenticated = false
    },
  },
})

export const { setCredentials, clearCredentials } = authSlice.actions
export default authSlice.reducer
