import { useMemo, useState } from 'react'
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
  Divider,
  Modal,
  TextInput,
  Textarea,
  Timeline,
  ActionIcon,
  SimpleGrid,
  Menu,
  CopyButton,
  Tooltip,
  Alert,
  Tabs,
  Grid,
} from '@mantine/core'
import {
  IconArrowLeft,
  IconUser,
  IconCar,
  IconCash,
  IconReceipt,
  IconMessageDots,
  IconMail,
  IconCircleCheck,
  IconCircleX,
  IconCircleDot,
  IconCopy,
  IconCheck,
  IconExternalLink,
  IconClock,
  IconBuildingBank,
  IconAlertCircle,
  IconRefresh,
  IconReceipt2,
  IconDots,
  IconCreditCard,
  IconCalendar,
  IconX,
  IconHourglass,
  IconAlertTriangle,
} from '@tabler/icons-react'
import { mockTickets } from '../data/autopassMock'
import {
  STATUS_META,
  SERVICE_META,
  SERVICE_QUERY_FIELDS,
  type Ticket,
  type TicketStatus,
  type InvoiceOrder,
  type TicketNote,
  type EmailLog,
} from '../types/autopass'
import { useNotification } from '../hooks/useNotification'
import { maskDate } from '../utils/mask'

interface AutopassTicketDetailProps {
  ticketId: string
  onBack: () => void
}

const cardShadow =
  '0px 7px 7px -5px rgba(0,0,0,0.04), 0px 10px 15px -5px rgba(0,0,0,0.1), 0px 1px 3px 0px rgba(0,0,0,0.05)'

const STATUS_OPTIONS = Object.entries(STATUS_META).map(([k, v]) => ({
  value: k,
  label: v.label,
}))

// 對應 PRD 4.6 的 6 種會發信狀態
const EMAIL_HINT: Partial<Record<TicketStatus, string>> = {
  'no-fee': '將寄送「本期無待繳項目」通知信',
  'counter-required': '將寄送「請至臨櫃繳費」通知信',
  'query-failed': '將寄送「查詢失敗，請確認車籍資料」通知信',
  'invoice-failed': '將寄送「請款失敗，請更新付款資訊」通知信',
  'paid': '將寄送「繳費完成」通知信（含申訴連結）',
}

export function AutopassTicketDetail({ ticketId, onBack }: AutopassTicketDetailProps) {
  const original = useMemo(
    () => mockTickets.find((t) => t.id === ticketId),
    [ticketId],
  )

  const [ticket, setTicket] = useState<Ticket | undefined>(
    original
      ? {
          ...original,
          invoiceOrders: [...original.invoiceOrders],
          notes: [...original.notes],
          emailLogs: [...original.emailLogs],
        }
      : undefined,
  )
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [invoiceAmount, setInvoiceAmount] = useState('')
  const [invoiceNote, setInvoiceNote] = useState('')
  const [newNote, setNewNote] = useState('')
  const { showSuccess } = useNotification()

  if (!ticket) {
    return (
      <Paper shadow={cardShadow} radius="16px" p="40px" style={{ textAlign: 'center' }}>
        <Text c="dimmed">找不到此 Ticket</Text>
        <Button mt="md" variant="outline" onClick={onBack}>
          返回列表
        </Button>
      </Paper>
    )
  }

  const statusMeta = STATUS_META[ticket.status]
  const serviceMeta = SERVICE_META[ticket.serviceType]
  const queryFields = SERVICE_QUERY_FIELDS[ticket.serviceType]

  const transitionTo = (nextStatus: TicketStatus, opts?: { silent?: boolean }) => {
    const now = formatDate(new Date())
    const newEmailLog: EmailLog | null = EMAIL_HINT[nextStatus]
      ? {
          id: `E-${Date.now()}`,
          triggerStatus: nextStatus,
          template: `${nextStatus}-v1`,
          subject: `【自動繳通知】${STATUS_META[nextStatus].label}`,
          sentAt: now,
          status: 'sent',
        }
      : null

    setTicket({
      ...ticket,
      status: nextStatus,
      updatedAt: now,
      emailLogs: newEmailLog ? [newEmailLog, ...ticket.emailLogs] : ticket.emailLogs,
    })

    if (!opts?.silent) {
      showSuccess(
        `已更新狀態為「${STATUS_META[nextStatus].label}」`,
        newEmailLog ? '系統已自動寄送對應通知信給用戶' : '此狀態無對應通知信',
      )
    }
  }

  const handleCreateInvoice = () => {
    const amount = parseInt(invoiceAmount, 10)
    if (!amount || amount <= 0) return
    const now = formatDate(new Date())
    const newInvoice: InvoiceOrder = {
      id: `INV-${now.replace(/[^0-9]/g, '').slice(0, 12)}`,
      amount,
      note: invoiceNote || undefined,
      createdAt: now,
      status: 'pending',
    }
    setTicket({
      ...ticket,
      status: 'invoicing',
      updatedAt: now,
      invoiceOrders: [newInvoice, ...ticket.invoiceOrders],
    })
    setInvoiceAmount('')
    setInvoiceNote('')
    setShowInvoiceModal(false)
    showSuccess('已建立請款訂單', `已連動車麻吉發起請款，金額 $${amount.toLocaleString()}`)
  }

  const handleAddNote = () => {
    const content = newNote.trim()
    if (!content) return
    const now = formatDate(new Date())
    const note: TicketNote = {
      id: `N-${Date.now()}`,
      author: 'Rex',
      content,
      createdAt: now,
    }
    setTicket({ ...ticket, notes: [note, ...ticket.notes] })
    setNewNote('')
  }

  return (
    <Stack gap="20px">
      {/* Top bar */}
      <Group justify="space-between">
        <Button
          variant="subtle"
          color="gray"
          leftSection={<IconArrowLeft size={16} />}
          onClick={onBack}
        >
          返回列表
        </Button>

        <Menu shadow="md" position="bottom-end" width={220}>
          <Menu.Target>
            <Tooltip label="覆寫狀態（跳階／回退）" withArrow>
              <ActionIcon variant="subtle" color="gray" size="lg" aria-label="更多動作">
                <IconDots size={18} />
              </ActionIcon>
            </Tooltip>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>覆寫狀態（跳階／回退）</Menu.Label>
            {STATUS_OPTIONS.map((opt) => (
              <Menu.Item
                key={opt.value}
                onClick={() => transitionTo(opt.value as TicketStatus)}
                disabled={opt.value === ticket.status}
              >
                {opt.label}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
      </Group>

      <Grid gutter="20px">
        {/* === 主內容欄 === */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack gap="20px">
            {/* Title block */}
            <Paper
              shadow={cardShadow}
              radius="16px"
              p="24px"
              style={{ backgroundColor: '#fff' }}
            >
              <Text size="xs" c="dimmed" fw={500} mb="6px">
                {ticket.id}
              </Text>
              <Group justify="space-between" wrap="wrap" gap="12px" align="center">
                <Group gap="12px" align="center" wrap="wrap" style={{ flex: 1, minWidth: 0 }}>
                  <Title
                    order={2}
                    style={{
                      fontSize: '22px',
                      fontWeight: 700,
                      fontFamily: 'Noto Sans TC, sans-serif',
                      color: '#000',
                      lineHeight: 1.3,
                    }}
                  >
                    {serviceMeta.label}
                  </Title>
                  <Badge
                    variant="light"
                    size="lg"
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
                <Button
                  component="a"
                  href={serviceMeta.platformUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="light"
                  size="sm"
                  rightSection={<IconExternalLink size={14} />}
                >
                  前往 {serviceMeta.platform}
                </Button>
              </Group>

              {/* Flow stepper */}
              <Box mt="20px" pt="20px" style={{ borderTop: '1px solid #f1f3f5' }}>
                <FlowStepper status={ticket.status} />
              </Box>
            </Paper>

            {/* failReason banner — query-failed / invoice-failed 才顯示 */}
            {(() => {
              const reason = getFailReason(ticket)
              if (!reason) return null
              const isQuery = ticket.status === 'query-failed'
              return (
                <Alert
                  icon={<IconAlertTriangle size={20} />}
                  color="red"
                  radius="16px"
                  styles={{
                    root: { backgroundColor: '#fff5f5', border: '1px solid #ffc9c9' },
                    title: { fontWeight: 600 },
                  }}
                  title={isQuery ? '查詢失敗原因' : '請款失敗原因'}
                >
                  {reason}
                </Alert>
              )
            })()}

            {/* 金額卡 — 有 amount 才顯示，混合狀態同時露出臨櫃金額 */}
            {(ticket.amount !== null && ticket.amount !== undefined) && (
              <Paper
                shadow={cardShadow}
                radius="16px"
                p="20px"
                style={{ backgroundColor: '#fff' }}
              >
                <Group gap="32px" wrap="wrap">
                  <Box>
                    <Text size="xs" c="dimmed" mb="4px">
                      線上可繳金額
                    </Text>
                    <Text size="24px" fw={700} style={{ lineHeight: 1.2 }}>
                      NT$ {ticket.amount.toLocaleString()}
                    </Text>
                  </Box>
                  {ticket.counterAmount && ticket.counterAmount > 0 && (
                    <>
                      <Divider orientation="vertical" />
                      <Box>
                        <Group gap="6px" mb="4px">
                          <Text size="xs" c="dimmed">
                            臨櫃須繳金額
                          </Text>
                          <Badge size="xs" color="blue" variant="light">
                            用戶自繳
                          </Badge>
                        </Group>
                        <Text size="24px" fw={700} style={{ lineHeight: 1.2, color: '#1971c2' }}>
                          NT$ {ticket.counterAmount.toLocaleString()}
                        </Text>
                      </Box>
                    </>
                  )}
                </Group>
              </Paper>
            )}

            {/* Invoicing banner */}
            {ticket.status === 'invoicing' && (
              <Alert
                icon={<IconClock size={20} />}
                color="yellow"
                radius="16px"
                styles={{
                  root: { backgroundColor: '#fff9db', border: '1px solid #ffe066' },
                  title: { fontWeight: 600 },
                }}
                title="等待車麻吉請款結果"
              >
                實際環境會由 webhook 自動更新；demo 中請依車麻吉錢包實際結果手動標記。
              </Alert>
            )}

      {/* ── 下一步動作 ──────────────────────────── */}
      <Paper
        shadow={cardShadow}
        radius="16px"
        p="24px"
        style={{ backgroundColor: '#f8fbff' }}
      >
        <Box mb="16px">
          <Title
            order={4}
            style={{
              fontSize: '16px',
              fontWeight: 700,
              fontFamily: 'Noto Sans TC',
              color: '#000',
            }}
          >
            下一步動作
          </Title>
          <Text size="xs" c="dimmed" mt="2px">
            {actionGuideText(ticket.status)}
          </Text>
        </Box>

        <ActionPanel
          status={ticket.status}
          onTransition={(s) => transitionTo(s)}
          onOpenInvoiceModal={() => setShowInvoiceModal(true)}
        />
      </Paper>

      {/* ── 歷史紀錄（Tabs） ──────────────────────── */}
      <Paper shadow={cardShadow} radius="16px" style={{ backgroundColor: '#fff', overflow: 'hidden' }}>
        <Tabs
          defaultValue="orders"
          styles={{
            list: { borderBottom: '1px solid #e9ecef', paddingLeft: 12, paddingRight: 12 },
            tab: {
              fontSize: 14,
              fontWeight: 500,
              fontFamily: 'Noto Sans TC, sans-serif',
              padding: '14px 16px',
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
          </Tabs.List>

          <Tabs.Panel value="orders" p="24px">
            <Text size="sm" c="dimmed" mb="16px">
              此任務下所有請款訂單；新增請款請使用上方「下一步動作」
            </Text>
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
                            <Text size="sm" fw={600} c="blue" style={{ cursor: 'pointer' }}>
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

          <Tabs.Panel value="notes" p="24px">
            <Text size="sm" c="dimmed" mb="16px">
              送出後不可編輯，所有內容會永久留存
            </Text>
            <Stack gap="10px" mb="16px">
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
            <Group align="flex-end" gap="10px">
              <Textarea
                placeholder="輸入新備註... 送出後不可修改"
                value={newNote}
                onChange={(e) => setNewNote(e.currentTarget.value)}
                autosize
                minRows={2}
                style={{ flex: 1 }}
              />
              <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                送出
              </Button>
            </Group>
          </Tabs.Panel>

          <Tabs.Panel value="emails" p="24px">
            <Text size="sm" c="dimmed" mb="16px">
              系統依狀態自動寄送的通知信，由新到舊排序
            </Text>
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
        </Tabs>
      </Paper>
          </Stack>
        </Grid.Col>

        {/* === 右側 Properties Sidebar === */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper
            shadow={cardShadow}
            radius="16px"
            p="20px"
            style={{
              backgroundColor: '#fff',
              position: 'sticky',
              top: 20,
            }}
          >
            <Text
              size="xs"
              c="dimmed"
              fw={600}
              tt="uppercase"
              mb="md"
              style={{ letterSpacing: '0.5px' }}
            >
              詳細資訊
            </Text>

            <Stack gap="md">
              <PropRow icon={<IconCircleDot size={14} />} label="狀態">
                <Badge
                  variant="light"
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
              </PropRow>

              {(() => {
                const aging = getAging(ticket.updatedAt)
                return (
                  <PropRow icon={<IconHourglass size={14} />} label="停留時間">
                    <Text size="sm" fw={500} c={aging.warning ? 'red.7' : 'dark.8'}>
                      {aging.text}
                    </Text>
                  </PropRow>
                )
              })()}

              <PropRow icon={<IconUser size={14} />} label="用戶">
                <Text size="sm" fw={500}>
                  {ticket.userName}
                </Text>
              </PropRow>

              {queryFields.includes('plateNumber') && (
                <PropRow icon={<IconCar size={14} />} label="車牌">
                  <CopyableValue raw={ticket.plateNumber} display={ticket.plateNumber} />
                </PropRow>
              )}

              {queryFields.includes('idNumber') && (
                <PropRow
                  icon={<IconCreditCard size={14} />}
                  label={ticket.driverInfo.ownerType === '法人' ? '法人統一編號' : '身分證字號'}
                >
                  <CopyableValue
                    raw={ticket.driverInfo.idNumber}
                    display={ticket.driverInfo.idNumber}
                  />
                </PropRow>
              )}

              {queryFields.includes('birthDate') && ticket.driverInfo.birthDate && (
                <PropRow icon={<IconCalendar size={14} />} label="出生年月日">
                  <CopyableValue
                    raw={ticket.driverInfo.birthDate}
                    display={maskDate(ticket.driverInfo.birthDate)}
                  />
                </PropRow>
              )}

              {queryFields.includes('vehicleType') && (
                <PropRow icon={<IconCar size={14} />} label="車種">
                  <Text size="sm" fw={500}>
                    {ticket.driverInfo.vehicleType}
                  </Text>
                </PropRow>
              )}

              {ticket.driverInfo.fullName !== ticket.userName && (
                <PropRow icon={<IconUser size={14} />} label="車主名稱">
                  <Text size="sm" fw={500} truncate>
                    {ticket.driverInfo.fullName}
                  </Text>
                </PropRow>
              )}

              <PropRow icon={<IconBuildingBank size={14} />} label="查繳平台">
                <Text size="sm" fw={500}>
                  {serviceMeta.platform}
                </Text>
              </PropRow>

              <Divider my={4} />

              <PropRow icon={<IconClock size={14} />} label="建立時間">
                <Text size="xs" c="dimmed">
                  {ticket.createdAt}
                </Text>
              </PropRow>

              <PropRow icon={<IconRefresh size={14} />} label="最後更新">
                <Text size="xs" c="dimmed">
                  {ticket.updatedAt}
                </Text>
              </PropRow>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>

      {/* Create invoice modal (4.4) */}
      <Modal
        opened={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        title="建立請款訂單"
        centered
        size="md"
      >
        <Stack gap="16px">
          <Box style={{ backgroundColor: '#f8f9fa', borderRadius: 8, padding: 12 }}>
            <Text size="xs" c="dimmed" mb="2px">
              服務項目
            </Text>
            <Text size="sm" fw={500}>
              {serviceMeta.label}
            </Text>
          </Box>
          <TextInput
            label="金額"
            placeholder="請輸入金額"
            leftSection={<Text size="sm">$</Text>}
            value={invoiceAmount}
            onChange={(e) => setInvoiceAmount(e.currentTarget.value.replace(/[^0-9]/g, ''))}
            required
          />
          <Textarea
            label="備註（選填）"
            placeholder="例：兩筆超速罰單"
            value={invoiceNote}
            onChange={(e) => setInvoiceNote(e.currentTarget.value)}
            autosize
            minRows={2}
          />
          <Group justify="flex-end" gap="10px">
            <Button variant="default" onClick={() => setShowInvoiceModal(false)}>
              取消
            </Button>
            <Button
              onClick={handleCreateInvoice}
              disabled={!invoiceAmount || parseInt(invoiceAmount, 10) <= 0}
              styles={{ root: { backgroundColor: '#228be6' } }}
            >
              確認請款
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  )
}

// =====================================================
// Sub-components
// =====================================================

function actionGuideText(status: TicketStatus): string {
  switch (status) {
    case 'pending-query':
      return '依查繳結果選擇下方動作'
    case 'invoicing':
      return '依車麻吉實際結果，標記成功或失敗'
    case 'invoice-success':
      return '用公司卡於官方平台代繳完成後，標記繳款成功'
    case 'invoice-failed':
    case 'query-failed':
      return '可重試或標記為無法結單'
    case 'no-fee':
    case 'counter-required':
    case 'paid':
    case 'unable-to-close':
      return '此任務已結束'
  }
}

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

function ActionPanel({
  status,
  onTransition,
  onOpenInvoiceModal,
}: {
  status: TicketStatus
  onTransition: (next: TicketStatus) => void
  onOpenInvoiceModal: () => void
}) {
  if (status === 'pending-query') {
    return (
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="10px">
        <ActionTile
          icon={<IconCircleCheck size={18} />}
          label="無待繳"
          variant="success"
          onClick={() => onTransition('no-fee')}
          hint={EMAIL_HINT['no-fee']!}
        />
        <ActionTile
          icon={<IconBuildingBank size={18} />}
          label="需臨櫃繳費"
          variant="info"
          onClick={() => onTransition('counter-required')}
          hint={EMAIL_HINT['counter-required']!}
        />
        <ActionTile
          icon={<IconReceipt2 size={18} />}
          label="建立請款訂單"
          variant="primary"
          onClick={onOpenInvoiceModal}
          hint="輸入金額，連動車麻吉發起請款"
        />
        <ActionTile
          icon={<IconAlertCircle size={18} />}
          label="查詢失敗"
          variant="warning"
          onClick={() => onTransition('query-failed')}
          hint={EMAIL_HINT['query-failed']!}
        />
      </SimpleGrid>
    )
  }

  if (status === 'invoicing') {
    return (
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="10px">
        <ActionTile
          icon={<IconCircleCheck size={18} />}
          label="標記請款成功"
          variant="success"
          onClick={() => onTransition('invoice-success')}
          hint="車麻吉已成功扣款"
        />
        <ActionTile
          icon={<IconCircleX size={18} />}
          label="標記請款失敗"
          variant="warning"
          onClick={() => onTransition('invoice-failed')}
          hint={EMAIL_HINT['invoice-failed']!}
        />
      </SimpleGrid>
    )
  }

  if (status === 'invoice-success') {
    return (
      <ActionTile
        icon={<IconCash size={18} />}
        label="標記繳款成功"
        variant="success"
        onClick={() => onTransition('paid')}
        hint={EMAIL_HINT['paid']!}
      />
    )
  }

  if (status === 'invoice-failed') {
    return (
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="10px">
        <ActionTile
          icon={<IconRefresh size={18} />}
          label="重新建立請款"
          variant="primary"
          onClick={onOpenInvoiceModal}
          hint="輸入金額，重新發起請款"
        />
        <ActionTile
          icon={<IconCircleX size={18} />}
          label="標記為無法結單"
          variant="warning"
          onClick={() => onTransition('unable-to-close')}
          hint="例外結束狀態，此後不再推進"
        />
      </SimpleGrid>
    )
  }

  if (status === 'query-failed') {
    return (
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="10px">
        <ActionTile
          icon={<IconRefresh size={18} />}
          label="重新查詢"
          variant="primary"
          onClick={() => onTransition('pending-query')}
          hint="用戶已更新資料，回到待查詢"
        />
        <ActionTile
          icon={<IconCircleX size={18} />}
          label="標記為無法結單"
          variant="warning"
          onClick={() => onTransition('unable-to-close')}
          hint="例外結束狀態，此後不再推進"
        />
      </SimpleGrid>
    )
  }

  // terminal: no-fee, counter-required, paid, unable-to-close
  return (
    <Box
      py="24px"
      px="16px"
      style={{
        backgroundColor: '#fff',
        border: '1px dashed #dee2e6',
        borderRadius: 8,
        textAlign: 'center',
      }}
    >
      <Text size="sm" c="dimmed">
        此任務已結束。如需重啟，請使用右上方
        <IconDots size={14} style={{ verticalAlign: 'middle', margin: '0 4px' }} />
        覆寫狀態。
      </Text>
    </Box>
  )
}

type ActionVariant = 'primary' | 'success' | 'info' | 'warning'

function ActionTile({
  icon,
  label,
  hint,
  variant,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  hint: string
  variant: ActionVariant
  onClick: () => void
}) {
  const colors: Record<ActionVariant, { bg: string; border: string; iconColor: string; hoverBg: string }> = {
    primary: {
      bg: '#e7f5ff',
      border: '#74c0fc',
      iconColor: '#1971c2',
      hoverBg: '#d0ebff',
    },
    success: {
      bg: '#ebfbee',
      border: '#8ce99a',
      iconColor: '#0b7c4d',
      hoverBg: '#d3f9d8',
    },
    info: {
      bg: '#f8f9fa',
      border: '#dee2e6',
      iconColor: '#495057',
      hoverBg: '#e9ecef',
    },
    warning: {
      bg: '#fff5f5',
      border: '#ffc9c9',
      iconColor: '#c92a2a',
      hoverBg: '#ffe3e3',
    },
  }
  const c = colors[variant]
  return (
    <Box
      onClick={onClick}
      style={{
        backgroundColor: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 8,
        padding: '14px 16px',
        cursor: 'pointer',
        transition: 'background-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.backgroundColor = c.hoverBg
        el.style.transform = 'translateY(-1px)'
        el.style.boxShadow = '0px 4px 10px rgba(0,0,0,0.06)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.backgroundColor = c.bg
        el.style.transform = ''
        el.style.boxShadow = ''
      }}
      onMouseDown={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
      }}
      onMouseUp={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)'
      }}
    >
      <Group gap="10px" mb="6px" wrap="nowrap">
        <Box style={{ color: c.iconColor, display: 'flex' }}>{icon}</Box>
        <Text size="sm" fw={600} c="dark.8">
          {label}
        </Text>
      </Group>
      <Text size="xs" c="dimmed" style={{ lineHeight: 1.5 }}>
        {hint}
      </Text>
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

function formatDate(d: Date): string {
  const yy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${yy}-${mm}-${dd} ${hh}:${mi}`
}

// =====================================================
// Phase C: 流程訊號
// =====================================================

// demo 用：mock 資料停在 2026-05-04~06，將「現在」鎖在 2026-05-07 以呈現合理的停留天數
const DEMO_NOW = new Date('2026-05-07T12:00:00')

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
  const styleMap: Record<StepStatus, { bg: string; border: string; iconColor: string; labelColor: string; bold: boolean }> = {
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
  // updatedAt 格式："2026-05-06 14:30"
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
