import { useMemo } from 'react'
import {
  Paper,
  Title,
  Group,
  Stack,
  Text,
  Box,
  SimpleGrid,
  Card,
  Badge,
  Divider,
  ThemeIcon,
} from '@mantine/core'
import {
  IconClipboardList,
  IconReceipt,
  IconCreditCard,
  IconCircleCheck,
  IconAlertTriangle,
  IconSearchOff,
  IconCalendarEvent,
  IconArrowRight,
} from '@tabler/icons-react'
import { mockTickets, mockUpcomingSchedules } from '../data/autopassMock'
import type { TicketStatus } from '../types/autopass'

interface AutopassDashboardProps {
  onJumpToTickets?: (filterStatus?: TicketStatus) => void
}

const cardShadow =
  '0px 7px 7px -5px rgba(0,0,0,0.04), 0px 10px 15px -5px rgba(0,0,0,0.1), 0px 1px 3px 0px rgba(0,0,0,0.05)'

export function AutopassDashboard({ onJumpToTickets }: AutopassDashboardProps) {
  const stats = useMemo(() => {
    const counts: Record<string, number> = {
      'pending-query': 0,
      'invoicing': 0,
      'paid': 0,
      'invoice-failed': 0,
      'query-failed': 0,
    }
    mockTickets.forEach((t) => {
      counts[t.status] = (counts[t.status] || 0) + 1
    })
    return counts
  }, [])

  const today = new Date()
  const todayLabel = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`

  const heroCards = [
    {
      key: 'pending-query' as TicketStatus,
      label: '待查詢',
      count: stats['pending-query'] ?? 0,
      icon: IconClipboardList,
      color: '#868e96',
      bg: 'rgba(134,142,150,0.12)',
    },
    {
      key: 'invoicing' as TicketStatus,
      label: '待請款',
      count: stats['invoicing'] ?? 0,
      icon: IconReceipt,
      color: '#fab005',
      bg: 'rgba(250,176,5,0.15)',
    },
    {
      key: 'invoice-success' as TicketStatus,
      label: '待繳款',
      count: stats['invoice-success'] ?? 0,
      icon: IconCreditCard,
      color: '#1c7ed6',
      bg: 'rgba(34,139,230,0.12)',
    },
    {
      key: 'paid' as TicketStatus,
      label: '已完成',
      count: stats['paid'] ?? 0,
      icon: IconCircleCheck,
      color: '#0b7c4d',
      bg: 'rgba(18,184,134,0.15)',
    },
  ]

  const stuckCards = [
    {
      key: 'invoice-failed' as TicketStatus,
      label: '請款失敗',
      count: stats['invoice-failed'] ?? 0,
      icon: IconAlertTriangle,
      color: '#fa5252',
    },
    {
      key: 'query-failed' as TicketStatus,
      label: '查詢失敗',
      count: stats['query-failed'] ?? 0,
      icon: IconSearchOff,
      color: '#fa5252',
    },
  ]

  return (
    <Stack gap="20px">
      {/* Page Header */}
      <Paper
        shadow={cardShadow}
        radius="16px"
        p="24px"
        style={{ backgroundColor: '#ffffff' }}
      >
        <Group justify="space-between" align="center">
          <Box>
            <Title
              order={2}
              style={{
                fontSize: '20px',
                lineHeight: '24px',
                fontWeight: 700,
                fontFamily: 'Noto Sans TC, sans-serif',
                color: '#000',
              }}
            >
              通行費自動繳 Dashboard
            </Title>
            <Text mt="6px" size="sm" c="dimmed">
              今天是 {todayLabel}，以下為目前任務狀態總覽
            </Text>
          </Box>
        </Group>
      </Paper>

      {/* Hero Stats */}
      <Paper shadow={cardShadow} radius="16px" p="24px" style={{ backgroundColor: '#ffffff' }}>
        <Group mb="16px" gap="8px">
          <ThemeIcon variant="light" color="blue" size={28} radius="md">
            <IconClipboardList size={16} />
          </ThemeIcon>
          <Title order={4} style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'Noto Sans TC' }}>
            今日重點待辦
          </Title>
        </Group>

        <SimpleGrid cols={{ base: 2, md: 4 }} spacing="16px">
          {heroCards.map((c) => {
            const Icon = c.icon
            return (
              <Card
                key={c.key}
                p="20px"
                radius="12px"
                withBorder
                style={{
                  cursor: 'pointer',
                  border: '1px solid #e9ecef',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
                onClick={() => onJumpToTickets?.(c.key)}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
                  ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0px 6px 14px rgba(0,0,0,0.08)'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLDivElement).style.transform = ''
                  ;(e.currentTarget as HTMLDivElement).style.boxShadow = ''
                }}
              >
                <Group justify="space-between" mb="8px">
                  <Box
                    style={{
                      backgroundColor: c.bg,
                      borderRadius: '8px',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={18} color={c.color} />
                  </Box>
                  <IconArrowRight size={16} color="#adb5bd" />
                </Group>
                <Text size="sm" c="dimmed">
                  {c.label}
                </Text>
                <Text fw={700} style={{ fontSize: '28px', lineHeight: 1.2 }}>
                  {c.count}
                </Text>
              </Card>
            )
          })}
        </SimpleGrid>
      </Paper>

      {/* Stuck Section */}
      <Paper shadow={cardShadow} radius="16px" p="24px" style={{ backgroundColor: '#ffffff' }}>
        <Group mb="16px" gap="8px">
          <ThemeIcon variant="light" color="red" size={28} radius="md">
            <IconAlertTriangle size={16} />
          </ThemeIcon>
          <Title order={4} style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'Noto Sans TC' }}>
            需要關注
          </Title>
          <Text size="xs" c="dimmed">
            （點擊可篩選列表）
          </Text>
        </Group>

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="16px">
          {stuckCards.map((c) => {
            const Icon = c.icon
            return (
              <Card
                key={c.key}
                p="20px"
                radius="12px"
                withBorder
                style={{
                  cursor: 'pointer',
                  border: '1px solid #ffe3e3',
                  backgroundColor: '#fff5f5',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
                onClick={() => onJumpToTickets?.(c.key)}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLDivElement).style.transform = ''
                }}
              >
                <Group justify="space-between">
                  <Group gap="12px">
                    <Box
                      style={{
                        backgroundColor: 'rgba(250,82,82,0.15)',
                        borderRadius: '10px',
                        width: '44px',
                        height: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={22} color={c.color} />
                    </Box>
                    <Box>
                      <Text fw={600} size="sm" c="dark.8">
                        {c.label}
                      </Text>
                      <Text size="xs" c="dimmed">
                        需營運人員介入處理
                      </Text>
                    </Box>
                  </Group>
                  <Group gap="6px">
                    <Text fw={700} style={{ fontSize: '24px', color: c.color }}>
                      {c.count}
                    </Text>
                    <Text size="xs" c="dimmed">
                      筆
                    </Text>
                  </Group>
                </Group>
              </Card>
            )
          })}
        </SimpleGrid>
      </Paper>

      {/* Upcoming Schedules */}
      <Paper shadow={cardShadow} radius="16px" p="24px" style={{ backgroundColor: '#ffffff' }}>
        <Group mb="16px" gap="8px">
          <ThemeIcon variant="light" color="grape" size={28} radius="md">
            <IconCalendarEvent size={16} />
          </ThemeIcon>
          <Title order={4} style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'Noto Sans TC' }}>
            本週服務排程
          </Title>
          <Text size="xs" c="dimmed">
            （純資訊）
          </Text>
        </Group>

        <Stack gap={0}>
          {mockUpcomingSchedules.map((s, idx) => (
            <Box key={s.date}>
              <Group justify="space-between" py="14px" px="4px" wrap="nowrap">
                <Group gap="14px" wrap="nowrap">
                  <Box
                    style={{
                      width: '52px',
                      textAlign: 'center',
                      borderRadius: '8px',
                      backgroundColor: '#f1f3f5',
                      padding: '6px 0',
                    }}
                  >
                    <Text size="xs" c="dimmed" style={{ lineHeight: 1.1 }}>
                      {s.weekday}
                    </Text>
                    <Text fw={700} size="md" style={{ lineHeight: 1.2 }}>
                      {s.date.slice(5).replace('-', '/')}
                    </Text>
                  </Box>
                  <Box>
                    <Group gap="6px" mb={4}>
                      <Badge
                        size="sm"
                        variant="light"
                        styles={{
                          root: {
                            backgroundColor:
                              s.category === '罰單'
                                ? 'rgba(250,176,5,0.15)'
                                : s.category === '通行費'
                                  ? 'rgba(34,139,230,0.12)'
                                  : 'rgba(18,184,134,0.15)',
                            color:
                              s.category === '罰單'
                                ? '#b08000'
                                : s.category === '通行費'
                                  ? '#1971c2'
                                  : '#0b7c4d',
                            border: 'none',
                          },
                        }}
                      >
                        {s.category}
                      </Badge>
                      <Text fw={600} size="sm">
                        {s.serviceLabel}
                      </Text>
                    </Group>
                    <Text size="xs" c="dimmed">
                      {s.produced
                        ? `已產出 ${s.estimatedCount} 筆 Ticket`
                        : `預估 ${s.estimatedCount} 筆 Ticket`}
                    </Text>
                  </Box>
                </Group>
                <Badge
                  variant="light"
                  size="sm"
                  styles={{
                    root: {
                      backgroundColor: s.produced ? 'rgba(18,184,134,0.15)' : 'rgba(134,142,150,0.15)',
                      color: s.produced ? '#0b7c4d' : '#495057',
                      border: 'none',
                    },
                  }}
                >
                  {s.produced ? '已產出' : '尚未產出'}
                </Badge>
              </Group>
              {idx < mockUpcomingSchedules.length - 1 && <Divider />}
            </Box>
          ))}
        </Stack>
      </Paper>
    </Stack>
  )
}
