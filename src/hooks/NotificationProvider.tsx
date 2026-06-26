import type { ReactNode } from 'react'
import { notifications } from '@mantine/notifications'
import type { NotificationContextValue, NotificationConfig } from '../types/notification'
import { Notification } from '../components/Notification'
import { NotificationContext } from './notificationContext'

interface NotificationProviderProps {
  children: ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const showNotification = (config: NotificationConfig) => {
    const notificationId = `notification-${Date.now()}`;

    notifications.show({
      id: notificationId,
      message: (
        <Notification
          type={config.type}
          title={config.title}
          message={config.message}
          onClose={() => notifications.hide(notificationId)}
        />
      ),
      autoClose: config.autoClose ?? 3000,
      withBorder: false,
      withCloseButton: false,
      color: 'transparent',
      styles: {
        root: {
          backgroundColor: 'transparent',
          border: 'none',
          padding: 0,
          boxShadow: 'none',
        },
        description: {
          margin: 0,
          padding: 0,
        },
        loader: {
          display: 'none',
        },
        icon: {
          display: 'none',
        },
      },
    })
  }

  const showSuccess = (message: string, title?: string) => {
    showNotification({
      type: 'success',
      title,
      message,
    })
  }

  const showError = (message: string, title?: string) => {
    showNotification({
      type: 'error',
      title,
      message,
    })
  }

  const showWarning = (message: string, title?: string) => {
    showNotification({
      type: 'warning',
      title,
      message,
    })
  }

  const showInfo = (message: string, title?: string) => {
    showNotification({
      type: 'info',
      title,
      message,
    })
  }

  const value: NotificationContextValue = {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}
