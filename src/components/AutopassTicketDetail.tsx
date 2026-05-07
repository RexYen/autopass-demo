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
  CopyButton,
  Tooltip,
  Alert,
  Tabs,
  Drawer,
  Image,
  Modal,
} from '@mantine/core'
import {
  IconUser,
  IconCar,
  IconReceipt,
  IconMessageDots,
  IconMail,
  IconCircleCheck,
  IconCircleX,
  IconCircleDot,
  IconCopy,
  IconCheck,
  IconExternalLink,
  IconCreditCard,
  IconCalendar,
  IconX,
  IconHourglass,
  IconAlertTriangle,
  IconChevronLeft,
  IconChevronRight,
  IconPhoto,
} from '@tabler/icons-react'
import {
  STATUS_META,
  SERVICE_META,
  SERVICE_QUERY_FIELDS,
  type Ticket,
  type TicketStatus,
  type InvoiceOrder,
} from '../types/autopass'
import { maskDate } from '../utils/mask'

const cardShadow =
  '0px 7px 7px -5px rgba(0,0,0,0.04), 0px 10px 15px -5px rgba(0,0,0,0.1), 0px 1px 3px 0px rgba(0,0,0,0.05)'

// demo 用：mock 資料停在 2026-05-04~06，將「現在」鎖在 2026-05-07 以呈現合理的停留天數
const DEMO_NOW = new Date('2026-05-07T12:00:00')

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
        body: { padding: 0, height: '100%' },
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
  const idLabel = ticket.driverInfo.ownerType === '法人' ? '法人統一編號' : '身分證字號'
  const aging = getAging(ticket.updatedAt)
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
        <Group gap="8px" wrap="nowrap">
          <ActionIcon variant="subtle" color="gray" size="md" onClick={onClose} aria-label="關閉">
            <IconX size={18} />
          </ActionIcon>
          <Text size="xs" c="dimmed" fw={500}>
            {ticket.id}
          </Text>
        </Group>
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
      <Box style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
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
                  style={{ textDecoration: 'none' }}
                >
                  {serviceMeta.platform}
                </Text>
                <IconExternalLink size={12} color="#228be6" />
              </Group>
            </Group>

            {/* Row 2：identity + aging */}
            <Group gap="8px" mt="10px" wrap="wrap" align="center">
              <Text size="sm" fw={600} c="dark.8">
                {ticket.userName}
              </Text>
              <Text size="sm" c="gray.5">
                ·
              </Text>
              <Text
                size="sm"
                fw={600}
                c="dark.8"
                style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', letterSpacing: '0.5px' }}
              >
                {ticket.plateNumber}
              </Text>
              <Text size="sm" c="gray.5">
                ·
              </Text>
              <Group gap="3px">
                <IconHourglass size={13} color={aging.warning ? '#c92a2a' : '#868e96'} />
                <Text size="sm" c={aging.warning ? 'red.7' : 'dimmed'} fw={500}>
                  {aging.text}
                </Text>
              </Group>
            </Group>

            {/* Row 3：金額 + Stepper（金額不存在時 Stepper 全寬） */}
            <Group mt="18px" align="center" gap="24px" wrap="nowrap">
              {ticket.amount !== null && ticket.amount !== undefined && (
                <Box style={{ flexShrink: 0, paddingRight: 16, borderRight: '1px solid #f1f3f5' }}>
                  <Text size="xs" c="dimmed" mb="2px" fw={500}>
                    金額
                  </Text>
                  <Text fz="24px" fw={700} style={{ lineHeight: 1.1, letterSpacing: '-0.5px' }}>
                    NT$ {ticket.amount.toLocaleString()}
                  </Text>
                  {ticket.counterAmount && ticket.counterAmount > 0 && (
                    <Text size="xs" c="blue.7" fw={500} mt="4px">
                      ＋ 臨櫃 NT$ {ticket.counterAmount.toLocaleString()}（用戶自繳）
                    </Text>
                  )}
                </Box>
              )}
              <Box style={{ flex: 1, minWidth: 0 }}>
                <FlowStepper status={ticket.status} />
              </Box>
            </Group>
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

          {/* 次要 Properties — 只放 hero 沒有的識別欄位 */}
          {(queryFields.includes('idNumber') ||
            (queryFields.includes('birthDate') && ticket.driverInfo.birthDate) ||
            queryFields.includes('vehicleType') ||
            ticket.driverInfo.fullName !== ticket.userName) && (
            <Paper shadow={cardShadow} radius="12px" px="16px" py="14px">
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" verticalSpacing="10px">
                {queryFields.includes('idNumber') && (
                  <PropRow icon={<IconCreditCard size={13} />} label={idLabel}>
                    <CopyableValue
                      raw={ticket.driverInfo.idNumber}
                      display={ticket.driverInfo.idNumber}
                    />
                  </PropRow>
                )}
                {queryFields.includes('birthDate') && ticket.driverInfo.birthDate && (
                  <PropRow icon={<IconCalendar size={13} />} label="出生年月日">
                    <CopyableValue
                      raw={ticket.driverInfo.birthDate}
                      display={maskDate(ticket.driverInfo.birthDate)}
                    />
                  </PropRow>
                )}
                {queryFields.includes('vehicleType') && (
                  <PropRow icon={<IconCar size={13} />} label="車種">
                    <Text size="sm" fw={500}>
                      {ticket.driverInfo.vehicleType}
                    </Text>
                  </PropRow>
                )}
                {ticket.driverInfo.fullName !== ticket.userName && (
                  <PropRow icon={<IconUser size={13} />} label="車主名稱">
                    <Text size="sm" fw={500} truncate>
                      {ticket.driverInfo.fullName}
                    </Text>
                  </PropRow>
                )}
              </SimpleGrid>
            </Paper>
          )}

          {/* Tabs：歷程 */}
          <Paper
            shadow={cardShadow}
            radius="12px"
            style={{ overflow: 'hidden' }}
          >
            <Tabs
              defaultValue="orders"
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
                <Tabs.Tab value="orders" leftSection={<IconReceipt size={14} />}>
                  訂單歷程
                  {ticket.invoiceOrders.length > 0 && (
                    <Text component="span" size="xs" c="dimmed" ml="6px">
                      {ticket.invoiceOrders.length}
                    </Text>
                  )}
                </Tabs.Tab>
                <Tabs.Tab value="notes" leftSection={<IconMessageDots size={14} />}>
                  備註
                  {ticket.notes.length > 0 && (
                    <Text component="span" size="xs" c="dimmed" ml="6px">
                      {ticket.notes.length}
                    </Text>
                  )}
                </Tabs.Tab>
                <Tabs.Tab value="emails" leftSection={<IconMail size={14} />}>
                  自動發信
                  {ticket.emailLogs.length > 0 && (
                    <Text component="span" size="xs" c="dimmed" ml="6px">
                      {ticket.emailLogs.length}
                    </Text>
                  )}
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

              <Tabs.Panel value="orders" p="16px">
                {ticket.invoiceOrders.length === 0 ? (
                  <Box py="24px" style={{ textAlign: 'center' }}>
                    <Text c="dimmed" size="sm">
                      尚無請款訂單
                    </Text>
                  </Box>
                ) : (
                  <Stack gap="10px">
                    {ticket.invoiceOrders.map((inv) => (
                      <Card key={inv.id} withBorder p="14px" radius="8px">
                        <Group justify="space-between" wrap="nowrap">
                          <Group gap="14px" wrap="nowrap">
                            <Box
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: 8,
                                backgroundColor: invoiceBg(inv.status),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {invoiceIcon(inv.status)}
                            </Box>
                            <Box>
                              <Group gap="8px">
                                <Text size="sm" fw={600} c="blue">
                                  {inv.id}
                                </Text>
                                <Badge
                                  variant="light"
                                  size="sm"
                                  color={invoiceColor(inv.status)}
                                  styles={{ root: { fontWeight: 500, border: 'none' } }}
                                >
                                  {invoiceLabel(inv.status)}
                                </Badge>
                              </Group>
                              <Text size="xs" c="dimmed" mt="2px">
                                {inv.createdAt}
                                {inv.note && ` · ${inv.note}`}
                                {inv.failReason && (
                                  <Text component="span" c="red.6" ml="4px">
                                    （{inv.failReason}）
                                  </Text>
                                )}
                              </Text>
                            </Box>
                          </Group>
                          <Text fw={700} size="md">
                            ${inv.amount.toLocaleString()}
                          </Text>
                        </Group>
                      </Card>
                    ))}
                  </Stack>
                )}
              </Tabs.Panel>

              <Tabs.Panel value="notes" p="16px">
                <Stack gap="10px" mb="12px">
                  {ticket.notes.length === 0 && (
                    <Box py="20px" style={{ textAlign: 'center' }}>
                      <Text size="sm" c="dimmed">
                        尚無備註
                      </Text>
                    </Box>
                  )}
                  {ticket.notes.map((n) => (
                    <Card key={n.id} p="12px" radius="8px" style={{ backgroundColor: '#f8f9fa' }}>
                      <Group justify="space-between" mb="4px">
                        <Text size="sm" fw={600}>
                          {n.author}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {n.createdAt}
                        </Text>
                      </Group>
                      <Text size="sm" c="dark.7">
                        {n.content}
                      </Text>
                    </Card>
                  ))}
                </Stack>
                <Group align="flex-end" gap="8px">
                  <Textarea
                    placeholder="輸入新備註... 送出後不可修改"
                    value={newNote}
                    onChange={(e) => onNewNoteChange(e.currentTarget.value)}
                    autosize
                    minRows={2}
                    style={{ flex: 1 }}
                  />
                  <Button onClick={onAddNote} disabled={!newNote.trim()} size="sm">
                    送出
                  </Button>
                </Group>
              </Tabs.Panel>

              <Tabs.Panel value="emails" p="16px">
                {ticket.emailLogs.length === 0 ? (
                  <Box py="20px" style={{ textAlign: 'center' }}>
                    <Text size="sm" c="dimmed">
                      尚未寄發任何信件
                    </Text>
                  </Box>
                ) : (
                  <Timeline bulletSize={20} lineWidth={2}>
                    {ticket.emailLogs.map((e) => (
                      <Timeline.Item
                        key={e.id}
                        bullet={<IconMail size={12} />}
                        color={e.status === 'sent' ? 'teal' : 'red'}
                        title={
                          <Text size="sm" fw={600}>
                            {e.subject}
                          </Text>
                        }
                      >
                        <Text size="xs" c="dimmed" mt="2px">
                          模板{' '}
                          <Text span fw={500}>
                            {e.template}
                          </Text>{' '}
                          · 觸發狀態{' '}
                          <Text span fw={500}>
                            {statusLabel(e.triggerStatus)}
                          </Text>
                        </Text>
                        <Text size="xs" c="dimmed" mt="2px">
                          {e.sentAt} · {e.status === 'sent' ? '已寄出' : '寄送失敗'}
                        </Text>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                )}
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

function PropRow({
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

function CopyableValue({ raw, display }: { raw: string; display: string }) {
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

// =====================================================
// Helpers
// =====================================================

function invoiceLabel(s: InvoiceOrder['status']): string {
  return s === 'pending' ? '請款中' : s === 'success' ? '請款成功' : '請款失敗'
}
function invoiceColor(s: InvoiceOrder['status']) {
  return s === 'pending' ? 'yellow' : s === 'success' ? 'teal' : 'red'
}
function invoiceBg(s: InvoiceOrder['status']) {
  return s === 'pending'
    ? 'rgba(250,176,5,0.18)'
    : s === 'success'
      ? 'rgba(18,184,134,0.18)'
      : 'rgba(250,82,82,0.15)'
}
function invoiceIcon(s: InvoiceOrder['status']) {
  if (s === 'pending') return <IconCircleDot size={18} color="#b08000" />
  if (s === 'success') return <IconCircleCheck size={18} color="#0b7c4d" />
  return <IconCircleX size={18} color="#c92a2a" />
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
    case 'counter-required':
      return ['done', 'skipped', 'skipped', 'done']
    case 'invoicing':
      return ['done', 'current', 'pending', 'pending']
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

function getAging(updatedAt: string): { text: string; warning: boolean } {
  const iso = updatedAt.replace(' ', 'T') + ':00'
  const updated = new Date(iso)
  if (Number.isNaN(updated.getTime())) {
    return { text: updatedAt, warning: false }
  }
  const diffMs = DEMO_NOW.getTime() - updated.getTime()
  if (diffMs < 0) return { text: '剛剛更新', warning: false }
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  if (days >= 3) return { text: `已停留 ${days} 天`, warning: true }
  if (days >= 1) return { text: `已停留 ${days} 天`, warning: false }
  if (hours >= 1) return { text: `${hours} 小時前更新`, warning: false }
  const mins = Math.max(1, Math.floor(diffMs / (1000 * 60)))
  return { text: `${mins} 分鐘前更新`, warning: false }
}
