import { useEffect, useState } from 'react'
import {
  Modal,
  Stack,
  Group,
  Box,
  Text,
  Badge,
  Radio,
  NumberInput,
  SegmentedControl,
  ThemeIcon,
  Textarea,
  Button,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import {
  IconExternalLink,
  IconCircleCheck,
  IconCircleX,
} from '@tabler/icons-react'
import {
  SERVICE_META,
  QUERY_FAILURE_REASON_META,
  type Ticket,
  type QueryFailureReason,
} from '../types/autopass'

type QueryResultChoice = 'no-online-fee' | 'query-failed' | 'has-fee'
type NoOnlineFeeReason = 'no-fee' | 'counter-required'
type HasFeeMode = 'has-amount' | 'mixed'
type ModalStep = 'input' | 'result'
type SimulatedResult = 'success' | 'failure'
type RetryChoice = 'retry' | 'no-retry'

const DEMO_FAIL_REASON = '信用卡授權失敗（demo 模擬）'

function formatRetryDate(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

export function QueryResultModal({
  ticket,
  opened,
  onClose,
  onSubmit,
}: {
  ticket: Ticket | null
  opened: boolean
  onClose: () => void
  onSubmit: (
    result: Partial<Pick<Ticket, 'status' | 'amount' | 'outcome' | 'queryFailureReason'>>,
    opts?: {
      failedInvoice?: { amount: number; failReason: string }
      openConfirmPaidAfter?: boolean
    },
  ) => void
}) {
  const [choice, setChoice] = useState<QueryResultChoice>('has-fee')
  const [noOnlineFeeReason, setNoOnlineFeeReason] = useState<NoOnlineFeeReason>('no-fee')
  const [hasFeeMode, setHasFeeMode] = useState<HasFeeMode>('has-amount')
  const [queryFailureReason, setQueryFailureReason] = useState<QueryFailureReason>('data-error')
  const [amount, setAmount] = useState<number | string>('')
  const [modalStep, setModalStep] = useState<ModalStep>('input')
  const [simulatedResult, setSimulatedResult] = useState<SimulatedResult>('success')
  const [retryChoice, setRetryChoice] = useState<RetryChoice>('retry')
  const [retryDays, setRetryDays] = useState<number | string>(7)

  useEffect(() => {
    if (opened) {
      setChoice('has-fee')
      setNoOnlineFeeReason('no-fee')
      setHasFeeMode('has-amount')
      setQueryFailureReason('data-error')
      setAmount('')
      setModalStep('input')
      setSimulatedResult('success')
      setRetryChoice('retry')
      setRetryDays(7)
    }
  }, [opened])

  if (!ticket) return null

  const serviceMeta = SERVICE_META[ticket.serviceType]
  const isEtcToll = ticket.serviceType === 'etc-toll'
  const supportsCounter =
    ticket.serviceType === 'traffic-fine-personal' ||
    ticket.serviceType === 'traffic-fine-corporate' ||
    ticket.serviceType === 'compulsory-insurance-fine'
  const numericAmount = Number(amount)
  const numericRetryDays = Number(retryDays)

  const canAdvance =
    choice === 'no-online-fee' ||
    choice === 'query-failed' ||
    (choice === 'has-fee' && numericAmount > 0)

  const canCloseResult =
    modalStep === 'result' &&
    (simulatedResult === 'success' ||
      retryChoice === 'no-retry' ||
      (retryChoice === 'retry' && numericRetryDays >= 1))

  const handleAdvance = () => {
    switch (choice) {
      case 'no-online-fee':
        if (noOnlineFeeReason === 'no-fee') {
          onSubmit({ status: 'no-fee', amount: 0, outcome: 'no-fee' })
          notifications.show({
            title: '已標記為無應繳費用',
            message: `${ticket.id} 已結案`,
            color: 'blue',
          })
        } else {
          onSubmit({ status: 'no-fee', amount: null, outcome: 'counter-only' })
          notifications.show({
            title: '已標記為整單需臨櫃辦理',
            message: '已寄信引導用戶臨櫃辦理，本票已結案',
            color: 'blue',
          })
        }
        break
      case 'query-failed': {
        const reasonMeta = QUERY_FAILURE_REASON_META[queryFailureReason]
        onSubmit({ status: 'query-failed', queryFailureReason })
        notifications.show({
          title: `已標記查詢失敗：${reasonMeta.label}`,
          message: '本票直接結案至歷史任務，若用戶更新資料下一週期會自動產生新 ticket',
          color: 'red',
        })
        break
      }
      case 'has-fee':
        setModalStep('result')
        notifications.show({
          title: '請款成功',
          message:
            hasFeeMode === 'mixed'
              ? `已向用戶請款 NT$ ${numericAmount.toLocaleString()}，並通知臨櫃部分自繳`
              : `已向用戶請款 NT$ ${numericAmount.toLocaleString()}，待確認代繳`,
          color: 'teal',
        })
        return
    }
  }

  const handleResultConfirm = () => {
    const a = numericAmount
    const outcome = hasFeeMode === 'mixed' ? 'online-mixed' : 'online-full'
    if (simulatedResult === 'success') {
      onSubmit(
        { status: 'invoice-success', amount: a, outcome },
        { openConfirmPaidAfter: true },
      )
      return
    }
    onSubmit(
      { status: 'invoice-failed', amount: a, outcome },
      { failedInvoice: { amount: a, failReason: DEMO_FAIL_REASON } },
    )
    if (retryChoice === 'retry') {
      const days = Math.max(1, Math.floor(numericRetryDays || 0))
      notifications.show({
        title: `請款失敗，已排程 ${days} 天後重新查詢`,
        message: `本任務以「請款失敗」進入歷史；系統將於 ${formatRetryDate(days)} 自動產生新的待查詢任務`,
        color: 'orange',
      })
    } else {
      notifications.show({
        title: '請款失敗，已直接結案',
        message: `${ticket.id} 以「請款失敗」進入歷史任務，不再重新嘗試`,
        color: 'red',
      })
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="lg"
      centered
      title={
        <Box>
          <Text size="md" fw={600}>
            {modalStep === 'input' ? '回填查詢結果' : '請款結果'}
          </Text>
          <Text size="xs" c="dimmed" mt={2}>
            {ticket.id} · {serviceMeta.label} · {ticket.userEmail} · {ticket.plateNumber}
          </Text>
        </Box>
      }
    >
      {modalStep === 'input' ? (
        <Stack gap="md">
          <Box
            style={{
              background: '#f8f9fa',
              borderRadius: 8,
              padding: '10px 14px',
            }}
          >
            <Group justify="space-between" wrap="nowrap">
              <Text size="sm" c="dimmed">
                線下查繳平台
              </Text>
              {serviceMeta.platform === '街口支付' ? (
                <Text size="sm" fw={500}>
                  {serviceMeta.platform}
                </Text>
              ) : (
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
                  <IconExternalLink size={12} style={{ marginLeft: 4, verticalAlign: 'middle' }} />
                </Text>
              )}
            </Group>
          </Box>

          <Radio.Group
            value={choice}
            onChange={(v) => setChoice(v as QueryResultChoice)}
            label="查詢結果"
            required
          >
            <Stack gap="xs" mt="xs">
              <Radio value="has-fee" label="需繳費" />
              {choice === 'has-fee' && (
                <Box
                  pl="28px"
                  style={{
                    borderLeft: '2px solid #e9ecef',
                    marginLeft: 8,
                  }}
                >
                  <Stack gap="sm" mt="xs">
                    {supportsCounter && (
                      <Radio.Group
                        value={hasFeeMode}
                        onChange={(v) => setHasFeeMode(v as HasFeeMode)}
                        label="繳費範圍"
                        size="sm"
                      >
                        <Stack gap="xs" mt="xs">
                          <Radio
                            value="has-amount"
                            label="全額可線上代繳"
                            description="查到的金額全數透過系統代繳"
                          />
                          <Radio
                            value="mixed"
                            label="部分需臨櫃繳費"
                            description="僅就線上部分代繳，臨櫃部分由用戶自行處理"
                          />
                        </Stack>
                      </Radio.Group>
                    )}
                    <NumberInput
                      label="線上可繳金額 (NT$)"
                      placeholder="輸入金額"
                      value={amount}
                      onChange={setAmount}
                      min={0}
                      thousandSeparator
                      required
                    />
                    <Text size="xs" c="dimmed">
                      送出後系統會即時向用戶發起請款，下一步顯示請款結果。
                      {hasFeeMode === 'mixed' && '同時，系統將發送臨櫃繳費通知信。'}
                    </Text>
                  </Stack>
                </Box>
              )}
              <Radio value="no-online-fee" label="無需繳費" />
              {choice === 'no-online-fee' && supportsCounter && (
                <Box
                  pl="28px"
                  style={{
                    borderLeft: '2px solid #e9ecef',
                    marginLeft: 8,
                  }}
                >
                  <Radio.Group
                    value={noOnlineFeeReason}
                    onChange={(v) => setNoOnlineFeeReason(v as NoOnlineFeeReason)}
                    label="原因"
                    size="sm"
                  >
                    <Stack gap="xs" mt="xs">
                      <Radio
                        value="no-fee"
                        label="無應繳費用"
                        description="平台查詢結果為零，直接結案"
                      />
                      <Radio
                        value="counter-required"
                        label="需臨櫃繳費"
                        description="無法線上代繳，系統將寄信引導用戶臨櫃辦理"
                      />
                    </Stack>
                  </Radio.Group>
                </Box>
              )}
              <Radio
                value="query-failed"
                label="查詢失敗"
                description="本票直接結案，系統將寄信引導用戶更新資料"
              />
              {choice === 'query-failed' && (
                <Box
                  pl="28px"
                  style={{
                    borderLeft: '2px solid #e9ecef',
                    marginLeft: 8,
                  }}
                >
                  <Radio.Group
                    value={queryFailureReason}
                    onChange={(v) => setQueryFailureReason(v as QueryFailureReason)}
                    label="原因"
                    size="sm"
                    required
                  >
                    <Stack gap="xs" mt="xs">
                      <Radio
                        value="data-error"
                        label={QUERY_FAILURE_REASON_META['data-error'].label}
                      />
                      {isEtcToll && (
                        <Radio
                          value="etag-bound"
                          label={QUERY_FAILURE_REASON_META['etag-bound'].label}
                        />
                      )}
                    </Stack>
                  </Radio.Group>
                </Box>
              )}
            </Stack>
          </Radio.Group>

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              取消
            </Button>
            <Button onClick={handleAdvance} disabled={!canAdvance}>
              {choice === 'has-fee' ? '送出請款' : '送出'}
            </Button>
          </Group>
        </Stack>
      ) : (
        <Stack gap="md">
          <Group justify="flex-end" align="center">
            <SegmentedControl
              size="xs"
              value={simulatedResult}
              onChange={(v) => setSimulatedResult(v as SimulatedResult)}
              data={[
                { label: '成功', value: 'success' },
                { label: '失敗', value: 'failure' },
              ]}
            />
          </Group>

          {simulatedResult === 'success' ? (
            <Box
              style={{
                background: 'rgba(18,184,134,0.10)',
                border: '1px solid rgba(18,184,134,0.30)',
                borderRadius: 8,
                padding: '14px 16px',
              }}
            >
              <Group gap="10px" wrap="nowrap" align="flex-start">
                <ThemeIcon color="teal" radius="xl" size="lg" variant="light">
                  <IconCircleCheck size={22} />
                </ThemeIcon>
                <Stack gap={2} style={{ flex: 1 }}>
                  <Text size="sm" fw={600} c="teal.8">
                    請款成功
                  </Text>
                  <Text size="sm" c="dark.7">
                    已向用戶請款 NT$ {numericAmount.toLocaleString()}
                    {hasFeeMode === 'mixed' && '，臨櫃部分由用戶自繳'}
                  </Text>
                  <Text size="xs" c="dimmed" mt={2}>
                    本票進入「請款成功」狀態，等待代繳完成
                  </Text>
                </Stack>
              </Group>
            </Box>
          ) : (
            <Stack gap="sm">
              <Box
                style={{
                  background: 'rgba(250,82,82,0.08)',
                  border: '1px solid rgba(250,82,82,0.30)',
                  borderRadius: 8,
                  padding: '14px 16px',
                }}
              >
                <Group gap="10px" wrap="nowrap" align="flex-start">
                  <ThemeIcon color="red" radius="xl" size="lg" variant="light">
                    <IconCircleX size={22} />
                  </ThemeIcon>
                  <Stack gap={2} style={{ flex: 1 }}>
                    <Text size="sm" fw={600} c="red.7">
                      請款失敗
                    </Text>
                    <Text size="sm" c="dark.7">
                      金額 NT$ {numericAmount.toLocaleString()}
                    </Text>
                    <Text size="xs" c="dimmed" mt={2}>
                      本任務將以「請款失敗」狀態進入歷史任務，系統將寄信引導用戶更新付款方式
                    </Text>
                  </Stack>
                </Group>
              </Box>

              <Radio.Group
                value={retryChoice}
                onChange={(v) => setRetryChoice(v as RetryChoice)}
                label="後續處理"
                required
              >
                <Stack gap="xs" mt="xs">
                  <Radio
                    value="retry"
                    label="幾天後重新查詢"
                    description="系統將在指定天數後重新產生待查詢任務"
                  />
                  {retryChoice === 'retry' && (
                    <Box
                      pl="28px"
                      style={{
                        borderLeft: '2px solid #e9ecef',
                        marginLeft: 8,
                      }}
                    >
                      <Stack gap={4} mt="xs">
                        <NumberInput
                          label="X 天後重新產生待查詢任務"
                          value={retryDays}
                          onChange={setRetryDays}
                          min={1}
                          max={90}
                          required
                        />
                        {numericRetryDays >= 1 && (
                          <Text size="xs" c="dimmed">
                            預計於 {formatRetryDate(Math.floor(numericRetryDays))} 自動產生新任務
                          </Text>
                        )}
                      </Stack>
                    </Box>
                  )}
                  <Radio
                    value="no-retry"
                    label="不重新嘗試"
                    description="本任務直接結案，不再追蹤"
                  />
                </Stack>
              </Radio.Group>
            </Stack>
          )}

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              關閉
            </Button>
            <Button
              color={simulatedResult === 'success' ? undefined : 'red'}
              onClick={handleResultConfirm}
              disabled={!canCloseResult}
            >
              {simulatedResult === 'success' ? '下一步' : '確認結案'}
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  )
}

export function ConfirmPaidModal({
  ticket,
  opened,
  onClose,
  onConfirm,
}: {
  ticket: Ticket | null
  opened: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  if (!ticket) return null

  const serviceMeta = SERVICE_META[ticket.serviceType]
  const isMixed = ticket.outcome === 'online-mixed'

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="md"
      centered
      title={
        <Box>
          <Text size="md" fw={600}>
            確認已代繳
          </Text>
          <Text size="xs" c="dimmed" mt={2}>
            {ticket.id} · {serviceMeta.label} · {ticket.userEmail}
          </Text>
        </Box>
      }
    >
      <Stack gap="md">
        <Text size="sm" c="dark.7">
          請確認已透過 <Text component="span" fw={600}>{serviceMeta.platform}</Text> 完成線下代繳，提交後此票將標記為「繳款成功」並結案，系統將寄送繳款成功通知。
        </Text>

        <Box
          style={{
            background: '#f8f9fa',
            borderRadius: 8,
            padding: '14px 16px',
          }}
        >
          <Group gap="12px" wrap="wrap" align="center">
            <Box>
              <Text size="xs" c="dimmed" mb={2}>
                線上代繳金額
              </Text>
              <Text size="20px" fw={700} style={{ lineHeight: 1.2 }}>
                NT$ {(ticket.amount ?? 0).toLocaleString()}
              </Text>
            </Box>
            {isMixed && (
              <Badge size="sm" color="blue" variant="light">
                部分需臨櫃繳費
              </Badge>
            )}
          </Group>
        </Box>

        {isMixed && (
          <Text size="xs" c="dimmed">
            混合單僅就線上部分結案，臨櫃部分由用戶自行處理，後台不再追蹤金額。
          </Text>
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose}>
            取消
          </Button>
          <Button color="teal" onClick={onConfirm}>
            確認已代繳
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}

export function AddNoteModal({
  ticket,
  opened,
  onClose,
  onSubmit,
}: {
  ticket: Ticket | null
  opened: boolean
  onClose: () => void
  onSubmit: (ticketId: string, content: string) => void
}) {
  const [content, setContent] = useState('')

  useEffect(() => {
    if (opened) setContent('')
  }, [opened])

  if (!ticket) return null

  const serviceMeta = SERVICE_META[ticket.serviceType]
  const trimmed = content.trim()
  const disabled = trimmed.length === 0

  const handleSubmit = () => {
    if (disabled) return
    onSubmit(ticket.id, trimmed)
    onClose()
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="md"
      centered
      title={
        <Box>
          <Text size="md" fw={600}>
            新增備註
          </Text>
          <Text size="xs" c="dimmed" mt={2}>
            {ticket.id} · {serviceMeta.label} · {ticket.userEmail}
          </Text>
        </Box>
      }
    >
      <Stack gap="md">
        <Textarea
          placeholder="填寫備註內容..."
          value={content}
          onChange={(e) => setContent(e.currentTarget.value)}
          autosize
          minRows={4}
          maxRows={10}
          data-autofocus
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
              e.preventDefault()
              handleSubmit()
            }
          }}
        />
        <Group justify="space-between" align="center">
          <Text size="xs" c="dimmed">
            ⌘ / Ctrl + Enter 送出
          </Text>
          <Group gap="xs">
            <Button variant="default" onClick={onClose}>
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={disabled}>
              新增備註
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  )
}
