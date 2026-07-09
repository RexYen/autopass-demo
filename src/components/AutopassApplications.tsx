import {
  Paper,
  Title,
  Group,
  TextInput,
  Table,
  Badge,
  Pagination,
  Text,
  Box,
  Select,
  Stack,
  Modal,
  Button,
  ActionIcon,
} from '@mantine/core'
import { IconSearch, IconEdit } from '@tabler/icons-react'
import { useState, useMemo } from 'react'
import {
  SERVICE_META,
  QUERY_FIELD_META,
  BILLING_CYCLES,
} from '../types/autopass'
import type { BillingCycle } from '../types/autopass'
import { mockApplications } from '../data/autopassApplicationsMock'
import { useNotification } from '../hooks/useNotification'

const PAGE_SIZE = 10

// 服務別篩選：以顯示名稱去重（同名不同 serviceType 視為同一類，例如個人/法人汽燃費）
const SERVICE_LABELS = Array.from(
  new Set(Object.values(SERVICE_META).map((m) => m.label)),
)

const cellText = {
  color: '#000000',
  fontSize: '14px',
  lineHeight: '20px',
  fontFamily: 'Noto Sans TC, sans-serif',
  fontWeight: 400,
}

const cycleBadgeStyles = {
  root: {
    backgroundColor: 'rgba(34,139,230,0.1)',
    color: '#1971c2',
    fontSize: '12px',
    lineHeight: '16px',
    fontWeight: 400,
    padding: '4px 8px',
    borderRadius: '16px',
    border: 'none',
    fontFamily: 'Noto Sans TC, sans-serif',
  },
}

const labelText = {
  color: '#000000',
  fontSize: '14px',
  fontFamily: 'Noto Sans TC',
  fontWeight: 500,
  lineHeight: '20px',
}

const subtitleText = {
  color: '#868e96',
  fontSize: '13px',
  fontFamily: 'Noto Sans TC, sans-serif',
  fontWeight: 400,
  lineHeight: '18px',
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function AutopassApplications() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterService, setFilterService] = useState<string | null>(null)
  const [filterCycle, setFilterCycle] = useState<BillingCycle | null>(null)

  // 記憶體 override：編輯查繳週期只在前端生效，重新整理即重置（與全 app 一致）
  const [cycleOverrides, setCycleOverrides] = useState<
    Record<string, BillingCycle>
  >({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftCycle, setDraftCycle] = useState<BillingCycle | null>(null)
  const { showSuccess } = useNotification()

  const applications = useMemo(
    () =>
      mockApplications.map((a) =>
        cycleOverrides[a.id]
          ? { ...a, billingCycle: cycleOverrides[a.id] }
          : a,
      ),
    [cycleOverrides],
  )

  const editingApp = applications.find((a) => a.id === editingId) ?? null

  const openEdit = (id: string, cycle: BillingCycle) => {
    setEditingId(id)
    setDraftCycle(cycle)
  }

  const closeEdit = () => {
    setEditingId(null)
    setDraftCycle(null)
  }

  const saveEdit = () => {
    if (editingId && draftCycle) {
      setCycleOverrides((prev) => ({ ...prev, [editingId]: draftCycle }))
      showSuccess(`已更新查繳週期為「${draftCycle}」`, '查繳週期已更新')
      closeEdit()
    }
  }

  const resetFilters = () => {
    setSearchTerm('')
    setFilterService(null)
    setFilterCycle(null)
    setCurrentPage(1)
  }

  const filtered = applications
    .filter((app) => {
      const term = searchTerm.trim().toLowerCase()
      const matchesSearch =
        !term ||
        app.userEmail.toLowerCase().includes(term) ||
        app.plateNumber.toLowerCase().includes(term) ||
        app.idNumber.toLowerCase().includes(term)
      const matchesService =
        !filterService || SERVICE_META[app.serviceType].label === filterService
      const matchesCycle = !filterCycle || app.billingCycle === filterCycle
      return matchesSearch && matchesService && matchesCycle
    })
    // 申請日期 近→遠（PRD v9.1.1 §2.1）；appliedAt 為 ISO 字串，字典序即時間序
    .sort((a, b) => b.appliedAt.localeCompare(a.appliedAt))

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const pageItems = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  )
  const rangeStart = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(safePage * PAGE_SIZE, filtered.length)

  return (
    <Paper
      shadow="0px 7px 7px -5px rgba(0,0,0,0.04), 0px 10px 15px -5px rgba(0,0,0,0.1), 0px 1px 3px 0px rgba(0,0,0,0.05)"
      radius="16px"
      style={{
        minHeight: '760px',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: '100%',
      }}
    >
      {/* Header */}
      <Group
        justify="space-between"
        px="20px"
        py="24px"
        style={{ borderBottom: 'none', flexShrink: 0 }}
      >
        <Title
          order={2}
          style={{
            color: '#000000',
            fontWeight: 700,
            fontSize: '20px',
            lineHeight: '24px',
            fontFamily: 'Noto Sans TC, sans-serif',
          }}
        >
          通行費申請單
        </Title>
      </Group>

      {/* Search and Filters */}
      <Box px="20px" pb="24px" style={{ flexShrink: 0 }}>
        <Group gap="16px" align="end">
          <TextInput
            placeholder="搜尋 Email、車牌號碼、證件號碼或統編"
            leftSection={<IconSearch size={16} />}
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.currentTarget.value)
              setCurrentPage(1)
            }}
            style={{ maxWidth: '390px', width: '100%' }}
            styles={{
              input: {
                borderColor: '#dee2e6',
                borderRadius: '4px',
                height: '40px',
                fontSize: '14px',
                lineHeight: '20px',
              },
            }}
          />
          <Select
            placeholder="請選擇服務類型"
            data={SERVICE_LABELS}
            value={filterService}
            onChange={(value) => {
              setFilterService(value)
              setCurrentPage(1)
            }}
            clearable
            style={{ width: '240px' }}
            styles={{
              input: {
                borderColor: '#dee2e6',
                borderRadius: '4px',
                height: '40px',
                fontSize: '14px',
                lineHeight: '20px',
              },
            }}
          />
          <Select
            placeholder="請選擇查繳週期"
            data={BILLING_CYCLES}
            value={filterCycle}
            onChange={(value) => {
              setFilterCycle(value as BillingCycle | null)
              setCurrentPage(1)
            }}
            clearable
            style={{ width: '240px' }}
            styles={{
              input: {
                borderColor: '#dee2e6',
                borderRadius: '4px',
                height: '40px',
                fontSize: '14px',
                lineHeight: '20px',
              },
            }}
          />
          <Button
            variant="default"
            onClick={resetFilters}
            styles={{
              root: {
                height: '40px',
                borderColor: '#dee2e6',
                borderRadius: '4px',
                color: '#212529',
                fontSize: '14px',
                fontWeight: 400,
                fontFamily: 'Noto Sans TC, sans-serif',
              },
            }}
          >
            重設
          </Button>
        </Group>
      </Box>

      {/* Table */}
      <Box
        style={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        <Table
          withTableBorder={false}
          withRowBorders
          styles={{
            table: { backgroundColor: '#ffffff', width: '100%' },
            thead: { backgroundColor: '#ffffff' },
            th: {
              color: '#868e96',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '20px',
              padding: '12px 20px',
              height: '50px',
              borderBottom: '1px solid #dee2e6',
              fontFamily: 'Noto Sans TC, sans-serif',
            },
            td: {
              padding: '12px 20px',
              height: 'auto',
              minHeight: '50px',
              borderBottom: '1px solid #dee2e6',
              verticalAlign: 'middle',
              overflow: 'visible',
            },
            tr: {
              backgroundColor: '#ffffff',
            },
          }}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: '22%' }}>Email</Table.Th>
              <Table.Th style={{ width: '11%' }}>
                {QUERY_FIELD_META.plateNumber.label}
              </Table.Th>
              <Table.Th style={{ width: '8%' }}>
                {QUERY_FIELD_META.vehicleType.label}
              </Table.Th>
              <Table.Th style={{ width: '14%' }}>
                {QUERY_FIELD_META.idNumber.label}
              </Table.Th>
              <Table.Th style={{ width: '13%' }}>申請服務</Table.Th>
              <Table.Th style={{ width: '14%' }}>查繳週期</Table.Th>
              <Table.Th style={{ width: '18%' }}>申請時間</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {pageItems.map((app) => (
              <Table.Tr key={app.id}>
                <Table.Td>
                  <Text style={cellText}>{app.userEmail}</Text>
                </Table.Td>
                <Table.Td>
                  <Text style={cellText}>{app.plateNumber}</Text>
                </Table.Td>
                <Table.Td>
                  <Text style={cellText}>{app.vehicleType}</Text>
                </Table.Td>
                <Table.Td>
                  <Text style={cellText}>{app.idNumber}</Text>
                </Table.Td>
                <Table.Td>
                  <Text style={cellText}>
                    {SERVICE_META[app.serviceType].label}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Group gap="4px" wrap="nowrap">
                    <Badge variant="light" styles={cycleBadgeStyles}>
                      {app.billingCycle}
                    </Badge>
                    {/* 僅 ETC 開放週期設定（PRD v9.1.1 §2.5），編輯入口內嵌於週期旁 */}
                    {app.serviceType === 'etc-toll' && (
                      <ActionIcon
                        variant="transparent"
                        size={20}
                        onClick={() => openEdit(app.id, app.billingCycle)}
                        aria-label="編輯查繳週期"
                        style={{ cursor: 'pointer', minWidth: '20px' }}
                      >
                        <IconEdit size={18} stroke={1.5} color="#212529" />
                      </ActionIcon>
                    )}
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Text style={cellText}>{formatDateTime(app.appliedAt)}</Text>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Box>

      {/* Footer */}
      <Group
        justify="space-between"
        px="20px"
        py="24px"
        style={{ borderTop: 'none', flexShrink: 0 }}
      >
        <Text
          style={{
            color: '#868e96',
            fontSize: '14px',
            lineHeight: '20px',
            fontFamily: 'Noto Sans TC, sans-serif',
          }}
        >
          顯示 {rangeStart} - {rangeEnd} 筆，共 {filtered.length} 筆
        </Text>
        <Pagination
          total={totalPages}
          value={safePage}
          onChange={setCurrentPage}
          color="#228be6"
          size="sm"
          styles={{
            control: {
              width: '24px',
              height: '24px',
              minWidth: '24px',
              fontSize: '14px',
              lineHeight: '20px',
              borderRadius: '4px',
              border: '1px solid #dee2e6',
              backgroundColor: '#ffffff',
              color: '#000000',
            },
          }}
        />
      </Group>

      {/* 編輯查繳週期 Modal */}
      <Modal
        opened={editingId !== null}
        onClose={closeEdit}
        title=""
        centered
        size={420}
        padding="16px"
        styles={{
          content: {
            background: '#ffffff',
            boxShadow:
              '0px 7px 7px -5px rgba(0,0,0,0.04), 0px 10px 15px -5px rgba(0,0,0,0.1), 0px 1px 3px 0px rgba(0,0,0,0.05)',
            borderRadius: '4px',
            width: '420px',
          },
          header: { display: 'none' },
          body: { padding: '16px' },
        }}
      >
        <Stack gap="24px">
          <Stack gap="6px">
            <Title
              order={4}
              style={{
                color: '#000000',
                fontSize: '16px',
                fontFamily: 'Noto Sans TC',
                fontWeight: 700,
                lineHeight: '24px',
                margin: 0,
              }}
            >
              編輯查繳週期
            </Title>
            {editingApp && (
              <Text style={subtitleText}>
                {editingApp.userEmail} ·{' '}
                {SERVICE_META[editingApp.serviceType].label}
              </Text>
            )}
          </Stack>

          <Stack gap="4px">
            <Text style={labelText}>查繳週期</Text>
            <Select
              data={BILLING_CYCLES}
              value={draftCycle}
              onChange={(value) => setDraftCycle(value as BillingCycle | null)}
              styles={{
                input: {
                  backgroundColor: '#ffffff',
                  padding: '6px 12px',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontFamily: 'Noto Sans TC',
                  fontWeight: 400,
                  lineHeight: '20px',
                },
              }}
            />
          </Stack>

          <Group justify="flex-end" gap="16px">
            <Button
              variant="outline"
              onClick={closeEdit}
              styles={{
                root: {
                  backgroundColor: '#ffffff',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  padding: '6px 16px',
                  color: '#212529',
                  fontSize: '14px',
                  fontFamily: 'Noto Sans TC',
                  fontWeight: 400,
                  lineHeight: '20px',
                },
              }}
            >
              取消
            </Button>
            <Button
              onClick={saveEdit}
              disabled={!draftCycle}
              styles={{
                root: {
                  backgroundColor: '#228be6',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '6px 16px',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontFamily: 'Noto Sans TC',
                  fontWeight: 400,
                  lineHeight: '20px',
                },
              }}
            >
              儲存
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Paper>
  )
}
