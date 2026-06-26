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
  ScrollArea,
  Grid,
  Timeline,
  Card,
  ActionIcon,
  Progress,
  Avatar,
  Divider,
  SimpleGrid,
} from '@mantine/core'
import {
  IconPlus,
  IconSearch,
  IconClock,
  IconCircleCheck,
  IconAlertCircle,
  IconX,
  IconChevronLeft,
  IconEye,
  IconBuildingStore,
  IconMapPin,
  IconFileText,
  IconUsers,
  IconTrendingUp,
  IconBuilding,
  IconCheck,
  IconArrowRight,
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
      contract: { status: '已完成', assignee: '營運部 - 陳小美' },
      merchant: { status: '待上架', assignee: '營運部 - 陳小美' },
      mapResource: { status: '已完成', assignee: '圖資部 - 黃小強' },
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
      vendor: { status: '已完成', assignee: '營運部 - 陳小美' },
      contract: { status: '已完成', assignee: '營運部 - 陳小美' },
      merchant: { status: '已完成', assignee: '營運部 - 陳小美' },
      mapResource: { status: '已完成', assignee: '圖資部 - 黃小強' },
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
    modules: ['商店管理', '圖資管理'],
    icon: IconBuildingStore,
    color: '#228be6'
  },
  { 
    value: '舊業者｜新合約｜新場站', 
    label: '舊業者｜新合約｜新場站', 
    description: '既有業者簽訂新合約並增加新場站',
    modules: ['業者管理(合約)', '商店管理', '圖資管理'],
    icon: IconFileText,
    color: '#fd7e14'
  },
  { 
    value: '新業者｜新合約｜新場站', 
    label: '新業者｜新合約｜新場站', 
    description: '全新業者加入平台',
    modules: ['業者管理(業者+合約)', '商店管理', '圖資管理'],
    icon: IconUsers,
    color: '#12b886'
  }
]

export function TaskManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTask, setSelectedTask] = useState<typeof mockTasks[0] | null>(null)
  
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
      case '待上架': return <IconTrendingUp size={14} />
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

  const getProgressPercentage = (moduleStatus: typeof mockTasks[0]['moduleStatus']) => {
    const modules = Object.values(moduleStatus)
    const total = modules.filter(m => m.status !== '不需要').length
    const completed = modules.filter(m => m.status === '已完成').length
    return total > 0 ? (completed / total) * 100 : 0
  }

  const getScenarioConfig = (scenario: string) => {
    return scenarios.find(s => s.value === scenario)
  }

  const handleCreateTask = () => {
    if (taskDetails.stationName.trim() && taskDetails.operator.trim() && 
        taskDetails.address.trim() && taskDetails.contactPerson.trim() && 
        taskDetails.contactPhone.trim()) {
      
      showSuccess(`已建立任務「${taskDetails.stationName}」`, '已發送任務通知至 Slack 頻道')
      
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

  const handleViewTaskDetail = (task: typeof mockTasks[0]) => {
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
        marginBottom: '24px',
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

      {/* Search */}
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
            },
          }}
        />
      </Box>

      {/* Task Cards */}
      <Box 
        style={{ 
          flex: 1,
          overflow: 'auto',
          paddingLeft: '20px',
          paddingRight: '20px',
          paddingBottom: '24px',
        }}
      >
        <SimpleGrid 
          cols={{ base: 1, sm: 2, lg: 3 }}
          spacing="20px"
          style={{ paddingBottom: '24px' }}
        >
          {filteredTasks.map((task) => {
            const progress = getProgressPercentage(task.moduleStatus)
            const scenarioConfig = getScenarioConfig(task.scenario)
            const statusStyle = getStatusColor(task.overallStatus)
            
            return (
              <Card
                key={task.id}
                padding="16px"
                radius="8px"
                withBorder
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e9ecef',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  minHeight: '300px',
                  height: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                styles={{
                  root: {
                  }
                }}
                onClick={() => handleViewTaskDetail(task)}
              >
                {/* Card Header */}
                <Group justify="space-between" mb="12px">
                  <Badge
                    variant="light"
                    leftSection={getStatusIcon(task.overallStatus)}
                    styles={{
                      root: {
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.color,
                        fontSize: '11px',
                        fontWeight: 400,
                        border: 'none',
                        fontFamily: 'Noto Sans TC, sans-serif',
                      },
                    }}
                  >
                    {task.overallStatus}
                  </Badge>
                  <ActionIcon variant="subtle" size="sm" color="gray">
                    <IconArrowRight size={14} />
                  </ActionIcon>
                </Group>

                {/* Scenario Icon & Type */}
                <Group gap="8px" mb="12px">
                  {scenarioConfig && (
                    <Box
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        backgroundColor: `${scenarioConfig.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <scenarioConfig.icon size={14} color={scenarioConfig.color} />
                    </Box>
                  )}
                  <Text size="xs" c="dimmed" fw={500}>
                    {task.scenario}
                  </Text>
                </Group>

                {/* Station Name & Operator */}
                <Stack gap="4px" mb="12px">
                  <Text
                    fw={600}
                    size="sm"
                    c="dark.8"
                    style={{
                      lineHeight: 1.3,
                      cursor: 'pointer',
                    }}
                  >
                    {task.stationName}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {task.operator}
                  </Text>
                  <Group gap="4px">
                    <IconMapPin size={12} color="#868e96" />
                    <Text size="xs" c="dimmed" lineClamp={1}>
                      {task.address}
                    </Text>
                  </Group>
                </Stack>

                {/* Progress Section */}
                <Box mb="16px" style={{ flex: 1, minHeight: '80px' }}>
                  <Group justify="space-between" mb="8px">
                    <Text size="xs" fw={500} c="dark.6">
                      完成進度
                    </Text>
                    <Text size="xs" c="dimmed">
                      {Math.round(progress)}%
                    </Text>
                  </Group>
                  <Progress
                    value={progress}
                    size="sm"
                    radius="xl"
                    color={progress === 100 ? 'teal' : 'blue'}
                    mb="8px"
                  />
                  
                  {/* Module Status Indicators */}
                  <Group gap="6px" wrap="nowrap">
                    {Object.entries(task.moduleStatus).map(([key, status]) => {
                      if (status.status === '不需要') return null
                      
                      const moduleNames = {
                        vendor: '業者',
                        contract: '合約', 
                        merchant: '商店',
                        mapResource: '圖資'
                      }
                      
                      return (
                        <Box
                          key={key}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            padding: '1px 4px',
                            borderRadius: '3px',
                            backgroundColor: '#f8f9fa',
                            border: '1px solid #e9ecef',
                          }}
                        >
                          <Box
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: getModuleStatusColor(status.status),
                            }}
                          />
                          <Text size="xs" c="dark.6" fw={400} style={{ fontSize: '10px' }}>
                            {moduleNames[key as keyof typeof moduleNames]}
                          </Text>
                        </Box>
                      )
                    })}
                  </Group>
                </Box>

                <Divider my="sm" />

                {/* Footer */}
                <Group justify="space-between" align="center" mt="auto">
                  <Group gap="6px">
                    <Avatar size={20} color="blue" radius="xl">
                      {task.createdBy.split(' - ')[1]?.[0] || 'U'}
                    </Avatar>
                    <Box>
                      <Text size="xs" fw={500} c="dark.7">
                        {task.createdBy.split(' - ')[1] || task.createdBy}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {task.createdAt}
                      </Text>
                    </Box>
                  </Group>
                </Group>
              </Card>
            )
          })}
        </SimpleGrid>
      </Box>

      {/* Create Task Modal */}
      <Modal
        opened={isCreateModalOpen}
        onClose={handleCancelCreate}
        title=""
        centered
        size={createStep === 1 ? 560 : 800}
        padding={0}
        styles={{
          content: {
            background: '#ffffff',
            boxShadow: '0px 7px 7px -5px rgba(0,0,0,0.04), 0px 10px 15px -5px rgba(0,0,0,0.1), 0px 1px 3px 0px rgba(0,0,0,0.05)',
            borderRadius: '4px',
            maxHeight: '95vh',
            overflow: 'hidden',
          },
          header: {
            display: 'none',
          },
          body: {
            padding: '24px',
            maxHeight: 'calc(95vh - 48px)',
            overflow: 'hidden',
          },
        }}
      >
        <Stack gap={createStep === 1 ? "24px" : "20px"}>
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
                  {scenarios.map((scenario) => {
                    const Icon = scenario.icon
                    return (
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
                          <Box
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              backgroundColor: `${scenario.color}15`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Icon size={18} color={scenario.color} />
                          </Box>
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
                                marginBottom: '8px',
                              }}
                            >
                              {scenario.description}
                            </Text>
                            <Group gap="4px">
                              {scenario.modules.map((module, idx) => (
                                <Badge
                                  key={idx}
                                  variant="light"
                                  size="xs"
                                  style={{
                                    backgroundColor: `${scenario.color}10`,
                                    color: scenario.color,
                                    border: 'none',
                                  }}
                                >
                                  {module}
                                </Badge>
                              ))}
                            </Group>
                          </Box>
                        </Group>
                      </Box>
                    )
                  })}
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

              <ScrollArea.Autosize mah="calc(75vh - 160px)" scrollbarSize={6} offsetScrollbars={false}>
                <Stack gap="16px" pb="24px">
                  {/* Station Name */}
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
                        },
                      }}
                    />
                  </Stack>

                  {/* Contract Upload for scenarios with new contract */}
                  {selectedScenario.includes('新合約') && (
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
              </ScrollArea.Autosize>

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

      {/* Enhanced Task Detail Modal */}
      {showTaskDetail && selectedTask && (
        <Modal
          opened={showTaskDetail}
          onClose={() => {
            setShowTaskDetail(false)
            setSelectedTask(null)
          }}
          title=""
          size="xl"
          padding={0}
          centered
          styles={{
            content: {
              background: '#ffffff',
              boxShadow: '0px 7px 7px -5px rgba(0,0,0,0.04), 0px 10px 15px -5px rgba(0,0,0,0.1), 0px 1px 3px 0px rgba(0,0,0,0.05)',
              borderRadius: '4px',
              maxHeight: '90vh',
            },
            header: {
              display: 'none',
            },
            body: {
              padding: 0,
            },
          }}
        >
          <Box>
            {/* Header with gradient background */}
            <Box
              style={{
                background: 'linear-gradient(135deg, #228be6 0%, #339af0 100%)',
                color: 'white',
                padding: '24px',
                borderRadius: '4px 4px 0 0',
              }}
            >
              <Group justify="space-between" align="flex-start">
                <Box style={{ flex: 1 }}>
                  <Group gap="8px" mb="8px">
                    {(() => {
                      const scenarioConfig = getScenarioConfig(selectedTask.scenario)
                      const Icon = scenarioConfig?.icon || IconBuildingStore
                      return (
                        <Box
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Icon size={18} color="white" />
                        </Box>
                      )
                    })()}
                    <Text size="sm" opacity={0.9}>
                      {selectedTask.scenario}
                    </Text>
                  </Group>
                  <Title order={3} c="white" mb="4px">
                    {selectedTask.stationName}
                  </Title>
                  <Text size="sm" opacity={0.9} mb="12px">
                    {selectedTask.operator}
                  </Text>
                  <Group gap="12px">
                    <Badge
                      variant="light"
                      color="white"
                      styles={{
                        root: {
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          color: 'white',
                          border: '1px solid rgba(255,255,255,0.3)',
                        },
                      }}
                    >
                      {selectedTask.overallStatus}
                    </Badge>
                    <Text size="sm" opacity={0.8}>
                      {(() => {
                        const progress = getProgressPercentage(selectedTask.moduleStatus)
                        return `${Math.round(progress)}% 完成`
                      })()}
                    </Text>
                  </Group>
                </Box>
                <ActionIcon
                  variant="subtle"
                  size="lg"
                  onClick={() => {
                    setShowTaskDetail(false)
                    setSelectedTask(null)
                  }}
                  style={{ color: 'white' }}
                >
                  <IconX size={20} />
                </ActionIcon>
              </Group>
            </Box>

            <ScrollArea style={{ height: '60vh' }}>
              <Box p="24px">
                <Grid gutter="24px">
                  {/* Left Column */}
                  <Grid.Col span={8}>
                    <Stack gap="24px">
                      {/* Progress Visualization */}
                      <Card withBorder p="20px">
                        <Group justify="space-between" mb="16px">
                          <Text fw={600} size="md">整體進度</Text>
                          <Text size="sm" c="dimmed">
                            {(() => {
                              const progress = getProgressPercentage(selectedTask.moduleStatus)
                              return `${Math.round(progress)}%`
                            })()}
                          </Text>
                        </Group>
                        <Progress
                          value={getProgressPercentage(selectedTask.moduleStatus)}
                          size="lg"
                          radius="xl"
                          color="blue"
                          mb="20px"
                        />
                        <SimpleGrid cols={2} spacing="12px">
                          {Object.entries(selectedTask.moduleStatus).map(([key, status]) => {
                            if (status.status === '不需要') return null
                            
                            const moduleData = {
                              vendor: { name: '業者管理', icon: IconBuilding },
                              contract: { name: '合約管理', icon: IconFileText },
                              merchant: { name: '商店管理', icon: IconBuildingStore },
                              mapResource: { name: '圖資管理', icon: IconMapPin },
                            }
                            
                            const module = moduleData[key as keyof typeof moduleData]
                            const Icon = module.icon
                            const statusStyle = getStatusColor(status.status)
                            
                            return (
                              <Card key={key} withBorder p="12px">
                                <Group gap="8px" mb="8px">
                                  <Icon size={16} color="#666" />
                                  <Text size="sm" fw={500}>{module.name}</Text>
                                </Group>
                                <Badge
                                  variant="light"
                                  size="sm"
                                  styles={{
                                    root: {
                                      backgroundColor: statusStyle.bg,
                                      color: statusStyle.color,
                                      border: 'none',
                                    },
                                  }}
                                >
                                  {status.status}
                                </Badge>
                                {status.assignee && (
                                  <Text size="xs" c="dimmed" mt="4px">
                                    {status.assignee}
                                  </Text>
                                )}
                              </Card>
                            )
                          })}
                        </SimpleGrid>
                      </Card>

                      {/* Basic Info */}
                      <Card withBorder p="20px">
                        <Text fw={600} size="md" mb="16px">基本資訊</Text>
                        <Stack gap="12px">
                          <Group>
                            <Text size="sm" c="dimmed" style={{ minWidth: '80px' }}>場站名稱</Text>
                            <Text size="sm" fw={500}>{selectedTask.stationName}</Text>
                          </Group>
                          <Group>
                            <Text size="sm" c="dimmed" style={{ minWidth: '80px' }}>業者名稱</Text>
                            <Text size="sm" fw={500}>{selectedTask.operator}</Text>
                          </Group>
                          <Group>
                            <Text size="sm" c="dimmed" style={{ minWidth: '80px' }}>地址</Text>
                            <Text size="sm">{selectedTask.address}</Text>
                          </Group>
                          <Group>
                            <Text size="sm" c="dimmed" style={{ minWidth: '80px' }}>聯絡人</Text>
                            <Text size="sm">{selectedTask.contactPerson}</Text>
                          </Group>
                          <Group>
                            <Text size="sm" c="dimmed" style={{ minWidth: '80px' }}>電話</Text>
                            <Text size="sm">{selectedTask.contactPhone}</Text>
                          </Group>
                          {selectedTask.contactEmail && (
                            <Group>
                              <Text size="sm" c="dimmed" style={{ minWidth: '80px' }}>電子郵件</Text>
                              <Text size="sm">{selectedTask.contactEmail}</Text>
                            </Group>
                          )}
                        </Stack>
                      </Card>

                      {/* Notes */}
                      {selectedTask.notes && (
                        <Card withBorder p="20px">
                          <Text fw={600} size="md" mb="12px">備註</Text>
                          <Text size="sm" c="dark.6">{selectedTask.notes}</Text>
                        </Card>
                      )}
                    </Stack>
                  </Grid.Col>

                  {/* Right Column */}
                  <Grid.Col span={4}>
                    <Stack gap="20px">
                      {/* Creator Info */}
                      <Card withBorder p="16px">
                        <Text fw={600} size="sm" mb="12px">建立資訊</Text>
                        <Group gap="8px" mb="8px">
                          <Avatar size={32} color="blue">
                            {selectedTask.createdBy.split(' - ')[1]?.[0] || 'U'}
                          </Avatar>
                          <Box>
                            <Text size="sm" fw={500}>
                              {selectedTask.createdBy.split(' - ')[1] || selectedTask.createdBy}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {selectedTask.createdBy.split(' - ')[0]}
                            </Text>
                          </Box>
                        </Group>
                        <Text size="xs" c="dimmed">
                          建立時間：{selectedTask.createdAt}
                        </Text>
                      </Card>

                      {/* Activity Timeline */}
                      <Card withBorder p="16px">
                        <Text fw={600} size="sm" mb="16px">活動記錄</Text>
                        <Timeline bulletSize={16} lineWidth={2}>
                          {selectedTask.activities.map((activity) => (
                            <Timeline.Item
                              key={activity.id}
                              bullet={<IconCheck size={10} />}
                              color="blue"
                            >
                              <Text size="sm" fw={500} mb={2}>
                                {activity.action}
                              </Text>
                              <Text size="xs" c="dimmed" mb={4}>
                                {activity.description}
                              </Text>
                              <Group gap="4px">
                                <Text size="xs" fw={500}>
                                  {activity.user}
                                </Text>
                                <Text size="xs" c="gray.5">
                                  {activity.time}
                                </Text>
                              </Group>
                            </Timeline.Item>
                          ))}
                        </Timeline>
                      </Card>
                    </Stack>
                  </Grid.Col>
                </Grid>
              </Box>
            </ScrollArea>

            {/* Footer */}
            <Box
              p="20px"
              style={{
                borderTop: '1px solid #e9ecef',
                backgroundColor: '#f8f9fa',
              }}
            >
              <Group justify="flex-end" gap="12px">
                <Button variant="outline">編輯任務</Button>
                {selectedTask.overallStatus === '待覆核' && (
                  <Button
                    color="teal"
                    onClick={() => {
                      handleCompleteReview()
                      setShowTaskDetail(false)
                      setSelectedTask(null)
                    }}
                  >
                    完成覆核
                  </Button>
                )}
              </Group>
            </Box>
          </Box>
        </Modal>
      )}
    </Paper>
  )
}