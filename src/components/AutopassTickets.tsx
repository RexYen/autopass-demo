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
  SegmentedControl,
  ThemeIcon,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import {
  IconSearch,
  IconArrowRight,
  IconFilter,
  IconCar,
  IconCreditCard,
  IconCalendar,
  IconBuildingBank,
  IconClock,
  IconRefresh,
  IconCircleDot,
  IconCopy,
  IconCheck,
  IconCircleCheck,
  IconCircleX,
  IconExternalLink,
  IconDots,
  IconClipboardCheck,
  IconCash,
  IconNote,
  IconMail,
  IconEye,
} from '@tabler/icons-react'
import { mockTickets } from '../data/autopassMock'
import {
  STATUS_META,
  SERVICE_META,
  SERVICE_QUERY_FIELDS,
  QUERY_FAILURE_REASON_META,
  type ServiceType,
  type Ticket,
  type TicketNote,
  type TicketStatus,
  type EmailLog,
  type InvoiceOrder,
  type QueryFailureReason,
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
  'query-failed',    // 查詢失敗直接結案，下一週期若資料更新會自動產生新 ticket
  'invoice-failed',  // 請款失敗直接結案；若操作員勾「重新嘗試」，由系統 X 天後另開新 ticket
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

type HistorySearchFields = {
  email: string
  plateNumber: string
  idNumber: string
  birthDate: string
  vehicleType: string
}

const HISTORY_VEHICLE_OPTIONS = ['汽車', '機車', '大型重型機車', '拖車']

export function AutopassTickets({
  initialStatusFilter,
  mode = 'current',
}: AutopassTicketsProps) {
  const isHistory = mode === 'history'
  const [activeTab, setActiveTab] = useState<TabValue>('etc-toll')
  const [search, setSearch] = useState('')
  const [historySearch, setHistorySearch] = useState<HistorySearchFields>({
    email: '',
    plateNumber: '',
    idNumber: '',
    birthDate: '',
    vehicleType: '',
  })
  const [statusFilter, setStatusFilter] = useState<string | null>(
    initialStatusFilter ?? null,
  )
  const [page, setPage] = useState(1)

  // demo 用 — 點 Modal 送出後本地端覆寫對應欄位，讓卡片狀態跟著流程走
  const [statusOverrides, setStatusOverrides] = useState<
    Record<string, Partial<Pick<Ticket, 'status' | 'amount' | 'outcome' | 'queryFailureReason'>>>
  >({})
  const [queryModalTicketId, setQueryModalTicketId] = useState<string | null>(null)
  const [confirmPaidTicketId, setConfirmPaidTicketId] = useState<string | null>(null)
  const [detailTicketId, setDetailTicketId] = useState<string | null>(null)
  const [noteOverrides, setNoteOverrides] = useState<Record<string, TicketNote[]>>({})
  const [emailOverrides, setEmailOverrides] = useState<Record<string, EmailLog[]>>({})
  const [invoiceOverrides, setInvoiceOverrides] = useState<Record<string, InvoiceOrder[]>>({})

  // 當外部傳入新的 initialStatusFilter（例：從 Dashboard 跳過來），同步進來
  useEffect(() => {
    if (initialStatusFilter) {
      setStatusFilter(initialStatusFilter)
      setPage(1)
    }
  }, [initialStatusFilter])

  // 套用 demo 覆寫（狀態 + 加備註 + 自動發信 + 新請款訂單）
  const tickets = useMemo(
    () =>
      mockTickets.map((t) => {
        const status = statusOverrides[t.id]
        const extraNotes = noteOverrides[t.id]
        const extraEmails = emailOverrides[t.id]
        const extraInvoices = invoiceOverrides[t.id]
        let merged: Ticket = status ? { ...t, ...status } : t
        if (extraNotes && extraNotes.length > 0) {
          merged = { ...merged, notes: [...extraNotes, ...merged.notes] }
        }
        if (extraEmails && extraEmails.length > 0) {
          merged = { ...merged, emailLogs: [...extraEmails, ...merged.emailLogs] }
        }
        if (extraInvoices && extraInvoices.length > 0) {
          merged = {
            ...merged,
            invoiceOrders: [...merged.invoiceOrders, ...extraInvoices],
          }
        }
        return merged
      }),
    [statusOverrides, noteOverrides, emailOverrides, invoiceOverrides],
  )

  const queryModalTicket = useMemo(
    () => (queryModalTicketId ? tickets.find((t) => t.id === queryModalTicketId) ?? null : null),
    [queryModalTicketId, tickets],
  )

  const confirmPaidTicket = useMemo(
    () => (confirmPaidTicketId ? tickets.find((t) => t.id === confirmPaidTicketId) ?? null : null),
    [confirmPaidTicketId, tickets],
  )

  const handleQueryModalOpen = (ticketId: string) => setQueryModalTicketId(ticketId)
  const handleQueryModalClose = () => setQueryModalTicketId(null)
  const handleQueryResultSubmit = (
    result: Partial<Pick<Ticket, 'status' | 'amount' | 'outcome' | 'queryFailureReason'>>,
    opts?: {
      failedInvoice?: { amount: number; failReason: string }
    },
  ) => {
    if (!queryModalTicketId) return
    setStatusOverrides((prev) => ({
      ...prev,
      [queryModalTicketId]: result,
    }))
    if (opts?.failedInvoice) {
      const now = new Date()
      const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      setInvoiceOverrides((prev) => ({
        ...prev,
        [queryModalTicketId]: [
          ...(prev[queryModalTicketId] ?? []),
          {
            id: `INV-${Date.now()}`,
            amount: opts.failedInvoice!.amount,
            createdAt: stamp,
            status: 'failed',
            failReason: opts.failedInvoice!.failReason,
          },
        ],
      }))
    }
    setQueryModalTicketId(null)
  }

  const handleOpenConfirmPaidModal = (ticketId: string) => setConfirmPaidTicketId(ticketId)
  const handleConfirmPaidClose = () => setConfirmPaidTicketId(null)
  const handleConfirmPaidSubmit = () => {
    if (!confirmPaidTicketId) return
    setStatusOverrides((prev) => ({
      ...prev,
      [confirmPaidTicketId]: { ...prev[confirmPaidTicketId], status: 'paid' },
    }))
    const now = new Date()
    const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    setEmailOverrides((prev) => ({
      ...prev,
      [confirmPaidTicketId]: [
        {
          id: `E-${Date.now()}`,
          triggerStatus: 'paid',
          template: 'paid-v1',
          subject: '【自動繳通知】繳費完成',
          sentAt: stamp,
          status: 'sent',
        },
        ...(prev[confirmPaidTicketId] ?? []),
      ],
    }))
    notifications.show({
      title: '已確認代繳完成',
      message: `${confirmPaidTicketId} 已結案、已寄出繳費完成通知信`,
      color: 'teal',
    })
    setConfirmPaidTicketId(null)
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

  // 卡牌上對每個 ticket 實際顯示的可搜尋欄位（id / Email + 該 service 對應的 query fields）
  const ticketSearchValues = (t: Ticket): string[] => {
    const fields = SERVICE_QUERY_FIELDS[t.serviceType]
    const values: string[] = [t.id, t.userEmail]
    if (fields.includes('plateNumber')) values.push(t.plateNumber)
    if (fields.includes('idNumber')) values.push(t.driverInfo.idNumber)
    if (fields.includes('birthDate') && t.driverInfo.birthDate) {
      values.push(t.driverInfo.birthDate)
    }
    if (fields.includes('vehicleType')) values.push(t.driverInfo.vehicleType)
    return values
  }

  const activeFieldSet = useMemo(() => {
    const s = new Set<string>()
    TAB_TYPES[activeTab].forEach((type) => {
      SERVICE_QUERY_FIELDS[type].forEach((f) => s.add(f))
    })
    return s
  }, [activeTab])

  const filtered = useMemo(() => {
    return tabFiltered.filter((t) => {
      if (statusFilter && t.status !== statusFilter) return false
      if (isHistory) {
        const e = historySearch.email.trim().toLowerCase()
        if (e && !t.userEmail.toLowerCase().includes(e)) return false
        if (activeFieldSet.has('plateNumber')) {
          const p = historySearch.plateNumber.trim().toLowerCase()
          if (p && !t.plateNumber.toLowerCase().includes(p)) return false
        }
        if (activeFieldSet.has('idNumber')) {
          const idKw = historySearch.idNumber.trim().toLowerCase()
          if (idKw && !t.driverInfo.idNumber.toLowerCase().includes(idKw)) return false
        }
        if (activeFieldSet.has('birthDate')) {
          const bd = historySearch.birthDate.trim()
          if (bd && !(t.driverInfo.birthDate ?? '').includes(bd)) return false
        }
        if (activeFieldSet.has('vehicleType')) {
          const vt = historySearch.vehicleType.trim()
          if (vt && t.driverInfo.vehicleType !== vt) return false
        }
        return true
      }
      const kw = search.trim().toLowerCase()
      if (!kw) return true
      return ticketSearchValues(t).some((v) => v.toLowerCase().includes(kw))
    })
  }, [tabFiltered, search, historySearch, statusFilter, isHistory, activeFieldSet])

  // Placeholder 依 active tab 顯示欄位（聯集，因 tab 可能合併個人 / 法人）
  const searchPlaceholder = useMemo(() => {
    const fieldSet = new Set<string>()
    TAB_TYPES[activeTab].forEach((type) => {
      SERVICE_QUERY_FIELDS[type].forEach((f) => fieldSet.add(f))
    })
    const labels: string[] = ['Email']
    if (fieldSet.has('plateNumber')) labels.push('車牌')
    if (fieldSet.has('idNumber')) labels.push('身分證／統編')
    if (fieldSet.has('birthDate')) labels.push('出生年月日')
    if (fieldSet.has('vehicleType')) labels.push('車種')
    return `搜尋 ${labels.join('、')}`
  }, [activeTab])

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

  const hasHistorySearch = Object.values(historySearch).some((v) => v.trim().length > 0)
  const handleResetFilters = () => {
    setSearch('')
    setHistorySearch({
      email: '',
      plateNumber: '',
      idNumber: '',
      birthDate: '',
      vehicleType: '',
    })
    setStatusFilter(null)
    setPage(1)
  }
  const updateHistorySearch = (key: keyof HistorySearchFields, value: string) => {
    setHistorySearch((prev) => ({ ...prev, [key]: value }))
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
          {isHistory && (
            <Text size="sm" c="dimmed" mt="4px">
              已結案 {filtered.length} 筆
            </Text>
          )}
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
          {isHistory ? (
            <HistorySearchInputs
              activeTab={activeTab}
              value={historySearch}
              onChange={updateHistorySearch}
            />
          ) : (
            <TextInput
              placeholder={searchPlaceholder}
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
          )}
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
          {(statusFilter || search || hasHistorySearch) && (
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

function HistorySearchInputs({
  activeTab,
  value,
  onChange,
}: {
  activeTab: TabValue
  value: HistorySearchFields
  onChange: (key: keyof HistorySearchFields, v: string) => void
}) {
  const fieldSet = new Set<string>()
  TAB_TYPES[activeTab].forEach((type) => {
    SERVICE_QUERY_FIELDS[type].forEach((f) => fieldSet.add(f))
  })

  const inputStyles = { input: { height: 40, borderRadius: 4, fontSize: 14 } }
  const baseStyle = { flex: '1 1 180px', minWidth: 160 }

  return (
    <>
      <TextInput
        placeholder="Email"
        leftSection={<IconSearch size={14} />}
        value={value.email}
        onChange={(e) => onChange('email', e.currentTarget.value)}
        style={baseStyle}
        styles={inputStyles}
      />
      {fieldSet.has('plateNumber') && (
        <TextInput
          placeholder="車牌"
          value={value.plateNumber}
          onChange={(e) => onChange('plateNumber', e.currentTarget.value)}
          style={baseStyle}
          styles={inputStyles}
        />
      )}
      {fieldSet.has('idNumber') && (
        <TextInput
          placeholder="身分證／統編"
          value={value.idNumber}
          onChange={(e) => onChange('idNumber', e.currentTarget.value)}
          style={baseStyle}
          styles={inputStyles}
        />
      )}
      {fieldSet.has('birthDate') && (
        <TextInput
          placeholder="出生年月日"
          value={value.birthDate}
          onChange={(e) => onChange('birthDate', e.currentTarget.value)}
          style={baseStyle}
          styles={inputStyles}
        />
      )}
      {fieldSet.has('vehicleType') && (
        <Select
          placeholder="車種"
          data={HISTORY_VEHICLE_OPTIONS}
          value={value.vehicleType || null}
          onChange={(v) => onChange('vehicleType', v ?? '')}
          clearable
          style={{ width: 140 }}
          styles={inputStyles}
        />
      )}
    </>
  )
}

function TicketCard({
  ticket,
  onViewDetail,
  onOpenQueryModal,
  onConfirmPaid,
}: {
  ticket: Ticket
  onViewDetail: (id: string) => void
  onOpenQueryModal: (id: string) => void
  onConfirmPaid: (id: string) => void
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

        <CardRow icon={<IconMail size={14} />} label="Email">
          <Text size="sm" fw={500}>
            {ticket.userEmail}
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

  const addNote: MenuItemDef = {
    label: '加備註',
    icon: <IconNote size={14} />,
    onClick: () => showToast('加備註'),
  }

  if (TERMINAL_STATUSES.includes(ticket.status)) {
    return {
      primary: {
        label: '查看詳情',
        icon: <IconArrowRight size={16} />,
        onClick: () => cb.onViewDetail(ticket.id),
      },
      actionItems: [],
      commonItems: [addNote],
    }
  }

  // 非終結態：「查看詳情」獨立成 icon button（在外部 render），不重複放選單
  const commonItems = [addNote]

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
    default:
      return {
        primary: {
          label: '查看詳情',
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
}: {
  ticket: Ticket
  onViewDetail: (id: string) => void
  onOpenQueryModal: (id: string) => void
  onConfirmPaid: (id: string) => void
}) {
  const { primary, actionItems, commonItems } = buildCardActionConfig(ticket, {
    onViewDetail,
    onOpenQueryModal,
    onConfirmPaid,
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

type QueryResultChoice = 'no-online-fee' | 'query-failed' | 'has-fee'
type NoOnlineFeeReason = 'no-fee' | 'counter-required'
type HasFeeMode = 'has-amount' | 'mixed'
type ModalStep = 'input' | 'result'
type SimulatedResult = 'success' | 'failure'
type RetryChoice = 'retry' | 'no-retry'

const DEMO_FAIL_REASON = '信用卡授權失敗（demo 模擬）'

function formatRetryDate(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

function QueryResultModal({
  ticket,
  opened,
  onClose,
  onSubmit,
}: {
  ticket: Ticket | null
  opened: boolean
  onClose: () => void
  onSubmit: (
    result: Partial<Pick<Ticket, 'status' | 'amount' | 'outcome' | 'queryFailureReason'>>,
    opts?: { failedInvoice?: { amount: number; failReason: string } },
  ) => void
}) {
  const [choice, setChoice] = useState<QueryResultChoice>('has-fee')
  const [noOnlineFeeReason, setNoOnlineFeeReason] = useState<NoOnlineFeeReason>('no-fee')
  const [hasFeeMode, setHasFeeMode] = useState<HasFeeMode>('has-amount')
  const [queryFailureReason, setQueryFailureReason] = useState<QueryFailureReason>('data-error')
  const [amount, setAmount] = useState<number | string>('')
  const [modalStep, setModalStep] = useState<ModalStep>('input')
  const [simulatedResult, setSimulatedResult] = useState<SimulatedResult>('success')
  const [retryChoice, setRetryChoice] = useState<RetryChoice>('retry')
  const [retryDays, setRetryDays] = useState<number | string>(7)

  useEffect(() => {
    if (opened) {
      setChoice('has-fee')
      setNoOnlineFeeReason('no-fee')
      setHasFeeMode('has-amount')
      setQueryFailureReason('data-error')
      setAmount('')
      setModalStep('input')
      setSimulatedResult('success')
      setRetryChoice('retry')
      setRetryDays(7)
    }
  }, [opened])

  if (!ticket) return null

  const serviceMeta = SERVICE_META[ticket.serviceType]
  const isEtcToll = ticket.serviceType === 'etc-toll'
  const numericAmount = Number(amount)
  const numericRetryDays = Number(retryDays)

  const canAdvance =
    choice === 'no-online-fee' ||
    choice === 'query-failed' ||
    (choice === 'has-fee' && numericAmount > 0)

  const canCloseResult =
    modalStep === 'result' &&
    (simulatedResult === 'success' ||
      retryChoice === 'no-retry' ||
      (retryChoice === 'retry' && numericRetryDays >= 1))

  // Step 1 送出：non-has-fee 直接 submit；has-fee 進入 result 步驟
  const handleAdvance = () => {
    switch (choice) {
      case 'no-online-fee':
        if (noOnlineFeeReason === 'no-fee') {
          onSubmit({ status: 'no-fee', amount: 0, outcome: 'no-fee' })
          notifications.show({
            title: '已標記為無應繳費用',
            message: `${ticket.id} 已結案`,
            color: 'blue',
          })
        } else {
          onSubmit({ status: 'no-fee', amount: null, outcome: 'counter-only' })
          notifications.show({
            title: '已標記為整單需臨櫃辦理',
            message: '已寄信引導用戶臨櫃辦理，本票已結案',
            color: 'blue',
          })
        }
        break
      case 'query-failed': {
        const reasonMeta = QUERY_FAILURE_REASON_META[queryFailureReason]
        onSubmit({ status: 'query-failed', queryFailureReason })
        notifications.show({
          title: `已標記查詢失敗：${reasonMeta.label}`,
          message: '本票直接結案至歷史任務，若用戶更新資料下一週期會自動產生新 ticket',
          color: 'red',
        })
        break
      }
      case 'has-fee':
        // 進入 result 步驟，等操作員確認模擬結果（成功/失敗 + 失敗 retry 安排）
        setModalStep('result')
        return
    }
  }

  // Step 2 確認結案：依模擬結果送出對應 status
  const handleResultConfirm = () => {
    const a = numericAmount
    const outcome = hasFeeMode === 'mixed' ? 'online-mixed' : 'online-full'
    if (simulatedResult === 'success') {
      onSubmit({ status: 'invoice-success', amount: a, outcome })
      notifications.show({
        title: '請款成功',
        message:
          hasFeeMode === 'mixed'
            ? `已向用戶請款 NT$ ${a.toLocaleString()}，並通知臨櫃部分自繳`
            : `已向用戶請款 NT$ ${a.toLocaleString()}，待代繳`,
        color: 'teal',
      })
      return
    }
    // failure path
    onSubmit(
      { status: 'invoice-failed', amount: a, outcome },
      { failedInvoice: { amount: a, failReason: DEMO_FAIL_REASON } },
    )
    if (retryChoice === 'retry') {
      const days = Math.max(1, Math.floor(numericRetryDays || 0))
      notifications.show({
        title: `請款失敗，已排程 ${days} 天後重新查詢`,
        message: `原 ticket 以「請款失敗」進入歷史；系統將於 ${formatRetryDate(days)} 自動產生新的待查詢 ticket`,
        color: 'orange',
      })
    } else {
      notifications.show({
        title: '請款失敗，已直接結案',
        message: `${ticket.id} 以「請款失敗」進入歷史任務，不再重新嘗試`,
        color: 'red',
      })
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
            {modalStep === 'input' ? '回填查詢結果' : '請款結果'}
          </Text>
          <Text size="xs" c="dimmed" mt={2}>
            {ticket.id} · {serviceMeta.label} · {ticket.userEmail} · {ticket.plateNumber}
          </Text>
        </Box>
      }
    >
      {modalStep === 'input' ? (
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
              <Radio value="no-online-fee" label="無需繳費" />
              {choice === 'no-online-fee' && (
                <Box
                  pl="28px"
                  style={{
                    borderLeft: '2px solid #e9ecef',
                    marginLeft: 8,
                  }}
                >
                  <Radio.Group
                    value={noOnlineFeeReason}
                    onChange={(v) => setNoOnlineFeeReason(v as NoOnlineFeeReason)}
                    label="原因"
                    size="sm"
                  >
                    <Stack gap="xs" mt="xs">
                      <Radio
                        value="no-fee"
                        label="無應繳費用"
                        description="平台查詢結果為零，直接結案"
                      />
                      <Radio
                        value="counter-required"
                        label="需臨櫃繳費（整單）"
                        description="無法線上代繳，將寄信引導用戶臨櫃辦理"
                      />
                    </Stack>
                  </Radio.Group>
                </Box>
              )}
              <Radio
                value="query-failed"
                label="查詢失敗"
                description="本票直接結案至歷史任務，若用戶更新資料下一週期會自動產生新 ticket"
              />
              {choice === 'query-failed' && (
                <Box
                  pl="28px"
                  style={{
                    borderLeft: '2px solid #e9ecef',
                    marginLeft: 8,
                  }}
                >
                  <Radio.Group
                    value={queryFailureReason}
                    onChange={(v) => setQueryFailureReason(v as QueryFailureReason)}
                    label="失敗原因"
                    size="sm"
                    required
                  >
                    <Stack gap="xs" mt="xs">
                      <Radio
                        value="data-error"
                        label={QUERY_FAILURE_REASON_META['data-error'].label}
                        description={QUERY_FAILURE_REASON_META['data-error'].description}
                      />
                      {isEtcToll && (
                        <Radio
                          value="etag-bound"
                          label={QUERY_FAILURE_REASON_META['etag-bound'].label}
                          description={QUERY_FAILURE_REASON_META['etag-bound'].description}
                        />
                      )}
                    </Stack>
                  </Radio.Group>
                </Box>
              )}
              <Radio value="has-fee" label="查到待繳費用" />
              {choice === 'has-fee' && (
                <Box
                  pl="28px"
                  style={{
                    borderLeft: '2px solid #e9ecef',
                    marginLeft: 8,
                  }}
                >
                  <Stack gap="sm" mt="xs">
                    <Radio.Group
                      value={hasFeeMode}
                      onChange={(v) => setHasFeeMode(v as HasFeeMode)}
                      label="繳費範圍"
                      size="sm"
                    >
                      <Stack gap="xs" mt="xs">
                        <Radio
                          value="has-amount"
                          label="全額可線上代繳"
                          description="查到的金額全數透過系統代繳"
                        />
                        <Radio
                          value="mixed"
                          label="部分需臨櫃自繳"
                          description="僅就線上部分代繳，臨櫃部分由用戶自行處理"
                        />
                      </Stack>
                    </Radio.Group>
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
                      送出後系統會即時向用戶發起請款，下一步顯示請款結果。
                      {hasFeeMode === 'mixed' && '臨櫃部分由用戶自繳，後台不再追蹤金額。'}
                    </Text>
                  </Stack>
                </Box>
              )}
            </Stack>
          </Radio.Group>

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              取消
            </Button>
            <Button onClick={handleAdvance} disabled={!canAdvance}>
              {choice === 'has-fee' ? '送出請款' : '送出'}
            </Button>
          </Group>
        </Stack>
      ) : (
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Text size="xs" c="dimmed">
              demo 模擬請款回傳結果
            </Text>
            <SegmentedControl
              size="xs"
              value={simulatedResult}
              onChange={(v) => setSimulatedResult(v as SimulatedResult)}
              data={[
                { label: '成功', value: 'success' },
                { label: '失敗', value: 'failure' },
              ]}
            />
          </Group>

          {simulatedResult === 'success' ? (
            <Box
              style={{
                background: 'rgba(18,184,134,0.10)',
                border: '1px solid rgba(18,184,134,0.30)',
                borderRadius: 8,
                padding: '14px 16px',
              }}
            >
              <Group gap="10px" wrap="nowrap" align="flex-start">
                <ThemeIcon color="teal" radius="xl" size="lg" variant="light">
                  <IconCircleCheck size={22} />
                </ThemeIcon>
                <Stack gap={2} style={{ flex: 1 }}>
                  <Text size="sm" fw={600} c="teal.8">
                    請款成功
                  </Text>
                  <Text size="sm" c="dark.7">
                    已向用戶請款 NT$ {numericAmount.toLocaleString()}
                    {hasFeeMode === 'mixed' && '，臨櫃部分由用戶自繳'}
                  </Text>
                  <Text size="xs" c="dimmed" mt={2}>
                    本票進入「請款成功」狀態，等待代繳完成
                  </Text>
                </Stack>
              </Group>
            </Box>
          ) : (
            <Stack gap="sm">
              <Box
                style={{
                  background: 'rgba(250,82,82,0.08)',
                  border: '1px solid rgba(250,82,82,0.30)',
                  borderRadius: 8,
                  padding: '14px 16px',
                }}
              >
                <Group gap="10px" wrap="nowrap" align="flex-start">
                  <ThemeIcon color="red" radius="xl" size="lg" variant="light">
                    <IconCircleX size={22} />
                  </ThemeIcon>
                  <Stack gap={2} style={{ flex: 1 }}>
                    <Text size="sm" fw={600} c="red.7">
                      請款失敗
                    </Text>
                    <Text size="sm" c="dark.7">
                      金額 NT$ {numericAmount.toLocaleString()} · {DEMO_FAIL_REASON}
                    </Text>
                    <Text size="xs" c="dimmed" mt={2}>
                      原 ticket 將以「請款失敗」狀態進入歷史任務
                    </Text>
                  </Stack>
                </Group>
              </Box>

              <Radio.Group
                value={retryChoice}
                onChange={(v) => setRetryChoice(v as RetryChoice)}
                label="後續處理"
                required
              >
                <Stack gap="xs" mt="xs">
                  <Radio
                    value="retry"
                    label="幾天後重新查詢"
                    description="系統將在指定天數後重新產生一張待查詢 ticket"
                  />
                  {retryChoice === 'retry' && (
                    <Box
                      pl="28px"
                      style={{
                        borderLeft: '2px solid #e9ecef',
                        marginLeft: 8,
                      }}
                    >
                      <Stack gap={4} mt="xs">
                        <NumberInput
                          label="X 天後重新產生待查詢 ticket"
                          value={retryDays}
                          onChange={setRetryDays}
                          min={1}
                          max={90}
                          required
                        />
                        {numericRetryDays >= 1 && (
                          <Text size="xs" c="dimmed">
                            預計於 {formatRetryDate(Math.floor(numericRetryDays))} 自動產生新 ticket
                          </Text>
                        )}
                      </Stack>
                    </Box>
                  )}
                  <Radio
                    value="no-retry"
                    label="不重新嘗試"
                    description="原 ticket 直接結案，不再追蹤"
                  />
                </Stack>
              </Radio.Group>
            </Stack>
          )}

          <Group justify="space-between" mt="md">
            <Button variant="subtle" onClick={() => setModalStep('input')}>
              返回修改
            </Button>
            <Group gap="xs">
              <Button variant="default" onClick={onClose}>
                取消
              </Button>
              <Button
                color={simulatedResult === 'success' ? 'teal' : 'red'}
                onClick={handleResultConfirm}
                disabled={!canCloseResult}
              >
                確認結案
              </Button>
            </Group>
          </Group>
        </Stack>
      )}
    </Modal>
  )
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
  onConfirm: () => void
}) {
  if (!ticket) return null

  const serviceMeta = SERVICE_META[ticket.serviceType]
  const isMixed = ticket.outcome === 'online-mixed'

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="md"
      centered
      title={
        <Box>
          <Text size="md" fw={600}>
            確認已代繳
          </Text>
          <Text size="xs" c="dimmed" mt={2}>
            {ticket.id} · {serviceMeta.label} · {ticket.userEmail}
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
          <Group gap="12px" wrap="wrap" align="center">
            <Box>
              <Text size="xs" c="dimmed" mb={2}>
                線上代繳金額
              </Text>
              <Text size="20px" fw={700} style={{ lineHeight: 1.2 }}>
                NT$ {(ticket.amount ?? 0).toLocaleString()}
              </Text>
            </Box>
            {isMixed && (
              <Badge size="sm" color="blue" variant="light">
                部分需臨櫃自繳
              </Badge>
            )}
          </Group>
        </Box>

        {isMixed && (
          <Text size="xs" c="dimmed">
            混合單僅就線上部分結案，臨櫃部分由用戶自行處理，後台不再追蹤金額。
          </Text>
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose}>
            取消
          </Button>
          <Button color="teal" onClick={onConfirm}>
            確認已代繳
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}

