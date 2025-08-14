import {
  Paper,
  Title,
  Group,
  Button,
  TextInput,
  Badge,
  Text,
  Box,
  Modal,
  Stack,
  Textarea,
  Radio,
  Table,
  Timeline,
  ScrollArea,
  Grid,
} from '@mantine/core'
import {
  IconPlus,
  IconSearch,
  IconBuilding,
  IconClock,
  IconCircleCheck,
  IconAlertCircle,
  IconX,
  IconChevronLeft,
  IconUser,
  IconActivity,
  IconEye,
} from '@tabler/icons-react'

import { useState } from 'react'
import { useNotification } from '../hooks/useNotification'

// Mock data for tasks - 根據業務流程重新設計
const mockTasks = [
  {
    id: 1,
    stationName: '台北101停車場',
    scenario: '舊業者｜舊合約｜新場站',
    overallStatus: '待建立',
    createdBy: '商務部 - 王小明',
    createdAt: '2025-01-25',
    operator: '世潮企業股份有限公司',
    address: '台北市信義區信義路五段7號',
    contactPerson: '張經理',
    contactPhone: '0912-345-678',
    contactEmail: 'chang@parking.com',
    notes: '地下B2-B5層，共400個車位',
    contractFile: null,
    // 根據情境一設計的狀態
    moduleStatus: {
      vendor: { status: '不需要', assignee: null },
      contract: { status: '不需要', assignee: null },
      merchant: { status: '待建立', assignee: '營運部 - 陳小美' },
      mapResource: { status: '待建立', assignee: '圖資部 - 黃小強' },
    },
    activities: [
      {
        id: 1,
        action: '建立任務',
        user: '商務部 - 王小明',
        time: '2025-01-25 10:30',
        description: '建立場站上線任務，系統已自動建立場站商店和圖資'
      }
    ]
  },
  {
    id: 2,
    stationName: '信義威秀停車場',
    scenario: '舊業者｜新合約｜新場站',
    overallStatus: '進行中',
    createdBy: '商務部 - 李小華',
    createdAt: '2025-01-24',
    operator: '世潮企業股份有限公司',
    address: '台北市信義區松壽路20號',
    contactPerson: '林經理',
    contactPhone: '0923-456-789',
    contactEmail: 'lin@parking.com',
    notes: '配合威秀影城營業時間',
    contractFile: '威秀停車場合約.pdf',
    // 根據情境二設計的狀態
    moduleStatus: {
      vendor: { status: '不需要', assignee: null },
      contract: { status: '待啟用', assignee: '營運部 - 陳小美' },
      merchant: { status: '待上架', assignee: '營運部 - 陳小美' },
      mapResource: { status: '待上架', assignee: '圖資部 - 黃小強' },
    },
    activities: [
      {
        id: 1,
        action: '建立任務',
        user: '商務部 - 李小華',
        time: '2025-01-24 14:20',
        description: '建立場站上線任務，系統已自動建立場站商店和圖資，提醒營運建立新合約'
      },
      {
        id: 2,
        action: '完成合約設定',
        user: '營運部 - 陳小美',
        time: '2025-01-24 15:30',
        description: '在業者管理中完成合約設定'
      },
      {
        id: 3,
        action: '完成商店設定',
        user: '營運部 - 陳小美',
        time: '2025-01-24 16:45',
        description: '完成交易設定和串接設定'
      },
      {
        id: 4,
        action: '完成圖資設定',
        user: '圖資部 - 黃小強',
        time: '2025-01-25 09:15',
        description: '完成圖資設定和費率設定'
      }
    ]
  },
  {
    id: 3,
    stationName: '大直美麗華停車場',
    scenario: '新業者｜新合約｜新場站',
    overallStatus: '待覆核',
    createdBy: '商務部 - 張小雯',
    createdAt: '2025-01-23',
    operator: '美麗華企業股份有限公司',
    address: '台北市中山區敬業三路20號',
    contactPerson: '李總監',
    contactPhone: '0987-654-321',
    contactEmail: 'lee@miramar.com',
    notes: '百貨公司地下停車場，假日車流量大',
    contractFile: '美麗華停車場合約.pdf',
    // 根據情境三設計的狀態
    moduleStatus: {
      vendor: { status: '待啟用', assignee: '營運部 - 陳小美' },
      contract: { status: '待啟用', assignee: '營運部 - 陳小美' },
      merchant: { status: '待上架', assignee: '營運部 - 陳小美' },
      mapResource: { status: '待上架', assignee: '圖資部 - 黃小強' },
    },
    activities: [
      {
        id: 1,
        action: '建立任務',
        user: '商務部 - 張小雯',
        time: '2025-01-23 11:00',
        description: '建立場站上線任務，系統已自動建立場站業者、商店和圖資'
      },
      {
        id: 2,
        action: '完成業者設定',
        user: '營運部 - 陳小美',
        time: '2025-01-23 14:30',
        description: '在業者管理中完成業者建立'
      },
      {
        id: 3,
        action: '完成合約設定',
        user: '營運部 - 陳小美',
        time: '2025-01-23 15:15',
        description: '在業者管理中完成合約設定'
      },
      {
        id: 4,
        action: '完成商店設定',
        user: '營運部 - 陳小美',
        time: '2025-01-23 16:20',
        description: '完成交易設定和串接設定'
      },
      {
        id: 5,
        action: '完成圖資設定',
        user: '圖資部 - 黃小強',
        time: '2025-01-24 10:30',
        description: '完成圖資設定和費率設定'
      }
    ]
  }
]

// Scenario options with detailed descriptions
const scenarios = [
  { 
    value: '舊業者｜舊合約｜新場站', 
    label: '舊業者｜舊合約｜新場站', 
    description: '既有業者使用現有合約增加新場站',
    modules: ['商店管理', '圖資管理']
  },
  { 
    value: '舊業者｜新合約｜新場站', 
    label: '舊業者｜新合約｜新場站', 
    description: '既有業者簽訂新合約並增加新場站',
    modules: ['業者管理(合約)', '商店管理', '圖資管理']
  },
  { 
    value: '新業者｜新合約｜新場站', 
    label: '新業者｜新合約｜新場站', 
    description: '全新業者加入平台',
    modules: ['業者管理(業者+合約)', '商店管理', '圖資管理']
  }
]

interface TaskManagementProps {}

export function TaskManagement({}: TaskManagementProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTask, setSelectedTask] = useState<any>(null)
  
  // Create task modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createStep, setCreateStep] = useState(1)
  const [selectedScenario, setSelectedScenario] = useState('')
  
  // Task detail modal
  const [showTaskDetail, setShowTaskDetail] = useState(false)
  
  // Task form data
  const [taskDetails, setTaskDetails] = useState({
    stationName: '',
    operator: '',
    address: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    notes: '',
    contractFile: null as File | null
  })
  
  const { showSuccess } = useNotification()

  const getStatusColor = (status: string) => {
    switch (status) {
      case '待建立': return { bg: 'rgba(134,142,150,0.1)', color: '#212529' }
      case '進行中': return { bg: 'rgba(34,139,230,0.1)', color: '#212529' }
      case '待上架': return { bg: 'rgba(250,176,5,0.1)', color: '#212529' }
      case '待啟用': return { bg: 'rgba(250,130,49,0.1)', color: '#212529' }
      case '待覆核': return { bg: 'rgba(173,58,204,0.1)', color: '#212529' }
      case '已完成': return { bg: 'rgba(18,184,134,0.1)', color: '#212529' }
      default: return { bg: 'rgba(134,142,150,0.1)', color: '#212529' }
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case '待建立': return <IconClock size={14} />
      case '進行中': return <IconAlertCircle size={14} />
      case '待上架': return <IconClock size={14} />
      case '待啟用': return <IconAlertCircle size={14} />
      case '待覆核': return <IconEye size={14} />
      case '已完成': return <IconCircleCheck size={14} />
      default: return <IconClock size={14} />
    }
  }

  const getModuleStatusColor = (status: string) => {
    switch (status) {
      case '待建立': return '#868e96'
      case '待上架': return '#fab005'
      case '待啟用': return '#fd7e14'
      case '已完成': return '#12b886'
      case '不需要': return '#dee2e6'
      default: return '#868e96'
    }
  }

  const handleCreateTask = () => {
    console.log('Creating task with details:', taskDetails)
    console.log('Selected scenario:', selectedScenario)
    
    if (taskDetails.stationName.trim() && taskDetails.operator.trim() && 
        taskDetails.address.trim() && taskDetails.contactPerson.trim() && 
        taskDetails.contactPhone.trim()) {
      
      showSuccess(`已建立任務「${taskDetails.stationName}」`, '建立任務成功')
      
      // Reset form
      setTaskDetails({
        stationName: '',
        operator: '',
        address: '',
        contactPerson: '',
        contactPhone: '',
        contactEmail: '',
        notes: '',
        contractFile: null
      })
      setSelectedScenario('')
      setCreateStep(1)
      setIsCreateModalOpen(false)
    } else {
      console.log('Validation failed:', {
        stationName: taskDetails.stationName,
        operator: taskDetails.operator,
        address: taskDetails.address,
        contactPerson: taskDetails.contactPerson,
        contactPhone: taskDetails.contactPhone
      })
    }
  }

  const handleCancelCreate = () => {
    setTaskDetails({
      stationName: '',
      operator: '',
      address: '',
      contactPerson: '',
      contactPhone: '',
      contactEmail: '',
      notes: '',
      contractFile: null
    })
    setSelectedScenario('')
    setCreateStep(1)
    setIsCreateModalOpen(false)
  }

  const handleViewTaskDetail = (task: any) => {
    console.log('Opening task detail for:', task)
    setSelectedTask(task)
    setShowTaskDetail(true)
  }

  const handleCompleteReview = () => {
    showSuccess('覆核完成', '已發送上線公告至 Slack 頻道')
  }

  const filteredTasks = mockTasks.filter(task =>
    task.stationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.operator.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.scenario.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
        style={{ 
          borderBottom: 'none',
          flexShrink: 0,
        }}
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
          任務管理
        </Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => setIsCreateModalOpen(true)}
          style={{
            backgroundColor: '#228be6',
            color: '#ffffff',
            height: '40px',
            padding: '8px 20px',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: 400,
            lineHeight: '24px',
          }}
        >
          建立新任務
        </Button>
      </Group>

      {/* Search and Filters */}
      <Box px="20px" pb="24px" style={{ flexShrink: 0 }}>
        <TextInput
          placeholder="搜尋場站名稱、業者或情境"
          leftSection={<IconSearch size={16} />}
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.currentTarget.value)}
          style={{ 
            maxWidth: '321px',
            width: '100%'
          }}
          styles={{
            input: {
              borderColor: '#dee2e6',
              borderRadius: '4px',
              height: '40px',
              fontSize: '14px',
              lineHeight: '20px',
              '&::placeholder': {
                color: '#adb5bd',
              },
            },
          }}
        />
      </Box>

      {/* Task Table */}
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
            table: {
              backgroundColor: '#ffffff',
              width: '100%',
            },
            thead: {
              backgroundColor: '#ffffff',
            },
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
              minHeight: '60px',
              borderBottom: '1px solid #dee2e6',
              verticalAlign: 'middle',
              overflow: 'visible',
            },
            tr: {
              backgroundColor: '#ffffff',
              '&:hover': {
                backgroundColor: '#f8f9fa',
              },
            },
          }}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: '20%' }}>場站名稱</Table.Th>
              <Table.Th style={{ width: '20%' }}>情境類型</Table.Th>
              <Table.Th style={{ width: '12%' }}>整體狀態</Table.Th>
              <Table.Th style={{ width: '28%' }}>模組狀態</Table.Th>
              <Table.Th style={{ width: '12%' }}>建立時間</Table.Th>
              <Table.Th style={{ width: '8%' }}>操作</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredTasks.map((task) => {
              const statusStyle = getStatusColor(task.overallStatus)
              return (
                <Table.Tr key={task.id}>
                  {/* 場站名稱 */}
                  <Table.Td>
                    <Stack gap="4px">
                      <Text
                        style={{
                          color: '#228be6',
                          fontSize: '14px',
                          lineHeight: '20px',
                          fontFamily: 'Noto Sans TC, sans-serif',
                          fontWeight: 500,
                          cursor: 'pointer',
                          textDecoration: 'underline',
                        }}
                        onClick={() => handleViewTaskDetail(task)}
                      >
                        {task.stationName}
                      </Text>
                      <Text
                        style={{
                          color: '#6c757d',
                          fontSize: '12px',
                          lineHeight: '16px',
                          fontFamily: 'Noto Sans TC, sans-serif',
                        }}
                      >
                        {task.operator}
                      </Text>
                    </Stack>
                  </Table.Td>

                  {/* 情境類型 */}
                  <Table.Td>
                    <Text
                      style={{
                        color: '#000000',
                        fontSize: '14px',
                        lineHeight: '20px',
                        fontFamily: 'Noto Sans TC, sans-serif',
                        fontWeight: 400,
                      }}
                    >
                      {task.scenario}
                    </Text>
                  </Table.Td>

                  {/* 整體狀態 */}
                  <Table.Td>
                    <Badge
                      variant="light"
                      styles={{
                        root: {
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.color,
                          fontSize: '12px',
                          lineHeight: '16px',
                          fontWeight: 400,
                          padding: '4px 8px',
                          borderRadius: '16px',
                          border: 'none',
                          fontFamily: 'Noto Sans TC, sans-serif',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        },
                      }}
                    >
                      {getStatusIcon(task.overallStatus)}
                      {task.overallStatus}
                    </Badge>
                  </Table.Td>

                  {/* 模組狀態 */}
                  <Table.Td>
                    <Group gap="8px" wrap="nowrap">
                      {/* 業者狀態 */}
                      {task.moduleStatus.vendor.status !== '不需要' && (
                        <Box
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: '#f8f9fa',
                          }}
                        >
                          <Box
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: getModuleStatusColor(task.moduleStatus.vendor.status),
                            }}
                          />
                          <Text size="xs">業者</Text>
                        </Box>
                      )}
                      
                      {/* 合約狀態 */}
                      {task.moduleStatus.contract.status !== '不需要' && (
                        <Box
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: '#f8f9fa',
                          }}
                        >
                          <Box
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: getModuleStatusColor(task.moduleStatus.contract.status),
                            }}
                          />
                          <Text size="xs">合約</Text>
                        </Box>
                      )}

                      {/* 商店狀態 */}
                      <Box
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: '#f8f9fa',
                        }}
                      >
                        <Box
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: getModuleStatusColor(task.moduleStatus.merchant.status),
                          }}
                        />
                        <Text size="xs">商店</Text>
                      </Box>

                      {/* 圖資狀態 */}
                      <Box
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: '#f8f9fa',
                        }}
                      >
                        <Box
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: getModuleStatusColor(task.moduleStatus.mapResource.status),
                          }}
                        />
                        <Text size="xs">圖資</Text>
                      </Box>
                    </Group>
                  </Table.Td>

                  {/* 建立時間 */}
                  <Table.Td>
                    <Text
                      style={{
                        color: '#6c757d',
                        fontSize: '14px',
                        lineHeight: '20px',
                        fontFamily: 'Noto Sans TC, sans-serif',
                      }}
                    >
                      {task.createdAt}
                    </Text>
                  </Table.Td>

                  {/* 操作 */}
                  <Table.Td>
                    <Button
                      variant="subtle"
                      size="sm"
                      onClick={() => handleViewTaskDetail(task)}
                      style={{
                        color: '#228be6',
                        padding: '4px 8px',
                      }}
                    >
                      <IconEye size={16} />
                    </Button>
                  </Table.Td>
                </Table.Tr>
              )
            })}
          </Table.Tbody>
        </Table>
      </Box>

      {/* Create Task Modal */}
      <Modal
        opened={isCreateModalOpen}
        onClose={handleCancelCreate}
        title=""
        centered
        size={createStep === 1 ? 520 : 640}
        padding="16px"
        styles={{
          content: {
            background: '#ffffff',
            boxShadow: '0px 7px 7px -5px rgba(0,0,0,0.04), 0px 10px 15px -5px rgba(0,0,0,0.1), 0px 1px 3px 0px rgba(0,0,0,0.05)',
            borderRadius: '4px',
          },
          header: {
            display: 'none',
          },
          body: {
            padding: '16px',
          },
        }}
      >
        <Stack gap="24px">
          {/* Step Indicator */}
          <Group justify="space-between" align="center">
            <Group gap="16px" align="center">
              <Box
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: createStep === 1 ? '#228be6' : '#12b886',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                {createStep === 1 ? '1' : <IconCircleCheck size={16} />}
              </Box>
              <Box style={{ width: '64px', height: '2px', backgroundColor: '#dee2e6', position: 'relative' }}>
                <Box
                  style={{
                    width: createStep === 2 ? '100%' : '0%',
                    height: '100%',
                    backgroundColor: '#228be6',
                    transition: 'width 0.3s ease',
                  }}
                />
              </Box>
              <Box
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: createStep === 2 ? '#228be6' : '#dee2e6',
                  color: createStep === 2 ? '#ffffff' : '#6c757d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                2
              </Box>
            </Group>
            <Button
              variant="subtle"
              onClick={handleCancelCreate}
              style={{ padding: '4px', minWidth: 'auto' }}
            >
              <IconX size={20} />
            </Button>
          </Group>

          {/* Step 1: Select Scenario */}
          {createStep === 1 && (
            <>
              <Box>
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
                  選擇情境類型
                </Title>
              </Box>

              <Radio.Group value={selectedScenario} onChange={setSelectedScenario}>
                <Stack gap="12px">
                  {scenarios.map((scenario) => (
                    <Box
                      key={scenario.value}
                      style={{
                        border: `1px solid ${selectedScenario === scenario.value ? '#228be6' : '#dee2e6'}`,
                        borderRadius: '8px',
                        padding: '16px',
                        backgroundColor: selectedScenario === scenario.value ? 'rgba(34,139,230,0.05)' : '#ffffff',
                        cursor: 'pointer',
                      }}
                      onClick={() => setSelectedScenario(scenario.value)}
                    >
                      <Group gap="12px" align="flex-start">
                        <Radio value={scenario.value} mt={2} />
                        <Box style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontSize: '14px',
                              fontWeight: 500,
                              color: '#000000',
                              lineHeight: '20px',
                              fontFamily: 'Noto Sans TC, sans-serif',
                              marginBottom: '4px',
                            }}
                          >
                            {scenario.label}
                          </Text>
                          <Text
                            style={{
                              fontSize: '12px',
                              color: '#6c757d',
                              lineHeight: '16px',
                              fontFamily: 'Noto Sans TC, sans-serif',
                            }}
                          >
                            {scenario.description}
                          </Text>
                        </Box>
                      </Group>
                    </Box>
                  ))}
                </Stack>
              </Radio.Group>

              <Group justify="flex-end">
                <Button
                  onClick={() => setCreateStep(2)}
                  disabled={!selectedScenario}
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
                      '&:hover': {
                        backgroundColor: '#1c7ed6',
                      },
                      '&:disabled': {
                        backgroundColor: '#e9ecef',
                        color: '#868e96',
                      },
                    },
                  }}
                >
                  下一步
                </Button>
              </Group>
            </>
          )}

          {/* Step 2: Fill Details */}
          {createStep === 2 && (
            <>
              <Box>
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
                  填寫場站資訊
                </Title>
              </Box>

              <ScrollArea style={{ maxHeight: '60vh' }}>
                <Stack gap="16px">
                  {/* Parking Name */}
                  <Stack gap="4px">
                    <Group gap="0">
                      <Text
                        style={{
                          color: '#000000',
                          fontSize: '14px',
                          fontFamily: 'Noto Sans TC',
                          fontWeight: 500,
                          lineHeight: '20px',
                        }}
                      >
                        場站名稱{' '}
                      </Text>
                      <Text
                        style={{
                          color: '#fa5252',
                          fontSize: '14px',
                          fontFamily: 'Noto Sans TC',
                          fontWeight: 500,
                          lineHeight: '20px',
                        }}
                      >
                        *
                      </Text>
                    </Group>
                    <TextInput
                      placeholder="請輸入場站名稱"
                      value={taskDetails.stationName}
                      onChange={(event) => setTaskDetails({ ...taskDetails, stationName: event.currentTarget.value })}
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
                          '&::placeholder': {
                            color: '#adb5bd',
                          },
                        },
                      }}
                    />
                  </Stack>

                  {/* Operator */}
                  <Stack gap="4px">
                    <Group gap="0">
                      <Text
                        style={{
                          color: '#000000',
                          fontSize: '14px',
                          fontFamily: 'Noto Sans TC',
                          fontWeight: 500,
                          lineHeight: '20px',
                        }}
                      >
                        業者名稱{' '}
                      </Text>
                      <Text
                        style={{
                          color: '#fa5252',
                          fontSize: '14px',
                          fontFamily: 'Noto Sans TC',
                          fontWeight: 500,
                          lineHeight: '20px',
                        }}
                      >
                        *
                      </Text>
                    </Group>
                    <TextInput
                      placeholder="請輸入業者名稱"
                      value={taskDetails.operator}
                      onChange={(event) => setTaskDetails({ ...taskDetails, operator: event.currentTarget.value })}
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
                          '&::placeholder': {
                            color: '#adb5bd',
                          },
                        },
                      }}
                    />
                  </Stack>

                  {/* Address */}
                  <Stack gap="4px">
                    <Group gap="0">
                      <Text
                        style={{
                          color: '#000000',
                          fontSize: '14px',
                          fontFamily: 'Noto Sans TC',
                          fontWeight: 500,
                          lineHeight: '20px',
                        }}
                      >
                        場站地址{' '}
                      </Text>
                      <Text
                        style={{
                          color: '#fa5252',
                          fontSize: '14px',
                          fontFamily: 'Noto Sans TC',
                          fontWeight: 500,
                          lineHeight: '20px',
                        }}
                      >
                        *
                      </Text>
                    </Group>
                    <TextInput
                      placeholder="請輸入場站地址"
                      value={taskDetails.address}
                      onChange={(event) => setTaskDetails({ ...taskDetails, address: event.currentTarget.value })}
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
                          '&::placeholder': {
                            color: '#adb5bd',
                          },
                        },
                      }}
                    />
                  </Stack>

                  {/* Contact Info */}
                  <Grid>
                    <Grid.Col span={6}>
                      <Stack gap="4px">
                        <Group gap="0">
                          <Text
                            style={{
                              color: '#000000',
                              fontSize: '14px',
                              fontFamily: 'Noto Sans TC',
                              fontWeight: 500,
                              lineHeight: '20px',
                            }}
                          >
                            聯絡人{' '}
                          </Text>
                          <Text
                            style={{
                              color: '#fa5252',
                              fontSize: '14px',
                              fontFamily: 'Noto Sans TC',
                              fontWeight: 500,
                              lineHeight: '20px',
                            }}
                          >
                            *
                          </Text>
                        </Group>
                        <TextInput
                          placeholder="請輸入聯絡人姓名"
                          value={taskDetails.contactPerson}
                          onChange={(event) => setTaskDetails({ ...taskDetails, contactPerson: event.currentTarget.value })}
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
                              '&::placeholder': {
                                color: '#adb5bd',
                              },
                            },
                          }}
                        />
                      </Stack>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Stack gap="4px">
                        <Group gap="0">
                          <Text
                            style={{
                              color: '#000000',
                              fontSize: '14px',
                              fontFamily: 'Noto Sans TC',
                              fontWeight: 500,
                              lineHeight: '20px',
                            }}
                          >
                            聯絡電話{' '}
                          </Text>
                          <Text
                            style={{
                              color: '#fa5252',
                              fontSize: '14px',
                              fontFamily: 'Noto Sans TC',
                              fontWeight: 500,
                              lineHeight: '20px',
                            }}
                          >
                            *
                          </Text>
                        </Group>
                        <TextInput
                          placeholder="請輸入聯絡電話"
                          value={taskDetails.contactPhone}
                          onChange={(event) => setTaskDetails({ ...taskDetails, contactPhone: event.currentTarget.value })}
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
                              '&::placeholder': {
                                color: '#adb5bd',
                              },
                            },
                          }}
                        />
                      </Stack>
                    </Grid.Col>
                  </Grid>

                  {/* Email */}
                  <Stack gap="4px">
                    <Text
                      style={{
                        color: '#000000',
                        fontSize: '14px',
                        fontFamily: 'Noto Sans TC',
                        fontWeight: 500,
                        lineHeight: '20px',
                      }}
                    >
                      電子郵件
                    </Text>
                    <TextInput
                      placeholder="請輸入電子郵件"
                      value={taskDetails.contactEmail}
                      onChange={(event) => setTaskDetails({ ...taskDetails, contactEmail: event.currentTarget.value })}
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
                          '&::placeholder': {
                            color: '#adb5bd',
                          },
                        },
                      }}
                    />
                  </Stack>

                  {/* Notes */}
                  <Stack gap="4px">
                    <Text
                      style={{
                        color: '#000000',
                        fontSize: '14px',
                        fontFamily: 'Noto Sans TC',
                        fontWeight: 500,
                        lineHeight: '20px',
                      }}
                    >
                      備註
                    </Text>
                    <Textarea
                      placeholder="請輸入備註資訊"
                      value={taskDetails.notes}
                      onChange={(event) => setTaskDetails({ ...taskDetails, notes: event.currentTarget.value })}
                      rows={3}
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
                          '&::placeholder': {
                            color: '#adb5bd',
                          },
                        },
                      }}
                    />
                  </Stack>

                  {/* 合約上傳（情境二、三需要） */}
                  {(selectedScenario.includes('新合約')) && (
                    <Stack gap="4px">
                      <Group gap="0">
                        <Text
                          style={{
                            color: '#000000',
                            fontSize: '14px',
                            fontFamily: 'Noto Sans TC',
                            fontWeight: 500,
                            lineHeight: '20px',
                          }}
                        >
                          合約文件{' '}
                        </Text>
                        <Text
                          style={{
                            color: '#fa5252',
                            fontSize: '14px',
                            fontFamily: 'Noto Sans TC',
                            fontWeight: 500,
                            lineHeight: '20px',
                          }}
                        >
                          *
                        </Text>
                      </Group>
                      <Box
                        style={{
                          border: '2px dashed #dee2e6',
                          borderRadius: '8px',
                          padding: '24px',
                          textAlign: 'center',
                          backgroundColor: '#f8f9fa',
                        }}
                      >
                        <Stack gap="8px" align="center">
                          <Text
                            style={{
                              color: '#6c757d',
                              fontSize: '14px',
                              fontFamily: 'Noto Sans TC',
                              fontWeight: 400,
                              lineHeight: '20px',
                            }}
                          >
                            拖放文件或點擊上傳
                          </Text>
                          <Text
                            style={{
                              color: '#adb5bd',
                              fontSize: '12px',
                              fontFamily: 'Noto Sans TC',
                              fontWeight: 400,
                              lineHeight: '16px',
                            }}
                          >
                            支援 PDF、DOC、DOCX 格式，最大 10MB
                          </Text>
                        </Stack>
                      </Box>
                    </Stack>
                  )}
                </Stack>
              </ScrollArea>

              <Group justify="space-between">
                <Button
                  variant="outline"
                  onClick={() => setCreateStep(1)}
                  leftSection={<IconChevronLeft size={16} />}
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
                      '&:hover': {
                        backgroundColor: '#f8f9fa',
                      },
                    },
                  }}
                >
                  上一步
                </Button>
                <Button
                  onClick={handleCreateTask}
                  disabled={!taskDetails.stationName.trim() || !taskDetails.operator.trim() || 
                           !taskDetails.address.trim() || !taskDetails.contactPerson.trim() || 
                           !taskDetails.contactPhone.trim()}
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
                      '&:hover': {
                        backgroundColor: '#1c7ed6',
                      },
                      '&:disabled': {
                        backgroundColor: '#e9ecef',
                        color: '#868e96',
                      },
                    },
                  }}
                >
                  建立任務
                </Button>
              </Group>
            </>
          )}
        </Stack>
      </Modal>

      {/* Task Detail Modal */}
      {showTaskDetail && selectedTask && (
        <Modal
          opened={showTaskDetail}
          onClose={() => {
            setShowTaskDetail(false)
            setSelectedTask(null)
          }}
          title="任務詳情"
          size="lg"
          padding="20px"
          centered
        >
          <Stack gap="20px">
            {/* 基本資訊 */}
            <Box>
              <Text size="lg" fw={600} mb="md">基本資訊</Text>
              <Stack gap="sm">
                <Group>
                  <Text size="sm" c="dimmed" w={100}>場站名稱:</Text>
                  <Text size="sm">{selectedTask.stationName}</Text>
                </Group>
                <Group>
                  <Text size="sm" c="dimmed" w={100}>業者名稱:</Text>
                  <Text size="sm">{selectedTask.operator}</Text>
                </Group>
                <Group>
                  <Text size="sm" c="dimmed" w={100}>情境類型:</Text>
                  <Text size="sm">{selectedTask.scenario}</Text>
                </Group>
                <Group>
                  <Text size="sm" c="dimmed" w={100}>整體狀態:</Text>
                  <Badge
                    variant="light"
                    styles={{
                      root: {
                        backgroundColor: getStatusColor(selectedTask.overallStatus).bg,
                        color: getStatusColor(selectedTask.overallStatus).color,
                      },
                    }}
                  >
                    {selectedTask.overallStatus}
                  </Badge>
                </Group>
                <Group>
                  <Text size="sm" c="dimmed" w={100}>建立者:</Text>
                  <Text size="sm">{selectedTask.createdBy}</Text>
                </Group>
                <Group>
                  <Text size="sm" c="dimmed" w={100}>建立時間:</Text>
                  <Text size="sm">{selectedTask.createdAt}</Text>
                </Group>
              </Stack>
            </Box>

            {/* 聯絡資訊 */}
            <Box>
              <Text size="lg" fw={600} mb="md">聯絡資訊</Text>
              <Stack gap="sm">
                <Group>
                  <Text size="sm" c="dimmed" w={100}>聯絡人:</Text>
                  <Text size="sm">{selectedTask.contactPerson}</Text>
                </Group>
                <Group>
                  <Text size="sm" c="dimmed" w={100}>聯絡電話:</Text>
                  <Text size="sm">{selectedTask.contactPhone}</Text>
                </Group>
                {selectedTask.contactEmail && (
                  <Group>
                    <Text size="sm" c="dimmed" w={100}>電子郵件:</Text>
                    <Text size="sm">{selectedTask.contactEmail}</Text>
                  </Group>
                )}
                <Group>
                  <Text size="sm" c="dimmed" w={100}>地址:</Text>
                  <Text size="sm">{selectedTask.address}</Text>
                </Group>
              </Stack>
            </Box>

            {/* 備註 */}
            {selectedTask.notes && (
              <Box>
                <Text size="lg" fw={600} mb="md">備註</Text>
                <Text size="sm">{selectedTask.notes}</Text>
              </Box>
            )}

            {/* 操作按鈕 */}
            {selectedTask.overallStatus === '待覆核' && (
              <Group justify="flex-end">
                <Button
                  onClick={() => {
                    handleCompleteReview()
                    setShowTaskDetail(false)
                    setSelectedTask(null)
                  }}
                  styles={{
                    root: {
                      backgroundColor: '#12b886',
                      '&:hover': {
                        backgroundColor: '#0ca678',
                      },
                    },
                  }}
                >
                  完成覆核
                </Button>
              </Group>
            )}
          </Stack>
            {/* Header */}
            <Group
              justify="space-between"
              p="20px"
              style={{
                borderBottom: '1px solid #dee2e6',
                flexShrink: 0,
              }}
            >
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
                任務詳情
              </Title>
              <Button
                variant="subtle"
                onClick={() => {
                  setShowTaskDetail(false)
                  setSelectedTask(null)
                }}
                style={{ padding: '4px', minWidth: 'auto' }}
              >
                <IconX size={20} />
              </Button>
            </Group>

            {/* Content */}
            <Box style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              {/* Left Panel - Main Content */}
              <ScrollArea style={{ flex: 1, padding: '20px' }}>
                <Stack gap="20px">
                  {/* Station Info */}
                  <Box
                    style={{
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      padding: '16px',
                    }}
                  >
                    <Group mb="12px" align="center">
                      <IconBuilding size={16} />
                      <Text
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#000000',
                          fontFamily: 'Noto Sans TC, sans-serif',
                        }}
                      >
                        場站資訊
                      </Text>
                    </Group>
                    <Grid>
                      <Grid.Col span={6}>
                        <Text size="xs" c="dimmed">場站名稱</Text>
                        <Text size="sm" fw={500}>{selectedTask.stationName}</Text>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Text size="xs" c="dimmed">業者名稱</Text>
                        <Text size="sm" fw={500}>{selectedTask.operator}</Text>
                      </Grid.Col>
                      <Grid.Col span={12}>
                        <Text size="xs" c="dimmed">地址</Text>
                        <Text size="sm" fw={500}>{selectedTask.address}</Text>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Text size="xs" c="dimmed">情境類型</Text>
                        <Text size="sm" fw={500}>{selectedTask.scenario}</Text>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Text size="xs" c="dimmed">當前狀態</Text>
                        <Badge
                          variant="light"
                          styles={{
                            root: {
                              backgroundColor: getStatusColor(selectedTask.overallStatus).bg,
                              color: getStatusColor(selectedTask.overallStatus).color,
                              fontSize: '12px',
                              lineHeight: '16px',
                              fontWeight: 400,
                              padding: '4px 8px',
                              borderRadius: '16px',
                              border: 'none',
                              fontFamily: 'Noto Sans TC, sans-serif',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            },
                          }}
                        >
                          {getStatusIcon(selectedTask.overallStatus)}
                          {selectedTask.overallStatus}
                        </Badge>
                      </Grid.Col>
                    </Grid>
                  </Box>

                  {/* Contact Info */}
                  <Box
                    style={{
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      padding: '16px',
                    }}
                  >
                    <Group mb="12px" align="center">
                      <IconUser size={16} />
                      <Text
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#000000',
                          fontFamily: 'Noto Sans TC, sans-serif',
                        }}
                      >
                        聯絡資訊
                      </Text>
                    </Group>
                    <Grid>
                      <Grid.Col span={4}>
                        <Text size="xs" c="dimmed">聯絡人</Text>
                        <Text size="sm" fw={500}>{selectedTask.contactPerson}</Text>
                      </Grid.Col>
                      <Grid.Col span={4}>
                        <Text size="xs" c="dimmed">電話</Text>
                        <Text size="sm" fw={500}>{selectedTask.contactPhone}</Text>
                      </Grid.Col>
                      {selectedTask.contactEmail && (
                        <Grid.Col span={4}>
                          <Text size="xs" c="dimmed">電子郵件</Text>
                          <Text size="sm" fw={500} style={{ wordBreak: 'break-all' }}>{selectedTask.contactEmail}</Text>
                        </Grid.Col>
                      )}
                    </Grid>
                  </Box>

                  {/* Notes */}
                  {selectedTask.notes && (
                    <Box
                      style={{
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        padding: '16px',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#000000',
                          fontFamily: 'Noto Sans TC, sans-serif',
                          marginBottom: '8px',
                        }}
                      >
                        備註
                      </Text>
                      <Text size="sm" c="gray.7">{selectedTask.notes}</Text>
                    </Box>
                  )}
                </Stack>
              </ScrollArea>

              {/* Right Panel - Status & Activities */}
              <Box
                style={{
                  width: '320px',
                  borderLeft: '1px solid #dee2e6',
                  flexShrink: 0,
                }}
              >
                <ScrollArea style={{ height: '100%', padding: '20px' }}>
                  <Stack gap="20px">
                    {/* Status Details */}
                    <Box
                      style={{
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        padding: '16px',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#000000',
                          fontFamily: 'Noto Sans TC, sans-serif',
                          marginBottom: '12px',
                        }}
                      >
                        各項狀態
                      </Text>
                      <Stack gap="8px">
                        <Group justify="space-between">
                          <Text size="xs" c="dimmed">商家管理</Text>
                          <Text size="xs" fw={500} c={
                            selectedTask.overallStatusDetails.merchant === '待建立' ? 'gray.6' :
                            selectedTask.overallStatusDetails.merchant === '待上架' ? 'yellow.6' :
                            'green.6'
                          }>
                            {selectedTask.overallStatusDetails.merchant}
                          </Text>
                        </Group>
                        <Group justify="space-between">
                          <Text size="xs" c="dimmed">圖資管理</Text>
                          <Text size="xs" fw={500} c={
                            selectedTask.overallStatusDetails.map === '待建立' ? 'gray.6' :
                            selectedTask.overallStatusDetails.map === '待上架' ? 'yellow.6' :
                            'green.6'
                          }>
                            {selectedTask.overallStatusDetails.map}
                          </Text>
                        </Group>
                        {selectedTask.overallStatusDetails.contract !== '不需要' && (
                          <Group justify="space-between">
                            <Text size="xs" c="dimmed">合約管理</Text>
                            <Text size="xs" fw={500} c={
                              selectedTask.overallStatusDetails.contract === '待建立' ? 'gray.6' :
                              selectedTask.overallStatusDetails.contract === '待啟用' ? 'yellow.6' :
                              'green.6'
                            }>
                              {selectedTask.overallStatusDetails.contract}
                            </Text>
                          </Group>
                        )}
                        {selectedTask.overallStatusDetails.operator !== '不需要' && (
                          <Group justify="space-between">
                            <Text size="xs" c="dimmed">業者管理</Text>
                            <Text size="xs" fw={500} c={
                              selectedTask.overallStatusDetails.operator === '待建立' ? 'gray.6' :
                              selectedTask.overallStatusDetails.operator === '待啟用' ? 'yellow.6' :
                              'green.6'
                            }>
                              {selectedTask.overallStatusDetails.operator}
                            </Text>
                          </Group>
                        )}
                      </Stack>
                    </Box>

                    {/* Activity Log */}
                    <Box
                      style={{
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        padding: '16px',
                      }}
                    >
                      <Group mb="12px" align="center">
                        <IconActivity size={16} />
                        <Text
                          style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#000000',
                            fontFamily: 'Noto Sans TC, sans-serif',
                          }}
                        >
                          活動記錄
                        </Text>
                      </Group>
                      <Timeline active={selectedTask.activities.length} bulletSize={12} lineWidth={2}>
                        {selectedTask.activities.map((activity: any, index: number) => (
                          <Timeline.Item key={index} bullet={<IconCircleCheck size={8} />}>
                            <Text size="xs" fw={500}>{activity.action}</Text>
                            <Text size="xs" c="dimmed">{activity.description}</Text>
                            <Text size="xs" c="dimmed">{activity.user}</Text>
                            <Text size="xs" c="gray.5">{activity.time}</Text>
                          </Timeline.Item>
                        ))}
                      </Timeline>
                    </Box>
                  </Stack>
                </ScrollArea>
              </Box>
            </Box>

            {/* Footer */}
            <Group
              justify="flex-end"
              p="20px"
              gap="12px"
              style={{
                borderTop: '1px solid #dee2e6',
                flexShrink: 0,
              }}
            >
              <Button
                variant="outline"
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
                    '&:hover': {
                      backgroundColor: '#f8f9fa',
                    },
                  },
                }}
              >
                編輯任務
              </Button>
              {selectedTask.overallStatus === '待覆核' && (
                <Button
                  styles={{
                    root: {
                      backgroundColor: '#12b886',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '6px 16px',
                      color: '#ffffff',
                      fontSize: '14px',
                      fontFamily: 'Noto Sans TC',
                      fontWeight: 400,
                      lineHeight: '20px',
                      '&:hover': {
                        backgroundColor: '#0ca678',
                      },
                    },
                  }}
                >
                  完成覆核
                </Button>
              )}
            </Group>
          </Box>
        </Modal>
      )}
    </Paper>
  )
}