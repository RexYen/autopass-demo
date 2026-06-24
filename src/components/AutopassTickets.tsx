import { useMemo, useState } from 'react'
import {
  Paper,
  Title,
  Group,
  Text,
  Box,
  TextInput,
  Select,
  MultiSelect,
  Pagination,
  Tabs,
  SimpleGrid,
  Stack,
  Button,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconSearch, IconFilter } from '@tabler/icons-react'
import { mockTickets } from '../data/autopassMock'
import {
  STATUS_META,
  SERVICE_QUERY_FIELDS,
  TERMINAL_STATUSES,
  type ServiceType,
  type Ticket,
  type TicketNote,
  type TicketStatus,
  type EmailLog,
  type InvoiceOrder,
} from '../types/autopass'
import { AutopassTicketDetail } from './AutopassTicketDetail'
import { TicketCard } from './TicketCard'
import { QueryResultModal, ConfirmPaidModal, AddNoteModal } from './TicketModals'

interface AutopassTicketsProps {
  mode?: 'current' | 'history'
}

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
  personalId: string
  corporateId: string
  birthDate: string
  vehicleType: string
  createdMonthStart: string // 'YYYY-MM' or '' (建立月份起)
  createdMonthEnd: string // 'YYYY-MM' or '' (建立月份迄)
}

const EMPTY_HISTORY_SEARCH: HistorySearchFields = {
  email: '',
  plateNumber: '',
  personalId: '',
  corporateId: '',
  birthDate: '',
  vehicleType: '',
  createdMonthStart: '',
  createdMonthEnd: '',
}

const HISTORY_VEHICLE_OPTIONS = ['汽車', '機車', '大型重型機車', '拖車']

export function AutopassTickets({
  mode = 'current',
}: AutopassTicketsProps) {
  const isHistory = mode === 'history'
  const [activeTab, setActiveTab] = useState<TabValue>('etc-toll')
  const [search, setSearch] = useState('')
  const [pendingSearch, setPendingSearch] = useState('')
  const [historySearch, setHistorySearch] = useState<HistorySearchFields>(EMPTY_HISTORY_SEARCH)
  const [pendingHistorySearch, setPendingHistorySearch] =
    useState<HistorySearchFields>(EMPTY_HISTORY_SEARCH)
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [pendingStatusFilter, setPendingStatusFilter] = useState<string[]>([])
  const [historyStatusFilters, setHistoryStatusFilters] = useState<string[]>([])
  const [pendingHistoryStatusFilters, setPendingHistoryStatusFilters] = useState<string[]>([])
  const [page, setPage] = useState(1)

  // demo 用 — 點 Modal 送出後本地端覆寫對應欄位，讓卡片狀態跟著流程走
  const [statusOverrides, setStatusOverrides] = useState<
    Record<string, Partial<Pick<Ticket, 'status' | 'amount' | 'outcome' | 'queryFailureReason'>>>
  >({})
  const [queryModalTicketId, setQueryModalTicketId] = useState<string | null>(null)
  const [confirmPaidTicketId, setConfirmPaidTicketId] = useState<string | null>(null)
  const [noteModalTicketId, setNoteModalTicketId] = useState<string | null>(null)
  const [detailTicketId, setDetailTicketId] = useState<string | null>(null)
  const [noteOverrides, setNoteOverrides] = useState<Record<string, TicketNote[]>>({})
  const [emailOverrides, setEmailOverrides] = useState<Record<string, EmailLog[]>>({})
  const [invoiceOverrides, setInvoiceOverrides] = useState<Record<string, InvoiceOrder[]>>({})

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

  const noteModalTicket = useMemo(
    () => (noteModalTicketId ? tickets.find((t) => t.id === noteModalTicketId) ?? null : null),
    [noteModalTicketId, tickets],
  )

  const handleQueryModalOpen = (ticketId: string) => setQueryModalTicketId(ticketId)
  const handleQueryModalClose = () => setQueryModalTicketId(null)
  const handleQueryResultSubmit = (
    result: Partial<Pick<Ticket, 'status' | 'amount' | 'outcome' | 'queryFailureReason'>>,
    opts?: {
      failedInvoice?: { amount: number; failReason: string }
      openConfirmPaidAfter?: boolean
    },
  ) => {
    if (!queryModalTicketId) return
    const ticketId = queryModalTicketId
    setStatusOverrides((prev) => ({
      ...prev,
      [ticketId]: result,
    }))
    if (opts?.failedInvoice) {
      const now = new Date()
      const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      setInvoiceOverrides((prev) => ({
        ...prev,
        [ticketId]: [
          ...(prev[ticketId] ?? []),
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
    if (opts?.openConfirmPaidAfter) {
      setConfirmPaidTicketId(ticketId)
    }
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

  const handleOpenNoteModal = (ticketId: string) => setNoteModalTicketId(ticketId)
  const handleCloseNoteModal = () => setNoteModalTicketId(null)

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

  const availableMonths = useMemo(() => {
    const set = new Set<string>()
    tabFiltered.forEach((t) => {
      const m = t.createdAt.slice(0, 7) // 'YYYY-MM'
      if (/^\d{4}-\d{2}$/.test(m)) set.add(m)
    })
    return Array.from(set)
      .sort((a, b) => (a < b ? 1 : -1)) // 最新月份在前
      .map((m) => ({ value: m, label: `${m.slice(0, 4)}/${m.slice(5, 7)}` }))
  }, [tabFiltered])

  const filtered = useMemo(() => {
    return tabFiltered.filter((t) => {
      if (isHistory) {
        if (historyStatusFilters.length > 0 && !historyStatusFilters.includes(t.status)) {
          return false
        }
      } else if (statusFilter.length > 0 && !statusFilter.includes(t.status)) {
        return false
      }
      if (isHistory) {
        const e = historySearch.email.trim().toLowerCase()
        if (e && !t.userEmail.toLowerCase().includes(e)) return false
        if (activeFieldSet.has('plateNumber')) {
          const p = historySearch.plateNumber.trim().toLowerCase()
          if (p && !t.plateNumber.toLowerCase().includes(p)) return false
        }
        if (activeFieldSet.has('idNumber')) {
          const personal = historySearch.personalId.trim().toLowerCase()
          if (personal) {
            if (t.driverInfo.ownerType !== '個人') return false
            if (!t.driverInfo.idNumber.toLowerCase().includes(personal)) return false
          }
          const corporate = historySearch.corporateId.trim().toLowerCase()
          if (corporate) {
            if (t.driverInfo.ownerType !== '法人') return false
            if (!t.driverInfo.idNumber.toLowerCase().includes(corporate)) return false
          }
        }
        if (activeFieldSet.has('birthDate')) {
          const bd = historySearch.birthDate.trim()
          if (bd && !(t.driverInfo.birthDate ?? '').includes(bd)) return false
        }
        if (activeFieldSet.has('vehicleType')) {
          const vt = historySearch.vehicleType.trim()
          if (vt && t.driverInfo.vehicleType !== vt) return false
        }
        const ms = historySearch.createdMonthStart.trim()
        const me = historySearch.createdMonthEnd.trim()
        if (ms || me) {
          const m = t.createdAt.slice(0, 7)
          if (ms && m < ms) return false
          if (me && m > me) return false
        }
        return true
      }
      const kw = search.trim().toLowerCase()
      if (!kw) return true
      return ticketSearchValues(t).some((v) => v.toLowerCase().includes(kw))
    })
  }, [
    tabFiltered,
    search,
    historySearch,
    statusFilter,
    historyStatusFilters,
    isHistory,
    activeFieldSet,
  ])

  // Placeholder 依 active tab 顯示欄位（聯集，因 tab 可能合併個人 / 法人）
  const searchPlaceholder = useMemo(() => {
    const fieldSet = new Set<string>()
    TAB_TYPES[activeTab].forEach((type) => {
      SERVICE_QUERY_FIELDS[type].forEach((f) => fieldSet.add(f))
    })
    const labels: string[] = ['Email']
    if (fieldSet.has('plateNumber')) labels.push('車牌')
    if (fieldSet.has('idNumber')) labels.push('證件號碼／統編')
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

  const handleResetFilters = () => {
    setSearch('')
    setPendingSearch('')
    setHistorySearch(EMPTY_HISTORY_SEARCH)
    setPendingHistorySearch(EMPTY_HISTORY_SEARCH)
    setStatusFilter([])
    setPendingStatusFilter([])
    setHistoryStatusFilters([])
    setPendingHistoryStatusFilters([])
    setPage(1)
  }
  const handleHistorySearchSubmit = () => {
    setHistorySearch(pendingHistorySearch)
    setHistoryStatusFilters(pendingHistoryStatusFilters)
    setPage(1)
  }
  const handleCurrentSearchSubmit = () => {
    setSearch(pendingSearch)
    setStatusFilter(pendingStatusFilter)
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
        {isHistory ? (
          <HistorySearchInputs
            activeTab={activeTab}
            pending={pendingHistorySearch}
            onChangePending={setPendingHistorySearch}
            onSubmit={handleHistorySearchSubmit}
            onReset={handleResetFilters}
            pendingStatusFilters={pendingHistoryStatusFilters}
            onPendingStatusFiltersChange={setPendingHistoryStatusFilters}
            statusOptions={statusOptions}
            monthOptions={availableMonths}
          />
        ) : (
          <Box
            component="form"
            onSubmit={(e: React.FormEvent) => {
              e.preventDefault()
              handleCurrentSearchSubmit()
            }}
          >
            <Group gap="12px" align="flex-end" wrap="wrap">
              <TextInput
                placeholder={searchPlaceholder}
                leftSection={<IconSearch size={16} />}
                value={pendingSearch}
                onChange={(e) => setPendingSearch(e.currentTarget.value)}
                style={{ flex: '1 1 auto', minWidth: 240 }}
                styles={{
                  input: {
                    borderRadius: 4,
                    height: 40,
                    fontSize: 14,
                  },
                }}
              />
              <MultiSelect
                placeholder={pendingStatusFilter.length === 0 ? '所有狀態' : undefined}
                data={statusOptions}
                value={pendingStatusFilter}
                onChange={setPendingStatusFilter}
                clearable
                leftSection={<IconFilter size={14} />}
                style={{ flex: '0 1 400px', minWidth: 220 }}
                styles={{
                  input: {
                    minHeight: 40,
                    display: 'flex',
                    alignItems: 'center',
                  },
                }}
              />
              <Button type="button" variant="default" onClick={handleResetFilters} h={40}>
                重設
              </Button>
              <Button type="submit" leftSection={<IconSearch size={14} />} h={40}>
                搜尋
              </Button>
            </Group>
          </Box>
        )}
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
                onAddNote={handleOpenNoteModal}
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

      <AddNoteModal
        ticket={noteModalTicket}
        opened={!!noteModalTicket}
        onClose={handleCloseNoteModal}
        onSubmit={handleAddNote}
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
  pending,
  onChangePending,
  onSubmit,
  onReset,
  pendingStatusFilters,
  onPendingStatusFiltersChange,
  statusOptions,
  monthOptions,
}: {
  activeTab: TabValue
  pending: HistorySearchFields
  onChangePending: (next: HistorySearchFields) => void
  onSubmit: () => void
  onReset: () => void
  pendingStatusFilters: string[]
  onPendingStatusFiltersChange: (v: string[]) => void
  statusOptions: { value: string; label: string }[]
  monthOptions: { value: string; label: string }[]
}) {
  const fieldSet = new Set<string>()
  TAB_TYPES[activeTab].forEach((type) => {
    SERVICE_QUERY_FIELDS[type].forEach((f) => fieldSet.add(f))
  })

  const inputStyles = { input: { height: 40, borderRadius: 4, fontSize: 14 } }
  const fieldStyle = { flex: '1 1 0', minWidth: 140 }
  const setField = (key: keyof HistorySearchFields, v: string) =>
    onChangePending({ ...pending, [key]: v })

  return (
    <Box
      component="form"
      onSubmit={(e: React.FormEvent) => {
        e.preventDefault()
        onSubmit()
      }}
      p="12px 16px"
      style={{
        backgroundColor: '#f8f9fa',
        borderRadius: 10,
        border: '1px solid #e9ecef',
      }}
    >
      <Stack gap="10px">
        {/* Row 1: 人/車基本資料 */}
        <Group gap="10px" wrap="wrap" align="flex-end">
          <TextInput
            placeholder="Email"
            leftSection={<IconSearch size={14} />}
            value={pending.email}
            onChange={(e) => setField('email', e.currentTarget.value)}
            style={fieldStyle}
            styles={inputStyles}
          />
          {fieldSet.has('plateNumber') && (
            <TextInput
              placeholder="車牌"
              value={pending.plateNumber}
              onChange={(e) => setField('plateNumber', e.currentTarget.value)}
              style={fieldStyle}
              styles={inputStyles}
            />
          )}
          {fieldSet.has('idNumber') && (
            <>
              <TextInput
                placeholder="證件號碼"
                value={pending.personalId}
                onChange={(e) => setField('personalId', e.currentTarget.value)}
                style={fieldStyle}
                styles={inputStyles}
              />
              <TextInput
                placeholder="統一編號"
                value={pending.corporateId}
                onChange={(e) => setField('corporateId', e.currentTarget.value)}
                style={fieldStyle}
                styles={inputStyles}
              />
            </>
          )}
          <Group gap="6px" wrap="nowrap" align="center">
            <Select
              placeholder="起始月份"
              data={monthOptions}
              value={pending.createdMonthStart || null}
              onChange={(v) => setField('createdMonthStart', v ?? '')}
              clearable
              style={{ width: 130 }}
              styles={inputStyles}
            />
            <Text size="sm" c="dimmed">
              ~
            </Text>
            <Select
              placeholder="結束月份"
              data={monthOptions}
              value={pending.createdMonthEnd || null}
              onChange={(v) => setField('createdMonthEnd', v ?? '')}
              clearable
              style={{ width: 130 }}
              styles={inputStyles}
            />
          </Group>
        </Group>

        {/* Row 2: 補充欄位 + 狀態 + 動作 */}
        <Group gap="10px" wrap="wrap" align="flex-end">
          {fieldSet.has('birthDate') && (
            <TextInput
              placeholder="出生年月日"
              value={pending.birthDate}
              onChange={(e) => setField('birthDate', e.currentTarget.value)}
              style={fieldStyle}
              styles={inputStyles}
            />
          )}
          {fieldSet.has('vehicleType') && (
            <Select
              placeholder="車種"
              data={HISTORY_VEHICLE_OPTIONS}
              value={pending.vehicleType || null}
              onChange={(v) => setField('vehicleType', v ?? '')}
              clearable
              style={{ flex: '0 1 140px', minWidth: 120 }}
              styles={inputStyles}
            />
          )}
          <MultiSelect
            placeholder={pendingStatusFilters.length === 0 ? '所有狀態' : undefined}
            data={statusOptions}
            value={pendingStatusFilters}
            onChange={onPendingStatusFiltersChange}
            clearable
            leftSection={<IconFilter size={14} />}
            style={{ flex: '0 1 400px', minWidth: 220 }}
            styles={{
              input: {
                minHeight: 40,
                display: 'flex',
                alignItems: 'center',
              },
            }}
          />
          <Group gap="8px" ml="auto" wrap="nowrap">
            <Button type="button" variant="default" onClick={onReset} h={40}>
              重設
            </Button>
            <Button type="submit" leftSection={<IconSearch size={14} />} h={40}>
              搜尋
            </Button>
          </Group>
        </Group>
      </Stack>
    </Box>
  )
}


