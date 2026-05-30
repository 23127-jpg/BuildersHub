import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    theme: localStorage.getItem('theme') || 'dark',
    sidebarOpen: true,
    searchOpen: false,
  },
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload
      localStorage.setItem('theme', action.payload)
      if (action.payload === 'light') {
        document.documentElement.classList.add('light-mode')
      } else {
        document.documentElement.classList.remove('light-mode')
      }
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    toggleSearch: (state) => {
      state.searchOpen = !state.searchOpen
    },
  },
})

export const { setTheme, toggleSidebar, toggleSearch } = uiSlice.actions
export default uiSlice.reducer
