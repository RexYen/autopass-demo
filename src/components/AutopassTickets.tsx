import { useMemo, useState, useEffect } from 'react'
import {
  Paper,
  Title,
  Group,
  Text,
  Box,
  TextInput,
  Select,
  Badge,
  ActionIcon,
  Pagination,
  Tabs,
  SimpleGrid,
  Stack,
  Divider,
  Button,
  CopyButton,
  Tooltip,
} from '@mantine/core'
import {
  IconSearch,
  IconArrowRight,
  IconFilter,
  IconUser,
  IconCar,
  IconCreditCard,
  IconCalendar,
  IconBuildingBank,
  IconClock,
  IconRefresh,
  IconCircleDot,
  IconCopy,
  IconCheck,
  IconExternalLink,
} from '@tabler/icons-react'
import { mockTickets } from '../data/autopassMock'
import {
  STATUS_META,
  SERVICE_META,
  type ServiceType,
  type Ticket,
  type TicketStatus,
} from '../types/autopass'
import { maskId, maskDate } from '../utils/mask'

interface AutopassTicketsProps {
  onViewDetail: (ticketId: string) => void
  initialStatusFilter?: TicketStatus
  mode?: 'current' | 'history'
}

// 已結案狀態（歷史任務頁顯示這些）
const TERMINAL_STATUSES: TicketStatus[] = [
  'paid',
  'no-fee',
  'counter-required',
  'unable-to-close',
]

const cardShadow =
  '0px 7px 7px -5px rgba(0,0,0,0.04), 0px 10px 15px -5px rgba(0,0,0,0.1), 0px 1px 3px 0px rgba(0,0,0,0.05)'

const PAGE_SIZE = 6

type TabValue =
  | 'fuel-fee'
  | 'fuel-fee-overdue'
  | 'traffic-fine'
  | 'compulsory-insurance-fine'
  | 'etc-toll'

const TABS: { value: TabValue; label: string; types: ServiceType[] }[] = [
  { value: 'fuel-fee', label: '汽燃費', types: ['fuel-fee-personal', 'fuel-fee-corporate'] },
  { value: 'fuel-fee-overdue', label: '汽燃費逾期罰緩', types: ['fuel-fee-overdue'] },
  {
    value: 'traffic-fine',
    label: '交通罰緩',
    types: ['traffic-fine-personal', 'traffic-fine-corporate'],
  },
  {
    value: 'compulsory-insurance-fine',
    label: '違反強制險罰緩',
    types: ['compulsory-insurance-fine'],
  },
  { value: 'etc-toll', label: 'ETC 通行費', types: ['etc-toll'] },
]

const TAB_TYPES: Record<TabValue, ServiceType[]> = TABS.reduce(
  (acc, t) => ({ ...acc, [t.value]: t.types }),
  {} as Record<TabValue, ServiceType[]>,
)

export function AutopassTickets({
  onViewDetail,
  initialStatusFilter,
  mode = 'current',
}: AutopassTicketsProps) {
  const isHistory = mode === 'history'
  const [activeTab, setActiveTab] = useState<TabValue>('fuel-fee')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(
    initialStatusFilter ?? null,
  )
  const [page, setPage] = useState(1)

  // 當外部傳入新的 initialStatusFilter（例：從 Dashboard 跳過來），同步進來
  useEffect(() => {
    if (initialStatusFilter) {
      setStatusFilter(initialStatusFilter)
      setPage(1)
    }
  }, [initialStatusFilter])

  // 先依 mode 篩選（current 排除已結案 / history 只看已結案）
  const modeFiltered = useMemo(() => {
    return mockTickets.filter((t) => {
      const isTerminal = TERMINAL_STATUSES.includes(t.status)
      return isHistory ? isTerminal : !isTerminal
    })
  }, [isHistory])

  // 再依 tab 切服務類型（個人/法人 合併）
  const tabFiltered = useMemo(() => {
    const allowed = TAB_TYPES[activeTab]
    return modeFiltered.filter((t) => allowed.includes(t.serviceType))
  }, [modeFiltered, activeTab])

  const statusOptions = useMemo(
    () =>
      Object.entries(STATUS_META)
        .filter(([k]) => {
          const isTerminal = TERMINAL_STATUSES.includes(k as TicketStatus)
          return isHistory ? isTerminal : !isTerminal
        })
        .map(([k, v]) => ({ value: k, label: v.label })),
    [isHistory],
  )

  const counts = useMemo(() => {
    const c = TABS.reduce(
      (acc, t) => ({ ...acc, [t.value]: 0 }),
      {} as Record<TabValue, number>,
    )
    modeFiltered.forEach((t) => {
      const tab = TABS.find((tab) => tab.types.includes(t.serviceType))
      if (tab) c[tab.value] += 1
    })
    return c
  }, [modeFiltered])

  const handleTabChange = (next: TabValue) => {
    setActiveTab(next)
    setPage(1)
  }

  const filtered = useMemo(() => {
    const kw = search.trim().toLowerCase()
    return tabFiltered.filter((t) => {
      if (statusFilter && t.status !== statusFilter) return false
      if (!kw) return true
      return (
        t.id.toLowerCase().includes(kw) ||
        t.userName.toLowerCase().includes(kw) ||
        t.plateNumber.toLowerCase().includes(kw) ||
        t.userId.toLowerCase().includes(kw)
      )
    })
  }, [tabFiltered, search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleResetFilters = () => {
    setSearch('')
    setStatusFilter(null)
    setPage(1)
  }

  return (
    <Paper
      shadow={cardShadow}
      radius="16px"
      style={{
        backgroundColor: '#ffffff',
        minHeight: '760px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Group justify="space-between" px="24px" py="20px">
        <Box>
          <Title
            order={2}
            style={{
              fontSize: '20px',
              fontWeight: 700,
              fontFamily: 'Noto Sans TC, sans-serif',
              color: '#000',
              lineHeight: '24px',
            }}
          >
            {isHistory ? '歷史任務' : '查繳任務'}
          </Title>
          <Text size="sm" c="dimmed" mt="4px">
            {isHistory ? `已結案 ${filtered.length} 筆` : `共 ${filtered.length} 筆任務`}
          </Text>
        </Box>
      </Group>

      {/* Tabs */}
      <Box px="24px">
        <Tabs
          value={activeTab}
          onChange={(v) => v && handleTabChange(v as TabValue)}
          styles={{
            list: {
              borderBottom: '1px solid #e9ecef',
            },
            tab: {
              fontSize: 14,
              fontWeight: 500,
              fontFamily: 'Noto Sans TC, sans-serif',
              padding: '12px 16px',
            },
          }}
        >
          <Tabs.List>
            {TABS.map((tab) => (
              <Tabs.Tab key={tab.value} value={tab.value}>
                {tab.label}
                <Text component="span" size="xs" c="dimmed" ml="6px">
                  {counts[tab.value]}
                </Text>
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs>
      </Box>

      {/* Filters */}
      <Box px="24px" pt="16px" pb="16px">
        <Group gap="12px" align="flex-end" wrap="wrap">
          <TextInput
            placeholder="搜尋車牌、用戶或 Ticket ID"
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => {
              setSearch(e.currentTarget.value)
              setPage(1)
            }}
            style={{ flex: 1, minWidth: 240 }}
            styles={{
              input: {
                borderRadius: 4,
                height: 40,
                fontSize: 14,
              },
            }}
          />
          <Select
            placeholder="所有狀態"
            data={statusOptions}
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter(v)
              setPage(1)
            }}
            clearable
            leftSection={<IconFilter size={14} />}
            style={{ width: 160 }}
            styles={{ input: { height: 40 } }}
          />
          {(statusFilter || search) && (
            <Text
              size="sm"
              c="blue"
              style={{ cursor: 'pointer', height: 40, display: 'flex', alignItems: 'center' }}
              onClick={handleResetFilters}
            >
              清除全部
            </Text>
          )}
        </Group>
      </Box>

      {/* Cards */}
      <Box px="24px" pb="16px" style={{ flex: 1 }}>
        {pageData.length === 0 ? (
          <Box py="80px" style={{ textAlign: 'center' }}>
            <Text c="dimmed">沒有符合條件的任務</Text>
          </Box>
        ) : (
          <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }} spacing="20px">
            {pageData.map((t: Ticket) => (
              <TicketCard key={t.id} ticket={t} onViewDetail={onViewDetail} />
            ))}
          </SimpleGrid>
        )}
      </Box>

      {/* Pagination */}
      {totalPages > 1 && (
        <Group justify="space-between" px="24px" py="16px" style={{ borderTop: '1px solid #f1f3f5' }}>
          <Text size="sm" c="dimmed">
            顯示第 {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, filtered.length)} 筆，共 {filtered.length} 筆
          </Text>
          <Pagination total={totalPages} value={page} onChange={setPage} size="sm" />
        </Group>
      )}
    </Paper>
  )
}

function TicketCard({
  ticket,
  onViewDetail,
}: {
  ticket: Ticket
  onViewDetail: (id: string) => void
}) {
  const statusMeta = STATUS_META[ticket.status]
  const serviceMeta = SERVICE_META[ticket.serviceType]
  const idLabel = ticket.driverInfo.ownerType === '法人' ? '統一編號' : '身分證'

  return (
    <Paper
      shadow="0px 1px 3px 0px rgba(0,0,0,0.05), 0px 1px 2px 0px rgba(0,0,0,0.06)"
      radius="12px"
      p="20px"
      style={{
        backgroundColor: '#fff',
        border: '1px solid #f1f3f5',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box style={{ flex: 1 }}>
        <Text size="sm" fw={600} mb="md" truncate>
          {serviceMeta.label}
        </Text>

        <Stack gap="sm">
          <CardRow icon={<IconCircleDot size={14} />} label="狀態">
          <Badge
            variant="light"
            size="sm"
            styles={{
              root: {
                backgroundColor: statusMeta.bg,
                color: statusMeta.color,
                border: 'none',
                fontWeight: 500,
              },
            }}
          >
            {statusMeta.label}
          </Badge>
        </CardRow>

        <CardRow icon={<IconUser size={14} />} label="用戶">
          <Text size="sm" fw={500}>
            {ticket.userName}
          </Text>
        </CardRow>

        <CardRow icon={<IconCar size={14} />} label="車牌">
          <CardCopyValue raw={ticket.plateNumber} display={ticket.plateNumber} />
        </CardRow>

        <CardRow icon={<IconCreditCard size={14} />} label={idLabel}>
          <CardCopyValue
            raw={ticket.driverInfo.idNumber}
            display={maskId(ticket.driverInfo.idNumber)}
          />
        </CardRow>

        <CardRow icon={<IconCalendar size={14} />} label="出生年月日">
          <CardCopyValue
            raw={ticket.driverInfo.birthDate ?? ''}
            display={ticket.driverInfo.birthDate ? maskDate(ticket.driverInfo.birthDate) : '—'}
          />
        </CardRow>

        <CardRow icon={<IconCar size={14} />} label="車種">
          <Text size="sm" fw={500}>
            {ticket.driverInfo.vehicleType}
          </Text>
        </CardRow>

        <CardRow icon={<IconBuildingBank size={14} />} label="查繳平台">
          <Group gap="4px" wrap="nowrap" justify="flex-end">
            <Text
              component="a"
              href={serviceMeta.platformUrl}
              target="_blank"
              rel="noopener noreferrer"
              size="sm"
              fw={500}
              c="blue"
              style={{ textDecoration: 'none' }}
              onClick={(e) => e.stopPropagation()}
            >
              {serviceMeta.platform}
            </Text>
            <IconExternalLink size={12} color="#228be6" />
          </Group>
        </CardRow>
      </Stack>

      <Divider my="md" />

      <Stack gap="xs">
        <CardRow icon={<IconClock size={14} />} label="建立時間">
          <Text size="xs" c="dimmed">
            {ticket.createdAt}
          </Text>
        </CardRow>
        <CardRow icon={<IconRefresh size={14} />} label="最後更新">
          <Text size="xs" c="dimmed">
            {ticket.updatedAt}
          </Text>
        </CardRow>
      </Stack>

      </Box>

      <Button
        mt="lg"
        variant="light"
        rightSection={<IconArrowRight size={16} />}
        onClick={() => onViewDetail(ticket.id)}
      >
        查看詳情
      </Button>
    </Paper>
  )
}

function CardRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <Group justify="space-between" wrap="nowrap" align="flex-start" gap="md">
      <Group gap="6px" wrap="nowrap" style={{ flexShrink: 0 }}>
        <Box style={{ color: '#868e96', display: 'flex' }}>{icon}</Box>
        <Text size="sm" c="dimmed">
          {label}
        </Text>
      </Group>
      <Box style={{ minWidth: 0, flexShrink: 1, textAlign: 'right' }}>{children}</Box>
    </Group>
  )
}

function CardCopyValue({ raw, display }: { raw: string; display: string }) {
  return (
    <Group gap="4px" wrap="nowrap" justify="flex-end">
      <Text size="sm" fw={500} truncate>
        {display || '—'}
      </Text>
      {raw && (
        <CopyButton value={raw} timeout={1500}>
          {({ copied, copy }) => (
            <Tooltip label={copied ? '已複製' : '複製完整值'} withArrow>
              <ActionIcon
                variant="subtle"
                size="sm"
                color={copied ? 'teal' : 'gray'}
                onClick={copy}
              >
                {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
              </ActionIcon>
            </Tooltip>
          )}
        </CopyButton>
      )}
    </Group>
  )
}
