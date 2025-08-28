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

  const handleAddChargingService = () => {
    if (!newChargingService.name || !newChargingService.brand) {
      return
    }

    const service: ChargingService = {
      id: Date.now().toString(),
      name: newChargingService.name!,
      brand: newChargingService.brand!,
      status: newChargingService.status!,
      phone: newChargingService.phone || '',
      operatingHours: newChargingService.operatingHours || '',
      photos: [],
      remarks: newChargingService.remarks || '',
      officialWebsite: newChargingService.officialWebsite || '',
      evses: newChargingService.evses || []
    }

    setChargingServices(prev => [...prev, service])
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
    setIsAddingChargingService(false)
    showSuccess('充電服務已新增', '新增成功')
  }

  const handleAddEVSE = (serviceId: string) => {
    const newEVSE: EVSE = {
      id: Date.now().toString(),
      floor: '',
      connectors: []
    }

    setChargingServices(prev => prev.map(service => 
      service.id === serviceId 
        ? { ...service, evses: [...service.evses, newEVSE] }
        : service
    ))
  }

  const handleAddConnector = (serviceId: string, evseId: string) => {
    const newConnector: ChargingConnector = {
      id: Date.now().toString(),
      connectorNumber: '',
      connectorType: 'Type 2',
      status: 'AVAILABLE',
      powerKw: 22
    }

    setChargingServices(prev => prev.map(service => 
      service.id === serviceId 
        ? {
            ...service,
            evses: service.evses.map(evse =>
              evse.id === evseId
                ? { ...evse, connectors: [...evse.connectors, newConnector] }
                : evse
            )
          }
        : service
    ))
  }

  const updateEVSE = (serviceId: string, evseId: string, field: keyof EVSE, value: string) => {
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

  const updateConnector = (serviceId: string, evseId: string, connectorId: string, field: keyof ChargingConnector, value: string | number) => {
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
        <Button
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
          儲存設定
        </Button>
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
                  {/* 充電服務管理區塊 */}
                  <Card withBorder radius="8px" bg="#ffffff" style={{ border: '1px solid #bbdefb' }}>
                    <Stack gap="lg">
                      <Title order={5} style={{ color: '#1976d2' }}>充電服務管理</Title>
                      
                      {/* 充電服務詳細管理區域 */}
                      {chargingServices.map((service) => (
                        <div key={service.id}>
                          {/* 充電服務標題區塊 */}
                          <Card withBorder radius="8px" bg="#e3f2fd" mb="lg" style={{ border: '1px solid #bbdefb' }}>
                            <Group justify="space-between" align="center">
                              <Group align="center">
                                <IconBolt size={24} color="#1976d2" />
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
                              <ActionIcon color="red" variant="subtle" size="lg">
                                <IconTrash size={18} />
                              </ActionIcon>
                            </Group>
                          </Card>

                          {/* 充電服務詳細資訊 */}
                          <Card withBorder radius="8px" bg="#ffffff" mb="md" style={{ border: '1px solid #bbdefb' }}>
                            <div style={{ 
                              display: 'grid', 
                              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                              gap: '20px',
                              marginBottom: '16px'
                            }}>

                              {service.phone && (
                                <Box>
                                  <Group gap="8px" mb="xs">
                                    <IconPhone size={16} color="#666" />
                                    <Text size="sm" fw={600} style={{ color: '#495057' }}>服務電話</Text>
                                  </Group>
                                  <Text size="sm" style={{ color: '#212529' }}>{service.phone}</Text>
                                </Box>
                              )}

                              {service.operatingHours && (
                                <Box>
                                  <Group gap="8px" mb="xs">
                                    <IconClock size={16} color="#666" />
                                    <Text size="sm" fw={600} style={{ color: '#495057' }}>營業時間</Text>
                                  </Group>
                                  <Text size="sm" style={{ color: '#212529' }}>{service.operatingHours}</Text>
                                </Box>
                              )}

                              {service.officialWebsite && (
                                <Box>
                                  <Group gap="8px" mb="xs">
                                    <IconWorld size={16} color="#666" />
                                    <Text size="sm" fw={600} style={{ color: '#495057' }}>官方網站</Text>
                                  </Group>
                                  <Text size="sm" c="blue" style={{ cursor: 'pointer' }}
                                        onClick={() => window.open(service.officialWebsite, '_blank')}>
                                    {service.officialWebsite}
                                  </Text>
                                </Box>
                              )}

                              {service.remarks && (
                                <Box style={{ gridColumn: 'span 2' }}>
                                  <Text size="sm" fw={600} mb="xs" style={{ color: '#495057' }}>備註</Text>
                                  <Text size="sm" style={{ color: '#212529', lineHeight: '1.5' }}>
                                    {service.remarks}
                                  </Text>
                                </Box>
                              )}
                            </div>
                          </Card>

                          {/* EVSE 管理 */}
                          <Card withBorder radius="8px" bg="#ffffff" mb="md" style={{ border: '1px solid #bbdefb' }}>
                            <Stack gap="16px">
                              <Group justify="space-between">
                                <Text fw={500}>充電樁管理</Text>
                                <Button
                                  size="xs"
                                  variant="light"
                                  onClick={() => handleAddEVSE(service.id)}
                                >
                                  新增充電樁
                                </Button>
                              </Group>

                              {service.evses.map((evse, evseIndex) => (
                                <Card key={evse.id} withBorder bg="#e3f2fd" style={{ border: '1px solid #bbdefb' }}>
                                  <Stack gap="12px">
                                    <Group justify="space-between">
                                      <Text fw={500} size="sm" style={{ color: '#1976d2' }}>充電樁 #{evseIndex + 1}</Text>
                                      <ActionIcon size="sm" color="red" variant="subtle">
                                        <IconTrash size={14} />
                                      </ActionIcon>
                                    </Group>

                                    <TextInput
                                      label="樓層資訊"
                                      placeholder="例: 1F, B1, B2..."
                                      value={evse.floor}
                                      onChange={(e) => {
                                        const value = e.currentTarget.value;
                                        updateEVSE(service.id, evse.id, 'floor', value);
                                      }}
                                      size="sm"
                                    />

                                    <Group justify="space-between">
                                      <Text size="sm" fw={500} style={{ color: '#1976d2' }}>充電槍管理</Text>
                                      <Button
                                        size="xs"
                                        variant="light"
                                        color="blue"
                                        onClick={() => handleAddConnector(service.id, evse.id)}
                                      >
                                        新增充電槍
                                      </Button>
                                    </Group>

                                    {evse.connectors.map((connector, connectorIndex) => (
                                      <Card key={connector.id} bg="#ffffff" withBorder style={{ border: '1px solid #bbdefb' }}>
                                        <Group align="flex-start">
                                          <Stack gap="8px" style={{ flex: 1 }}>
                                            <Text size="xs" fw={500}>充電槍 #{connectorIndex + 1}</Text>
                                            
                                            <Group grow>
                                              <TextInput
                                                label="充電槍號"
                                                placeholder="例: A1, B2..."
                                                value={connector.connectorNumber}
                                                onChange={(e) => {
                                                  const value = e.currentTarget.value;
                                                  updateConnector(service.id, evse.id, connector.id, 'connectorNumber', value);
                                                }}
                                                size="xs"
                                              />
                                              <Select
                                                label="充電槍規格"
                                                data={connectorTypeOptions}
                                                value={connector.connectorType}
                                                onChange={(value) => updateConnector(service.id, evse.id, connector.id, 'connectorType', value || 'Type 2')}
                                                size="xs"
                                              />
                                            </Group>

                                            <Group grow>
                                              <Select
                                                label="狀態"
                                                data={connectorStatusOptions}
                                                value={connector.status}
                                                onChange={(value) => updateConnector(service.id, evse.id, connector.id, 'status', value || 'AVAILABLE')}
                                                size="xs"
                                              />
                                              <TextInput
                                                label="功率 (kW)"
                                                value={connector.powerKw.toString()}
                                                onChange={(e) => {
                                                  const value = parseFloat(e.currentTarget.value) || 0;
                                                  updateConnector(service.id, evse.id, connector.id, 'powerKw', value);
                                                }}
                                                size="xs"
                                                type="number"
                                              />
                                            </Group>
                                          </Stack>
                                          <ActionIcon size="sm" color="red" variant="subtle">
                                            <IconTrash size={14} />
                                          </ActionIcon>
                                        </Group>
                                      </Card>
                                    ))}
                                  </Stack>
                                </Card>
                              ))}
                            </Stack>
                          </Card>
                        </div>
                      ))}

                      {/* 新增充電服務按鈕 */}
                      <Group justify="flex-end">
                        {chargingServices.length === 0 ? (
                          <Button
                            leftSection={<IconBolt size={16} />}
                            onClick={() => setIsAddingChargingService(true)}
                          >
                            新增充電服務
                          </Button>
                        ) : (
                          <Text size="sm" c="dimmed">
                            已建立充電服務 (一個場站只能有一個充電服務)
                          </Text>
                        )}
                      </Group>

                      {chargingServices.length === 0 && !isAddingChargingService && (
                        <Text size="sm" c="dimmed" ta="center" py="xl">
                          點擊上方按鈕開始設置充電服務
                        </Text>
                      )}
                    </Stack>
                  </Card>

                  {/* 新增充電服務表單 */}
                  {isAddingChargingService && (
                    <Card withBorder radius="8px" bg="#ffffff" style={{ border: '1px solid #bbdefb' }}>
                      <Stack gap="lg">
                        <Title order={5} style={{ color: '#1976d2' }}>新增充電服務</Title>
                        
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

                        {/* 營業時間設定 */}
                        <Card withBorder radius="6px" bg="#e3f2fd" style={{ border: '1px solid #bbdefb' }}>
                          <Stack gap="md">
                            <Text size="sm" fw={500} style={{ color: '#1976d2' }}>營業時間設定</Text>
                            
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
                            <Stack gap="xs">
                              {weekDays.map((day) => {
                                const hasSchedule = operatingHours[day.value];
                                
                                return hasSchedule ? (
                                  <Group key={day.value} justify="space-between" align="center" p="sm" 
                                         style={{ 
                                           backgroundColor: '#ffffff', 
                                           borderRadius: '6px', 
                                           border: '1px solid #bbdefb'
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
                          </Stack>
                        </Card>

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

                        <Group justify="flex-end">
                          <Button
                            variant="outline"
                            onClick={() => setIsAddingChargingService(false)}
                          >
                            取消
                          </Button>
                          <Button
                            onClick={handleAddChargingService}
                            disabled={!newChargingService.name || !newChargingService.brand}
                          >
                            新增充電服務
                          </Button>
                        </Group>
                      </Stack>
                    </Card>
                  )}
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