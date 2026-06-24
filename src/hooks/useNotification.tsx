import { useContext } from 'react'
import type { NotificationContextValue } from '../types/notification'
import { NotificationContext } from './notificationContext'

export function useNotification(): NotificationContextValue {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}
