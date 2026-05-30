import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import uiReducer from './uiSlice'
import notificationReducer from './notificationSlice'
import dmReducer from './dmSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    notifications: notificationReducer,
    dm: dmReducer,
  },
})

export default store
