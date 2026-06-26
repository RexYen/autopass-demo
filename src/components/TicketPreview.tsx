import { useMemo, useState } from 'react'
import {
  Paper,
  Title,
  Text,
  Box,
  Stack,
  Group,
  Badge,
  SimpleGrid,
  Divider,
  Code,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import {
  STATUS_META,
  type Ticket,
  type TicketStatus,
} from '../types/autopass'
import { TicketCard } from './TicketCard'
import { AutopassTicketDetail } from './AutopassTicketDetail'
import { QueryResultModal, ConfirmPaidModal, AddNoteModal } from './TicketModals'

const cardShadow =
  '0px 7px 7px -5px rgba(0,0,0,0.04), 0px 10px 15px -5px rgba(0,0,0,0.1), 0px 1px 3px 0px rgba(0,0,0,0.05)'

// 每張 demo 卡都用一致的時間，避免 UI 因 dummy 時間差異分心
const DEMO_CREATED = '2026-05-04 10:00'
const DEMO_UPDATED = '2026-05-05 09:12'

interface PreviewSection {
  status: TicketStatus
  ticket: Ticket
}

function makeTicket(overrides: Partial<Ticket>): Ticket {
  return {
    id: 'T-PREVIEW',
    userId: 'U-00000',
    userEmail: 'preview@example.com',
    plateNumber: 'ABC-1234',
    serviceType: 'etc-toll',
    cycle: '2026/05',
    amount: null,
    status: 'pending-query',
    createdAt: DEMO_CREATED,
    updatedAt: DEMO_UPDATED,
    driverInfo: {
      fullName: '王小明',
      idNumber: 'A123456789',
      birthDate: '1988/03/15',
      vehicleType: '汽車',
      ownerType: '個人',
    },
    invoiceOrders: [],
    notes: [],
    emailLogs: [],
    ...overrides,
  }
}

// 6 種 status 各一張卡（不展示 outcome / 失敗原因 變體）
const SECTIONS: PreviewSection[] = [
  {
    status: 'pending-query',
    ticket: makeTicket({
      id: 'T-PREVIEW-01',
      serviceType: 'etc-toll',
      status: 'pending-query',
    }),
  },
  {
    status: 'no-fee',
    ticket: makeTicket({
      id: 'T-PREVIEW-02',
      serviceType: 'fuel-fee-personal',
      status: 'no-fee',
      outcome: 'no-fee',
      amount: 0,
    }),
  },
  {
    status: 'query-failed',
    ticket: makeTicket({
      id: 'T-PREVIEW-03',
      serviceType: 'fuel-fee-corporate',
      status: 'query-failed',
      queryFailureReason: 'data-error',
      driverInfo: {
        fullName: '示範股份有限公司',
        idNumber: '24536806',
        vehicleType: '汽車',
        ownerType: '法人',
      },
      plateNumber: 'KAA-3030',
      userEmail: 'demo-corp@example.com',
    }),
  },
  {
    status: 'invoice-success',
    ticket: makeTicket({
      id: 'T-PREVIEW-04',
      serviceType: 'fuel-fee-corporate',
      status: 'invoice-success',
      outcome: 'online-full',
      amount: 3600,
      driverInfo: {
        fullName: '示範運輸股份有限公司',
        idNumber: '12345678',
        vehicleType: '汽車',
        ownerType: '法人',
      },
      plateNumber: 'TPE-8888',
      userEmail: 'fleet@example.com',
    }),
  },
  {
    status: 'invoice-failed',
    ticket: makeTicket({
      id: 'T-PREVIEW-05',
      serviceType: 'fuel-fee-overdue',
      status: 'invoice-failed',
      outcome: 'online-full',
      amount: 420,
      plateNumber: 'TXG-7788',
      userEmail: 'overdue@example.com',
    }),
  },
  {
    status: 'paid',
    ticket: makeTicket({
      id: 'T-PREVIEW-06',
      serviceType: 'etc-toll',
      status: 'paid',
      outcome: 'online-full',
      amount: 1240,
      plateNumber: 'EFG-5544',
      userEmail: 'paid@example.com',
    }),
  },
]

export function TicketPreview() {
  const [queryModalId, setQueryModalId] = useState<string | null>(null)
  const [confirmPaidId, setConfirmPaidId] = useState<string | null>(null)
  const [noteModalId, setNoteModalId] = useState<string | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)

  const findTicket = (id: string | null) =>
    id ? SECTIONS.find((s) => s.ticket.id === id)?.ticket ?? null : null

  const queryModalTicket = useMemo(() => findTicket(queryModalId), [queryModalId])
  const confirmPaidTicket = useMemo(() => findTicket(confirmPaidId), [confirmPaidId])
  const noteModalTicket = useMemo(() => findTicket(noteModalId), [noteModalId])
  const detailTicket = useMemo(() => findTicket(detailId), [detailId])

  const callbacks = {
    onViewDetail: (id: string) => setDetailId(id),
    onOpenQueryModal: (id: string) => setQueryModalId(id),
    onConfirmPaid: (id: string) => setConfirmPaidId(id),
    onAddNote: (id: string) => setNoteModalId(id),
  }

  // 在 preview 模式下，QueryResultModal 的 onSubmit 不真的改 ticket 狀態；
  // 它的內部多步驟流程（成功/失敗、retry 設定）由 modal 自己維持，這裡只負責收尾。
  const handleQuerySubmit = () => {
    setQueryModalId(null)
  }

  const handleConfirmPaid = () => {
    notifications.show({
      title: 'Preview',
      message: '此為樣式預覽，未實際改動 ticket 狀態',
      color: 'gray',
    })
    setConfirmPaidId(null)
  }

  const handleAddNote = (ticketId: string, content: string) => {
    notifications.show({
      title: '已新增備註（Preview）',
      message: `${ticketId}：${content}`,
      color: 'teal',
    })
  }

  return (
    <Paper
      shadow={cardShadow}
      radius="16px"
      p="24px"
      style={{ backgroundColor: '#ffffff' }}
    >
      <Stack gap="lg">
        <Box>
          <Title order={2} style={{ fontSize: 20, fontWeight: 700 }}>
            Ticket 狀態 Preview
          </Title>
          <Text size="sm" c="dimmed" mt={4}>
            前端參考用：列出查繳任務卡片在所有 status 下的視覺。
            點擊卡片上的 CTA、眼睛 icon、或「⋯」選單可以打開對應的 modal / 詳情抽屜（不會真的改動資料）。
          </Text>
        </Box>

        <StatusLegend />

        <Divider />

        <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }} spacing="20px">
          {SECTIONS.map((section) => {
            const meta = STATUS_META[section.status]
            return (
              <Stack key={section.status} gap="6px">
                <Group gap="6px" align="center">
                  <Text size="sm" fw={600}>
                    {meta.label}
                  </Text>
                  <Code style={{ fontSize: 11 }}>{section.status}</Code>
                </Group>
                <TicketCard ticket={section.ticket} {...callbacks} />
              </Stack>
            )
          })}
        </SimpleGrid>
      </Stack>

      <QueryResultModal
        ticket={queryModalTicket}
        opened={!!queryModalTicket}
        onClose={() => setQueryModalId(null)}
        onSubmit={handleQuerySubmit}
      />

      <ConfirmPaidModal
        ticket={confirmPaidTicket}
        opened={!!confirmPaidTicket}
        onClose={() => setConfirmPaidId(null)}
        onConfirm={handleConfirmPaid}
      />

      <AddNoteModal
        ticket={noteModalTicket}
        opened={!!noteModalTicket}
        onClose={() => setNoteModalId(null)}
        onSubmit={handleAddNote}
      />

      <AutopassTicketDetail
        ticket={detailTicket}
        opened={!!detailTicket}
        onClose={() => setDetailId(null)}
        onAddNote={handleAddNote}
      />
    </Paper>
  )
}

function StatusLegend() {
  return (
    <Box>
      <Text size="xs" c="dimmed" fw={600} mb="xs" style={{ letterSpacing: 0.4 }}>
        STATUS LEGEND
      </Text>
      <Group gap="xs" wrap="wrap">
        {(Object.entries(STATUS_META) as [TicketStatus, typeof STATUS_META[TicketStatus]][]).map(
          ([key, meta]) => (
            <Badge
              key={key}
              variant="light"
              size="lg"
              radius="md"
              styles={{
                root: {
                  backgroundColor: meta.bg,
                  color: meta.color,
                  border: 'none',
                  fontWeight: 600,
                  fontSize: 13,
                  paddingLeft: 12,
                  paddingRight: 12,
                  height: 28,
                },
              }}
            >
              {meta.label}
              <Text component="span" size="xs" ml="6px" style={{ opacity: 0.7 }}>
                {key}
              </Text>
            </Badge>
          ),
        )}
      </Group>
    </Box>
  )
}

