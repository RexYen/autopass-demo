import {
  Paper,
  Group,
  Text,
  Box,
  Badge,
  ActionIcon,
  Stack,
  Divider,
  Button,
  CopyButton,
  Tooltip,
  Menu,
} from '@mantine/core'
import {
  IconArrowRight,
  IconCar,
  IconCreditCard,
  IconCalendar,
  IconBuildingBank,
  IconClock,
  IconRefresh,
  IconCopy,
  IconCheck,
  IconExternalLink,
  IconDots,
  IconClipboardCheck,
  IconCash,
  IconNote,
  IconMail,
  IconEye,
} from '@tabler/icons-react'
import {
  STATUS_META,
  SERVICE_META,
  SERVICE_QUERY_FIELDS,
  TERMINAL_STATUSES,
  type Ticket,
} from '../types/autopass'

export type TicketCardCallbacks = {
  onViewDetail: (id: string) => void
  onOpenQueryModal: (id: string) => void
  onConfirmPaid: (id: string) => void
  onAddNote: (id: string) => void
}

export function TicketCard({
  ticket,
  onViewDetail,
  onOpenQueryModal,
  onConfirmPaid,
  onAddNote,
}: { ticket: Ticket } & TicketCardCallbacks) {
  const statusMeta = STATUS_META[ticket.status]
  const serviceMeta = SERVICE_META[ticket.serviceType]
  const queryFields = SERVICE_QUERY_FIELDS[ticket.serviceType]
  const idLabel = ticket.driverInfo.ownerType === '法人' ? '統一編號' : '證件號碼'

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
        <Group justify="space-between" align="center" wrap="nowrap" mb="md" gap="sm">
          <Text size="sm" fw={600} truncate style={{ flex: 1, minWidth: 0 }}>
            {serviceMeta.label}
          </Text>
          <Badge
            variant="light"
            size="lg"
            radius="md"
            styles={{
              root: {
                backgroundColor: statusMeta.bg,
                color: statusMeta.color,
                border: 'none',
                fontWeight: 600,
                fontSize: 13,
                paddingLeft: 12,
                paddingRight: 12,
                height: 28,
                flexShrink: 0,
              },
            }}
          >
            {statusMeta.label}
          </Badge>
        </Group>

        <Stack gap="sm">
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
                display={ticket.driverInfo.birthDate}
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
            {serviceMeta.platform === '街口支付' ? (
              <Text size="sm" fw={500}>
                {serviceMeta.platform}
              </Text>
            ) : (
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
            )}
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
        onAddNote={onAddNote}
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
  commonItems: MenuItemDef[]
}

function buildCardActionConfig(
  ticket: Ticket,
  cb: TicketCardCallbacks,
): CardActionConfig {
  const addNote: MenuItemDef = {
    label: '備註',
    icon: <IconNote size={14} />,
    onClick: () => cb.onAddNote(ticket.id),
  }

  if (TERMINAL_STATUSES.includes(ticket.status)) {
    return {
      primary: {
        label: '查看詳情',
        icon: <IconArrowRight size={16} />,
        onClick: () => cb.onViewDetail(ticket.id),
      },
      commonItems: [addNote],
    }
  }

  const commonItems = [addNote]

  switch (ticket.status) {
    case 'pending-query':
      return {
        primary: {
          label: '回填查詢結果',
          icon: <IconClipboardCheck size={16} />,
          onClick: () => cb.onOpenQueryModal(ticket.id),
        },
        commonItems,
      }
    case 'invoice-success':
      return {
        primary: {
          label: '確認已代繳',
          icon: <IconCash size={16} />,
          onClick: () => cb.onConfirmPaid(ticket.id),
        },
        commonItems,
      }
    default:
      return {
        primary: {
          label: '查看詳情',
          icon: <IconArrowRight size={16} />,
          onClick: () => cb.onViewDetail(ticket.id),
        },
        commonItems,
      }
  }
}

function CardActions({
  ticket,
  onViewDetail,
  onOpenQueryModal,
  onConfirmPaid,
  onAddNote,
}: { ticket: Ticket } & TicketCardCallbacks) {
  const { primary, commonItems } = buildCardActionConfig(ticket, {
    onViewDetail,
    onOpenQueryModal,
    onConfirmPaid,
    onAddNote,
  })

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
