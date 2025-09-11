import {
  Title,
  Group,
  Button,
  TextInput,
  Badge,
  Text,
  Box,
  Stack,
  Select,
  Textarea,
  Card,
  ActionIcon,
  Tabs,
  Modal,
  Tooltip,
} from '@mantine/core'
import {
  IconArrowLeft,
  IconTrash,
  IconBolt,
  IconCar,
  IconPhone,
  IconClock,
  IconWorld,
  IconMapPin,
  IconGasStation,
  IconTool,
  IconSpray,
  IconNote,
  IconPhoto,
  IconPlus,
  IconX,
  IconUpload,
  IconEdit,
  IconTag,
} from '@tabler/icons-react'

import { useState } from 'react'
import { useNotification } from '../hooks/useNotification'

// 充電槍選項
const connectorTypeOptions = [
  'CCS1',
  'CCS2', 
  'Tesla TPC',
  'CHAdeMO',
  'Type 1',
  'Type 2'
]

const connectorStatusOptions = [
  'Unknown',
  'AVAILABLE',
  'PREPARING', 
  'CHARGING',
  'FAULTED'
]

const powerOutputOptions = [
  'AC',
  'DC'
]

interface PlaceDetailProps {
  place: {
    id: number
    placeName: string
    address: string
    streetViewUrl: string
    latitude: number
    longitude: number
    coordinates: string
    serviceTypes: string[]
    status: string
    editorChoice?: string
    photos?: string[]
  }
  onBack: () => void
}

interface ChargingService {
  id: string
  name: string
  brand: string
  status: string
  phone: string
  operatingHours: string
  photos: string[]
  remarks: string
  officialWebsite: string
  evses: EVSE[]
}

interface EVSE {
  id: string
  floor: string
  connectors: ChargingConnector[]
}

interface ChargingConnector {
  id: string
  connectorNumber: string
  connectorType: string
  status: string
  powerKw: number
  chargingRate: string
  powerOutput: string
  supportsEVCCID: boolean
}



// 服務狀態選項
const serviceStatusOptions = [
  '營運中',
  '維護中',
  '籌備中',
  '停用'
]

// 營運業者品牌選項
const operatorBrandOptions = [
  'Acon-Eco',
  '區快充',
  'Tesla',
  '皮卡充',
  'EVOASIS'
]

// 充電樁/槍資料來源選項
const dataSourceOptions = [
  '手動新增',
  'TDX',
  '好友電',
  '用愛發電'
]

// 週天選項
const weekDays = [
  { value: 'monday', label: '週一' },
  { value: 'tuesday', label: '週二' },
  { value: 'wednesday', label: '週三' },
  { value: 'thursday', label: '週四' },
  { value: 'friday', label: '週五' },
  { value: 'saturday', label: '週六' },
  { value: 'sunday', label: '週日' }
]

// 服務類型配置 - 此版本中使用Tab式設計
// const serviceTypes = ...

// 營業時間介面
interface OperatingHours {
  [key: string]: {
    isOpen: boolean
    openTime: string
    closeTime: string
  }
}

export function PlaceDetail({ place, onBack }: PlaceDetailProps) {
  console.log('PlaceDetail 渲染，place:', place);
  const [chargingServices, setChargingServices] = useState<ChargingService[]>([
    // 測試資料 - 模擬多個充電服務
    {
      id: 'test1',
      name: 'Taipei Train Station',
      brand: 'ACON-ECO',
      status: '營運中',
      phone: '02-1234-5678',
      operatingHours: '週一: 00:00-24:00, 週二: 00:00-24:00, 週三: 00:00-24:00',
      photos: [],
      remarks: '24小時營業，提供快充服務',
      officialWebsite: 'https://www.acon-eco.com',
      evses: [
        {
          id: 'evse1',
          floor: '1F',
          connectors: [
            {
              id: 'conn1',
              connectorNumber: 'A1',
              connectorType: 'Type 2',
              status: 'AVAILABLE',
              powerKw: 22,
              chargingRate: '尖峰時段: NT$8/度, 離峰時段: NT$6/度',
              powerOutput: 'AC',
              supportsEVCCID: false
            }
          ]
        }
      ]
    },
    {
      id: 'test2',
      name: 'Tesla 超級充電站',
      brand: 'Tesla',
      status: '維護中',
      phone: '02-8765-4321',
      operatingHours: '週一: 06:00-22:00, 週二: 06:00-22:00, 週三: 06:00-22:00',
      photos: [],
      remarks: '預計週五恢復營業',
      officialWebsite: 'https://www.tesla.com',
      evses: []
    }
  ])
  const [isAddingChargingService, setIsAddingChargingService] = useState(false)
  const [addingStep, setAddingStep] = useState<'basic' | 'schedule' | 'dataSource'>('basic')
  
  // 添加 CSS 樣式
  const tabStyle = `
    .mantine-Tabs-tab {
      transition: all 0.2s ease !important;
      color: #6b7280 !important;
    }
    
    .mantine-Tabs-tab:hover {
      background-color: #f8fafc !important;
      color: #0284c7 !important;
      border-radius: 8px 8px 0 0 !important;
    }
    
    .mantine-Tabs-tab[data-active="true"] {
      background-color: #ffffff !important;
      color: #0284c7 !important;
      border-bottom: 2px solid #0284c7 !important;
      font-weight: 600 !important;
    }
  `
  
  // 地點圖片管理
  const [placePhotos, setPlacePhotos] = useState<string[]>(place.photos || [])
  // 如果是空值（新地點），預設為編輯模式；有資料則為查看模式
  const [isEditingPhotos, setIsEditingPhotos] = useState((place.photos || []).length === 0)
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null)
  const [editingStep, setEditingStep] = useState<'basic' | 'schedule' | 'dataSource'>('basic')
  
  // 充電樁管理狀態
  const [isAddingEVSE, setIsAddingEVSE] = useState(false)
  const [addingEVSEServiceId, setAddingEVSEServiceId] = useState<string | null>(null)
  const [newEVSE, setNewEVSE] = useState<Partial<EVSE>>({
    floor: ''
  })

  // 充電槍管理狀態
  const [isAddingConnector, setIsAddingConnector] = useState(false)
  const [addingConnectorServiceId, setAddingConnectorServiceId] = useState<string | null>(null)
  const [addingConnectorEVSEId, setAddingConnectorEVSEId] = useState<string | null>(null)
  const [newConnector, setNewConnector] = useState<Partial<ChargingConnector>>({
    connectorNumber: '',
    connectorType: 'Type 2',
    status: 'Unknown',
    powerKw: 22,
    chargingRate: '',
    powerOutput: 'AC',
    supportsEVCCID: false
  })
  
  // 小編精選狀態
  const [isEditingEditorChoice, setIsEditingEditorChoice] = useState(false)
  const [editorChoiceText, setEditorChoiceText] = useState(place.editorChoice || '')
  
  // const [expandedService, setExpandedService] = useState<string | null>(null) // Tab設計不需要
  
  const { showSuccess } = useNotification()

  // 新增充電服務的表單狀態
  const [newChargingService, setNewChargingService] = useState<Partial<ChargingService>>({
    name: '',
    brand: '',
    status: '籌備中',
    phone: '',
    operatingHours: '',
    remarks: '',
    officialWebsite: '',
    evses: []
  })

  // 資料來源選擇狀態
  const [dataSource, setDataSource] = useState<string>('')

  // 營業時間狀態
  const [operatingHours, setOperatingHours] = useState<OperatingHours>({
    monday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    tuesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    wednesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    thursday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    friday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    saturday: { isOpen: true, openTime: '09:00', closeTime: '18:00' }
  })

  const handleNextStep = () => {
    if (editingServiceId) {
      if (editingStep === 'basic') {
        if (!newChargingService.name || !newChargingService.brand) {
          return
        }
        setEditingStep('schedule')
      } else if (editingStep === 'schedule') {
        setEditingStep('dataSource')
      }
    } else {
      if (addingStep === 'basic') {
        if (!newChargingService.name || !newChargingService.brand) {
          return
        }
        setAddingStep('schedule')
      } else if (addingStep === 'schedule') {
        setAddingStep('dataSource')
      }
    }
  }

  const handlePrevStep = () => {
    if (editingServiceId) {
      if (editingStep === 'schedule') {
        setEditingStep('basic')
      } else if (editingStep === 'dataSource') {
        setEditingStep('schedule')
      }
    } else {
      if (addingStep === 'schedule') {
        setAddingStep('basic')
      } else if (addingStep === 'dataSource') {
        setAddingStep('schedule')
      }
    }
  }

  const handleAddChargingService = () => {
    if (!newChargingService.name || !newChargingService.brand) {
      return
    }

    // 將營業時間轉換為字串格式
    const operatingHoursStr = Object.entries(operatingHours)
      .filter(([, schedule]) => schedule.isOpen)
      .map(([day, schedule]) => {
        const dayLabel = weekDays.find(d => d.value === day)?.label || day
        return `${dayLabel}: ${schedule.openTime}-${schedule.closeTime}`
      })
      .join(', ')

    const service: ChargingService = {
      id: Date.now().toString(),
      name: newChargingService.name!,
      brand: newChargingService.brand!,
      status: newChargingService.status!,
      phone: newChargingService.phone || '',
      operatingHours: operatingHoursStr,
      photos: [],
      remarks: newChargingService.remarks || '',
      officialWebsite: newChargingService.officialWebsite || '',
      evses: newChargingService.evses || []
    }

    setChargingServices(prev => [...prev, service])
    handleCloseModal()
    showSuccess('充電服務已新增', '新增成功')
  }

  const handleCloseModal = () => {
    setIsAddingChargingService(false)
    setEditingServiceId(null)
    setAddingStep('basic')
    setEditingStep('basic')
    setNewChargingService({
      name: '',
      brand: '',
      status: '籌備中',
      phone: '',
      operatingHours: '',
      remarks: '',
      officialWebsite: '',
      evses: []
    })
    setOperatingHours({
      monday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      tuesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      wednesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      thursday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      friday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      saturday: { isOpen: true, openTime: '09:00', closeTime: '18:00' }
    })
  }

  const handleEditService = (service: ChargingService) => {
    setEditingServiceId(service.id)
    setEditingStep('basic')
    setNewChargingService({
      name: service.name,
      brand: service.brand,
      status: service.status,
      phone: service.phone,
      operatingHours: service.operatingHours,
      remarks: service.remarks,
      officialWebsite: service.officialWebsite,
      evses: service.evses
    })
    
    // 解析營業時間字串回到狀態
    const hoursFromString: OperatingHours = {}
    if (service.operatingHours) {
      const hoursParts = service.operatingHours.split(', ')
      hoursParts.forEach(part => {
        const match = part.match(/^(.+): (.+)-(.+)$/)
        if (match) {
          const [, dayLabel, openTime, closeTime] = match
          const dayValue = weekDays.find(d => d.label === dayLabel)?.value
          if (dayValue) {
            hoursFromString[dayValue] = { isOpen: true, openTime, closeTime }
          }
        }
      })
    }
    setOperatingHours(hoursFromString)
  }

  const handleUpdateService = () => {
    if (!editingServiceId || !newChargingService.name || !newChargingService.brand) {
      return
    }

    // 將營業時間轉換為字串格式
    const operatingHoursStr = Object.entries(operatingHours)
      .filter(([, schedule]) => schedule.isOpen)
      .map(([day, schedule]) => {
        const dayLabel = weekDays.find(d => d.value === day)?.label || day
        return `${dayLabel}: ${schedule.openTime}-${schedule.closeTime}`
      })
      .join(', ')

    setChargingServices(prev => prev.map(service => 
      service.id === editingServiceId 
        ? {
            ...service,
            name: newChargingService.name!,
            brand: newChargingService.brand!,
            status: newChargingService.status!,
            phone: newChargingService.phone || '',
            operatingHours: operatingHoursStr,
            remarks: newChargingService.remarks || '',
            officialWebsite: newChargingService.officialWebsite || '',
          }
        : service
    ))
    handleCloseModal()
    showSuccess('充電服務已更新', '更新成功')
  }

  // 充電樁管理函數
  const handleAddEVSE = (serviceId: string) => {
    setAddingEVSEServiceId(serviceId)
    setIsAddingEVSE(true)
  }

  const handleEditEVSE = (serviceId: string, evseId: string) => {
    console.log('編輯充電樁', serviceId, evseId)
    // TODO: 實作充電樁編輯功能
    alert('編輯充電樁功能開發中')
  }

  const handleSaveEVSE = () => {
    if (!newEVSE.floor || !addingEVSEServiceId) return

    const evse: EVSE = {
      id: Date.now().toString(),
      floor: newEVSE.floor,
      connectors: []
    }

    setChargingServices(prev => prev.map(service => 
      service.id === addingEVSEServiceId 
        ? { ...service, evses: [...service.evses, evse] }
        : service
    ))
    
    handleCloseEVSEModal()
    showSuccess('充電樁已新增', '新增成功')
  }

  const handleCloseEVSEModal = () => {
    setIsAddingEVSE(false)
    setAddingEVSEServiceId(null)
    setNewEVSE({ floor: '' })
  }

  // 充電槍管理函數
  const handleAddConnector = (serviceId: string, evseId: string) => {
    setAddingConnectorServiceId(serviceId)
    setAddingConnectorEVSEId(evseId)
    setIsAddingConnector(true)
  }

  const handleSaveConnector = () => {
    if (!newConnector.connectorNumber || !addingConnectorServiceId || !addingConnectorEVSEId) return

    const connector: ChargingConnector = {
      id: Date.now().toString(),
      connectorNumber: newConnector.connectorNumber,
      connectorType: newConnector.connectorType || 'Type 2',
      status: newConnector.status || 'Unknown',
      powerKw: newConnector.powerKw || 22,
      chargingRate: newConnector.chargingRate || '',
      powerOutput: newConnector.powerOutput || 'AC',
      supportsEVCCID: newConnector.supportsEVCCID || false
    }

    setChargingServices(prev => prev.map(service => 
      service.id === addingConnectorServiceId 
        ? {
            ...service,
            evses: service.evses.map(evse =>
              evse.id === addingConnectorEVSEId
                ? { ...evse, connectors: [...evse.connectors, connector] }
                : evse
            )
          }
        : service
    ))
    
    handleCloseConnectorModal()
    showSuccess('充電槍已新增', '新增成功')
  }

  const handleCloseConnectorModal = () => {
    setIsAddingConnector(false)
    setAddingConnectorServiceId(null)
    setAddingConnectorEVSEId(null)
    setNewConnector({
      connectorNumber: '',
      connectorType: 'Type 2',
      status: 'Unknown',
      powerKw: 22,
      chargingRate: '',
      powerOutput: 'AC',
      supportsEVCCID: false
    })
  }

  // 圖片管理函數
  const handleEditPhotos = () => {
    setIsEditingPhotos(true)
  }

  const handleSavePhotos = () => {
    // TODO: 實際的儲存邏輯到後端
    setIsEditingPhotos(false)
    showSuccess('圖片已儲存', '儲存成功')
  }

  const handleCancelEditPhotos = () => {
    // 重置回原始狀態
    setPlacePhotos(place.photos || [])
    setIsEditingPhotos(false)
  }

  const handleAddPhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditingPhotos) return
    
    const files = event.target.files
    if (files) {
      const newPhotos = Array.from(files).map(file => URL.createObjectURL(file))
      setPlacePhotos(prev => [...prev, ...newPhotos])
    }
  }

  const handleRemovePhoto = (index: number) => {
    if (!isEditingPhotos) return
    
    setPlacePhotos(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <Box
      style={{ 
        minHeight: '760px',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: '100%',
      }}
    >
      <style>{tabStyle}</style>
      {/* Header */}
      <Group 
        justify="space-between" 
        px="20px" 
        py="24px"
        style={{ 
          borderBottom: '1px solid #dee2e6',
          flexShrink: 0,
        }}
      >
        <Group gap="12px">
          <ActionIcon
            variant="subtle"
            onClick={onBack}
            size="lg"
          >
            <IconArrowLeft size={20} />
          </ActionIcon>
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
            地點詳情設定
          </Title>
        </Group>
      </Group>

      {/* Content */}
      <Box style={{ flex: 1, overflow: 'auto' }}>
        <Stack gap="32px" p="20px">
          {/* 基本地點資訊 - 現代化設計 */}
          <Card withBorder radius="12px" shadow="xs" bg="#ffffff" style={{ 
            border: '1px solid #f1f3f4',
            overflow: 'hidden'
          }}>
            {/* Header Section */}
            <Box style={{
              backgroundColor: '#ffffff',
              padding: '24px',
              borderBottom: '1px solid #f1f3f4'
            }}>
              <Group justify="space-between" align="flex-start">
                <Group gap="16px" align="flex-start">
                  <Box
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      backgroundColor: '#f0f9ff',
                      border: '1px solid #e0f2fe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <IconMapPin size={24} color="#0284c7" />
                  </Box>
                  <div>
                    <Title order={2} style={{ 
                      color: '#1e293b',
                      fontSize: '24px',
                      fontWeight: 700,
                      marginBottom: '4px'
                    }}>
                      {place.placeName}
                    </Title>
                    <Text size="sm" style={{ 
                      color: '#64748b',
                      fontWeight: 500
                    }}>
                      營運狀態 • {place.status}
                    </Text>
                  </div>
                </Group>
                
                <Button
                  variant="light"
                  size="sm"
                  leftSection={<IconEdit size={16} />}
                  onClick={() => {
                    // 編輯地點資訊的邏輯
                  }}
                >
                  編輯
                </Button>
              </Group>
            </Box>

            {/* Information Grid */}
            <Box p="24px">
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: '20px' 
              }}>
                {/* 地址位置 */}
                <Box style={{
                  padding: '20px',
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0'
                }}>
                  <Group gap="12px" mb="12px" align="center">
                    <Box style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: '#e0f2fe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <IconMapPin size={16} color="#0369a1" />
                    </Box>
                    <Text size="sm" fw={600} style={{ 
                      color: '#334155',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontSize: '12px'
                    }}>
                      地址位置
                    </Text>
                  </Group>
                  <Text size="sm" style={{ 
                    color: '#1e293b', 
                    lineHeight: '1.5',
                    fontWeight: 500
                  }}>
                    {place.address}
                  </Text>
                </Box>
                
                {/* 座標位置 */}
                <Box style={{
                  padding: '20px',
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}>
                  <Group gap="12px" mb="12px" align="center">
                    <Box style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: '#f0f9ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <IconWorld size={16} color="#0284c7" />
                    </Box>
                    <Text size="sm" fw={600} style={{ 
                      color: '#334155',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontSize: '12px'
                    }}>
                      座標位置
                    </Text>
                  </Group>
                  <Group gap="12px" align="center">
                    <Text size="sm" style={{ 
                      color: '#1e293b',
                      fontWeight: 500,
                      fontFamily: 'monospace'
                    }}>
                      {place.coordinates}
                    </Text>
                    <Button
                      size="xs"
                      variant="light"
                      color="blue"
                      radius="xl"
                      onClick={() => window.open(place.streetViewUrl, '_blank')}
                      style={{ fontSize: '11px' }}
                    >
                      查看街景
                    </Button>
                  </Group>
                </Box>

                {/* 小編精選 */}
                <Box style={{
                  padding: '20px',
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  position: 'relative'
                }}>
                  <Group gap="12px" mb="12px" align="center">
                    <Box style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: '#fef3c7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <IconNote size={16} color="#d97706" />
                    </Box>
                    <Text size="sm" fw={600} style={{ 
                      color: '#334155',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontSize: '12px'
                    }}>
                      小編精選
                    </Text>
                    {(!place.editorChoice || place.editorChoice.trim() === '') && (
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="blue"
                        onClick={() => setIsEditingEditorChoice(true)}
                        style={{ marginLeft: 'auto' }}
                      >
                        <IconEdit size={12} />
                      </ActionIcon>
                    )}
                  </Group>
                  <Text size="sm" style={{ 
                    color: place.editorChoice ? '#1e293b' : '#94a3b8',
                    fontWeight: place.editorChoice ? 500 : 400,
                    fontStyle: place.editorChoice ? 'normal' : 'italic'
                  }}>
                    {place.editorChoice || '尚未設定小編精選內容'}
                  </Text>
                  {place.editorChoice && (
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      color="gray"
                      onClick={() => setIsEditingEditorChoice(true)}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px'
                      }}
                    >
                      <IconEdit size={12} />
                    </ActionIcon>
                  )}
                </Box>
              </div>
            </Box>
          </Card>

          {/* 地點圖片區域 */}
          <Card withBorder radius="8px" shadow="sm" bg="#ffffff">
            <Stack gap="md">
              <Group justify="space-between" align="center">
                <Group gap="sm">
                  <IconPhoto size={20} color="#495057" />
                  <Text size="md" fw={600} style={{ color: '#495057' }}>
                    地點圖片
                  </Text>
                  <Text size="sm" c="dimmed">
                    ({placePhotos.length}/10)
                  </Text>
                </Group>
                
                {/* 編輯/儲存按鈕 */}
                {!isEditingPhotos ? (
                  <Button
                    size="sm"
                    variant="light"
                    onClick={handleEditPhotos}
                  >
                    編輯圖片
                  </Button>
                ) : (
                  /* 編輯模式下，只有當有圖片時才顯示儲存按鈕 */
                  placePhotos.length > 0 && (
                    <Group gap="sm">
                      {/* 只有在原本有圖片的情況下才顯示取消按鈕 */}
                      {(place.photos || []).length > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEditPhotos}
                        >
                          取消
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="filled"
                        color="blue"
                        onClick={handleSavePhotos}
                      >
                        {(place.photos || []).length === 0 ? '儲存圖片' : '儲存變更'}
                      </Button>
                    </Group>
                  )
                )}
              </Group>
              
              {/* 隱藏的檔案輸入 */}
              <input
                id="photo-upload"
                type="file"
                multiple
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAddPhoto}
              />
              
              {placePhotos.length === 0 ? (
                <Card withBorder bg="#f8f9fa" style={{ 
                  border: '2px dashed #dee2e6',
                  borderRadius: '8px',
                  textAlign: 'center',
                  padding: '40px 20px'
                }}>
                  <Stack gap="md" align="center">
                    <IconPhoto size={48} color="#868e96" />
                    <Stack gap="xs" align="center">
                      <Text size="md" fw={600} style={{ color: '#495057' }}>
                        尚未上傳圖片
                      </Text>
                      <Text size="sm" style={{ color: '#6c757d' }}>
                        為這個地點添加照片，讓使用者更容易找到位置
                      </Text>
                    </Stack>
                    {isEditingPhotos && (
                      <Button 
                        leftSection={<IconUpload size={16} />}
                        onClick={() => document.getElementById('photo-upload')?.click()}
                        variant="light"
                        size="sm"
                      >
                        立即上傳圖片
                      </Button>
                    )}
                  </Stack>
                </Card>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                  gap: '12px'
                }}>
                  {placePhotos.map((photo, index) => (
                    <Box
                      key={index}
                      style={{
                        position: 'relative',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #dee2e6'
                      }}
                    >
                      <img
                        src={photo}
                        alt={`地點照片 ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '120px',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                      />
                      {isEditingPhotos && (
                        <ActionIcon
                          variant="filled"
                          color="red"
                          size="sm"
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px'
                          }}
                          onClick={() => handleRemovePhoto(index)}
                        >
                          <IconX size={12} />
                        </ActionIcon>
                      )}
                    </Box>
                  ))}
                  
                  {/* 新增圖片按鈕 - 僅在編輯模式顯示 */}
                  {isEditingPhotos && placePhotos.length < 10 && (
                    <Box
                      style={{
                        height: '120px',
                        border: '2px dashed #adb5bd',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        backgroundColor: '#f8f9fa',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => document.getElementById('photo-upload')?.click()}
                    >
                      <Stack align="center" gap="xs">
                        <IconPlus size={24} color="#6c757d" />
                        <Text size="xs" c="dimmed">新增圖片</Text>
                      </Stack>
                    </Box>
                  )}
                </div>
              )}
            </Stack>
          </Card>

          {/* 服務管理 - 側邊導航式設計 (方案D) */}
          <Card withBorder radius="12px" shadow="xs" bg="#ffffff" style={{ 
            border: '1px solid #f1f3f4',
            overflow: 'hidden'
          }}>

            {/* Top Navigation Tabs */}
            <Tabs defaultValue="charging" variant="default">
              {/* Tab Navigation */}
              <Tabs.List style={{
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #e9ecef',
                padding: '16px 24px 0 24px',
                gap: '8px'
              }}>
                <Tabs.Tab 
                  value="charging" 
                  leftSection={<IconBolt size={18} />}
                  style={{
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontWeight: 500,
                    borderRadius: '8px 8px 0 0',
                    border: 'none',
                    backgroundColor: 'transparent'
                  }}
                >
                  充電服務 {chargingServices.length > 0 && (
                    <Badge size="sm" variant="light" color="blue" style={{ marginLeft: '8px' }}>
                      {chargingServices.length}
                    </Badge>
                  )}
                </Tabs.Tab>
                
                <Tabs.Tab 
                  value="fueling" 
                  leftSection={<IconGasStation size={18} />}
                  style={{
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontWeight: 500,
                    borderRadius: '8px 8px 0 0',
                    border: 'none',
                    backgroundColor: 'transparent'
                  }}
                >
                  加油服務
                </Tabs.Tab>
                
                <Tabs.Tab 
                  value="maintenance" 
                  leftSection={<IconTool size={18} />}
                  style={{
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontWeight: 500,
                    borderRadius: '8px 8px 0 0',
                    border: 'none',
                    backgroundColor: 'transparent'
                  }}
                >
                  保修服務
                </Tabs.Tab>
                
                <Tabs.Tab 
                  value="washing" 
                  leftSection={<IconSpray size={18} />}
                  style={{
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontWeight: 500,
                    borderRadius: '8px 8px 0 0',
                    border: 'none',
                    backgroundColor: 'transparent'
                  }}
                >
                  洗車服務
                </Tabs.Tab>
                
                <Tabs.Tab 
                  value="parking" 
                  leftSection={<IconCar size={18} />}
                  style={{
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontWeight: 500,
                    borderRadius: '8px 8px 0 0',
                    border: 'none',
                    backgroundColor: 'transparent'
                  }}
                >
                  停車服務
                </Tabs.Tab>
              </Tabs.List>

              {/* Content Area */}
              <Box style={{ 
                backgroundColor: '#ffffff',
                padding: '24px',
                minHeight: '500px'
              }}>
                  <Tabs.Panel value="charging">
                    <Stack gap="lg">
                  {/* 充電服務 Dashboard 型卡片 */}
                  {chargingServices.map((service) => (
                    <Card key={service.id} withBorder radius="12px" bg="#ffffff" style={{ 
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      marginBottom: '20px',
                      borderLeft: `4px solid ${service.status === '營運中' ? '#22c55e' : service.status === '維護中' ? '#f97316' : '#ef4444'}`,
                      position: 'relative'
                    }}>
                      {/* 服務標題區域 */}
                      <Group justify="space-between" align="flex-start" mb="sm">
                        <Group gap="sm" align="center">
                          <Box
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              backgroundColor: '#e3f2fd',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <IconBolt size={16} color="#1976d2" />
                          </Box>
                          <div style={{ flex: 1 }}>
                            <Group gap="md" mb="4px" align="center">
                              <Text size="xl" fw={700} style={{ color: '#1976d2' }}>
                                {service.name}
                              </Text>
                              <Group gap="xs" align="center">
                                <Box
                                  style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: service.status === '營運中' ? '#22c55e' : service.status === '維護中' ? '#f97316' : '#ef4444'
                                  }}
                                />
                                <Text size="sm" style={{ 
                                  color: service.status === '營運中' ? '#16a34a' : service.status === '維護中' ? '#ea580c' : '#dc2626',
                                  fontWeight: 500
                                }}>
                                  {service.status}
                                </Text>
                              </Group>
                            </Group>
                            
                          </div>
                        </Group>
                        
                        {/* 操作按鈕 */}
                        <Group gap="sm">
                          <Button
                            variant="light"
                            size="sm"
                            onClick={() => handleEditService(service)}
                          >
                            編輯設定
                          </Button>
                        </Group>
                      </Group>

                      {/* 服務詳細資訊 - 橫式排列 */}
                      <Box style={{ 
                        marginTop: '12px'
                      }}>
                        <Group gap="xl" align="center" style={{ flexWrap: 'wrap' }}>
                          {/* 品牌 */}
                          {service.brand && (
                            <Group gap="xs" align="center">
                              <IconTag size={16} color="#0ea5e9" />
                              <Text size="sm" style={{ color: '#1f2937' }}>
                                {service.brand}
                              </Text>
                            </Group>
                          )}
                          
                          {/* 電話 */}
                          {service.phone && (
                            <Group gap="xs" align="center">
                              <IconPhone size={16} color="#15803d" />
                              <Text size="sm" style={{ color: '#1f2937' }}>
                                {service.phone}
                              </Text>
                            </Group>
                          )}
                          
                          {/* 官方網站 */}
                          {service.officialWebsite && (
                            <Group gap="xs" align="center">
                              <IconWorld size={16} color="#d97706" />
                              <Text 
                                size="sm" 
                                c="blue" 
                                style={{ 
                                  cursor: 'pointer', 
                                  textDecoration: 'underline'
                                }}
                                onClick={() => window.open(service.officialWebsite, '_blank')}
                              >
                                官方網站
                              </Text>
                            </Group>
                          )}
                          
                          {/* 營業時間 */}
                          {service.operatingHours && (
                            <Group gap="xs" align="center">
                              <IconClock size={16} color="#7c3aed" />
                              <Tooltip
                                multiline
                                withArrow
                                transitionProps={{ duration: 200 }}
                                label={
                                  <Stack gap="xs" p="xs">
                                    {['週一', '週二', '週三', '週四', '週五', '週六', '週日'].map((day, index) => {
                                      const hours = index < 5 ? '08:00-22:00' : index === 5 ? '09:00-23:00' : '10:00-20:00'
                                      const isToday = new Date().getDay() === (index + 1) % 7
                                      
                                      return (
                                        <Group key={day} justify="space-between" gap="sm">
                                          <Text size="xs" fw={isToday ? 600 : 500} c={isToday ? 'blue' : undefined}>
                                            {day}
                                          </Text>
                                          <Text size="xs" c={isToday ? 'blue' : 'dimmed'}>
                                            {hours}
                                          </Text>
                                        </Group>
                                      )
                                    })}
                                  </Stack>
                                }
                              >
                                <Text 
                                  size="sm" 
                                  c="blue"
                                  style={{ 
                                    cursor: 'pointer', 
                                    textDecoration: 'underline',
                                    textDecorationStyle: 'dotted'
                                  }}
                                >
                                  查看營業時間
                                </Text>
                              </Tooltip>
                            </Group>
                          )}
                          
                          {/* 備註 */}
                          {service.remarks && (
                            <Group gap="xs" align="center">
                              <IconNote size={16} color="#dc2626" />
                              <Text size="sm" style={{ 
                                color: '#374151', 
                                lineHeight: '1.4'
                              }}>
                                {service.remarks}
                              </Text>
                            </Group>
                          )}
                        </Group>
                      </Box>

                      {/* 充電設備列表 */}
                      {service.evses.length > 0 ? (
                        <Box mt="lg" pt="lg" style={{ 
                          borderTop: '2px solid #f1f3f4',
                          backgroundColor: '#f8fafc',
                          margin: '16px -24px -24px -24px',
                          padding: '20px 24px 24px 24px',
                          borderRadius: '0 0 12px 12px'
                        }}>
                          <Group justify="space-between" mb="md">
                            <Group gap="xs">
                              <Box
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '6px',
                                  backgroundColor: '#e0f2fe',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <IconGasStation size={14} color="#0369a1" />
                              </Box>
                              <Text size="md" fw={700} style={{ color: '#374151' }}>
                                充電設備列表
                              </Text>
                              <Badge variant="light" color="blue" size="sm">
                                {service.evses.reduce((total, evse) => total + evse.connectors.length, 0)} 支充電槍
                              </Badge>
                            </Group>
                            <Button
                              variant="filled"
                              size="sm"
                              color="blue"
                              leftSection={<IconGasStation size={14} />}
                              onClick={() => handleAddEVSE(service.id)}
                            >
                              新增充電樁
                            </Button>
                          </Group>
                          <Stack gap="xs">
                            {service.evses.map((evse, evseIndex) => (
                              <Box key={evse.id}>
                                {/* 充電樁標題 */}
                                <Box
                                  style={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    padding: '12px 16px',
                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                                  }}
                                >
                                  <Group justify="space-between" align="center">
                                    <Group gap="sm">
                                      <IconGasStation size={18} color="#228be6" />
                                      <Text fw={600} style={{ color: '#495057' }}>
                                        {evse.floor ? `充電樁 ${evse.floor}` : `充電樁 #${evseIndex + 1}`}
                                      </Text>
                                    </Group>
                                    <Group gap="xs">
                                      <ActionIcon
                                        size="sm"
                                        variant="subtle"
                                        color="blue"
                                        onClick={() => handleEditEVSE(service.id, evse.id)}
                                      >
                                        <IconEdit size={14} />
                                      </ActionIcon>
                                      <ActionIcon
                                        size="sm"
                                        variant="subtle"
                                        color="red"
                                        onClick={() => {
                                          // 刪除充電樁邏輯
                                        }}
                                      >
                                        <IconTrash size={14} />
                                      </ActionIcon>
                                    </Group>
                                  </Group>
                                </Box>

                                {/* 充電槍列表 */}
                                {evse.connectors.length > 0 && (
                                  <Box mt="sm" style={{ 
                                    paddingLeft: '24px',
                                    borderLeft: '2px solid #e0f2fe',
                                    marginLeft: '8px'
                                  }}>
                                    <Stack gap="xs">
                                      {evse.connectors.map((connector) => (
                                        <Box
                                          key={connector.id}
                                          style={{
                                            backgroundColor: '#fafbff',
                                            border: '1px solid #e0f2fe',
                                            borderRadius: '6px',
                                            padding: '12px',
                                            position: 'relative'
                                          }}
                                        >
                                          {/* 連接線 */}
                                          <Box
                                            style={{
                                              position: 'absolute',
                                              left: '-25px',
                                              top: '50%',
                                              transform: 'translateY(-50%)',
                                              width: '16px',
                                              height: '2px',
                                              backgroundColor: '#e0f2fe'
                                            }}
                                          />
                                          <Stack gap="xs">
                                            <Group justify="space-between" align="center">
                                              <Group gap="sm">
                                                <Box
                                                  style={{
                                                    width: '20px',
                                                    height: '20px',
                                                    borderRadius: '4px',
                                                    backgroundColor: '#e0f2fe',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                  }}
                                                >
                                                  <IconBolt size={12} color="#0369a1" />
                                                </Box>
                                                <Text size="sm" fw={500} style={{ color: '#495057' }}>
                                                  槍號: {connector.connectorNumber}
                                                </Text>
                                                <Badge
                                                  size="sm"
                                                  color={
                                                    connector.status === 'AVAILABLE' ? 'green' : 
                                                    connector.status === 'CHARGING' ? 'blue' : 
                                                    connector.status === 'FAULTED' ? 'red' : 'gray'
                                                  }
                                                >
                                                  {connector.status}
                                                </Badge>
                                              </Group>
                                              <Group gap="xs">
                                                <ActionIcon
                                                  size="sm"
                                                  variant="subtle"
                                                  color="blue"
                                                  onClick={() => {
                                                    // 編輯充電槍邏輯
                                                  }}
                                                >
                                                  <IconEdit size={14} />
                                                </ActionIcon>
                                                <ActionIcon
                                                  size="sm"
                                                  variant="subtle"
                                                  color="red"
                                                  onClick={() => {
                                                    // 刪除充電槍邏輯
                                                  }}
                                                >
                                                  <IconTrash size={14} />
                                                </ActionIcon>
                                              </Group>
                                            </Group>
                                            
                                            {/* 詳細規格資訊 */}
                                            <Stack gap="xs" style={{ paddingLeft: '8px' }}>
                                              {/* 第一行：技術規格 */}
                                              <Group gap="lg">
                                                <Text size="xs" c="dimmed">
                                                  <strong>規格:</strong> {connector.connectorType}
                                                </Text>
                                                <Text size="xs" c="dimmed">
                                                  <strong>功率:</strong> {connector.powerKw}kW
                                                </Text>
                                                <Text size="xs" c="dimmed">
                                                  <strong>輸出:</strong> {connector.powerOutput}
                                                </Text>
                                                <Text size="xs" c="dimmed">
                                                  <strong>EVCCID:</strong> {connector.supportsEVCCID ? '支援' : '不支援'}
                                                </Text>
                                              </Group>
                                              
                                              {/* 第二行：費率資訊（自由文字形式） */}
                                              {connector.chargingRate && (
                                                <Box>
                                                  <Text size="xs" c="dimmed" style={{ lineHeight: '1.4' }}>
                                                    <Text span fw={500} c="dark">費率說明：</Text>
                                                    {connector.chargingRate}
                                                  </Text>
                                                </Box>
                                              )}
                                            </Stack>
                                          </Stack>
                                        </Box>
                                      ))}
                                      
                                      {/* 新增充電槍按鈕 */}
                                      <Box
                                        style={{
                                          borderTop: '1px dashed #e0f2fe',
                                          paddingTop: '8px',
                                          marginTop: '4px'
                                        }}
                                      >
                                        <Button
                                          size="xs"
                                          variant="light"
                                          color="blue"
                                          leftSection={<IconPlus size={12} />}
                                          onClick={() => handleAddConnector(service.id, evse.id)}
                                          style={{
                                            width: '100%',
                                            borderStyle: 'dashed',
                                            backgroundColor: 'transparent'
                                          }}
                                        >
                                          新增充電槍
                                        </Button>
                                      </Box>
                                    </Stack>
                                  </Box>
                                )}
                                
                                {/* 當沒有充電槍時，在樹狀結構內顯示新增按鈕 */}
                                {evse.connectors.length === 0 && (
                                  <Box mt="sm" style={{ 
                                    paddingLeft: '24px',
                                    borderLeft: '2px solid #e0f2fe',
                                    marginLeft: '8px'
                                  }}>
                                    <Button
                                      size="xs"
                                      variant="light"
                                      color="gray"
                                      leftSection={<IconPlus size={12} />}
                                      onClick={() => handleAddConnector(service.id, evse.id)}
                                      style={{
                                        width: '100%',
                                        borderStyle: 'dashed',
                                        backgroundColor: 'transparent',
                                        color: '#868e96'
                                      }}
                                    >
                                      新增第一支充電槍
                                    </Button>
                                  </Box>
                                )}
                              </Box>
                            ))}
                          </Stack>
                        </Box>
                      ) : (
                        // 沒有充電樁時的引導界面
                        <Box mt="lg" pt="lg" style={{ 
                          borderTop: '2px solid #f1f3f4',
                          backgroundColor: '#f8fafc',
                          margin: '16px -24px -24px -24px',
                          padding: '40px 24px',
                          borderRadius: '0 0 12px 12px',
                          textAlign: 'center'
                        }}>
                          <Stack gap="lg" align="center">
                            <Box
                              style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '16px',
                                backgroundColor: '#e0f2fe',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <IconGasStation size={32} color="#0369a1" />
                            </Box>
                            <Stack gap="xs" align="center">
                              <Text size="lg" fw={600} style={{ color: '#374151' }}>
                                開始設置充電設備
                              </Text>
                              <Text size="sm" c="dimmed" ta="center" style={{ maxWidth: '300px' }}>
                                您已成功建立充電服務！現在需要新增充電樁來完成設置，讓用戶能夠使用充電服務。
                              </Text>
                            </Stack>
                            <Button
                              variant="filled"
                              color="blue"
                              size="md"
                              leftSection={<IconGasStation size={18} />}
                              onClick={() => handleAddEVSE(service.id)}
                            >
                              新增第一個充電樁
                            </Button>
                          </Stack>
                        </Box>
                      )}
                    </Card>
                  ))}

                  {/* 充電服務初始狀態區塊 - 美化提示和引導 */}
                  {chargingServices.length === 0 && !isAddingChargingService && (
                    <Card withBorder bg="#f8f9fa" style={{ 
                      border: '2px dashed #dee2e6',
                      borderRadius: '8px',
                      textAlign: 'center',
                      padding: '40px 20px'
                    }}>
                      <Stack gap="md" align="center">
                        <IconBolt size={48} color="#868e96" />
                        <Stack gap="xs" align="center">
                          <Text size="md" fw={600} style={{ color: '#495057' }}>
                            尚未設定充電服務
                          </Text>
                          <Text size="sm" style={{ color: '#6c757d' }}>
                            開始建立這個地點的充電服務，設定營運業者、營業時間和充電設備資訊
                          </Text>
                        </Stack>
                        <Button 
                          leftSection={<IconBolt size={16} />}
                          onClick={() => setIsAddingChargingService(true)}
                          variant="filled"
                          color="blue"
                          size="sm"
                        >
                          立即設定充電服務
                        </Button>
                      </Stack>
                    </Card>
                  )}


                  {/* 兩階段Modal - 新增/編輯充電服務 */}
                  <Modal
                    opened={isAddingChargingService || editingServiceId !== null}
                    onClose={handleCloseModal}
                    title={
                      <Group gap="xs">
                        <IconBolt size={20} color="#1976d2" />
                        <Text fw={600} style={{ color: '#1976d2' }}>
                          {editingServiceId 
                            ? (editingStep === 'basic' ? '編輯：充電服務基本設定' : '編輯：營業時間設定')
                            : (addingStep === 'basic' ? '第一階段：充電服務基本設定' : addingStep === 'schedule' ? '第二階段：營業時間設定' : '第三階段：資料來源選擇')
                          }
                        </Text>
                      </Group>
                    }
                    size="xl"
                    centered
                    styles={{
                      body: {
                        height: 'auto',
                        maxHeight: 'none'
                      },
                      content: {
                        height: 'auto',
                        maxHeight: 'none'
                      }
                    }}
                  >
                    <Stack gap="lg">
                      {/* 進度指示器 */}
                      <Group justify="center" gap="xs">
                        <Box
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#228be6',
                          }}
                        />
                        <Box
                          style={{
                            width: '30px',
                            height: '2px',
                            backgroundColor: (editingServiceId ? (editingStep === 'schedule' || editingStep === 'basic') : (addingStep === 'schedule' || addingStep === 'dataSource')) ? '#228be6' : '#e9ecef',
                          }}
                        />
                        <Box
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: (editingServiceId ? (editingStep === 'schedule' || editingStep === 'basic') : (addingStep === 'schedule' || addingStep === 'dataSource')) ? '#228be6' : '#e9ecef',
                          }}
                        />
                        <Box
                          style={{
                            width: '30px',
                            height: '2px',
                            backgroundColor: (editingServiceId ? false : addingStep === 'dataSource') ? '#228be6' : '#e9ecef',
                          }}
                        />
                        <Box
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: (editingServiceId ? false : addingStep === 'dataSource') ? '#228be6' : '#e9ecef',
                          }}
                        />
                      </Group>

                      {/* 第一階段：基本設定 */}
                      {(editingServiceId ? editingStep : addingStep) === 'basic' && (
                        <Stack gap="lg">
                          <Group grow>
                            <TextInput
                              label="充電站名稱"
                              placeholder="請輸入充電站名稱"
                              value={newChargingService.name || ''}
                              onChange={(e) => {
                                const value = e.currentTarget.value;
                                setNewChargingService(prev => ({ ...prev, name: value }));
                              }}
                            />
                            <Select
                              label="營運業者品牌"
                              placeholder="請選擇營運業者品牌"
                              data={operatorBrandOptions}
                              value={newChargingService.brand || null}
                              onChange={(value) => {
                                setNewChargingService(prev => ({ ...prev, brand: value || '' }));
                              }}
                              clearable
                            />
                          </Group>

                          <Group grow>
                            <Select
                              label="服務狀態"
                              data={serviceStatusOptions}
                              value={newChargingService.status}
                              onChange={(value) => {
                                setNewChargingService(prev => ({ ...prev, status: value || '籌備中' }));
                              }}
                            />
                            <TextInput
                              label="服務電話"
                              placeholder="請輸入電話號碼"
                              value={newChargingService.phone || ''}
                              onChange={(e) => {
                                const value = e.currentTarget.value;
                                setNewChargingService(prev => ({ ...prev, phone: value }));
                              }}
                            />
                          </Group>

                          <TextInput
                            label="官方網址"
                            placeholder="請輸入官方網站連結"
                            value={newChargingService.officialWebsite || ''}
                            onChange={(e) => {
                              const value = e.currentTarget.value;
                              setNewChargingService(prev => ({ ...prev, officialWebsite: value }));
                            }}
                          />

                          <Textarea
                            label="備註"
                            placeholder="請輸入相關備註資訊或特殊說明"
                            value={newChargingService.remarks || ''}
                            onChange={(e) => {
                              const value = e.currentTarget.value;
                              setNewChargingService(prev => ({ ...prev, remarks: value }));
                            }}
                            rows={3}
                          />

                          <Group justify="flex-end" mt="lg">
                            <Button variant="outline" onClick={handleCloseModal}>
                              取消
                            </Button>
                            <Button 
                              onClick={handleNextStep}
                              disabled={!newChargingService.name || !newChargingService.brand}
                            >
                              {editingServiceId ? '下一步：編輯營業時間' : '下一步：設定營業時間'}
                            </Button>
                          </Group>
                        </Stack>
                      )}

                      {/* 第二階段：營業時間設定 */}
                      {(editingServiceId ? editingStep : addingStep) === 'schedule' && (
                        <Stack gap="lg">
                          {/* 快速選擇模式 */}
                          <Group gap="xs">
                            <Button 
                              size="xs" 
                              variant="light"
                              onClick={() => {
                                const newHours: OperatingHours = {};
                                weekDays.forEach(day => {
                                  newHours[day.value] = { isOpen: true, openTime: '00:00', closeTime: '24:00' };
                                });
                                setOperatingHours(newHours);
                              }}
                            >
                              24小時營業
                            </Button>
                            <Button 
                              size="xs" 
                              variant="light"
                              onClick={() => {
                                const newHours: OperatingHours = {};
                                weekDays.forEach(day => {
                                  newHours[day.value] = { isOpen: true, openTime: '09:00', closeTime: '18:00' };
                                });
                                setOperatingHours(newHours);
                              }}
                            >
                              09:00-18:00
                            </Button>
                            <Button 
                              size="xs" 
                              variant="light"
                              onClick={() => {
                                const newHours: OperatingHours = {};
                                ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].forEach(day => {
                                  newHours[day] = { isOpen: true, openTime: '09:00', closeTime: '18:00' };
                                });
                                setOperatingHours(newHours);
                              }}
                            >
                              平日營業
                            </Button>
                          </Group>

                          {/* 營業日設定 */}
                          <Box>
                            <Stack gap="xs">
                              {weekDays.map((day) => {
                                const hasSchedule = operatingHours[day.value];
                                
                                return hasSchedule ? (
                                  <Group key={day.value} justify="space-between" align="center" p="sm" 
                                         style={{ 
                                           backgroundColor: '#f8f9fa', 
                                           borderRadius: '6px', 
                                           border: '1px solid #e9ecef'
                                         }}>
                                    <Group gap="sm">
                                      <Text size="xs" fw={600} w={30}>
                                        {day.label}
                                      </Text>
                                      <Group gap="4px">
                                        <TextInput
                                          size="xs"
                                          w={60}
                                          value={operatingHours[day.value]?.openTime || '09:00'}
                                          onChange={(e) => {
                                            const value = e.currentTarget.value;
                                            setOperatingHours(prev => ({
                                              ...prev,
                                              [day.value]: {
                                                ...prev[day.value],
                                                isOpen: true,
                                                openTime: value
                                              }
                                            }));
                                          }}
                                        />
                                        <Text size="xs" c="dimmed">-</Text>
                                        <TextInput
                                          size="xs"
                                          w={60}
                                          value={operatingHours[day.value]?.closeTime || '18:00'}
                                          onChange={(e) => {
                                            const value = e.currentTarget.value;
                                            setOperatingHours(prev => ({
                                              ...prev,
                                              [day.value]: {
                                                ...prev[day.value],
                                                isOpen: true,
                                                closeTime: value
                                              }
                                            }));
                                          }}
                                        />
                                      </Group>
                                    </Group>
                                    
                                    <ActionIcon 
                                      color="red" 
                                      variant="subtle" 
                                      size="sm"
                                      onClick={() => {
                                        setOperatingHours(prev => {
                                          const newHours = { ...prev };
                                          delete newHours[day.value];
                                          return newHours;
                                        });
                                      }}
                                    >
                                      <IconTrash size={12} />
                                    </ActionIcon>
                                  </Group>
                                ) : (
                                  <Group key={day.value} justify="space-between" align="center" p="sm"
                                         style={{ 
                                           backgroundColor: '#f8f9fa', 
                                           borderRadius: '6px', 
                                           border: '1px dashed #ced4da'
                                         }}>
                                    <Text size="xs" fw={500} w={30} c="dimmed">
                                      {day.label}
                                    </Text>
                                    <Button
                                      size="xs"
                                      variant="subtle"
                                      onClick={() => {
                                        setOperatingHours(prev => ({
                                          ...prev,
                                          [day.value]: { isOpen: true, openTime: '09:00', closeTime: '18:00' }
                                        }));
                                      }}
                                    >
                                      + 新增
                                    </Button>
                                  </Group>
                                );
                              })}
                            </Stack>
                          </Box>

                          <Group justify="space-between" mt="lg">
                            <Button variant="outline" onClick={handlePrevStep}>
                              上一步
                            </Button>
                            <Button onClick={handleNextStep}>
                              下一步：選擇資料來源
                            </Button>
                          </Group>
                        </Stack>
                      )}

                      {/* 第三階段：資料來源選擇 */}
                      {(editingServiceId ? editingStep : addingStep) === 'dataSource' && (
                        <Stack gap="lg">
                          
                          <Select
                            label="資料來源"
                            placeholder="請選擇充電樁/槍的資料來源"
                            data={dataSourceOptions}
                            value={dataSource}
                            onChange={(value) => setDataSource(value || '')}
                            size="md"
                            description="選擇如何建立充電樁/槍資料。手動新增：自行輸入詳細資訊；API來源：自動同步外部資料"
                          />

                          {dataSource && (
                            <Box p="md" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                              <Text size="sm" fw={600} mb="xs">資料來源說明：</Text>
                              <Text size="sm" c="dimmed">
                                {dataSource === '手動新增' && '您可以完全自訂充電樁和充電槍的所有規格和參數'}
                                {dataSource === 'TDX' && '交通資料流通服務平臺 - 政府開放資料，包含全台公共充電站資訊'}
                                {dataSource === '好友電' && '好友電充電站網路 - 提供民營充電站詳細資訊和即時狀態'}
                                {dataSource === '用愛發電' && '用愛發電社群平台 - 社群維護的充電站資訊和使用者評價'}
                              </Text>
                            </Box>
                          )}

                          <Group justify="space-between" mt="lg">
                            <Button variant="outline" onClick={handlePrevStep}>
                              上一步
                            </Button>
                            <Button 
                              onClick={editingServiceId ? handleUpdateService : handleAddChargingService}
                              disabled={!dataSource}
                            >
                              {editingServiceId ? '完成編輯充電服務' : '完成新增充電服務'}
                            </Button>
                          </Group>
                        </Stack>
                      )}
                    </Stack>
                  </Modal>

                  {/* 新增充電樁 Modal */}
                  <Modal
                    opened={isAddingEVSE}
                    onClose={handleCloseEVSEModal}
                    title={
                      <Group gap="xs">
                        <IconGasStation size={20} color="#1976d2" />
                        <Text fw={600} style={{ color: '#1976d2' }}>
                          新增充電樁
                        </Text>
                      </Group>
                    }
                    size="md"
                    centered
                  >
                    <Stack gap="md">
                      <TextInput
                        label="樓層資訊"
                        placeholder="例: 1F, B1, B2..."
                        value={newEVSE.floor || ''}
                        onChange={(e) => {
                          const value = e.currentTarget.value;
                          setNewEVSE(prev => ({ ...prev, floor: value }));
                        }}
                        size="sm"
                        required
                      />
                      
                      <Group justify="flex-end" gap="xs" mt="lg">
                        <Button variant="outline" onClick={handleCloseEVSEModal}>
                          取消
                        </Button>
                        <Button 
                          onClick={handleSaveEVSE}
                          disabled={!newEVSE.floor}
                        >
                          新增充電樁
                        </Button>
                      </Group>
                    </Stack>
                  </Modal>

                  {/* 新增充電槍 Modal */}
                  <Modal
                    opened={isAddingConnector}
                    onClose={handleCloseConnectorModal}
                    title={
                      <Group gap="xs">
                        <IconBolt size={20} color="#1976d2" />
                        <Text fw={600} style={{ color: '#1976d2' }}>
                          新增充電槍
                        </Text>
                      </Group>
                    }
                    size="lg"
                    centered
                  >
                    <Stack gap="md">
                      <Group grow>
                        <TextInput
                          label="充電槍號"
                          placeholder="例: A1, B2..."
                          value={newConnector.connectorNumber || ''}
                          onChange={(e) => {
                            const value = e.currentTarget.value;
                            setNewConnector(prev => ({ ...prev, connectorNumber: value }));
                          }}
                          size="sm"
                          required
                        />
                        <Select
                          label="充電槍規格"
                          data={connectorTypeOptions}
                          value={newConnector.connectorType || 'Type 2'}
                          onChange={(value) => setNewConnector(prev => ({ ...prev, connectorType: value || 'Type 2' }))}
                          size="sm"
                        />
                      </Group>

                      <Group grow>
                        <Select
                          label="狀態"
                          data={connectorStatusOptions}
                          value={newConnector.status || 'Unknown'}
                          onChange={(value) => setNewConnector(prev => ({ ...prev, status: value || 'Unknown' }))}
                          size="sm"
                        />
                        <TextInput
                          label="功率 (kW)"
                          value={newConnector.powerKw?.toString() || '22'}
                          onChange={(e) => {
                            const value = parseFloat(e.currentTarget.value) || 0;
                            setNewConnector(prev => ({ ...prev, powerKw: value }));
                          }}
                          size="sm"
                          type="number"
                        />
                      </Group>
                      
                      <Group grow>
                        <Select
                          label="電力輸出方式"
                          data={powerOutputOptions}
                          value={newConnector.powerOutput || 'AC'}
                          onChange={(value) => setNewConnector(prev => ({ ...prev, powerOutput: value || 'AC' }))}
                          size="sm"
                        />
                        <Select
                          label="是否支援 EVCCID"
                          data={[
                            { value: 'yes', label: '是' },
                            { value: 'no', label: '否' }
                          ]}
                          value={newConnector.supportsEVCCID ? 'yes' : 'no'}
                          onChange={(value) => setNewConnector(prev => ({ ...prev, supportsEVCCID: value === 'yes' }))}
                          size="sm"
                        />
                      </Group>
                      
                      <Textarea
                        label="充電費率"
                        placeholder="請輸入充電費率資訊，可支援不同時段費率"
                        value={newConnector.chargingRate || ''}
                        onChange={(e) => {
                          const value = e.currentTarget.value;
                          setNewConnector(prev => ({ ...prev, chargingRate: value }));
                        }}
                        size="sm"
                        rows={3}
                      />
                      
                      <Group justify="flex-end" gap="xs" mt="lg">
                        <Button variant="outline" onClick={handleCloseConnectorModal}>
                          取消
                        </Button>
                        <Button 
                          onClick={handleSaveConnector}
                          disabled={!newConnector.connectorNumber}
                        >
                          新增充電槍
                        </Button>
                      </Group>
                    </Stack>
                  </Modal>
                  
                  {/* 新增服務按鈕區域 */}
                  <Box mt="xl" pt="xl" style={{ 
                    borderTop: '1px solid #e9ecef',
                    textAlign: 'center'
                  }}>
                    <Button
                      variant="filled"
                      color="blue"
                      size="md"
                      leftSection={<IconPlus size={18} />}
                      onClick={() => setIsAddingChargingService(true)}
                      style={{
                        minWidth: '180px'
                      }}
                    >
                      新增充電服務
                    </Button>
                  </Box>
                    </Stack>
                  </Tabs.Panel>

                <Tabs.Panel value="fueling">
                  <Box style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    height: '400px'
                  }}>
                    <Stack gap="lg" align="center">
                      <IconGasStation size={64} color="#9ca3af" />
                      <Stack gap="xs" align="center">
                        <Text size="lg" fw={600} style={{ color: '#495057' }}>
                          加油服務
                        </Text>
                        <Text size="sm" c="dimmed" ta="center">
                          此功能正在開發中，敬請期待
                        </Text>
                      </Stack>
                    </Stack>
                  </Box>
                </Tabs.Panel>

                <Tabs.Panel value="maintenance">
                  <Box style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    height: '400px'
                  }}>
                    <Stack gap="lg" align="center">
                      <IconTool size={64} color="#9ca3af" />
                      <Stack gap="xs" align="center">
                        <Text size="lg" fw={600} style={{ color: '#495057' }}>
                          保修服務
                        </Text>
                        <Text size="sm" c="dimmed" ta="center">
                          此功能正在開發中，敬請期待
                        </Text>
                      </Stack>
                    </Stack>
                  </Box>
                </Tabs.Panel>

                <Tabs.Panel value="washing">
                  <Box style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    height: '400px'
                  }}>
                    <Stack gap="lg" align="center">
                      <IconSpray size={64} color="#9ca3af" />
                      <Stack gap="xs" align="center">
                        <Text size="lg" fw={600} style={{ color: '#495057' }}>
                          洗車服務
                        </Text>
                        <Text size="sm" c="dimmed" ta="center">
                          此功能正在開發中，敬請期待
                        </Text>
                      </Stack>
                    </Stack>
                  </Box>
                </Tabs.Panel>

                <Tabs.Panel value="parking">
                  <Box style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    height: '400px'
                  }}>
                    <Stack gap="lg" align="center">
                      <IconCar size={64} color="#9ca3af" />
                      <Stack gap="xs" align="center">
                        <Text size="lg" fw={600} style={{ color: '#495057' }}>
                          停車服務
                        </Text>
                        <Text size="sm" c="dimmed" ta="center">
                          此功能正在開發中，敬請期待
                        </Text>
                      </Stack>
                    </Stack>
                  </Box>
                </Tabs.Panel>
              </Box>
            </Tabs>
          </Card>
        </Stack>
      </Box>

      {/* 小編精選編輯 Modal */}
      <Modal
        opened={isEditingEditorChoice}
        onClose={() => {
          setIsEditingEditorChoice(false)
          setEditorChoiceText(place.editorChoice || '')
        }}
        title={
          <Group gap="xs">
            <IconNote size={20} color="#d97706" />
            <Text fw={600} style={{ color: '#d97706' }}>
              編輯小編精選
            </Text>
          </Group>
        }
        size="md"
        centered
      >
        <Stack gap="lg">
          <Textarea
            label="小編精選內容"
            placeholder="請輸入小編精選的推薦內容..."
            value={editorChoiceText}
            onChange={(e) => setEditorChoiceText(e.currentTarget.value)}
            minRows={4}
            maxRows={8}
            autosize
          />
          
          <Group justify="flex-end" gap="sm">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditingEditorChoice(false)
                setEditorChoiceText(place.editorChoice || '')
              }}
            >
              取消
            </Button>
            <Button
              onClick={() => {
                // 這裡應該更新 place.editorChoice，但因為是 demo，我們只是關閉 modal
                // 實際應用中會有 API 調用來保存資料
                showSuccess('小編精選已更新')
                setIsEditingEditorChoice(false)
                // place.editorChoice = editorChoiceText // 在實際應用中會通過 API 更新
              }}
            >
              儲存
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  )
}