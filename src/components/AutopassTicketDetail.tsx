import { useState } from 'react'
import {
  Paper,
  Title,
  Group,
  Stack,
  Text,
  Box,
  Button,
  Badge,
  Card,
  Textarea,
  Timeline,
  ActionIcon,
  SimpleGrid,
  Tooltip,
  Alert,
  Tabs,
  Drawer,
  Image,
  Modal,
} from '@mantine/core'
import {
  IconMessageDots,
  IconMail,
  IconCircleCheck,
  IconCircleX,
  IconCircleDot,
  IconCheck,
  IconExternalLink,
  IconX,
  IconAlertTriangle,
  IconChevronLeft,
  IconChevronRight,
  IconPhoto,
  IconActivity,
  IconCirclePlus,
  IconClipboardCheck,
} from '@tabler/icons-react'
import {
  STATUS_META,
  SERVICE_META,
  SERVICE_QUERY_FIELDS,
  OUTCOME_META,
  type Ticket,
  type TicketStatus,
  type TicketOutcomeKind,
  type InvoiceOrder,
} from '../types/autopass'
import { maskDate } from '../utils/mask'

const cardShadow =
  '0px 7px 7px -5px rgba(0,0,0,0.04), 0px 10px 15px -5px rgba(0,0,0,0.1), 0px 1px 3px 0px rgba(0,0,0,0.05)'

const monoStyle = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  letterSpacing: '0.5px',
}

interface AutopassTicketDetailProps {
  ticket: Ticket | null
  opened: boolean
  onClose: () => void
  onPrev?: () => void
  onNext?: () => void
  position?: { current: number; total: number }
  onAddNote: (ticketId: string, content: string) => void
}

export function AutopassTicketDetail({
  ticket,
  opened,
  onClose,
  onPrev,
  onNext,
  position,
  onAddNote,
}: AutopassTicketDetailProps) {
  const [newNote, setNewNote] = useState('')

  const handleAddNote = () => {
    if (!ticket) return
    const content = newNote.trim()
    if (!content) return
    onAddNote(ticket.id, content)
    setNewNote('')
  }

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size={720}
      withCloseButton={false}
      padding={0}
      styles={{
        body: {
          padding: 0,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#f8f9fa',
        },
        content: { display: 'flex', flexDirection: 'column' },
      }}
    >
      {ticket && (
        <DetailContent
          ticket={ticket}
          onClose={onClose}
          onPrev={onPrev}
          onNext={onNext}
          position={position}
          newNote={newNote}
          onNewNoteChange={setNewNote}
          onAddNote={handleAddNote}
        />
      )}
    </Drawer>
  )
}

function DetailContent({
  ticket,
  onClose,
  onPrev,
  onNext,
  position,
  newNote,
  onNewNoteChange,
  onAddNote,
}: {
  ticket: Ticket
  onClose: () => void
  onPrev?: () => void
  onNext?: () => void
  position?: { current: number; total: number }
  newNote: string
  onNewNoteChange: (v: string) => void
  onAddNote: () => void
}) {
  const statusMeta = STATUS_META[ticket.status]
  const serviceMeta = SERVICE_META[ticket.serviceType]
  const queryFields = SERVICE_QUERY_FIELDS[ticket.serviceType]
  const failReason = getFailReason(ticket)
  const proofs = ticket.paymentProofs ?? []
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)

  return (
    <>
      {/* Drawer header */}
      <Group
        justify="space-between"
        px="20px"
        py="12px"
        style={{
          borderBottom: '1px solid #f1f3f5',
          position: 'sticky',
          top: 0,
          backgroundColor: '#fff',
          zIndex: 10,
        }}
      >
        <ActionIcon variant="subtle" color="gray" size="md" onClick={onClose} aria-label="關閉">
          <IconX size={18} />
        </ActionIcon>
        <Group gap="6px" wrap="nowrap">
          {position && (
            <Text size="xs" c="dimmed" mr="4px">
              {position.current} / {position.total}
            </Text>
          )}
          <Tooltip label="上一張" withArrow disabled={!onPrev}>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="md"
              onClick={onPrev}
              disabled={!onPrev}
              aria-label="上一張"
            >
              <IconChevronLeft size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="下一張" withArrow disabled={!onNext}>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="md"
              onClick={onNext}
              disabled={!onNext}
              aria-label="下一張"
            >
              <IconChevronRight size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      {/* Body */}
      <Box style={{ flex: 1, overflowY: 'auto' }}>
        <Stack gap="14px" p="20px">
          {/* Hero：服務 + 狀態 + identity + 金額 + Stepper 合一 */}
          <Paper shadow={cardShadow} radius="12px" p="20px">
            {/* Row 1：title + status + platform */}
            <Group justify="space-between" align="center" wrap="wrap" gap="10px">
              <Group gap="10px" align="center" wrap="wrap">
                <Title
                  order={3}
                  style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    fontFamily: 'Noto Sans TC, sans-serif',
                    color: '#000',
                    lineHeight: 1.2,
                  }}
                >
                  {serviceMeta.label}
                </Title>
                <Badge
                  variant="light"
                  size="md"
                  styles={{
                    root: {
                      backgroundColor: statusMeta.bg,
                      color: statusMeta.color,
                      border: 'none',
                      fontWeight: 600,
                    },
                  }}
                >
                  {statusMeta.label}
                </Badge>
              </Group>
              <Group gap="4px" wrap="nowrap">
                <Text
                  component="a"
                  href={serviceMeta.platformUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="sm"
                  fw={500}
                  c="blue"
                  style={{ textDecoration: 'none', ...monoStyle }}
                >
                  {ticket.id}
                </Text>
                <IconExternalLink size={12} color="#228be6" />
              </Group>
            </Group>

            {/* Row 2：identity（與列表卡片同步顯示的欄位） */}
            <Group gap="8px" mt="10px" wrap="wrap" align="center">
              <Text size="sm" fw={600} c="dark.8">
                {ticket.userName}
              </Text>
              {queryFields.includes('plateNumber') && (
                <>
                  <IdentityDot />
                  <Text size="sm" fw={600} c="dark.8" style={monoStyle}>
                    {ticket.plateNumber}
                  </Text>
                </>
              )}
              {queryFields.includes('idNumber') && (
                <>
                  <IdentityDot />
                  <Text size="sm" fw={600} c="dark.8" style={monoStyle}>
                    {ticket.driverInfo.idNumber}
                  </Text>
                </>
              )}
              {queryFields.includes('birthDate') && ticket.driverInfo.birthDate && (
                <>
                  <IdentityDot />
                  <Text size="sm" fw={600} c="dark.8" style={monoStyle}>
                    {maskDate(ticket.driverInfo.birthDate)}
                  </Text>
                </>
              )}
              {queryFields.includes('vehicleType') && (
                <>
                  <IdentityDot />
                  <Text size="sm" fw={500} c="dark.8">
                    {ticket.driverInfo.vehicleType}
                  </Text>
                </>
              )}
            </Group>

            {/* Row 3：Stepper */}
            <Box mt="18px">
              <FlowStepper status={ticket.status} />
            </Box>
          </Paper>

          {/* failReason banner */}
          {failReason && (
            <Alert
              icon={<IconAlertTriangle size={18} />}
              color="red"
              radius="12px"
              styles={{
                root: { backgroundColor: '#fff5f5', border: '1px solid #ffc9c9', padding: '12px 16px' },
                title: { fontWeight: 600, marginBottom: 4 },
                message: { fontSize: 13, color: '#862e2e' },
              }}
              title={ticket.status === 'query-failed' ? '查詢失敗原因' : '請款失敗原因'}
            >
              {failReason}
            </Alert>
          )}

          {/* Tabs：歷程 */}
          <Paper
            shadow={cardShadow}
            radius="12px"
            style={{ overflow: 'hidden' }}
          >
            <Tabs
              defaultValue="activity"
              styles={{
                list: { borderBottom: '1px solid #e9ecef', paddingLeft: 12, paddingRight: 12 },
                tab: {
                  fontSize: 14,
                  fontWeight: 500,
                  fontFamily: 'Noto Sans TC, sans-serif',
                  padding: '12px 14px',
                },
              }}
            >
              <Tabs.List>
                <Tabs.Tab value="activity" leftSection={<IconActivity size={14} />}>
                  Activity
                </Tabs.Tab>
                <Tabs.Tab value="proofs" leftSection={<IconPhoto size={14} />}>
                  繳費證明
                  {proofs.length > 0 && (
                    <Text component="span" size="xs" c="dimmed" ml="6px">
                      {proofs.length}
                    </Text>
                  )}
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="activity" p="16px">
                <ActivityPanel
                  ticket={ticket}
                  newNote={newNote}
                  onNewNoteChange={onNewNoteChange}
                  onAddNote={onAddNote}
                />
              </Tabs.Panel>

              <Tabs.Panel value="proofs" p="16px">
                {proofs.length === 0 ? (
                  <Box
                    py="32px"
                    style={{
                      textAlign: 'center',
                      border: '1px dashed #dee2e6',
                      borderRadius: 8,
                      backgroundColor: '#fafbfc',
                    }}
                  >
                    <IconPhoto size={28} color="#adb5bd" />
                    <Text size="sm" c="dimmed" mt="6px">
                      尚未上傳繳費證明
                    </Text>
                    <Text size="xs" c="dimmed" mt="4px">
                      營運人員代繳完成後，請於「確認已代繳」彈窗上傳截圖
                    </Text>
                  </Box>
                ) : (
                  <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="10px">
                    {proofs.map((src, i) => (
                      <Box
                        key={`${src.slice(0, 32)}-${i}`}
                        onClick={() => setLightboxSrc(src)}
                        style={{
                          position: 'relative',
                          borderRadius: 8,
                          overflow: 'hidden',
                          border: '1px solid #e9ecef',
                          aspectRatio: '4 / 3',
                          cursor: 'zoom-in',
                          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)'
                          ;(e.currentTarget as HTMLDivElement).style.boxShadow =
                            '0 4px 12px rgba(0,0,0,0.08)'
                        }}
                        onMouseLeave={(e) => {
                          ;(e.currentTarget as HTMLDivElement).style.transform = ''
                          ;(e.currentTarget as HTMLDivElement).style.boxShadow = ''
                        }}
                      >
                        <Image src={src} alt={`繳費證明 ${i + 1}`} h="100%" fit="cover" />
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
                            backgroundColor: 'rgba(0,0,0,0.6)',
                          }}
                        >
                          {i + 1} / {proofs.length}
                        </Text>
                      </Box>
                    ))}
                  </SimpleGrid>
                )}
              </Tabs.Panel>
            </Tabs>
          </Paper>
        </Stack>
      </Box>

      {/* Lightbox */}
      <Modal
        opened={!!lightboxSrc}
        onClose={() => setLightboxSrc(null)}
        size="xl"
        centered
        padding={0}
        withCloseButton={false}
        styles={{
          body: { padding: 0, backgroundColor: '#000' },
          content: { backgroundColor: '#000' },
        }}
      >
        {lightboxSrc && (
          <Box style={{ position: 'relative' }}>
            <Image
              src={lightboxSrc}
              alt="繳費證明"
              fit="contain"
              style={{ maxHeight: '85vh' }}
            />
            <ActionIcon
              variant="filled"
              color="dark"
              size="lg"
              onClick={() => setLightboxSrc(null)}
              aria-label="關閉"
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'rgba(0,0,0,0.65)',
              }}
            >
              <IconX size={18} />
            </ActionIcon>
          </Box>
        )}
      </Modal>
    </>
  )
}

// =====================================================
// Sub-components
// =====================================================

function IdentityDot() {
  return (
    <Text size="sm" c="gray.5">
      ·
    </Text>
  )
}

// =====================================================
// Activity（ClickUp 風格的歷程聚合）
// =====================================================

type ActivityEvent =
  | { id: string; kind: 'created'; at: string; serviceLabel: string; cycle: string }
  | {
      id: string
      kind: 'query-result'
      at: string
      finalStatus: TicketStatus
      outcome?: TicketOutcomeKind
      amount: number | null
    }
  | {
      id: string
      kind: 'invoice'
      at: string
      invoiceId: string
      status: InvoiceOrder['status']
      amount: number
      failReason?: string
      note?: string
    }
  | { id: string; kind: 'note'; at: string; author: string; content: string }
  | {
      id: string
      kind: 'email'
      at: string
      subject: string
      template: string
      triggerStatus: TicketStatus | 'service-activated'
      status: 'sent' | 'failed'
    }

function buildActivities(ticket: Ticket): ActivityEvent[] {
  const events: ActivityEvent[] = [
    {
      id: `${ticket.id}-created`,
      kind: 'created',
      at: ticket.createdAt,
      serviceLabel: SERVICE_META[ticket.serviceType].label,
      cycle: ticket.cycle,
    },
  ]

  // 合成「回填查詢結果」事件 — pending-query 以外，都視為已被營運人員回填過
  if (ticket.status !== 'pending-query') {
    events.push({
      id: `${ticket.id}-query-result`,
      kind: 'query-result',
      at: inferQueryResultTime(ticket),
      finalStatus: ticket.status,
      outcome: ticket.outcome,
      amount: ticket.amount,
    })
  }

  ticket.invoiceOrders.forEach((inv) => {
    events.push({
      id: inv.id,
      kind: 'invoice',
      at: inv.createdAt,
      invoiceId: inv.id,
      status: inv.status,
      amount: inv.amount,
      failReason: inv.failReason,
      note: inv.note,
    })
  })

  ticket.notes.forEach((n) => {
    events.push({
      id: n.id,
      kind: 'note',
      at: n.createdAt,
      author: n.author,
      content: n.content,
    })
  })

  ticket.emailLogs.forEach((e) => {
    events.push({
      id: e.id,
      kind: 'email',
      at: e.sentAt,
      subject: e.subject,
      template: e.template,
      triggerStatus: e.triggerStatus,
      status: e.status,
    })
  })

  // 由新到舊
  events.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0))
  return events
}

function inferQueryResultTime(ticket: Ticket): string {
  const candidates: string[] = []
  if (ticket.invoiceOrders[0]) candidates.push(ticket.invoiceOrders[0].createdAt)
  if (ticket.emailLogs[0]) candidates.push(ticket.emailLogs[0].sentAt)
  if (candidates.length === 0) return ticket.updatedAt
  candidates.sort()
  return shiftMinutes(candidates[0], -1)
}

// 簡易時戳位移；只在跨日時退而求其次回原值
function shiftMinutes(stamp: string, delta: number): string {
  const [date, time] = stamp.split(' ')
  if (!time) return stamp
  const [hh, mm] = time.split(':').map(Number)
  const total = hh * 60 + mm + delta
  if (total < 0 || total >= 24 * 60) return stamp
  const newHh = Math.floor(total / 60)
  const newMm = total % 60
  return `${date} ${String(newHh).padStart(2, '0')}:${String(newMm).padStart(2, '0')}`
}

function queryResultLabel(ev: Extract<ActivityEvent, { kind: 'query-result' }>): string {
  if (ev.outcome) return OUTCOME_META[ev.outcome].label
  if (ev.finalStatus === 'query-failed') return '查詢失敗'
  return '回填查詢結果'
}

function ActivityPanel({
  ticket,
  newNote,
  onNewNoteChange,
  onAddNote,
}: {
  ticket: Ticket
  newNote: string
  onNewNoteChange: (v: string) => void
  onAddNote: () => void
}) {
  const events = buildActivities(ticket)

  return (
    <Stack gap="14px">
      {/* Comment input */}
      <Box style={{ position: 'relative' }}>
        <Textarea
          placeholder="填寫備註..."
          value={newNote}
          onChange={(e) => onNewNoteChange(e.currentTarget.value)}
          autosize
          minRows={2}
          maxRows={6}
          styles={{
            input: {
              padding: '8px 12px',
              paddingBottom: 36,
              fontSize: 14,
              lineHeight: 1.5,
            },
          }}
        />
        <Button
          onClick={onAddNote}
          disabled={!newNote.trim()}
          size="xs"
          style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
          }}
        >
          送出
        </Button>
      </Box>

      <Timeline bulletSize={26} lineWidth={2}>
        {events.map((ev) => (
          <Timeline.Item
            key={ev.id}
            bullet={renderActivityBullet(ev)}
            color={activityColor(ev)}
          >
            <ActivityRow ev={ev} />
          </Timeline.Item>
        ))}
      </Timeline>
    </Stack>
  )
}

function renderActivityBullet(ev: ActivityEvent): React.ReactNode {
  switch (ev.kind) {
    case 'created':
      return <IconCirclePlus size={14} />
    case 'query-result':
      return <IconClipboardCheck size={14} />
    case 'invoice':
      if (ev.status === 'success') return <IconCircleCheck size={14} />
      if (ev.status === 'failed') return <IconCircleX size={14} />
      return <IconCircleDot size={14} />
    case 'note':
      return <IconMessageDots size={14} />
    case 'email':
      return <IconMail size={14} />
  }
}

function activityColor(ev: ActivityEvent): string {
  switch (ev.kind) {
    case 'created':
      return 'gray'
    case 'query-result':
      return ev.finalStatus === 'query-failed' ? 'red' : 'blue'
    case 'invoice':
      return ev.status === 'success' ? 'teal' : ev.status === 'failed' ? 'red' : 'yellow'
    case 'note':
      return 'gray'
    case 'email':
      return ev.status === 'sent' ? 'blue' : 'red'
  }
}

function ActivityRow({ ev }: { ev: ActivityEvent }) {
  switch (ev.kind) {
    case 'created':
      return (
        <ActivityBody
          actor="系統"
          action="建立工單"
          detail={`${ev.serviceLabel} · ${ev.cycle}`}
          at={ev.at}
        />
      )
    case 'query-result':
      return (
        <ActivityBody
          actor="客服"
          action="回填查詢結果"
          detail={
            <Group gap="6px" wrap="wrap" align="center">
              <Text size="sm" fw={600} c="dark.8">
                {queryResultLabel(ev)}
              </Text>
              {ev.amount !== null && ev.amount > 0 && (
                <Text size="xs" c="dimmed">
                  · 線上金額 NT$ {ev.amount.toLocaleString()}
                </Text>
              )}
            </Group>
          }
          at={ev.at}
        />
      )
    case 'invoice': {
      const verb =
        ev.status === 'success'
          ? '請款成功'
          : ev.status === 'failed'
            ? '請款失敗'
            : '發起請款'
      return (
        <ActivityBody
          actor="系統"
          action={verb}
          at={ev.at}
          detail={
            <Card withBorder p="12px" radius="8px" mt="6px">
              <Group justify="space-between" wrap="nowrap" align="center">
                <Group gap="8px" wrap="wrap">
                  <Text size="sm" fw={600} c="blue" style={monoStyle}>
                    {ev.invoiceId}
                  </Text>
                  <Badge
                    variant="light"
                    size="sm"
                    color={invoiceColor(ev.status)}
                    styles={{ root: { fontWeight: 500, border: 'none' } }}
                  >
                    {invoiceLabel(ev.status)}
                  </Badge>
                </Group>
                <Text fw={700} size="md">
                  NT$ {ev.amount.toLocaleString()}
                </Text>
              </Group>
              {(ev.note || ev.failReason) && (
                <Box mt="6px">
                  {ev.note && (
                    <Text size="xs" c="dimmed">
                      {ev.note}
                    </Text>
                  )}
                  {ev.failReason && (
                    <Text size="xs" c="red.6" mt="2px">
                      失敗原因：{ev.failReason}
                    </Text>
                  )}
                </Box>
              )}
            </Card>
          }
        />
      )
    }
    case 'note':
      return (
        <ActivityBody
          actor={ev.author}
          action="加備註"
          at={ev.at}
          detail={
            <Box
              mt="6px"
              p="10px 12px"
              style={{ backgroundColor: '#f8f9fa', borderRadius: 8 }}
            >
              <Text size="sm" c="dark.7" style={{ whiteSpace: 'pre-wrap' }}>
                {ev.content}
              </Text>
            </Box>
          }
        />
      )
    case 'email':
      return (
        <ActivityBody
          actor="系統"
          action={ev.status === 'sent' ? '寄送通知信' : '通知信寄送失敗'}
          at={ev.at}
          detail={
            <Stack gap={2}>
              <Text size="sm" fw={600} c="dark.8">
                {ev.subject}
              </Text>
              <Text size="xs" c="dimmed">
                模板 {ev.template} · 觸發於〈{statusLabel(ev.triggerStatus)}〉
              </Text>
            </Stack>
          }
        />
      )
  }
}

function ActivityBody({
  actor,
  action,
  detail,
  at,
}: {
  actor: string
  action: string
  detail?: React.ReactNode
  at: string
}) {
  return (
    <Box>
      <Group gap="6px" wrap="wrap" align="baseline">
        <Text size="sm" fw={600} c="dark.8">
          {actor}
        </Text>
        <Text size="sm" c="dimmed">
          {action}
        </Text>
        <Text size="xs" c="gray.5" ml="auto">
          {at}
        </Text>
      </Group>
      {detail && <Box mt="2px">{typeof detail === 'string' ? <Text size="sm" c="dark.7">{detail}</Text> : detail}</Box>}
    </Box>
  )
}

// =====================================================
// Helpers
// =====================================================

function invoiceLabel(s: InvoiceOrder['status']): string {
  return s === 'pending' ? '請款中' : s === 'success' ? '請款成功' : '請款失敗'
}
function invoiceColor(s: InvoiceOrder['status']) {
  return s === 'pending' ? 'yellow' : s === 'success' ? 'teal' : 'red'
}

function statusLabel(s: TicketStatus | 'service-activated'): string {
  if (s === 'service-activated') return '啟用服務'
  return STATUS_META[s].label
}

// =====================================================
// 流程訊號
// =====================================================

type StepStatus = 'done' | 'current' | 'error' | 'pending' | 'skipped'

const FLOW_STEPS: { key: string; label: string }[] = [
  { key: 'query', label: '查詢' },
  { key: 'invoice', label: '請款' },
  { key: 'remit', label: '代繳' },
  { key: 'closed', label: '結案' },
]

function getStepStatuses(status: TicketStatus): StepStatus[] {
  switch (status) {
    case 'pending-query':
      return ['current', 'pending', 'pending', 'pending']
    case 'query-failed':
      return ['error', 'pending', 'pending', 'pending']
    case 'no-fee':
      return ['done', 'skipped', 'skipped', 'done']
    case 'invoice-failed':
      return ['done', 'error', 'pending', 'pending']
    case 'invoice-success':
      return ['done', 'done', 'current', 'pending']
    case 'paid':
      return ['done', 'done', 'done', 'done']
    case 'unable-to-close':
      return ['done', 'done', 'done', 'error']
  }
}

function FlowStepper({ status }: { status: TicketStatus }) {
  const statuses = getStepStatuses(status)

  const nodes: React.ReactNode[] = []
  FLOW_STEPS.forEach((step, i) => {
    nodes.push(<StepNode key={`s-${step.key}`} status={statuses[i]} label={step.label} />)
    if (i < FLOW_STEPS.length - 1) {
      const prev = statuses[i]
      const next = statuses[i + 1]
      const active = prev === 'done' && (next === 'done' || next === 'current')
      const dashed = prev === 'skipped' || next === 'skipped'
      nodes.push(<StepConnector key={`c-${step.key}`} active={active} dashed={dashed} />)
    }
  })

  return (
    <Group gap={0} align="flex-start" wrap="nowrap" style={{ width: '100%' }}>
      {nodes}
    </Group>
  )
}

function StepNode({ status, label }: { status: StepStatus; label: string }) {
  const styleMap: Record<
    StepStatus,
    { bg: string; border: string; iconColor: string; labelColor: string; bold: boolean }
  > = {
    done: { bg: '#0b7c4d', border: '#0b7c4d', iconColor: '#fff', labelColor: '#0b7c4d', bold: false },
    current: { bg: '#1971c2', border: '#1971c2', iconColor: '#fff', labelColor: '#1971c2', bold: true },
    error: { bg: '#c92a2a', border: '#c92a2a', iconColor: '#fff', labelColor: '#c92a2a', bold: true },
    pending: { bg: '#fff', border: '#dee2e6', iconColor: '#adb5bd', labelColor: '#868e96', bold: false },
    skipped: { bg: '#fff', border: '#dee2e6', iconColor: '#adb5bd', labelColor: '#adb5bd', bold: false },
  }
  const s = styleMap[status]

  return (
    <Stack gap={6} align="center" style={{ width: 80, flexShrink: 0 }}>
      <Box
        style={{
          width: 26,
          height: 26,
          borderRadius: '50%',
          backgroundColor: s.bg,
          border: `2px solid ${s.border}`,
          color: s.iconColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {status === 'done' && <IconCheck size={14} stroke={3} />}
        {status === 'current' && (
          <Box style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#fff' }} />
        )}
        {status === 'error' && <IconX size={14} stroke={3} />}
        {status === 'pending' && (
          <Box style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#adb5bd' }} />
        )}
        {status === 'skipped' && (
          <Text size="xs" fw={600} c="gray.5" style={{ lineHeight: 1 }}>
            —
          </Text>
        )}
      </Box>
      <Text size="xs" fw={s.bold ? 600 : 400} style={{ color: s.labelColor }}>
        {label}
      </Text>
    </Stack>
  )
}

function StepConnector({ active, dashed }: { active: boolean; dashed: boolean }) {
  return (
    <Box
      style={{
        flex: 1,
        height: dashed ? 0 : 2,
        borderTop: dashed ? '2px dashed #dee2e6' : 'none',
        backgroundColor: dashed ? 'transparent' : active ? '#0b7c4d' : '#dee2e6',
        marginTop: 12,
        minWidth: 24,
      }}
    />
  )
}

function getFailReason(ticket: Ticket): string | null {
  if (ticket.status === 'invoice-failed') {
    const failed = [...ticket.invoiceOrders].reverse().find((i) => i.status === 'failed')
    return failed?.failReason ?? '系統未回傳具體失敗原因，請查訂單歷程'
  }
  if (ticket.status === 'query-failed') {
    return ticket.notes[0]?.content ?? '需人工排查車籍／資料比對'
  }
  return null
}

