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
  Menu,
  Modal,
  Radio,
  NumberInput,
  FileButton,
  Image,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
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
  IconDots,
  IconClipboardCheck,
  IconCash,
  IconNote,
  IconMail,
  IconBan,
  IconAlertTriangle,
  IconUpload,
  IconPhoto,
  IconPhotoPlus,
  IconTrash,
  IconEye,
} from '@tabler/icons-react'
import { mockTickets } from '../data/autopassMock'
import {
  STATUS_META,
  SERVICE_META,
  SERVICE_QUERY_FIELDS,
  type ServiceType,
  type Ticket,
  type TicketNote,
  type TicketStatus,
} from '../types/autopass'
import { maskDate } from '../utils/mask'
import { AutopassTicketDetail } from './AutopassTicketDetail'

interface AutopassTicketsProps {
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
  { value: 'etc-toll', label: 'ETC 通行費', types: ['etc-toll'] },
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
]

const TAB_TYPES: Record<TabValue, ServiceType[]> = TABS.reduce(
  (acc, t) => ({ ...acc, [t.value]: t.types }),
  {} as Record<TabValue, ServiceType[]>,
)

export function AutopassTickets({
  initialStatusFilter,
  mode = 'current',
}: AutopassTicketsProps) {
  const isHistory = mode === 'history'
  const [activeTab, setActiveTab] = useState<TabValue>('etc-toll')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(
    initialStatusFilter ?? null,
  )
  const [page, setPage] = useState(1)

  // demo 用 — 點 Modal 送出後本地端覆寫對應欄位，讓卡片狀態跟著流程走
  const [statusOverrides, setStatusOverrides] = useState<
    Record<string, Partial<Pick<Ticket, 'status' | 'amount' | 'counterAmount'>>>
  >({})
  const [queryModalTicketId, setQueryModalTicketId] = useState<string | null>(null)
  const [confirmPaidTicketId, setConfirmPaidTicketId] = useState<string | null>(null)
  const [resendNotifyTicketId, setResendNotifyTicketId] = useState<string | null>(null)
  const [retryInvoiceTicketId, setRetryInvoiceTicketId] = useState<string | null>(null)
  const [unableToCloseTicketId, setUnableToCloseTicketId] = useState<string | null>(null)
  const [detailTicketId, setDetailTicketId] = useState<string | null>(null)
  const [noteOverrides, setNoteOverrides] = useState<Record<string, TicketNote[]>>({})
  const [proofOverrides, setProofOverrides] = useState<Record<string, string[]>>({})

  // 當外部傳入新的 initialStatusFilter（例：從 Dashboard 跳過來），同步進來
  useEffect(() => {
    if (initialStatusFilter) {
      setStatusFilter(initialStatusFilter)
      setPage(1)
    }
  }, [initialStatusFilter])

  // 套用 demo 覆寫（狀態 + 加備註 + 繳費證明）
  const tickets = useMemo(
    () =>
      mockTickets.map((t) => {
        const status = statusOverrides[t.id]
        const extraNotes = noteOverrides[t.id]
        const extraProofs = proofOverrides[t.id]
        let merged: Ticket = status ? { ...t, ...status } : t
        if (extraNotes && extraNotes.length > 0) {
          merged = { ...merged, notes: [...extraNotes, ...merged.notes] }
        }
        if (extraProofs && extraProofs.length > 0) {
          merged = {
            ...merged,
            paymentProofs: [...(merged.paymentProofs ?? []), ...extraProofs],
          }
        }
        return merged
      }),
    [statusOverrides, noteOverrides, proofOverrides],
  )

  const queryModalTicket = useMemo(
    () => (queryModalTicketId ? tickets.find((t) => t.id === queryModalTicketId) ?? null : null),
    [queryModalTicketId, tickets],
  )

  const confirmPaidTicket = useMemo(
    () => (confirmPaidTicketId ? tickets.find((t) => t.id === confirmPaidTicketId) ?? null : null),
    [confirmPaidTicketId, tickets],
  )

  const resendNotifyTicket = useMemo(
    () => (resendNotifyTicketId ? tickets.find((t) => t.id === resendNotifyTicketId) ?? null : null),
    [resendNotifyTicketId, tickets],
  )

  const retryInvoiceTicket = useMemo(
    () => (retryInvoiceTicketId ? tickets.find((t) => t.id === retryInvoiceTicketId) ?? null : null),
    [retryInvoiceTicketId, tickets],
  )

  const unableToCloseTicket = useMemo(
    () =>
      unableToCloseTicketId ? tickets.find((t) => t.id === unableToCloseTicketId) ?? null : null,
    [unableToCloseTicketId, tickets],
  )

  const handleQueryModalOpen = (ticketId: string) => setQueryModalTicketId(ticketId)
  const handleQueryModalClose = () => setQueryModalTicketId(null)
  const handleQueryResultSubmit = (
    result: Partial<Pick<Ticket, 'status' | 'amount' | 'counterAmount'>>,
  ) => {
    if (!queryModalTicketId) return
    setStatusOverrides((prev) => ({
      ...prev,
      [queryModalTicketId]: result,
    }))
    setQueryModalTicketId(null)
  }

  const handleOpenConfirmPaidModal = (ticketId: string) => setConfirmPaidTicketId(ticketId)
  const handleConfirmPaidClose = () => setConfirmPaidTicketId(null)
  const handleConfirmPaidSubmit = (proofs: string[]) => {
    if (!confirmPaidTicketId) return
    setStatusOverrides((prev) => ({
      ...prev,
      [confirmPaidTicketId]: { ...prev[confirmPaidTicketId], status: 'paid' },
    }))
    setProofOverrides((prev) => ({
      ...prev,
      [confirmPaidTicketId]: [...(prev[confirmPaidTicketId] ?? []), ...proofs],
    }))
    notifications.show({
      title: '已確認代繳完成',
      message: `${confirmPaidTicketId} 已結案，已存入 ${proofs.length} 張繳費證明`,
      color: 'teal',
    })
    setConfirmPaidTicketId(null)
  }

  const handleOpenRetryInvoiceModal = (ticketId: string) => setRetryInvoiceTicketId(ticketId)
  const handleRetryInvoiceClose = () => setRetryInvoiceTicketId(null)
  const handleRetryInvoiceConfirm = () => {
    if (!retryInvoiceTicketId) return
    // demo：模擬同步請款成功
    setStatusOverrides((prev) => ({
      ...prev,
      [retryInvoiceTicketId]: { ...prev[retryInvoiceTicketId], status: 'invoice-success' },
    }))
    notifications.show({
      title: '重試請款成功',
      message: '已向用戶重新請款，待代繳',
      color: 'teal',
    })
    setRetryInvoiceTicketId(null)
  }

  const handleOpenResendNotifyModal = (ticketId: string) => setResendNotifyTicketId(ticketId)
  const handleResendNotifyClose = () => setResendNotifyTicketId(null)
  const handleResendNotifyConfirm = () => {
    if (!resendNotifyTicketId) return
    notifications.show({
      title: '已補寄通知信',
      message: `${resendNotifyTicketId} 已寄出「請更新車籍資料」通知信`,
      color: 'blue',
    })
    setResendNotifyTicketId(null)
  }

  const handleOpenDetail = (ticketId: string) => setDetailTicketId(ticketId)
  const handleCloseDetail = () => setDetailTicketId(null)

  const handleAddNote = (ticketId: string, content: string) => {
    const now = new Date()
    const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    setNoteOverrides((prev) => ({
      ...prev,
      [ticketId]: [
        {
          id: `N-${Date.now()}`,
          author: 'Rex',
          content,
          createdAt: stamp,
        },
        ...(prev[ticketId] ?? []),
      ],
    }))
    notifications.show({
      title: '已新增備註',
      message: ticketId,
      color: 'teal',
    })
  }

  const handleOpenUnableToCloseModal = (ticketId: string) => setUnableToCloseTicketId(ticketId)
  const handleUnableToCloseClose = () => setUnableToCloseTicketId(null)
  const handleUnableToCloseConfirm = () => {
    if (!unableToCloseTicketId) return
    setStatusOverrides((prev) => ({
      ...prev,
      [unableToCloseTicketId]: { ...prev[unableToCloseTicketId], status: 'unable-to-close' },
    }))
    notifications.show({
      title: '已標記為無法結單',
      message: `${unableToCloseTicketId} 已移至歷史任務`,
      color: 'red',
    })
    setUnableToCloseTicketId(null)
  }

  // 先依 mode 篩選（current 排除已結案 / history 只看已結案）
  const modeFiltered = useMemo(() => {
    return tickets.filter((t) => {
      const isTerminal = TERMINAL_STATUSES.includes(t.status)
      return isHistory ? isTerminal : !isTerminal
    })
  }, [isHistory, tickets])

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

  // Detail drawer：依 filtered 計算 prev/next，同步翻頁
  const detailIndex = detailTicketId
    ? filtered.findIndex((t) => t.id === detailTicketId)
    : -1
  const detailTicket = detailIndex >= 0 ? filtered[detailIndex] : null
  const hasPrev = detailIndex > 0
  const hasNext = detailIndex >= 0 && detailIndex < filtered.length - 1
  const goToTicket = (idx: number) => {
    if (idx < 0 || idx >= filtered.length) return
    const next = filtered[idx]
    setDetailTicketId(next.id)
    const targetPage = Math.floor(idx / PAGE_SIZE) + 1
    if (targetPage !== page) setPage(targetPage)
  }
  const handleDetailPrev = hasPrev ? () => goToTicket(detailIndex - 1) : undefined
  const handleDetailNext = hasNext ? () => goToTicket(detailIndex + 1) : undefined

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
              <TicketCard
                key={t.id}
                ticket={t}
                onViewDetail={handleOpenDetail}
                onOpenQueryModal={handleQueryModalOpen}
                onConfirmPaid={handleOpenConfirmPaidModal}
                onRetryInvoice={handleOpenRetryInvoiceModal}
                onResendNotify={handleOpenResendNotifyModal}
                onMarkUnableToClose={handleOpenUnableToCloseModal}
              />
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

      <QueryResultModal
        ticket={queryModalTicket}
        opened={!!queryModalTicket}
        onClose={handleQueryModalClose}
        onSubmit={handleQueryResultSubmit}
      />

      <ConfirmPaidModal
        ticket={confirmPaidTicket}
        opened={!!confirmPaidTicket}
        onClose={handleConfirmPaidClose}
        onConfirm={handleConfirmPaidSubmit}
      />

      <ResendNotifyModal
        ticket={resendNotifyTicket}
        opened={!!resendNotifyTicket}
        onClose={handleResendNotifyClose}
        onConfirm={handleResendNotifyConfirm}
      />

      <RetryInvoiceModal
        ticket={retryInvoiceTicket}
        opened={!!retryInvoiceTicket}
        onClose={handleRetryInvoiceClose}
        onConfirm={handleRetryInvoiceConfirm}
      />

      <UnableToCloseModal
        ticket={unableToCloseTicket}
        opened={!!unableToCloseTicket}
        onClose={handleUnableToCloseClose}
        onConfirm={handleUnableToCloseConfirm}
      />

      <AutopassTicketDetail
        ticket={detailTicket}
        opened={!!detailTicket}
        onClose={handleCloseDetail}
        onPrev={handleDetailPrev}
        onNext={handleDetailNext}
        position={
          detailIndex >= 0
            ? { current: detailIndex + 1, total: filtered.length }
            : undefined
        }
        onAddNote={handleAddNote}
      />
    </Paper>
  )
}

function TicketCard({
  ticket,
  onViewDetail,
  onOpenQueryModal,
  onConfirmPaid,
  onRetryInvoice,
  onResendNotify,
  onMarkUnableToClose,
}: {
  ticket: Ticket
  onViewDetail: (id: string) => void
  onOpenQueryModal: (id: string) => void
  onConfirmPaid: (id: string) => void
  onRetryInvoice: (id: string) => void
  onResendNotify: (id: string) => void
  onMarkUnableToClose: (id: string) => void
}) {
  const statusMeta = STATUS_META[ticket.status]
  const serviceMeta = SERVICE_META[ticket.serviceType]
  const queryFields = SERVICE_QUERY_FIELDS[ticket.serviceType]
  const idLabel = ticket.driverInfo.ownerType === '法人' ? '法人統一編號' : '身分證字號'

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

        {queryFields.includes('plateNumber') && (
          <CardRow icon={<IconCar size={14} />} label="車牌">
            <CardCopyValue raw={ticket.plateNumber} display={ticket.plateNumber} />
          </CardRow>
        )}

        {queryFields.includes('idNumber') && (
          <CardRow icon={<IconCreditCard size={14} />} label={idLabel}>
            <CardCopyValue
              raw={ticket.driverInfo.idNumber}
              display={ticket.driverInfo.idNumber}
            />
          </CardRow>
        )}

        {queryFields.includes('birthDate') && ticket.driverInfo.birthDate && (
          <CardRow icon={<IconCalendar size={14} />} label="出生年月日">
            <CardCopyValue
              raw={ticket.driverInfo.birthDate}
              display={maskDate(ticket.driverInfo.birthDate)}
            />
          </CardRow>
        )}

        {queryFields.includes('vehicleType') && (
          <CardRow icon={<IconCar size={14} />} label="車種">
            <Text size="sm" fw={500}>
              {ticket.driverInfo.vehicleType}
            </Text>
          </CardRow>
        )}

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

      </Box>

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

      <CardActions
        ticket={ticket}
        onViewDetail={onViewDetail}
        onOpenQueryModal={onOpenQueryModal}
        onConfirmPaid={onConfirmPaid}
        onRetryInvoice={onRetryInvoice}
        onResendNotify={onResendNotify}
        onMarkUnableToClose={onMarkUnableToClose}
      />
    </Paper>
  )
}

type MenuItemDef = {
  label: string
  icon: React.ReactNode
  onClick: () => void
  color?: string
}

type CardActionConfig = {
  primary: { label: string; icon: React.ReactNode; onClick: () => void }
  actionItems: MenuItemDef[]
  commonItems: MenuItemDef[]
}

type ActionCallbacks = {
  onViewDetail: (id: string) => void
  onOpenQueryModal: (id: string) => void
  onConfirmPaid: (id: string) => void
  onRetryInvoice: (id: string) => void
  onResendNotify: (id: string) => void
  onMarkUnableToClose: (id: string) => void
}

function buildCardActionConfig(
  ticket: Ticket,
  cb: ActionCallbacks,
): CardActionConfig {
  const showToast = (action: string, color: string = 'blue') => {
    notifications.show({
      title: action,
      message: `Demo：已對 ${ticket.id} 觸發「${action}」`,
      color,
    })
  }

  const copyId = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(ticket.id)
    }
    notifications.show({
      title: '已複製 Ticket ID',
      message: ticket.id,
      color: 'teal',
    })
  }

  const addNote: MenuItemDef = {
    label: '加備註',
    icon: <IconNote size={14} />,
    onClick: () => showToast('加備註'),
  }
  const copyTicketId: MenuItemDef = {
    label: '複製 Ticket ID',
    icon: <IconCopy size={14} />,
    onClick: copyId,
  }

  if (TERMINAL_STATUSES.includes(ticket.status)) {
    return {
      primary: {
        label: '查看詳情',
        icon: <IconArrowRight size={16} />,
        onClick: () => cb.onViewDetail(ticket.id),
      },
      actionItems: [],
      commonItems: [addNote, copyTicketId],
    }
  }

  // 非終結態：「查看詳情」獨立成 icon button（在外部 render），不重複放選單
  const commonItems = [addNote, copyTicketId]

  switch (ticket.status) {
    case 'pending-query':
      return {
        primary: {
          label: '回填查詢結果',
          icon: <IconClipboardCheck size={16} />,
          onClick: () => cb.onOpenQueryModal(ticket.id),
        },
        actionItems: [],
        commonItems,
      }
    case 'query-failed':
      return {
        primary: {
          label: '補寄通知信',
          icon: <IconMail size={16} />,
          onClick: () => cb.onResendNotify(ticket.id),
        },
        actionItems: [
          {
            label: '標記為無法結單',
            icon: <IconBan size={14} />,
            onClick: () => cb.onMarkUnableToClose(ticket.id),
            color: 'red',
          },
        ],
        commonItems,
      }
    case 'invoice-failed':
      return {
        primary: {
          label: '重試請款',
          icon: <IconRefresh size={16} />,
          onClick: () => cb.onRetryInvoice(ticket.id),
        },
        actionItems: [
          {
            label: '補寄付款通知信',
            icon: <IconMail size={14} />,
            onClick: () => showToast('補寄付款通知信'),
          },
          {
            label: '標記為無法結單',
            icon: <IconBan size={14} />,
            onClick: () => cb.onMarkUnableToClose(ticket.id),
            color: 'red',
          },
        ],
        commonItems,
      }
    case 'invoice-success':
      return {
        primary: {
          label: '確認已代繳',
          icon: <IconCash size={16} />,
          onClick: () => cb.onConfirmPaid(ticket.id),
        },
        actionItems: [],
        commonItems,
      }
    case 'invoicing':
    default:
      return {
        primary: {
          label: '查看請款進度',
          icon: <IconArrowRight size={16} />,
          onClick: () => cb.onViewDetail(ticket.id),
        },
        actionItems: [],
        commonItems,
      }
  }
}

function CardActions({
  ticket,
  onViewDetail,
  onOpenQueryModal,
  onConfirmPaid,
  onRetryInvoice,
  onResendNotify,
  onMarkUnableToClose,
}: {
  ticket: Ticket
  onViewDetail: (id: string) => void
  onOpenQueryModal: (id: string) => void
  onConfirmPaid: (id: string) => void
  onRetryInvoice: (id: string) => void
  onResendNotify: (id: string) => void
  onMarkUnableToClose: (id: string) => void
}) {
  const { primary, actionItems, commonItems } = buildCardActionConfig(ticket, {
    onViewDetail,
    onOpenQueryModal,
    onConfirmPaid,
    onRetryInvoice,
    onResendNotify,
    onMarkUnableToClose,
  })

  // 終結態的主 CTA 已是「查看詳情」，不再外掛獨立 icon button 避免重複
  const isTerminal = TERMINAL_STATUSES.includes(ticket.status)

  return (
    <Group mt="lg" gap="xs" wrap="nowrap">
      <Button
        variant="light"
        leftSection={primary.icon}
        onClick={primary.onClick}
        style={{ flex: 1 }}
      >
        {primary.label}
      </Button>
      {!isTerminal && (
        <Tooltip label="查看詳情" withArrow>
          <ActionIcon
            size={36}
            variant="default"
            aria-label="查看詳情"
            onClick={() => onViewDetail(ticket.id)}
          >
            <IconEye size={16} />
          </ActionIcon>
        </Tooltip>
      )}
      <Menu position="bottom-end" withinPortal width={200} shadow="md">
        <Menu.Target>
          <ActionIcon size={36} variant="default" aria-label="更多操作">
            <IconDots size={16} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          {actionItems.map((item) => (
            <Menu.Item
              key={item.label}
              leftSection={item.icon}
              onClick={item.onClick}
              color={item.color}
            >
              {item.label}
            </Menu.Item>
          ))}
          {actionItems.length > 0 && <Menu.Divider />}
          {commonItems.map((item) => (
            <Menu.Item
              key={item.label}
              leftSection={item.icon}
              onClick={item.onClick}
              color={item.color}
            >
              {item.label}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
    </Group>
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

type QueryResultChoice = 'no-fee' | 'counter-required' | 'query-failed' | 'has-amount' | 'mixed'

function QueryResultModal({
  ticket,
  opened,
  onClose,
  onSubmit,
}: {
  ticket: Ticket | null
  opened: boolean
  onClose: () => void
  onSubmit: (result: Partial<Pick<Ticket, 'status' | 'amount' | 'counterAmount'>>) => void
}) {
  const [choice, setChoice] = useState<QueryResultChoice>('has-amount')
  const [amount, setAmount] = useState<number | string>('')

  useEffect(() => {
    if (opened) {
      setChoice('has-amount')
      setAmount('')
    }
  }, [opened])

  if (!ticket) return null

  const serviceMeta = SERVICE_META[ticket.serviceType]

  const canSubmit =
    choice === 'no-fee' ||
    choice === 'counter-required' ||
    choice === 'query-failed' ||
    ((choice === 'has-amount' || choice === 'mixed') && Number(amount) > 0)

  const handleSubmit = () => {
    switch (choice) {
      case 'no-fee':
        onSubmit({ status: 'no-fee', amount: 0, counterAmount: null })
        notifications.show({
          title: '已標記為無需繳費',
          message: `${ticket.id} 已結案`,
          color: 'blue',
        })
        break
      case 'counter-required':
        onSubmit({ status: 'counter-required', amount: null, counterAmount: null })
        notifications.show({
          title: '已標記為需臨櫃繳費',
          message: '已寄信引導用戶臨櫃辦理',
          color: 'blue',
        })
        break
      case 'query-failed':
        onSubmit({ status: 'query-failed' })
        notifications.show({
          title: '已標記為查詢失敗',
          message: '系統將寄信通知用戶更新資料',
          color: 'red',
        })
        break
      case 'has-amount': {
        const a = Number(amount)
        // demo：模擬同步請款成功
        onSubmit({ status: 'invoice-success', amount: a, counterAmount: null })
        notifications.show({
          title: '請款成功',
          message: `已向用戶請款 NT$ ${a.toLocaleString()}，待代繳`,
          color: 'teal',
        })
        break
      }
      case 'mixed': {
        const a = Number(amount)
        // demo：模擬同步請款成功；臨櫃部分由用戶自繳，後台不再追蹤
        onSubmit({ status: 'invoice-success', amount: a, counterAmount: null })
        notifications.show({
          title: '請款成功',
          message: `已向用戶請款 NT$ ${a.toLocaleString()}，並通知臨櫃部分自繳`,
          color: 'teal',
        })
        break
      }
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="lg"
      centered
      title={
        <Box>
          <Text size="md" fw={600}>
            回填查詢結果
          </Text>
          <Text size="xs" c="dimmed" mt={2}>
            {ticket.id} · {serviceMeta.label} · {ticket.userName} · {ticket.plateNumber}
          </Text>
        </Box>
      }
    >
      <Stack gap="md">
        <Box
          style={{
            background: '#f8f9fa',
            borderRadius: 8,
            padding: '10px 14px',
          }}
        >
          <Group justify="space-between" wrap="nowrap">
            <Text size="sm" c="dimmed">
              線下查繳平台
            </Text>
            <Text
              component="a"
              href={serviceMeta.platformUrl}
              target="_blank"
              rel="noopener noreferrer"
              size="sm"
              fw={500}
              c="blue"
              style={{ textDecoration: 'none' }}
            >
              {serviceMeta.platform}
              <IconExternalLink size={12} style={{ marginLeft: 4, verticalAlign: 'middle' }} />
            </Text>
          </Group>
        </Box>

        <Radio.Group
          value={choice}
          onChange={(v) => setChoice(v as QueryResultChoice)}
          label="查詢結果"
          required
        >
          <Stack gap="xs" mt="xs">
            <Radio value="no-fee" label="無需繳費" />
            <Radio value="counter-required" label="需臨櫃繳費（整單）" />
            <Radio
              value="query-failed"
              label="查詢失敗"
              description="系統會自動寄信通知用戶更新資料"
            />
            <Radio value="has-amount" label="查到待繳費用" />
            <Radio value="mixed" label="查到待繳費用 + 部分需臨櫃" />
          </Stack>
        </Radio.Group>

        {(choice === 'has-amount' || choice === 'mixed') && (
          <Stack gap="sm">
            <NumberInput
              label="線上可繳金額 (NT$)"
              placeholder="輸入金額"
              value={amount}
              onChange={setAmount}
              min={0}
              thousandSeparator
              required
            />
            <Text size="xs" c="dimmed">
              送出後系統會立即向用戶發起請款，並當下回傳結果。
              {choice === 'mixed' && '臨櫃部分由用戶自繳，後台不再追蹤金額。'}
            </Text>
          </Stack>
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            送出
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}

// =====================================================
// Demo：模擬「代繳完成」截圖（不需真檔案）
// =====================================================

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function buildDemoProofSvg(opts: {
  platform: string
  amount: number
  ticketId: string
  date: string
  variant: 'success' | 'receipt'
}): string {
  const { platform, amount, ticketId, date, variant } = opts
  const headerColor = variant === 'success' ? '#1971c2' : '#0b7c4d'
  const accentColor = variant === 'success' ? '#12b886' : '#1971c2'
  const subtitle = variant === 'success' ? '繳費成功' : '繳費收據'
  const note = variant === 'success' ? '已成功扣款' : '本次交易紀錄'
  const fontFamily =
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans TC', sans-serif"

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600">
  <rect width="400" height="600" fill="#f8f9fa"/>
  <rect x="0" y="0" width="400" height="56" fill="${headerColor}"/>
  <text x="200" y="35" text-anchor="middle" font-size="18" font-weight="600" fill="#fff" font-family="${fontFamily}">${escapeXml(platform)}</text>
  <rect x="30" y="100" width="340" height="380" rx="16" fill="#fff" stroke="#e9ecef"/>
  <circle cx="200" cy="170" r="36" fill="${accentColor}"/>
  <path d="M183 170 L196 183 L218 158" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="200" y="240" text-anchor="middle" font-size="22" font-weight="700" fill="#212529" font-family="${fontFamily}">${subtitle}</text>
  <text x="200" y="275" text-anchor="middle" font-size="13" fill="#868e96" font-family="${fontFamily}">${note}</text>
  <line x1="60" y1="305" x2="340" y2="305" stroke="#e9ecef"/>
  <text x="60" y="335" font-size="13" fill="#868e96" font-family="${fontFamily}">金額</text>
  <text x="340" y="335" text-anchor="end" font-size="20" font-weight="700" fill="#212529" font-family="${fontFamily}">NT$ ${amount.toLocaleString()}</text>
  <text x="60" y="370" font-size="13" fill="#868e96" font-family="${fontFamily}">時間</text>
  <text x="340" y="370" text-anchor="end" font-size="13" fill="#212529" font-family="${fontFamily}">${escapeXml(date)}</text>
  <text x="60" y="405" font-size="13" fill="#868e96" font-family="${fontFamily}">交易單號</text>
  <text x="340" y="405" text-anchor="end" font-size="11" fill="#212529" font-family="ui-monospace, SFMono-Regular, monospace">${escapeXml(ticketId)}</text>
  <text x="200" y="455" text-anchor="middle" font-size="11" fill="#adb5bd" font-family="${fontFamily}">＊ demo 示意圖、非真實交易</text>
</svg>`
}

function svgStringToFile(svg: string, name: string): File {
  const blob = new Blob([svg], { type: 'image/svg+xml' })
  return new File([blob], name, { type: 'image/svg+xml' })
}

function buildDemoProofFiles(ticket: Ticket): File[] {
  const platform = SERVICE_META[ticket.serviceType].platform
  const amount = ticket.amount ?? 0
  const now = new Date()
  const date = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const stamp = `${now.getHours()}${now.getMinutes()}${now.getSeconds()}`

  return [
    svgStringToFile(
      buildDemoProofSvg({ platform, amount, ticketId: ticket.id, date, variant: 'success' }),
      `${platform}-繳費成功-${stamp}.svg`,
    ),
    svgStringToFile(
      buildDemoProofSvg({ platform, amount, ticketId: ticket.id, date, variant: 'receipt' }),
      `${platform}-收據-${stamp}.svg`,
    ),
  ]
}

function ConfirmPaidModal({
  ticket,
  opened,
  onClose,
  onConfirm,
}: {
  ticket: Ticket | null
  opened: boolean
  onClose: () => void
  onConfirm: (proofs: string[]) => void
}) {
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  // 重設與 preview URL 生命週期
  useEffect(() => {
    if (!opened) {
      setFiles([])
      setSubmitting(false)
    }
  }, [opened])

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f))
    setPreviews(urls)
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [files])

  if (!ticket) return null

  const serviceMeta = SERVICE_META[ticket.serviceType]
  const isMixed = !!(ticket.counterAmount && ticket.counterAmount > 0)
  const canSubmit = files.length > 0 && !submitting

  const handleAppend = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles])
  }

  const handleRemove = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const dataUris = await Promise.all(
        files.map(
          (file) =>
            new Promise<string>((resolve, reject) => {
              const reader = new FileReader()
              reader.onload = () => resolve(reader.result as string)
              reader.onerror = reject
              reader.readAsDataURL(file)
            }),
        ),
      )
      onConfirm(dataUris)
    } catch {
      notifications.show({
        title: '上傳失敗',
        message: '檔案讀取出錯，請重試',
        color: 'red',
      })
      setSubmitting(false)
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="lg"
      centered
      title={
        <Box>
          <Text size="md" fw={600}>
            確認已代繳
          </Text>
          <Text size="xs" c="dimmed" mt={2}>
            {ticket.id} · {serviceMeta.label} · {ticket.userName}
          </Text>
        </Box>
      }
    >
      <Stack gap="md">
        <Text size="sm" c="dark.7">
          請確認已透過 <Text component="span" fw={600}>{serviceMeta.platform}</Text> 完成線下代繳，提交後此票將標記為「繳款成功」並結案。
        </Text>

        <Box
          style={{
            background: '#f8f9fa',
            borderRadius: 8,
            padding: '14px 16px',
          }}
        >
          <Group gap="32px" wrap="wrap">
            <Box>
              <Text size="xs" c="dimmed" mb={2}>
                線上代繳金額
              </Text>
              <Text size="20px" fw={700} style={{ lineHeight: 1.2 }}>
                NT$ {(ticket.amount ?? 0).toLocaleString()}
              </Text>
            </Box>
            {isMixed && (
              <Box>
                <Group gap={6} mb={2}>
                  <Text size="xs" c="dimmed">
                    臨櫃部分
                  </Text>
                  <Badge size="xs" color="blue" variant="light">
                    用戶自繳
                  </Badge>
                </Group>
                <Text size="20px" fw={700} style={{ lineHeight: 1.2, color: '#1971c2' }}>
                  NT$ {(ticket.counterAmount ?? 0).toLocaleString()}
                </Text>
              </Box>
            )}
          </Group>
        </Box>

        {isMixed && (
          <Text size="xs" c="dimmed">
            混合單僅就線上部分結案，臨櫃須繳金額由用戶自行處理，不再追蹤。
          </Text>
        )}

        {/* 繳費證明上傳 */}
        <Box>
          <Group justify="space-between" align="center" mb="6px" wrap="wrap" gap="6px">
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text size="sm" fw={600}>
                繳費證明截圖
              </Text>
              <Text size="xs" c="dimmed">
                請上傳代繳完成畫面，以供後續對帳追溯（至少 1 張）
              </Text>
            </Box>
            <Group gap="6px" wrap="nowrap">
              <Tooltip
                label="Demo：自動產生 2 張帶本票資訊的示意截圖（供展示流程用）"
                withArrow
                multiline
                w={220}
              >
                <Button
                  variant="subtle"
                  size="xs"
                  leftSection={<IconPhotoPlus size={14} />}
                  onClick={() => handleAppend(buildDemoProofFiles(ticket))}
                >
                  插入示意圖
                </Button>
              </Tooltip>
              <FileButton onChange={handleAppend} accept="image/*" multiple>
                {(props) => (
                  <Button
                    {...props}
                    variant="light"
                    size="xs"
                    leftSection={<IconUpload size={14} />}
                  >
                    選擇圖片
                  </Button>
                )}
              </FileButton>
            </Group>
          </Group>

          {files.length === 0 ? (
            <Box
              style={{
                border: '1px dashed #dee2e6',
                borderRadius: 8,
                padding: '24px',
                textAlign: 'center',
                backgroundColor: '#fafbfc',
              }}
            >
              <IconPhoto size={28} color="#adb5bd" />
              <Text size="xs" c="dimmed" mt="6px">
                尚未選擇任何圖片
              </Text>
            </Box>
          ) : (
            <SimpleGrid cols={3} spacing="8px">
              {previews.map((src, i) => (
                <Box
                  key={src}
                  style={{
                    position: 'relative',
                    borderRadius: 8,
                    overflow: 'hidden',
                    border: '1px solid #e9ecef',
                    aspectRatio: '4 / 3',
                  }}
                >
                  <Image
                    src={src}
                    alt={files[i]?.name ?? `proof-${i}`}
                    h="100%"
                    fit="cover"
                  />
                  <ActionIcon
                    variant="filled"
                    color="dark"
                    size="sm"
                    onClick={() => handleRemove(i)}
                    aria-label="移除"
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      backgroundColor: 'rgba(0,0,0,0.65)',
                    }}
                  >
                    <IconTrash size={12} />
                  </ActionIcon>
                  <Text
                    size="10px"
                    c="white"
                    fw={500}
                    style={{
                      position: 'absolute',
                      left: 4,
                      bottom: 4,
                      padding: '2px 6px',
                      borderRadius: 4,
                      backgroundColor: 'rgba(0,0,0,0.65)',
                      maxWidth: 'calc(100% - 32px)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {files[i]?.name}
                  </Text>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </Box>

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose} disabled={submitting}>
            取消
          </Button>
          <Button color="teal" onClick={handleSubmit} disabled={!canSubmit} loading={submitting}>
            確認已代繳
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}

function ResendNotifyModal({
  ticket,
  opened,
  onClose,
  onConfirm,
}: {
  ticket: Ticket | null
  opened: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  if (!ticket) return null

  const serviceMeta = SERVICE_META[ticket.serviceType]
  const lastEmail = ticket.emailLogs[0]

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="md"
      centered
      title={
        <Box>
          <Text size="md" fw={600}>
            補寄通知信
          </Text>
          <Text size="xs" c="dimmed" mt={2}>
            {ticket.id} · {serviceMeta.label} · {ticket.userName}
          </Text>
        </Box>
      }
    >
      <Stack gap="md">
        <Text size="sm" c="dark.7">
          將再次寄送「<Text component="span" fw={600}>請更新車籍資料</Text>」通知信給用戶。系統第一封信已於查詢失敗時自動寄出，這是補發。
        </Text>

        {lastEmail && (
          <Box
            style={{
              background: '#f8f9fa',
              borderRadius: 8,
              padding: '12px 14px',
            }}
          >
            <Text size="xs" c="dimmed" mb={4}>
              上次寄送
            </Text>
            <Text size="sm" fw={500}>
              {lastEmail.subject}
            </Text>
            <Text size="xs" c="dimmed" mt={2}>
              {lastEmail.sentAt} · {lastEmail.status === 'sent' ? '已寄出' : '寄送失敗'}
            </Text>
          </Box>
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose}>
            取消
          </Button>
          <Button color="blue" onClick={onConfirm}>
            確認補寄
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}

function RetryInvoiceModal({
  ticket,
  opened,
  onClose,
  onConfirm,
}: {
  ticket: Ticket | null
  opened: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  if (!ticket) return null

  const serviceMeta = SERVICE_META[ticket.serviceType]
  const lastFailed = [...ticket.invoiceOrders].reverse().find((i) => i.status === 'failed')

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="md"
      centered
      title={
        <Box>
          <Text size="md" fw={600}>
            重試請款
          </Text>
          <Text size="xs" c="dimmed" mt={2}>
            {ticket.id} · {serviceMeta.label} · {ticket.userName}
          </Text>
        </Box>
      }
    >
      <Stack gap="md">
        <Text size="sm" c="dark.7">
          將重新向用戶綁定的支付工具發起<Text component="span" fw={600}>同步請款</Text>，當下回傳成功或失敗。
        </Text>

        <Box
          style={{
            background: '#f8f9fa',
            borderRadius: 8,
            padding: '14px 16px',
          }}
        >
          <Text size="xs" c="dimmed" mb={4}>
            請款金額
          </Text>
          <Text size="22px" fw={700} style={{ lineHeight: 1.2 }}>
            NT$ {(ticket.amount ?? 0).toLocaleString()}
          </Text>
          {lastFailed?.failReason && (
            <>
              <Divider my="sm" />
              <Text size="xs" c="dimmed" mb={4}>
                上次失敗原因
              </Text>
              <Text size="sm" c="red.7" fw={500}>
                {lastFailed.failReason}
              </Text>
            </>
          )}
        </Box>

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose}>
            取消
          </Button>
          <Button color="blue" onClick={onConfirm}>
            確認重試
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}

function UnableToCloseModal({
  ticket,
  opened,
  onClose,
  onConfirm,
}: {
  ticket: Ticket | null
  opened: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  if (!ticket) return null

  const serviceMeta = SERVICE_META[ticket.serviceType]
  const statusMeta = STATUS_META[ticket.status]

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="md"
      centered
      title={
        <Box>
          <Text size="md" fw={600} c="red.7">
            標記為無法結單
          </Text>
          <Text size="xs" c="dimmed" mt={2}>
            {ticket.id} · {serviceMeta.label} · {ticket.userName}
          </Text>
        </Box>
      }
    >
      <Stack gap="md">
        <Text size="sm" c="dark.7">
          此票將標記為「<Text component="span" fw={600} c="red.7">無法結單</Text>」並移至歷史任務，後續不再追蹤。
        </Text>

        <Box
          style={{
            background: '#fff5f5',
            border: '1px solid #ffc9c9',
            borderRadius: 8,
            padding: '12px 14px',
          }}
        >
          <Group gap="6px" mb="6px">
            <IconAlertTriangle size={16} color="#c92a2a" />
            <Text size="sm" fw={600} c="red.7">
              請先確認以下情況都成立
            </Text>
          </Group>
          <Stack gap={4} pl="22px">
            <Text size="xs" c="dark.7">
              · 多次重試／聯繫用戶仍無法處理
            </Text>
            <Text size="xs" c="dark.7">
              · 已評估過其他結案方式（補寄通知、修改車籍等）
            </Text>
            <Text size="xs" c="dark.7">
              · 此票對帳上不再進入請款／繳款週期
            </Text>
          </Stack>
        </Box>

        <Box
          style={{
            background: '#f8f9fa',
            borderRadius: 8,
            padding: '10px 14px',
          }}
        >
          <Group justify="space-between">
            <Text size="xs" c="dimmed">
              目前狀態
            </Text>
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
          </Group>
        </Box>

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose}>
            取消
          </Button>
          <Button color="red" onClick={onConfirm}>
            確認標記為無法結單
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
