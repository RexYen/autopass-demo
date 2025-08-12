export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface NotificationConfig {
  type: NotificationType
  title?: string
  message: string
  autoClose?: boolean | number
}

export interface NotificationContextValue {
  showNotification: (config: NotificationConfig) => void
  showSuccess: (message: string, title?: string) => void
  showError: (message: string, title?: string) => void
  showWarning: (message: string, title?: string) => void
  showInfo: (message: string, title?: string) => void
}