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
} from '@mantine/core'
import { IconSearch, IconFilter } from '@tabler/icons-react'
import { useState } from 'react'
import {
  SERVICE_META,
  SERVICE_QUERY_FIELDS,
  QUERY_FIELD_META,
} from '../types/autopass'
import { mockApplications } from '../data/autopassApplicationsMock'

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

const cellTextDim = {
  color: '#495057',
  fontSize: '13px',
  lineHeight: '18px',
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

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function AutopassApplications() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterService, setFilterService] = useState<string | null>(null)

  const applications = mockApplications

  const filtered = applications.filter((app) => {
    const term = searchTerm.trim().toLowerCase()
    const matchesSearch =
      !term ||
      app.userEmail.toLowerCase().includes(term) ||
      (app.queryData.plateNumber ?? '').toLowerCase().includes(term)
    const matchesService =
      !filterService || SERVICE_META[app.serviceType].label === filterService
    return matchesSearch && matchesService
  })

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
          自動繳申請
        </Title>
      </Group>

      {/* Search and Filters */}
      <Box px="20px" pb="24px" style={{ flexShrink: 0 }}>
        <Group gap="16px" align="end">
          <TextInput
            placeholder="搜尋 Email 或車牌"
            leftSection={<IconSearch size={16} />}
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.currentTarget.value)
              setCurrentPage(1)
            }}
            style={{ maxWidth: '321px', width: '100%' }}
            styles={{
              input: {
                borderColor: '#dee2e6',
                borderRadius: '4px',
                height: '40px',
                fontSize: '14px',
                lineHeight: '20px',
                '&::placeholder': { color: '#adb5bd' },
              },
            }}
          />
          <Select
            placeholder="服務別"
            data={SERVICE_LABELS}
            value={filterService}
            onChange={(value) => {
              setFilterService(value)
              setCurrentPage(1)
            }}
            clearable
            leftSection={<IconFilter size={16} />}
            style={{ width: '200px' }}
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
              '&:hover': { backgroundColor: '#ffffff' },
            },
          }}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: '22%' }}>駕駛中心帳號</Table.Th>
              <Table.Th style={{ width: '16%' }}>申請服務</Table.Th>
              <Table.Th style={{ width: '26%' }}>申請資料</Table.Th>
              <Table.Th style={{ width: '16%' }}>申請時間</Table.Th>
              <Table.Th style={{ width: '12%' }}>查繳週期</Table.Th>
              <Table.Th style={{ width: '8%' }}>操作</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {pageItems.map((app) => (
              <Table.Tr key={app.id}>
                <Table.Td>
                  <Text style={cellText}>{app.userEmail}</Text>
                </Table.Td>
                <Table.Td>
                  <Text style={cellText}>
                    {SERVICE_META[app.serviceType].label}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Stack gap={2}>
                    {SERVICE_QUERY_FIELDS[app.serviceType].map((field) => (
                      <Text key={field} style={cellTextDim}>
                        {QUERY_FIELD_META[field].label}：
                        {app.queryData[field] ?? '—'}
                      </Text>
                    ))}
                  </Stack>
                </Table.Td>
                <Table.Td>
                  <Text style={cellText}>{formatDateTime(app.appliedAt)}</Text>
                </Table.Td>
                <Table.Td>
                  <Badge variant="light" styles={cycleBadgeStyles}>
                    {app.billingCycle}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text
                    style={{
                      color: '#228be6',
                      fontSize: '14px',
                      lineHeight: '20px',
                      fontFamily: 'Noto Sans TC, sans-serif',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    編輯
                  </Text>
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
              '&[data-active]': {
                backgroundColor: '#228be6',
                color: '#ffffff',
                borderColor: '#228be6',
              },
              '&[data-active]:hover': {
                backgroundColor: '#228be6',
                color: '#ffffff',
              },
            },
          }}
        />
      </Group>
    </Paper>
  )
}
