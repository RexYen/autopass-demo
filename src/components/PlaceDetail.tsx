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
} from '@tabler/icons-react'

import { useState } from 'react'
import { useNotification } from '../hooks/useNotification'

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
    createdAt: string
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
}

interface TempChargingConnector extends Partial<ChargingConnector> {
  serviceId?: string
  evseId?: string
}

// 充電槍規格選項
const connectorTypeOptions = [
  'CCS1',
  'CCS2', 
  'Tesla TPC',
  'CHAdeMO',
  'Type 1',
  'Type 2'
]

// 充電槍狀態選項
const connectorStatusOptions = [
  'AVAILABLE',
  'PREPARING', 
  'CHARGING',
  'FAULTED'
]

// 服務狀態選項
const serviceStatusOptions = [
  '營運中',
  '維護中',
  '籌備中',
  '停用'
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
  const [chargingServices, setChargingServices] = useState<ChargingService[]>([])
  const [isAddingChargingService, setIsAddingChargingService] = useState(false)
  const [addingStep, setAddingStep] = useState<'basic' | 'schedule'>('basic')
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null)
  const [editingStep, setEditingStep] = useState<'basic' | 'schedule'>('basic')
  const [editingEVSEId, setEditingEVSEId] = useState<string | null>(null)
  const [editingConnectorId, setEditingConnectorId] = useState<string | null>(null)
  const [tempEVSE, setTempEVSE] = useState<Partial<EVSE>>({})
  const [tempConnector, setTempConnector] = useState<TempChargingConnector>({})
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
    if (!newChargingService.name || !newChargingService.brand) {
      return
    }
    if (editingServiceId) {
      if (editingStep === 'basic') {
        setEditingStep('schedule')
      }
    } else {
      if (addingStep === 'basic') {
        setAddingStep('schedule')
      }
    }
  }

  const handlePrevStep = () => {
    if (editingServiceId) {
      if (editingStep === 'schedule') {
        setEditingStep('basic')
      }
    } else {
      if (addingStep === 'schedule') {
        setAddingStep('basic')
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

  const handleAddEVSE = (_serviceId: string) => {
    const newEVSE: EVSE = {
      id: Date.now().toString(),
      floor: '',
      connectors: []
    }
    setTempEVSE(newEVSE)
    setEditingEVSEId(newEVSE.id)
  }

  const handleSaveEVSE = (serviceId: string) => {
    if (!tempEVSE.floor || !tempEVSE.id) return
    
    setChargingServices(prev => prev.map(service => 
      service.id === serviceId 
        ? { ...service, evses: [...service.evses, tempEVSE as EVSE] }
        : service
    ))
    setEditingEVSEId(null)
    setTempEVSE({})
    showSuccess('充電樁已儲存', '儲存成功')
  }

  const handleEditEVSE = (_serviceId: string, evse: EVSE) => {
    setTempEVSE(evse)
    setEditingEVSEId(evse.id)
  }

  const handleUpdateEVSE = (serviceId: string) => {
    if (!tempEVSE.floor || !tempEVSE.id) return
    
    setChargingServices(prev => prev.map(service => 
      service.id === serviceId 
        ? {
            ...service,
            evses: service.evses.map(evse =>
              evse.id === tempEVSE.id ? tempEVSE as EVSE : evse
            )
          }
        : service
    ))
    setEditingEVSEId(null)
    setTempEVSE({})
    showSuccess('充電樁已更新', '更新成功')
  }

  const handleCancelEVSE = () => {
    setEditingEVSEId(null)
    setTempEVSE({})
  }

  const handleAddConnector = (serviceId: string, evseId: string) => {
    const newConnector: ChargingConnector = {
      id: Date.now().toString(),
      connectorNumber: '',
      connectorType: 'Type 2',
      status: 'AVAILABLE',
      powerKw: 22,
      chargingRate: ''
    }
    setTempConnector({ ...newConnector, serviceId, evseId })
    setEditingConnectorId(newConnector.id)
  }

  const handleSaveConnector = (serviceId: string, evseId: string) => {
    if (!tempConnector.connectorNumber || !tempConnector.id) return
    
    setChargingServices(prev => prev.map(service => 
      service.id === serviceId 
        ? {
            ...service,
            evses: service.evses.map(evse =>
              evse.id === evseId
                ? { ...evse, connectors: [...evse.connectors, tempConnector as ChargingConnector] }
                : evse
            )
          }
        : service
    ))
    setEditingConnectorId(null)
    setTempConnector({})
    showSuccess('充電槍已儲存', '儲存成功')
  }

  const handleEditConnector = (serviceId: string, evseId: string, connector: ChargingConnector) => {
    setTempConnector({ ...connector, serviceId, evseId })
    setEditingConnectorId(connector.id)
  }

  const handleUpdateConnector = (serviceId: string, evseId: string) => {
    if (!tempConnector.connectorNumber || !tempConnector.id) return
    
    setChargingServices(prev => prev.map(service => 
      service.id === serviceId 
        ? {
            ...service,
            evses: service.evses.map(evse =>
              evse.id === evseId
                ? {
                    ...evse,
                    connectors: evse.connectors.map(connector =>
                      connector.id === tempConnector.id ? tempConnector as ChargingConnector : connector
                    )
                  }
                : evse
            )
          }
        : service
    ))
    setEditingConnectorId(null)
    setTempConnector({})
    showSuccess('充電槍已更新', '更新成功')
  }

  const handleCancelConnector = () => {
    setEditingConnectorId(null)
    setTempConnector({})
  }

  const updateEVSE = (serviceId: string, evseId: string, field: keyof EVSE, value: string) => {
    if (editingEVSEId === evseId) {
      setTempEVSE(prev => ({ ...prev, [field]: value }))
    } else {
      setChargingServices(prev => prev.map(service => 
        service.id === serviceId 
          ? {
              ...service,
              evses: service.evses.map(evse =>
                evse.id === evseId
                  ? { ...evse, [field]: value }
                  : evse
              )
            }
          : service
      ))
    }
  }

  const updateConnector = (serviceId: string, evseId: string, connectorId: string, field: keyof ChargingConnector, value: string | number) => {
    if (editingConnectorId === connectorId) {
      setTempConnector(prev => ({ ...prev, [field]: value }))
    } else {
      setChargingServices(prev => prev.map(service => 
        service.id === serviceId 
          ? {
              ...service,
              evses: service.evses.map(evse =>
                evse.id === evseId
                  ? {
                      ...evse,
                      connectors: evse.connectors.map(connector =>
                        connector.id === connectorId
                          ? { ...connector, [field]: value }
                          : connector
                      )
                    }
                  : evse
              )
            }
          : service
      ))
    }
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
          {/* 基本地點資訊 */}
          <Card withBorder radius="8px" shadow="sm" bg="#e3f2fd">
            <Stack gap="24px">
              <Group justify="space-between" align="flex-start">
                <Group gap="12px">
                  <Box
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      backgroundColor: '#228be6',
                    }}
                  >
                    <IconMapPin size={24} color="#ffffff" />
                  </Box>
                  <Box>
                    <Title order={2} style={{ color: '#212529' }}>
                      {place.placeName}
                    </Title>
                  </Box>
                </Group>
                
                <Badge
                  size="lg"
                  styles={{
                    root: {
                      backgroundColor: place.status === '營運中' ? '#51cf66' : 
                                     place.status === '維護中' ? '#ffd43b' : '#ff6b6b',
                      color: '#fff',
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontWeight: 600,
                    },
                  }}
                >
                  {place.status}
                </Badge>
              </Group>
              
              {/* 資訊網格 */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                gap: '20px' 
              }}>
                <Box 
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    padding: '16px',
                    border: '1px solid #bbdefb',
                  }}
                >
                  <Text size="xs" fw={600} mb="8px" style={{ 
                    color: '#868e96',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    地址位置
                  </Text>
                  <Text size="sm" style={{ color: '#212529', lineHeight: '1.4' }}>
                    {place.address}
                  </Text>
                </Box>
                
                <Box 
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    padding: '16px',
                    border: '1px solid #bbdefb',
                  }}
                >
                  <Text size="xs" fw={600} mb="8px" style={{ 
                    color: '#868e96',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    座標位置
                  </Text>
                  <Group gap="8px">
                    <Text size="sm" style={{ color: '#212529' }}>
                      {place.coordinates}
                    </Text>
                    <Button
                      size="xs"
                      variant="light"
                      color="blue"
                      onClick={() => window.open(place.streetViewUrl, '_blank')}
                    >
                      查看街景
                    </Button>
                  </Group>
                </Box>

                <Box 
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    padding: '16px',
                    border: '1px solid #bbdefb',
                  }}
                >
                  <Text size="xs" fw={600} mb="8px" style={{ 
                    color: '#868e96',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    建立時間
                  </Text>
                  <Text size="sm" style={{ color: '#212529' }}>
                    {place.createdAt}
                  </Text>
                </Box>
              </div>
            </Stack>
          </Card>

          {/* 服務管理 */}
          <div>
            <Title order={4} mb="lg">服務管理</Title>
            
            <Tabs defaultValue="charging" variant="pills" radius="md">
              <Tabs.List>
                <Tabs.Tab value="charging" leftSection={<IconBolt size={16} />}>
                  充電服務 {chargingServices.length > 0 && `(${chargingServices.length})`}
                </Tabs.Tab>
                <Tabs.Tab value="fueling" leftSection={<IconGasStation size={16} />}>
                  加油服務
                </Tabs.Tab>
                <Tabs.Tab value="maintenance" leftSection={<IconTool size={16} />}>
                  保修服務  
                </Tabs.Tab>
                <Tabs.Tab value="washing" leftSection={<IconSpray size={16} />}>
                  洗車服務
                </Tabs.Tab>
                <Tabs.Tab value="parking" leftSection={<IconCar size={16} />}>
                  停車服務
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="charging" pt="lg">
                <Stack gap="xl">
                  {/* 充電服務詳細管理區域 */}
                  {chargingServices.map((service) => (
                    <Card key={service.id} withBorder radius="8px" bg="#ffffff" style={{ border: '1px solid #e9ecef' }}>
                      <Stack gap="lg">
                        {/* 充電服務標題區塊 */}
                        <Group justify="space-between" align="flex-start">
                          <Group align="center">
                            <Box
                              style={{
                                padding: '10px',
                                borderRadius: '8px',
                                backgroundColor: '#e3f2fd',
                              }}
                            >
                              <IconBolt size={24} color="#1976d2" />
                            </Box>
                            <div>
                              <Text size="lg" fw={700} style={{ color: '#1976d2' }}>
                                {service.name}
                              </Text>
                              <Group gap="sm" mt="xs">
                                <Badge size="md" variant="light" color="blue">
                                  {service.brand}
                                </Badge>
                                <Badge
                                  size="md"
                                  variant="light"
                                  color={service.status === '營運中' ? 'green' : service.status === '維護中' ? 'yellow' : 'red'}
                                >
                                  {service.status}
                                </Badge>
                              </Group>
                            </div>
                          </Group>
                          <Button
                            variant="light"
                            size="sm"
                            onClick={() => handleEditService(service)}
                            disabled={editingEVSEId !== null || editingConnectorId !== null}
                          >
                            編輯設定
                          </Button>
                        </Group>

                        {/* 充電服務詳細資訊 - 改善版 */}
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                          gap: '24px'
                        }}>
                          {/* 基本資訊 */}
                          <Box 
                            style={{
                              backgroundColor: '#f8f9fa',
                              borderRadius: '8px',
                              padding: '16px',
                            }}
                          >
                            <Text size="sm" fw={600} mb="md" style={{ color: '#495057' }}>基本資訊</Text>
                            <Stack gap="sm">
                              {service.phone && (
                                <Group gap="8px">
                                  <IconPhone size={16} color="#666" />
                                  <Text size="sm" style={{ color: '#212529' }}>
                                    {service.phone}
                                  </Text>
                                </Group>
                              )}
                              {service.officialWebsite && (
                                <Group gap="8px">
                                  <IconWorld size={16} color="#666" />
                                  <Text 
                                    size="sm" 
                                    c="blue" 
                                    style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                    onClick={() => window.open(service.officialWebsite, '_blank')}
                                  >
                                    官方網站
                                  </Text>
                                </Group>
                              )}
                            </Stack>
                          </Box>

                          {/* 營業時間 - 改善版 */}
                          {service.operatingHours && (
                            <Box 
                              style={{
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px',
                                padding: '16px',
                              }}
                            >
                              <Group gap="8px" mb="md">
                                <IconClock size={16} color="#666" />
                                <Text size="sm" fw={600} style={{ color: '#495057' }}>營業時間</Text>
                              </Group>
                              <Stack gap="xs">
                                {service.operatingHours.split(', ').map((timeRange, index) => {
                                  const [day, hours] = timeRange.split(': ')
                                  return (
                                    <Group key={index} justify="space-between">
                                      <Text size="xs" fw={600} w={30} style={{ color: '#495057' }}>
                                        {day}
                                      </Text>
                                      <Text size="xs" style={{ color: '#212529' }}>
                                        {hours}
                                      </Text>
                                    </Group>
                                  )
                                })}
                              </Stack>
                            </Box>
                          )}

                          {/* 備註 */}
                          {service.remarks && (
                            <Box 
                              style={{ 
                                gridColumn: service.operatingHours ? 'span 1' : 'span 2',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px',
                                padding: '16px',
                              }}
                            >
                              <Text size="sm" fw={600} mb="sm" style={{ color: '#495057' }}>備註</Text>
                              <Text size="sm" style={{ color: '#212529', lineHeight: '1.5' }}>
                                {service.remarks}
                              </Text>
                            </Box>
                          )}
                        </div>

                        {/* EVSE 管理 - 簡潔設計 */}
                        <Box>
                          <Group justify="space-between" mb="lg">
                            <Title order={5} style={{ color: '#495057', fontSize: '16px' }}>充電樁管理</Title>
                            <Button
                              size="sm"
                              variant="light"
                              onClick={() => handleAddEVSE(service.id)}
                              disabled={editingEVSEId !== null || editingConnectorId !== null}
                            >
                              新增充電樁
                            </Button>
                          </Group>
                          
                          <Stack gap="lg">

                            {service.evses.map((evse, evseIndex) => (
                              <Card key={evse.id} withBorder bg="#ffffff" style={{ 
                                border: '2px solid #dee2e6',
                                borderRadius: '8px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                              }}>
                                  <Stack gap="12px">
                                <Group justify="space-between">
                                  <Group gap="xs">
                                    <Box 
                                      style={{
                                        width: '6px',
                                        height: '20px',
                                        backgroundColor: '#228be6',
                                        borderRadius: '3px'
                                      }}
                                    />
                                    <Text fw={600} size="md" style={{ color: '#495057' }}>充電樁 #{evseIndex + 1}</Text>
                                  </Group>
                                      <Group gap="xs">
                                        {editingEVSEId !== evse.id && (
                                          <Button
                                            size="xs"
                                            variant="light"
                                            onClick={() => handleEditEVSE(service.id, evse)}
                                            disabled={editingEVSEId !== null || editingConnectorId !== null}
                                          >
                                            編輯
                                          </Button>
                                        )}
                                        <Button 
                                          size="xs" 
                                          color="red" 
                                          variant="subtle"
                                          disabled={editingEVSEId !== null || editingConnectorId !== null}
                                        >
                                          <IconTrash size={14} />
                                        </Button>
                                      </Group>
                                    </Group>

                                    <TextInput
                                      label="樓層資訊"
                                      placeholder="例: 1F, B1, B2..."
                                      value={editingEVSEId === evse.id ? (tempEVSE.floor || '') : evse.floor}
                                      onChange={(e) => {
                                        const value = e.currentTarget.value;
                                        updateEVSE(service.id, evse.id, 'floor', value);
                                      }}
                                      size="sm"
                                      disabled={editingEVSEId !== evse.id}
                                      styles={{
                                        input: {
                                          '&:disabled': {
                                            color: '#495057',
                                            backgroundColor: '#f8f9fa',
                                            opacity: 1
                                          }
                                        }
                                      }}
                                    />
                                    
                                    {editingEVSEId === evse.id && (
                                      <Group justify="flex-end" gap="xs">
                                        <Button size="xs" variant="outline" onClick={handleCancelEVSE}>
                                          取消
                                        </Button>
                                        <Button 
                                          size="xs" 
                                          onClick={() => evse.floor ? handleUpdateEVSE(service.id) : handleSaveEVSE(service.id)}
                                          disabled={!tempEVSE.floor}
                                        >
                                          儲存
                                        </Button>
                                      </Group>
                                    )}

                                    <Group justify="space-between">
                                      <Text size="sm" fw={500} style={{ color: '#1976d2' }}>充電槍管理</Text>
                                      <Button
                                        size="xs"
                                        variant="light"
                                        color="blue"
                                        onClick={() => handleAddConnector(service.id, evse.id)}
                                        disabled={editingEVSEId !== null || editingConnectorId !== null}
                                      >
                                        新增充電槍
                                      </Button>
                                    </Group>

                                  {evse.connectors.map((connector, connectorIndex) => {
                                    const isEditing = editingConnectorId === connector.id;
                                    const displayConnector = isEditing ? tempConnector : connector;
                                    
                                    return (
                                      <Card key={connector.id} bg="#ffffff" withBorder style={{ 
                                        border: isEditing ? '2px solid #228be6' : '1px solid #e9ecef',
                                        borderRadius: '6px',
                                        marginLeft: '16px'
                                      }}>
                                          <Stack gap="8px">
                                            <Group justify="space-between">
                                              <Group gap="xs">
                                                <Box 
                                                  style={{
                                                    width: '4px',
                                                    height: '16px',
                                                    backgroundColor: '#28a745',
                                                    borderRadius: '2px'
                                                  }}
                                                />
                                                <Text size="sm" fw={500} style={{ color: '#495057' }}>充電槍 #{connectorIndex + 1}</Text>
                                              </Group>
                                              <Group gap="xs">
                                                {!isEditing && (
                                                  <Button
                                                    size="xs"
                                                    variant="subtle"
                                                    onClick={() => handleEditConnector(service.id, evse.id, connector)}
                                                    disabled={editingEVSEId !== null || editingConnectorId !== null}
                                                  >
                                                    編輯
                                                  </Button>
                                                )}
                                                <Button 
                                                  size="xs" 
                                                  color="red" 
                                                  variant="subtle"
                                                  disabled={editingEVSEId !== null || editingConnectorId !== null}
                                                >
                                                  <IconTrash size={14} />
                                                </Button>
                                              </Group>
                                            </Group>
                                            
                                            <Group grow>
                                              <TextInput
                                                label="充電槍號"
                                                placeholder="例: A1, B2..."
                                                value={displayConnector.connectorNumber || ''}
                                                onChange={(e) => {
                                                  const value = e.currentTarget.value;
                                                  updateConnector(service.id, evse.id, connector.id, 'connectorNumber', value);
                                                }}
                                                size="xs"
                                                disabled={editingConnectorId !== connector.id}
                                                styles={{
                                                  input: {
                                                    '&:disabled': {
                                                      color: '#495057',
                                                      backgroundColor: '#f8f9fa',
                                                      opacity: 1
                                                    }
                                                  }
                                                }}
                                              />
                                              <Select
                                                label="充電槍規格"
                                                data={connectorTypeOptions}
                                                value={displayConnector.connectorType}
                                                onChange={(value) => updateConnector(service.id, evse.id, connector.id, 'connectorType', value || 'Type 2')}
                                                size="xs"
                                                disabled={editingConnectorId !== connector.id}
                                                styles={{
                                                  input: {
                                                    '&:disabled': {
                                                      color: '#495057',
                                                      backgroundColor: '#f8f9fa',
                                                      opacity: 1
                                                    }
                                                  }
                                                }}
                                              />
                                            </Group>

                                            <Group grow>
                                              <Select
                                                label="狀態"
                                                data={connectorStatusOptions}
                                                value={displayConnector.status}
                                                onChange={(value) => updateConnector(service.id, evse.id, connector.id, 'status', value || 'AVAILABLE')}
                                                size="xs"
                                                disabled={editingConnectorId !== connector.id}
                                                styles={{
                                                  input: {
                                                    '&:disabled': {
                                                      color: '#495057',
                                                      backgroundColor: '#f8f9fa',
                                                      opacity: 1
                                                    }
                                                  }
                                                }}
                                              />
                                              <TextInput
                                                label="功率 (kW)"
                                                value={displayConnector.powerKw?.toString() || '22'}
                                                onChange={(e) => {
                                                  const value = parseFloat(e.currentTarget.value) || 0;
                                                  updateConnector(service.id, evse.id, connector.id, 'powerKw', value);
                                                }}
                                                size="xs"
                                                type="number"
                                                disabled={editingConnectorId !== connector.id}
                                                styles={{
                                                  input: {
                                                    '&:disabled': {
                                                      color: '#495057',
                                                      backgroundColor: '#f8f9fa',
                                                      opacity: 1
                                                    }
                                                  }
                                                }}
                                              />
                                            </Group>
                                            
                                            {/* 充電費率 - 條件顯示 */}
                                            {isEditing ? (
                                              <Textarea
                                                label="充電費率"
                                                placeholder="範例：
平日 08:00–18:00：TWD$ 6 元/kWh
假日 10:00–20:00：TWD$ 6.5 元/kWh
離峰 22:00-05:00：TWD$ 5.5 元/kWh"
                                                value={displayConnector.chargingRate || ''}
                                                onChange={(e) => {
                                                  const value = e.currentTarget.value;
                                                  if (value.length <= 1000) {
                                                    updateConnector(service.id, evse.id, connector.id, 'chargingRate', value);
                                                  }
                                                }}
                                                size="xs"
                                                rows={3}
                                                error={displayConnector.chargingRate && displayConnector.chargingRate.length > 1000 ? '不可超過 1000 字' : ''}
                                              />
                                            ) : displayConnector.chargingRate ? (
                                              <Box 
                                                style={{
                                                  backgroundColor: '#f8f9fa',
                                                  borderRadius: '4px',
                                                  padding: '8px',
                                                  border: '1px solid #dee2e6'
                                                }}
                                              >
                                                <Text size="xs" fw={500} mb="4px" style={{ color: '#495057' }}>充電費率</Text>
                                                <Text size="xs" style={{ 
                                                  color: '#212529', 
                                                  lineHeight: '1.4',
                                                  whiteSpace: 'pre-line'
                                                }}>
                                                  {displayConnector.chargingRate}
                                                </Text>
                                              </Box>
                                            ) : null}
                                            
                                            {isEditing && (
                                              <Group justify="flex-end" gap="xs" mt="xs">
                                                <Button size="xs" variant="outline" onClick={handleCancelConnector}>
                                                  取消
                                                </Button>
                                                <Button 
                                                  size="xs" 
                                                  onClick={() => handleUpdateConnector(service.id, evse.id)}
                                                  disabled={!tempConnector.connectorNumber || (tempConnector.chargingRate ? tempConnector.chargingRate.length > 1000 : false)}
                                                >
                                                  儲存
                                                </Button>
                                              </Group>
                                            )}
                                          </Stack>
                                        </Card>
                                      );
                                    })}
                                    
                                  {/* 新增充電槍表單 */}
                                  {editingConnectorId && !evse.connectors.find(c => c.id === editingConnectorId) && tempConnector.evseId === evse.id && (
                                    <Card bg="#ffffff" withBorder style={{ 
                                      border: '2px dashed #228be6',
                                      borderRadius: '6px',
                                      marginLeft: '16px'
                                    }}>
                                      <Stack gap="8px">
                                        <Group gap="xs">
                                          <Box 
                                            style={{
                                              width: '4px',
                                              height: '16px',
                                              backgroundColor: '#228be6',
                                              borderRadius: '2px'
                                            }}
                                          />
                                          <Text size="sm" fw={500} style={{ color: '#495057' }}>新增充電槍</Text>
                                        </Group>
                                          
                                          <Group grow>
                                            <TextInput
                                              label="充電槍號"
                                              placeholder="例: A1, B2..."
                                              value={tempConnector.connectorNumber || ''}
                                              onChange={(e) => {
                                                const value = e.currentTarget.value;
                                                setTempConnector(prev => ({ ...prev, connectorNumber: value }));
                                              }}
                                              size="xs"
                                            />
                                            <Select
                                              label="充電槍規格"
                                              data={connectorTypeOptions}
                                              value={tempConnector.connectorType || 'Type 2'}
                                              onChange={(value) => setTempConnector(prev => ({ ...prev, connectorType: value || 'Type 2' }))}
                                              size="xs"
                                            />
                                          </Group>

                                          <Group grow>
                                            <Select
                                              label="狀態"
                                              data={connectorStatusOptions}
                                              value={tempConnector.status || 'AVAILABLE'}
                                              onChange={(value) => setTempConnector(prev => ({ ...prev, status: value || 'AVAILABLE' }))}
                                              size="xs"
                                            />
                                            <TextInput
                                              label="功率 (kW)"
                                              value={tempConnector.powerKw?.toString() || '22'}
                                              onChange={(e) => {
                                                const value = parseFloat(e.currentTarget.value) || 0;
                                                setTempConnector(prev => ({ ...prev, powerKw: value }));
                                              }}
                                              size="xs"
                                              type="number"
                                            />
                                          </Group>
                                          
                                          <Stack gap="4px">
                                            <Textarea
                                              label="充電費率"
                                              placeholder="請輸入充電費率資訊，可支援不同時段費率"
                                              value={tempConnector.chargingRate || ''}
                                              onChange={(e) => {
                                                const value = e.currentTarget.value;
                                                if (value.length <= 1000) {
                                                  setTempConnector(prev => ({ ...prev, chargingRate: value }));
                                                }
                                              }}
                                              size="xs"
                                              rows={4}
                                              error={tempConnector.chargingRate && tempConnector.chargingRate.length > 1000 ? '不可超過 1000 字' : ''}
                                            />
                                            <Text size="10px" c="dimmed" style={{ lineHeight: '1.2' }}>
                                              <strong>填寫範例：</strong><br/>
                                              平日 08:00–18:00：TWD$ 6 元/kWh<br/>
                                              假日 10:00–20:00：TWD$ 6.5 元/kWh<br/>
                                              離峰 22:00-05:00：TWD$ 5.5 元/kWh
                                            </Text>
                                            <Text size="10px" c="dimmed">
                                              字數：{tempConnector.chargingRate?.length || 0}/1000
                                            </Text>
                                          </Stack>
                                          
                                          <Group justify="flex-end" gap="xs" mt="xs">
                                            <Button size="xs" variant="outline" onClick={handleCancelConnector}>
                                              取消
                                            </Button>
                                            <Button 
                                              size="xs" 
                                              onClick={() => handleSaveConnector(service.id, evse.id)}
                                              disabled={!tempConnector.connectorNumber || (tempConnector.chargingRate ? tempConnector.chargingRate.length > 1000 : false)}
                                            >
                                              儲存充電槍
                                            </Button>
                                          </Group>
                                        </Stack>
                                      </Card>
                                    )}
                                </Stack>
                              </Card>
                            ))}
                            
                            {/* 新增 EVSE 表單 */}
                            {editingEVSEId && !service.evses.find(e => e.id === editingEVSEId) && (
                              <Card withBorder bg="#ffffff" style={{ 
                                border: '2px dashed #228be6',
                                borderRadius: '8px'
                              }}>
                                <Stack gap="12px">
                                  <Group justify="space-between">
                                    <Group gap="xs">
                                      <Box 
                                        style={{
                                          width: '6px',
                                          height: '20px',
                                          backgroundColor: '#228be6',
                                          borderRadius: '3px'
                                        }}
                                      />
                                      <Text fw={600} size="md" style={{ color: '#495057' }}>新增充電樁</Text>
                                    </Group>
                                  </Group>

                                    <TextInput
                                      label="樓層資訊"
                                      placeholder="例: 1F, B1, B2..."
                                      value={tempEVSE.floor || ''}
                                      onChange={(e) => {
                                        const value = e.currentTarget.value;
                                        setTempEVSE(prev => ({ ...prev, floor: value }));
                                      }}
                                      size="sm"
                                    />
                                    
                                  <Group justify="flex-end" gap="xs">
                                    <Button size="sm" variant="outline" onClick={handleCancelEVSE}>
                                      取消
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      onClick={() => handleSaveEVSE(service.id)}
                                      disabled={!tempEVSE.floor}
                                    >
                                      儲存充電樁
                                    </Button>
                                  </Group>
                                </Stack>
                              </Card>
                            )}
                          </Stack>
                        </Box>
                      </Stack>
                    </Card>
                  ))}

                  {/* 充電服務初始狀態區塊 - 置中顯示按鈕和提示 */}
                  {chargingServices.length === 0 && !isAddingChargingService && (
                    <Box ta="center" py="xl">
                      <Button
                        leftSection={<IconBolt size={16} />}
                        onClick={() => setIsAddingChargingService(true)}
                        size="md"
                      >
                        開始設定充電服務
                      </Button>
                    </Box>
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
                            : (addingStep === 'basic' ? '第一階段：充電服務基本設定' : '第二階段：營業時間設定')
                          }
                        </Text>
                      </Group>
                    }
                    size="lg"
                    centered
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
                            backgroundColor: (editingServiceId ? editingStep : addingStep) === 'schedule' ? '#228be6' : '#e9ecef',
                          }}
                        />
                        <Box
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: (editingServiceId ? editingStep : addingStep) === 'schedule' ? '#228be6' : '#e9ecef',
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
                            <TextInput
                              label="充電站品牌"
                              placeholder="請輸入品牌名稱"
                              value={newChargingService.brand || ''}
                              onChange={(e) => {
                                const value = e.currentTarget.value;
                                setNewChargingService(prev => ({ ...prev, brand: value }));
                              }}
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
                            placeholder="請輸入備註資訊"
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
                          <Box style={{ maxHeight: '300px', overflowY: 'auto' }}>
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
                            <Button onClick={editingServiceId ? handleUpdateService : handleAddChargingService}>
                              {editingServiceId ? '完成編輯充電服務' : '完成新增充電服務'}
                            </Button>
                          </Group>
                        </Stack>
                      )}
                    </Stack>
                  </Modal>
                </Stack>
              </Tabs.Panel>

              <Tabs.Panel value="fueling" pt="lg">
                <Text size="sm" c="dimmed" ta="center" py="xl">
                  加油服務功能開發中...
                </Text>
              </Tabs.Panel>

              <Tabs.Panel value="maintenance" pt="lg">  
                <Text size="sm" c="dimmed" ta="center" py="xl">
                  保修服務功能開發中...
                </Text>
              </Tabs.Panel>

              <Tabs.Panel value="washing" pt="lg">
                <Text size="sm" c="dimmed" ta="center" py="xl">
                  洗車服務功能開發中...
                </Text>
              </Tabs.Panel>

              <Tabs.Panel value="parking" pt="lg">
                <Text size="sm" c="dimmed" ta="center" py="xl">
                  停車服務功能開發中...
                </Text>
              </Tabs.Panel>
            </Tabs>
          </div>
        </Stack>
      </Box>
    </Box>
  )
}