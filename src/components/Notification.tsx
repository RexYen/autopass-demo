import { Box, Group, Text } from '@mantine/core'

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="M2.66634 8.33325L6.83301 11.3333L13.3333 3.33325" 
      stroke="#ffffff" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
)

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="M12.4697 3.53033C12.7626 3.23744 12.7626 2.76256 12.4697 2.46967C12.1768 2.17678 11.7019 2.17678 11.409 2.46967L8 5.87868L4.59099 2.46967C4.2981 2.17678 3.82322 2.17678 3.53033 2.46967C3.23744 2.76256 3.23744 3.23744 3.53033 3.53033L6.93934 6.93934L3.53033 10.3483C3.23744 10.6412 3.23744 11.1161 3.53033 11.409C3.82322 11.7019 4.2981 11.7019 4.59099 11.409L8 8L11.409 11.409C11.7019 11.7019 12.1768 11.7019 12.4697 11.409C12.7626 11.1161 12.7626 10.6412 12.4697 10.3483L9.06066 6.93934L12.4697 3.53033Z" 
      fill="#868E96"
    />
  </svg>
)

interface NotificationProps {
  title?: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  onClose?: () => void
}

export function Notification({ title, message, type, onClose }: NotificationProps) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <Box
            style={{
              width: '24px',
              height: '24px',
              backgroundColor: '#12B886',
              borderRadius: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
            }}
          >
            <CheckIcon />
          </Box>
        )
      default:
        return (
          <Box
            style={{
              width: '24px',
              height: '24px',
              backgroundColor: '#12B886',
              borderRadius: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
            }}
          >
            <CheckIcon />
          </Box>
        )
    }
  }

  return (
    <Box
      style={{
        width: '372px',
        padding: '12px',
        background: '#ffffff',
        borderRadius: '4px',
        border: '1px solid #dee2e6',
        boxShadow: '0px 7px 7px -5px rgba(0,0,0,0.04), 0px 10px 15px -5px rgba(0,0,0,0.1), 0px 1px 3px 0px rgba(0,0,0,0.05)',
      }}
    >
      <Group justify="space-between" gap="12px" wrap="nowrap">
        <Group gap="12px" style={{ flex: 1 }} wrap="nowrap">
          {getIcon()}
          <Box style={{ flex: 1, paddingRight: '8px' }}>
            {title && (
              <Text
                style={{
                  color: '#000000',
                  fontSize: '14px',
                  fontFamily: 'Noto Sans TC',
                  fontWeight: 400,
                  lineHeight: '20px',
                  marginBottom: '2px',
                }}
              >
                {title}
              </Text>
            )}
            <Text
              style={{
                color: '#868e96',
                fontSize: '14px',
                fontFamily: 'Noto Sans TC',
                fontWeight: 400,
                lineHeight: '20px',
              }}
            >
              {message}
            </Text>
          </Box>
        </Group>
        <Box
          onClick={onClose}
          style={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '16px',
            height: '16px',
            flexShrink: 0,
          }}
        >
          <CloseIcon />
        </Box>
      </Group>
    </Box>
  )
}