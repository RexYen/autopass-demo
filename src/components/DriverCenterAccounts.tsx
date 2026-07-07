import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ActionIcon,
  Box,
  Button,
  Divider,
  Group,
  Modal,
  MultiSelect,
  Pagination,
  Paper,
  Radio,
  Stack,
  Table,
  Tabs,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core'
import {
  IconChevronLeft,
  IconChevronRight,
  IconClipboardCheck,
  IconEye,
  IconFilter,
  IconSearch,
} from '@tabler/icons-react'
import {
  DRIVER_DOC_META,
  DRIVER_DOC_TYPES,
  REVIEW_STATUS_META,
  type DriverDocUpload,
  type ReviewStatus,
} from '../types/driverCenter'
import { mockDriverDocUploads } from '../data/driverCenterMock'
import { useNotification } from '../hooks/useNotification'

// 行駕照/保單（駕駛中心證件審核）— PRD v9.0「4.9 後臺顯示」
// Tabs 以審核狀態為維度（待審核／審核失敗／審核成功），內容為列表；篩選為證件類型。
// 證件影像內嵌於審核 Modal（看圖＋記錄結果一次完成，正反面左右切換）；
// 不提供下載入口；審核失敗必填備註、結果送出後不可調整。

const cardShadow =
  '0px 7px 7px -5px rgba(0,0,0,0.04), 0px 10px 15px -5px rgba(0,0,0,0.1), 0px 1px 3px 0px rgba(0,0,0,0.05)'

const PAGE_SIZE = 10

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

// PRD 4.9：上傳時間以 YYYY-MM-DD hh:mm:ss 顯示（UTC+8）
function formatDateTime(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function nowIsoStamp(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}

// Tabs 以審核狀態為維度；篩選改為證件類型
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

  // demo 用 — 審核結果只在前端覆寫，重新整理即重置（與全 app 一致）
  const [reviewOverrides, setReviewOverrides] = useState<Record<string, ReviewOverride>>({})
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  // 純檢視（審核成功列的「檢視」）：index 為目前顯示的檔案（正反面左右切換）
  const [viewerTarget, setViewerTarget] = useState<{ uploadId: string; index: number } | null>(
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
  const rangeStart = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(safePage * PAGE_SIZE, filtered.length)

  // 依 tab 顯示欄位：審核時間僅已審核；備註僅審核失敗；
  // 操作欄靠右：待審核提供「審核」、審核成功提供「檢視」，審核失敗無操作
  const showReviewedAt = activeTab !== 'pending'
  const showNote = activeTab === 'rejected'
  const showActions = activeTab !== 'rejected'

  const reviewingUpload = reviewingId
    ? uploads.find((u) => u.id === reviewingId) ?? null
    : null

  const viewerUpload = viewerTarget
    ? uploads.find((u) => u.id === viewerTarget.uploadId) ?? null
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
    setReviewOverrides((prev) => ({
      ...prev,
      [reviewingId]: { reviewStatus: result, reviewNote: note, reviewedAt: nowIsoStamp() },
    }))
    showSuccess(
      `${reviewingUpload?.userEmail ?? reviewingId} 的${
        reviewingUpload ? DRIVER_DOC_META[reviewingUpload.docType].label : '證件'
      }已標記為「${REVIEW_STATUS_META[result].label}」`,
      '審核結果已更新',
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
          行駕照/保單
        </Title>
      </Group>

      {/* Tabs：以審核狀態為維度 */}
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
              placeholder="搜尋 Email"
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

      {/* Table */}
      <Box style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>
        {pageData.length === 0 ? (
          <Box py="80px" style={{ textAlign: 'center' }}>
            <Text c="dimmed">沒有符合條件的上傳資料</Text>
          </Box>
        ) : (
          <Table
            withTableBorder={false}
            withRowBorders
            styles={{
              // tableLayout fixed + 固定欄寬：讓三個 tab 的共同欄位（類型/Email/檔案/時間）對齊一致
              table: { backgroundColor: '#ffffff', width: '100%', tableLayout: 'fixed' },
              thead: { backgroundColor: '#ffffff' },
              th: {
                color: '#868e96',
                fontWeight: 400,
                fontSize: '14px',
                lineHeight: '20px',
                padding: '12px 24px',
                height: '50px',
                borderBottom: '1px solid #dee2e6',
                fontFamily: 'Noto Sans TC, sans-serif',
              },
              td: {
                padding: '12px 24px',
                height: 'auto',
                minHeight: '50px',
                borderBottom: '1px solid #dee2e6',
                verticalAlign: 'middle',
                overflow: 'visible',
              },
              tr: { backgroundColor: '#ffffff' },
            }}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: '12%' }}>類型</Table.Th>
                <Table.Th style={{ width: '24%' }}>Email</Table.Th>
                <Table.Th style={{ width: '18%' }}>上傳時間</Table.Th>
                {showReviewedAt && <Table.Th style={{ width: '18%' }}>審核時間</Table.Th>}
                {showNote && <Table.Th>備註</Table.Th>}
                {showActions && (
                  <>
                    {/* 彈性空欄：把窄的操作欄推到列表最右側 */}
                    <Table.Th aria-hidden />
                    <Table.Th style={{ width: 110, textAlign: 'center' }}>操作</Table.Th>
                  </>
                )}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {pageData.map((u) => (
                <Table.Tr key={u.id}>
                  <Table.Td>
                    <Text style={{ ...cellText, whiteSpace: 'nowrap' }}>
                      {DRIVER_DOC_META[u.docType].label}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text style={cellText}>{u.userEmail}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text style={{ ...cellText, whiteSpace: 'nowrap' }}>
                      {formatDateTime(u.uploadedAt)}
                    </Text>
                  </Table.Td>
                  {showReviewedAt && (
                    <Table.Td>
                      <Text style={{ ...cellText, whiteSpace: 'nowrap' }}>
                        {u.reviewedAt ? formatDateTime(u.reviewedAt) : '—'}
                      </Text>
                    </Table.Td>
                  )}
                  {showNote && (
                    <Table.Td>
                      <Text style={cellTextDim}>{u.reviewNote ?? '—'}</Text>
                    </Table.Td>
                  )}
                  {showActions && (
                    <>
                      <Table.Td aria-hidden />
                      <Table.Td style={{ textAlign: 'center' }}>
                        {u.reviewStatus === 'pending' ? (
                        <Button
                          size="xs"
                          variant="light"
                          leftSection={<IconClipboardCheck size={14} />}
                          onClick={() => setReviewingId(u.id)}
                        >
                          審核
                        </Button>
                      ) : (
                        <Button
                          size="xs"
                          variant="default"
                          leftSection={<IconEye size={14} />}
                          onClick={() => setViewerTarget({ uploadId: u.id, index: 0 })}
                        >
                          檢視
                        </Button>
                      )}
                      </Table.Td>
                    </>
                  )}
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Box>

      {/* Footer */}
      <Group
        justify="space-between"
        px="24px"
        py="16px"
        style={{ borderTop: '1px solid #f1f3f5', flexShrink: 0 }}
      >
        <Text size="sm" c="dimmed">
          顯示 {rangeStart} - {rangeEnd} 筆，共 {filtered.length} 筆
        </Text>
        <Pagination total={totalPages} value={safePage} onChange={setPage} size="sm" />
      </Group>

      <ReviewModal
        upload={reviewingUpload}
        opened={!!reviewingUpload}
        onClose={() => setReviewingId(null)}
        onSubmit={handleReviewSubmit}
      />

      <FileViewerModal
        upload={viewerUpload}
        index={viewerTarget?.index ?? 0}
        opened={!!viewerUpload}
        onClose={() => setViewerTarget(null)}
        onIndexChange={(index) =>
          setViewerTarget((prev) => (prev ? { ...prev, index } : prev))
        }
      />
    </Paper>
  )
}

// 證件檔案 carousel：正反面左右切換（箭頭／觸控滑動）。圖片原圖檢視、PDF 以內建
// viewer 開啟（demo 以示意頁呈現）；依 PRD 4.9 決議不提供任何下載入口。
function DocFileCarousel({
  upload,
  index,
  onIndexChange,
  imageMaxHeight = '62vh',
}: {
  upload: DriverDocUpload
  index: number
  onIndexChange: (index: number) => void
  imageMaxHeight?: string
}) {
  const touchStartX = useRef<number | null>(null)

  const files = upload.files
  const current = Math.min(index, files.length - 1)
  const file = files[current]
  const hasMultiple = files.length > 1
  const goPrev = () => onIndexChange((current - 1 + files.length) % files.length)
  const goNext = () => onIndexChange((current + 1) % files.length)

  return (
    <Stack gap="sm">
      <Group wrap="nowrap" gap="sm" align="center" justify="center">
        {hasMultiple && (
          <ActionIcon variant="default" size="lg" onClick={goPrev} aria-label="上一張">
            <IconChevronLeft size={18} />
          </ActionIcon>
        )}
        <Box
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0].clientX
          }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null || !hasMultiple) return
            const dx = e.changedTouches[0].clientX - touchStartX.current
            if (Math.abs(dx) > 40) (dx > 0 ? goPrev : goNext)()
            touchStartX.current = null
          }}
        >
          {file.kind === 'image' ? (
            <img
              src={file.url}
              alt={`${DRIVER_DOC_META[upload.docType].label}${file.label}`}
              onContextMenu={(e) => e.preventDefault()}
              style={{
                display: 'block',
                maxWidth: 'min(640px, 74vw)',
                maxHeight: imageMaxHeight,
                borderRadius: 8,
              }}
            />
          ) : (
            <Box
              style={{
                backgroundColor: '#495057',
                padding: 20,
                borderRadius: 8,
                maxHeight: imageMaxHeight,
                overflow: 'auto',
              }}
            >
              <img
                src={file.url}
                alt={file.fileName}
                onContextMenu={(e) => e.preventDefault()}
                style={{
                  display: 'block',
                  width: 'min(480px, 70vw)',
                  margin: '0 auto',
                  boxShadow: '0px 4px 12px rgba(0,0,0,0.3)',
                }}
              />
            </Box>
          )}
        </Box>
        {hasMultiple && (
          <ActionIcon variant="default" size="lg" onClick={goNext} aria-label="下一張">
            <IconChevronRight size={18} />
          </ActionIcon>
        )}
      </Group>
      <Stack gap="2px">
        {hasMultiple && (
          <Text size="sm" c="dimmed" ta="center">
            {file.label}（{current + 1}/{files.length}）— 可左右滑動或點箭頭切換
          </Text>
        )}
        <Text size="xs" c="dimmed" ta="center">
          僅供審核檢視，不提供下載
          {file.kind === 'pdf' && '；正式版 PDF 以瀏覽器內建檢視器開啟，demo 以示意頁呈現'}
        </Text>
      </Stack>
    </Stack>
  )
}

// 純檢視 Modal（審核成功列的「檢視」進入，回看已審核的證件影像）
function FileViewerModal({
  upload,
  index,
  opened,
  onClose,
  onIndexChange,
}: {
  upload: DriverDocUpload | null
  index: number
  opened: boolean
  onClose: () => void
  onIndexChange: (index: number) => void
}) {
  if (!upload) return null

  const file = upload.files[Math.min(index, upload.files.length - 1)]

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
      <DocFileCarousel upload={upload} index={index} onIndexChange={onIndexChange} />
    </Modal>
  )
}

// 審核 Modal：看圖＋記錄結果一次完成 —— 內嵌證件 carousel，
// 審核成功／審核失敗二擇一，失敗必填備註
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
  const [fileIndex, setFileIndex] = useState(0)

  // 每次開啟重置（審核結果送出後不可調整，只有待審核會進到這裡）
  useEffect(() => {
    if (upload) {
      setResult(null)
      setNote('')
      setFileIndex(0)
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
      size="auto"
      title={
        <Text size="sm" fw={700}>
          審核證件
        </Text>
      }
    >
      <Stack gap="md">
        <Group gap="32px" wrap="wrap">
          <Stack gap="2px">
            <Text size="xs" c="dimmed">
              Email
            </Text>
            <Text size="sm" fw={500}>
              {upload.userEmail}
            </Text>
          </Stack>
          <Stack gap="2px">
            <Text size="xs" c="dimmed">
              證件類型
            </Text>
            <Text size="sm" fw={500}>
              {DRIVER_DOC_META[upload.docType].label}
            </Text>
          </Stack>
          <Stack gap="2px">
            <Text size="xs" c="dimmed">
              上傳時間
            </Text>
            <Text size="sm" fw={500}>
              {formatDateTime(upload.uploadedAt)}
            </Text>
          </Stack>
        </Group>

        <DocFileCarousel
          upload={upload}
          index={fileIndex}
          onIndexChange={setFileIndex}
          imageMaxHeight="46vh"
        />

        <Divider />

        <Radio.Group
          label="審核結果"
          value={result ?? ''}
          onChange={(v) => setResult(v as Exclude<ReviewStatus, 'pending'>)}
        >
          <Group gap="lg" mt="6px">
            <Radio value="approved" label="審核成功" />
            <Radio value="rejected" label="審核失敗" />
          </Group>
        </Radio.Group>

        {result === 'rejected' && (
          <Textarea
            label="備註"
            withAsterisk
            placeholder="請說明審核失敗原因（必填），例如照片反光、缺角、證件不符"
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
