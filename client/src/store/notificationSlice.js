import { createSlice } from '@reduxjs/toolkit'

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    unreadCount: 0,
    items: [],
  },
  reducers: {
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload
    },
    addNotification: (state, action) => {
      state.items.unshift(action.payload)
      state.unreadCount += 1
    },
    markAllRead: (state) => {
      state.unreadCount = 0
      state.items = state.items.map((n) => ({ ...n, isRead: true }))
    },
  },
})

export const { setUnreadCount, addNotification, markAllRead } = notificationSlice.actions
export default notificationSlice.reducer
