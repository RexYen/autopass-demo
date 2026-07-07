import { useEffect, useMemo, useState } from 'react'
import {
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Modal,
  MultiSelect,
  Pagination,
  Paper,
  Radio,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  Textarea,
  TextInput,
  Title,
  UnstyledButton,
} from '@mantine/core'
import {
  IconClipboardCheck,
  IconClock,
  IconEye,
  IconFileTypePdf,
  IconFilter,
  IconMail,
  IconNote,
  IconPencil,
  IconPhoto,
  IconSearch,
} from '@tabler/icons-react'
import {
  DRIVER_DOC_META,
  DRIVER_DOC_TYPES,
  REVIEW_STATUS_META,
  type DriverDocFile,
  type DriverDocUpload,
  type ReviewStatus,
} from '../types/driverCenter'
import { mockDriverDocUploads } from '../data/driverCenterMock'
import { useNotification } from '../hooks/useNotification'

// 駕駛中心帳號管理 — PRD v9.0「4.9 後臺顯示」
// 呈現方式比照查繳任務：以「申請證件」為維度（駕照／行照／保單各一個 tab），一卡一組上傳。
// 檢視檔案以 Modal 開啟且不提供下載入口；審查失敗必填備註。

const cardShadow =
  '0px 7px 7px -5px rgba(0,0,0,0.04), 0px 10px 15px -5px rgba(0,0,0,0.1), 0px 1px 3px 0px rgba(0,0,0,0.05)'

const PAGE_SIZE = 6

// PRD 4.9：上傳時間以 YYYY-MM-DD hh:mm:ss 顯示（UTC+8）
function formatDateTime(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

// Tabs 以審查狀態為維度；篩選改為證件類型
const STATUS_TABS: ReviewStatus[] = ['pending', 'rejected', 'approved']

const DOC_TYPE_OPTIONS = DRIVER_DOC_TYPES.map((type) => ({
  value: type,
  label: DRIVER_DOC_META[type].label,
}))

type ReviewOverride = {
  reviewStatus: ReviewStatus
  reviewNote?: string
  reviewedAt?: string
}

export function DriverCenterAccounts() {
  const [activeTab, setActiveTab] = useState<ReviewStatus>('pending')
  const [pendingSearch, setPendingSearch] = useState('')
  const [search, setSearch] = useState('')
  const [pendingTypeFilter, setPendingTypeFilter] = useState<string[]>([])
  const [typeFilter, setTypeFilter] = useState<string[]>([])
  const [page, setPage] = useState(1)

  // demo 用 — 審查結果只在前端覆寫，重新整理即重置（與全 app 一致）
  const [reviewOverrides, setReviewOverrides] = useState<Record<string, ReviewOverride>>({})
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [viewerTarget, setViewerTarget] = useState<{ uploadId: string; fileId: string } | null>(
    null,
  )
  const { showSuccess } = useNotification()

  const uploads = useMemo(
    () =>
      mockDriverDocUploads.map((u) =>
        reviewOverrides[u.id] ? { ...u, ...reviewOverrides[u.id] } : u,
      ),
    [reviewOverrides],
  )

  const counts = useMemo(() => {
    const c = { pending: 0, rejected: 0, approved: 0 } as Record<ReviewStatus, number>
    uploads.forEach((u) => {
      c[u.reviewStatus] += 1
    })
    return c
  }, [uploads])

  const filtered = useMemo(() => {
    const kw = search.trim().toLowerCase()
    return uploads.filter((u) => {
      if (u.reviewStatus !== activeTab) return false
      if (typeFilter.length > 0 && !typeFilter.includes(u.docType)) return false
      if (kw && !u.userEmail.toLowerCase().includes(kw)) return false
      return true
    })
  }, [uploads, activeTab, typeFilter, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageData = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const reviewingUpload = reviewingId
    ? uploads.find((u) => u.id === reviewingId) ?? null
    : null

  const viewerUpload = viewerTarget
    ? uploads.find((u) => u.id === viewerTarget.uploadId) ?? null
    : null
  const viewerFile = viewerUpload
    ? viewerUpload.files.find((f) => f.id === viewerTarget?.fileId) ?? null
    : null

  const handleTabChange = (next: ReviewStatus) => {
    setActiveTab(next)
    setPage(1)
  }

  const handleSearchSubmit = () => {
    setSearch(pendingSearch)
    setTypeFilter(pendingTypeFilter)
    setPage(1)
  }

  const handleResetFilters = () => {
    setPendingSearch('')
    setSearch('')
    setPendingTypeFilter([])
    setTypeFilter([])
    setPage(1)
  }

  const handleReviewSubmit = (result: ReviewStatus, note?: string) => {
    if (!reviewingId) return
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
    setReviewOverrides((prev) => ({
      ...prev,
      [reviewingId]: { reviewStatus: result, reviewNote: note, reviewedAt: stamp },
    }))
    showSuccess(
      `${reviewingUpload?.userEmail ?? reviewingId} 的${
        reviewingUpload ? DRIVER_DOC_META[reviewingUpload.docType].label : '證件'
      }已標記為「${REVIEW_STATUS_META[result].label}」`,
      '審查結果已更新',
    )
    setReviewingId(null)
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
          駕駛中心帳號管理
        </Title>
      </Group>

      {/* Tabs：以審查狀態為維度 */}
      <Box px="24px">
        <Tabs
          value={activeTab}
          onChange={(v) => v && handleTabChange(v as ReviewStatus)}
          styles={{
            list: { borderBottom: '1px solid #e9ecef' },
            tab: {
              fontSize: 14,
              fontWeight: 500,
              fontFamily: 'Noto Sans TC, sans-serif',
              padding: '12px 16px',
            },
          }}
        >
          <Tabs.List>
            {STATUS_TABS.map((status) => (
              <Tabs.Tab key={status} value={status}>
                {REVIEW_STATUS_META[status].label}
                <Text component="span" size="xs" c="dimmed" ml="6px">
                  {counts[status]}
                </Text>
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs>
      </Box>

      {/* Filters */}
      <Box px="24px" pt="16px" pb="16px">
        <Box
          component="form"
          onSubmit={(e: React.FormEvent) => {
            e.preventDefault()
            handleSearchSubmit()
          }}
        >
          <Group gap="12px" align="flex-end" wrap="wrap">
            <TextInput
              placeholder="搜尋 Email 帳號"
              leftSection={<IconSearch size={16} />}
              value={pendingSearch}
              onChange={(e) => setPendingSearch(e.currentTarget.value)}
              style={{ flex: '1 1 auto', minWidth: 240 }}
              styles={{ input: { borderRadius: 4, height: 40, fontSize: 14 } }}
            />
            <MultiSelect
              placeholder={pendingTypeFilter.length === 0 ? '篩選類型' : undefined}
              data={DOC_TYPE_OPTIONS}
              value={pendingTypeFilter}
              onChange={setPendingTypeFilter}
              clearable
              leftSection={<IconFilter size={14} />}
              style={{ flex: '0 1 400px', minWidth: 220 }}
              styles={{
                input: { minHeight: 40, display: 'flex', alignItems: 'center' },
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
      </Box>

      {/* Cards */}
      <Box px="24px" pb="16px" style={{ flex: 1 }}>
        {pageData.length === 0 ? (
          <Box py="80px" style={{ textAlign: 'center' }}>
            <Text c="dimmed">沒有符合條件的上傳資料</Text>
          </Box>
        ) : (
          <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }} spacing="20px">
            {pageData.map((u) => (
              <DriverDocCard
                key={u.id}
                upload={u}
                onOpenFile={(uploadId, fileId) => setViewerTarget({ uploadId, fileId })}
                onReview={setReviewingId}
              />
            ))}
          </SimpleGrid>
        )}
      </Box>

      {/* Pagination */}
      {totalPages > 1 && (
        <Group
          justify="space-between"
          px="24px"
          py="16px"
          style={{ borderTop: '1px solid #f1f3f5' }}
        >
          <Text size="sm" c="dimmed">
            顯示第 {(safePage - 1) * PAGE_SIZE + 1} -{' '}
            {Math.min(safePage * PAGE_SIZE, filtered.length)} 筆，共 {filtered.length} 筆
          </Text>
          <Pagination total={totalPages} value={safePage} onChange={setPage} size="sm" />
        </Group>
      )}

      <FileViewerModal
        upload={viewerUpload}
        file={viewerFile}
        opened={!!viewerFile}
        onClose={() => setViewerTarget(null)}
      />

      <ReviewModal
        upload={reviewingUpload}
        opened={!!reviewingUpload}
        onClose={() => setReviewingId(null)}
        onSubmit={handleReviewSubmit}
      />
    </Paper>
  )
}

function DriverDocCard({
  upload,
  onOpenFile,
  onReview,
}: {
  upload: DriverDocUpload
  onOpenFile: (uploadId: string, fileId: string) => void
  onReview: (uploadId: string) => void
}) {
  const statusMeta = REVIEW_STATUS_META[upload.reviewStatus]

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
            {DRIVER_DOC_META[upload.docType].label}
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
          <CardRow icon={<IconMail size={14} />} label="帳號">
            <Text size="sm" fw={500} truncate>
              {upload.userEmail}
            </Text>
          </CardRow>
          <CardRow icon={<IconClock size={14} />} label="上傳時間">
            <Text size="sm" fw={500}>
              {formatDateTime(upload.uploadedAt)}
            </Text>
          </CardRow>
        </Stack>

        <Divider my="md" />

        {/* 上傳檔案：點擊以 Modal 檢視，不提供下載入口（PRD 4.9） */}
        <Stack gap="6px">
          {upload.files.map((f) => (
            <UnstyledButton key={f.id} onClick={() => onOpenFile(upload.id, f.id)}>
              <Group
                justify="space-between"
                wrap="nowrap"
                gap="8px"
                px="12px"
                py="8px"
                style={{ border: '1px solid #e9ecef', borderRadius: 8 }}
              >
                <Group gap="8px" wrap="nowrap" style={{ minWidth: 0 }}>
                  {f.kind === 'pdf' ? (
                    <IconFileTypePdf size={16} color="#228be6" style={{ flexShrink: 0 }} />
                  ) : (
                    <IconPhoto size={16} color="#228be6" style={{ flexShrink: 0 }} />
                  )}
                  <Text size="sm" fw={500} c="blue" truncate>
                    {f.label}｜{f.fileName}
                  </Text>
                </Group>
                <IconEye size={14} color="#868e96" style={{ flexShrink: 0 }} />
              </Group>
            </UnstyledButton>
          ))}
        </Stack>

        {upload.reviewStatus !== 'pending' && upload.reviewedAt && (
          <Stack gap="xs" mt="md">
            <CardRow icon={<IconClipboardCheck size={14} />} label="審查時間">
              <Text size="xs" c="dimmed">
                {formatDateTime(upload.reviewedAt)}
              </Text>
            </CardRow>
          </Stack>
        )}

        {upload.reviewStatus === 'rejected' && upload.reviewNote && (
          <Box
            mt="sm"
            px="12px"
            py="10px"
            style={{ backgroundColor: 'rgba(250,82,82,0.06)', borderRadius: 8 }}
          >
            <Group gap="6px" align="flex-start" wrap="nowrap">
              <IconNote size={14} color="#c92a2a" style={{ flexShrink: 0, marginTop: 2 }} />
              <Text size="xs" style={{ color: '#c92a2a' }}>
                {upload.reviewNote}
              </Text>
            </Group>
          </Box>
        )}
      </Box>

      <Group mt="lg" gap="xs" wrap="nowrap">
        {upload.reviewStatus === 'pending' ? (
          <Button
            variant="light"
            leftSection={<IconClipboardCheck size={16} />}
            onClick={() => onReview(upload.id)}
            style={{ flex: 1 }}
          >
            審查
          </Button>
        ) : (
          <Button
            variant="default"
            leftSection={<IconPencil size={16} />}
            onClick={() => onReview(upload.id)}
            style={{ flex: 1 }}
          >
            調整審查結果
          </Button>
        )}
      </Group>
    </Paper>
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

// 檔案檢視 Modal：圖片原圖檢視、PDF 以內建 viewer 開啟（demo 以示意頁呈現）。
// 依 PRD 4.9 決議不提供任何下載入口。
function FileViewerModal({
  upload,
  file,
  opened,
  onClose,
}: {
  upload: DriverDocUpload | null
  file: DriverDocFile | null
  opened: boolean
  onClose: () => void
}) {
  if (!upload || !file) return null
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="auto"
      title={
        <Group gap="8px" wrap="nowrap">
          <Text size="sm" fw={700}>
            {DRIVER_DOC_META[upload.docType].label}｜{file.label}
          </Text>
          <Text size="sm" c="dimmed">
            {file.fileName}
          </Text>
        </Group>
      }
    >
      <Stack gap="sm">
        {file.kind === 'image' ? (
          <img
            src={file.url}
            alt={`${DRIVER_DOC_META[upload.docType].label}${file.label}`}
            onContextMenu={(e) => e.preventDefault()}
            style={{
              display: 'block',
              maxWidth: 'min(840px, 82vw)',
              maxHeight: '66vh',
              borderRadius: 8,
            }}
          />
        ) : (
          <Box
            style={{
              backgroundColor: '#495057',
              padding: 20,
              borderRadius: 8,
              maxHeight: '66vh',
              overflow: 'auto',
            }}
          >
            <img
              src={file.url}
              alt={file.fileName}
              onContextMenu={(e) => e.preventDefault()}
              style={{
                display: 'block',
                width: 'min(560px, 76vw)',
                margin: '0 auto',
                boxShadow: '0px 4px 12px rgba(0,0,0,0.3)',
              }}
            />
          </Box>
        )}
        <Text size="xs" c="dimmed">
          僅供審核檢視，不提供下載
          {file.kind === 'pdf' && '；正式版 PDF 以瀏覽器內建檢視器開啟，demo 以示意頁呈現'}
        </Text>
      </Stack>
    </Modal>
  )
}

// 審查 Modal：審查成功／審查失敗二擇一，失敗必填備註
function ReviewModal({
  upload,
  opened,
  onClose,
  onSubmit,
}: {
  upload: DriverDocUpload | null
  opened: boolean
  onClose: () => void
  onSubmit: (result: ReviewStatus, note?: string) => void
}) {
  const [result, setResult] = useState<Exclude<ReviewStatus, 'pending'> | null>(null)
  const [note, setNote] = useState('')

  // 開啟時帶入現況（待審查為空白；調整審查結果時預填原本的結果與備註）
  useEffect(() => {
    if (upload) {
      setResult(upload.reviewStatus === 'pending' ? null : upload.reviewStatus)
      setNote(upload.reviewNote ?? '')
    }
  }, [upload])

  if (!upload) return null

  const canSubmit =
    result === 'approved' || (result === 'rejected' && note.trim().length > 0)

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size={460}
      title={
        <Text size="sm" fw={700}>
          審查證件
        </Text>
      }
    >
      <Stack gap="md">
        <Stack gap="4px">
          <Text size="xs" c="dimmed">
            帳號
          </Text>
          <Text size="sm" fw={500}>
            {upload.userEmail}
          </Text>
        </Stack>
        <Stack gap="4px">
          <Text size="xs" c="dimmed">
            證件類型
          </Text>
          <Text size="sm" fw={500}>
            {DRIVER_DOC_META[upload.docType].label}
          </Text>
        </Stack>
        <Stack gap="4px">
          <Text size="xs" c="dimmed">
            上傳時間
          </Text>
          <Text size="sm" fw={500}>
            {formatDateTime(upload.uploadedAt)}
          </Text>
        </Stack>

        <Radio.Group
          label="審查結果"
          value={result ?? ''}
          onChange={(v) => setResult(v as Exclude<ReviewStatus, 'pending'>)}
        >
          <Group gap="lg" mt="6px">
            <Radio value="approved" label="審查成功" />
            <Radio value="rejected" label="審查失敗" />
          </Group>
        </Radio.Group>

        {result === 'rejected' && (
          <Textarea
            label="備註"
            withAsterisk
            placeholder="請說明審查失敗原因（必填），例如照片反光、缺角、證件不符"
            value={note}
            onChange={(e) => setNote(e.currentTarget.value)}
            minRows={3}
            autosize
          />
        )}

        <Group justify="flex-end" gap="12px" mt="4px">
          <Button variant="default" onClick={onClose}>
            取消
          </Button>
          <Button
            disabled={!canSubmit}
            onClick={() => {
              if (!result) return
              onSubmit(result, result === 'rejected' ? note.trim() : undefined)
            }}
          >
            確認
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
