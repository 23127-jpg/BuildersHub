import { createSlice } from '@reduxjs/toolkit'

const dmSlice = createSlice({
  name: 'dm',
  initialState: {
    unreadDMCount: 0,
    activeThread: null,
  },
  reducers: {
    setUnreadDMCount: (state, action) => {
      state.unreadDMCount = action.payload
    },
    setActiveThread: (state, action) => {
      state.activeThread = action.payload
    },
  },
})

export const { setUnreadDMCount, setActiveThread } = dmSlice.actions
export default dmSlice.reducer
