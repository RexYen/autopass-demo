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
  Card,
  ActionIcon,
  Table,
  Collapse,
} from '@mantine/core'
import {
  IconArrowLeft,
  IconTrash,
  IconBolt,
  IconGasStation,
  IconChevronDown,
  IconChevronRight,
  IconPlus,
  IconEdit,
} from '@tabler/icons-react'

import { useState } from 'react'
import { useNotification } from '../hooks/useNotification'

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

interface TempChargingConnector extends Partial<ChargingConnector> {
  serviceId?: string
  evseId?: string
}

interface ChargingEquipmentManagementProps {
  service: ChargingService
  onBack: () => void
  onServiceUpdate: (updatedService: ChargingService) => void
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
  'Unknown',
  'AVAILABLE',
  'PREPARING', 
  'CHARGING',
  'FAULTED'
]

// 電力輸出方式選項
const powerOutputOptions = [
  'AC',
  'DC'
]

export function ChargingEquipmentManagement({ service, onBack, onServiceUpdate }: ChargingEquipmentManagementProps) {
  const [currentService, setCurrentService] = useState<ChargingService>(service)
  const [editingEVSEId, setEditingEVSEId] = useState<string | null>(null)
  const [editingConnectorId, setEditingConnectorId] = useState<string | null>(null)
  const [tempEVSE, setTempEVSE] = useState<Partial<EVSE>>({})
  const [tempConnector, setTempConnector] = useState<TempChargingConnector>({})
  const [expandedEVSEs, setExpandedEVSEs] = useState<Set<string>>(new Set())
  
  const { showSuccess } = useNotification()

  // 切換充電樁展開狀態
  const toggleEVSE = (evseId: string) => {
    setExpandedEVSEs(prev => {
      const newSet = new Set(prev)
      if (newSet.has(evseId)) {
        newSet.delete(evseId)
      } else {
        newSet.add(evseId)
      }
      return newSet
    })
  }

  const handleAddEVSE = () => {
    const newEVSE: EVSE = {
      id: Date.now().toString(),
      floor: '',
      connectors: []
    }
    setTempEVSE(newEVSE)
    setEditingEVSEId(newEVSE.id)
  }

  const handleSaveEVSE = () => {
    if (!tempEVSE.floor || !tempEVSE.id) return
    
    const updatedService = {
      ...currentService,
      evses: [...currentService.evses, tempEVSE as EVSE]
    }
    setCurrentService(updatedService)
    onServiceUpdate(updatedService)
    setEditingEVSEId(null)
    setTempEVSE({})
    showSuccess('充電樁已儲存', '儲存成功')
  }

  const handleEditEVSE = (evse: EVSE) => {
    setTempEVSE(evse)
    setEditingEVSEId(evse.id)
  }

  const handleCancelEVSE = () => {
    setEditingEVSEId(null)
    setTempEVSE({})
  }

  const handleAddConnector = (evseId: string) => {
    const newConnector: ChargingConnector = {
      id: Date.now().toString(),
      connectorNumber: '',
      connectorType: 'Type 2',
      status: 'Unknown',
      powerKw: 22,
      chargingRate: '',
      powerOutput: 'AC',
      supportsEVCCID: false
    }
    setTempConnector({ ...newConnector, serviceId: currentService.id, evseId })
    setEditingConnectorId(newConnector.id)
  }

  const handleSaveConnector = (evseId: string) => {
    if (!tempConnector.connectorNumber || !tempConnector.id) return
    
    const updatedService = {
      ...currentService,
      evses: currentService.evses.map(evse =>
        evse.id === evseId
          ? { ...evse, connectors: [...evse.connectors, tempConnector as ChargingConnector] }
          : evse
      )
    }
    setCurrentService(updatedService)
    onServiceUpdate(updatedService)
    setEditingConnectorId(null)
    setTempConnector({})
    showSuccess('充電槍已儲存', '儲存成功')
  }

  const handleEditConnector = (evseId: string, connector: ChargingConnector) => {
    setTempConnector({ ...connector, serviceId: currentService.id, evseId })
    setEditingConnectorId(connector.id)
  }

  const handleUpdateConnector = (evseId: string) => {
    if (!tempConnector.connectorNumber || !tempConnector.id) return
    
    const updatedService = {
      ...currentService,
      evses: currentService.evses.map(evse =>
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
    setCurrentService(updatedService)
    onServiceUpdate(updatedService)
    setEditingConnectorId(null)
    setTempConnector({})
    showSuccess('充電槍已更新', '更新成功')
  }

  const handleCancelConnector = () => {
    setEditingConnectorId(null)
    setTempConnector({})
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
            充電設備管理
          </Title>
        </Group>
      </Group>

      {/* Content */}
      <Box style={{ flex: 1, overflow: 'auto' }}>
        <Stack gap="32px" p="20px">
          {/* 充電服務基本資訊 */}
          <Card withBorder radius="8px" shadow="sm" bg="#e3f2fd">
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
                    {currentService.name}
                  </Text>
                  <Group gap="sm" mt="xs">
                    <Badge size="md" variant="light" color="blue">
                      {currentService.brand}
                    </Badge>
                    <Badge
                      size="md"
                      variant="light"
                      color={currentService.status === '營運中' ? 'green' : currentService.status === '維護中' ? 'yellow' : 'red'}
                    >
                      {currentService.status}
                    </Badge>
                  </Group>
                </div>
              </Group>
            </Group>
          </Card>

          {/* 充電設備管理 - 表格模式 */}
          <Box>
            <Group justify="space-between" mb="lg">
              <Title order={3} style={{ color: '#495057', fontSize: '18px' }}>充電設備管理</Title>
              <Button
                leftSection={<IconPlus size={16} />}
                size="sm"
                variant="filled"
                color="blue"
                onClick={handleAddEVSE}
                disabled={editingEVSEId !== null || editingConnectorId !== null}
              >
                新增充電樁
              </Button>
            </Group>
            
            {currentService.evses.length === 0 ? (
              <Card withBorder bg="#f8f9fa" style={{ 
                border: '2px dashed #dee2e6',
                borderRadius: '8px',
                textAlign: 'center',
                padding: '40px 20px'
              }}>
                <Stack gap="md" align="center">
                  <IconGasStation size={48} color="#868e96" />
                  <Stack gap="xs" align="center">
                    <Text size="md" fw={600} style={{ color: '#495057' }}>
                      尚未新增充電樁
                    </Text>
                    <Text size="sm" style={{ color: '#6c757d' }}>
                      開始為這個充電站配置充電樁設備，提供更完整的服務資訊
                    </Text>
                  </Stack>
                  <Button 
                    leftSection={<IconGasStation size={16} />}
                    onClick={handleAddEVSE}
                    variant="filled"
                    color="blue"
                    size="sm"
                  >
                    立即新增充電樁
                  </Button>
                </Stack>
              </Card>
            ) : (
              <Stack gap="xs">
                {currentService.evses.map((evse, evseIndex) => (
                  <Box key={evse.id}>
                    {/* 充電樁標題行 */}
                    <Box
                      style={{
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #dee2e6',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        cursor: 'pointer',
                      }}
                      onClick={() => toggleEVSE(evse.id)}
                    >
                      <Group justify="space-between" align="center">
                        <Group gap="sm">
                          <ActionIcon
                            variant="subtle"
                            size="sm"
                            style={{ color: '#495057' }}
                          >
                            {expandedEVSEs.has(evse.id) ? 
                              <IconChevronDown size={16} /> : 
                              <IconChevronRight size={16} />
                            }
                          </ActionIcon>
                          <IconGasStation size={18} color="#228be6" />
                          <Text fw={600} style={{ color: '#495057' }}>
                            充電樁 #{evseIndex + 1} {evse.floor && `(${evse.floor})`}
                          </Text>
                          <Badge variant="light" color="blue" size="sm">
                            {evse.connectors.length} 支充電槍
                          </Badge>
                        </Group>
                        
                        <Group gap="xs" onClick={(e) => e.stopPropagation()}>
                          <ActionIcon
                            variant="subtle"
                            size="sm"
                            color="blue"
                            onClick={() => handleEditEVSE(evse)}
                            disabled={editingEVSEId !== null || editingConnectorId !== null}
                          >
                            <IconEdit size={14} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            size="sm"
                            color="red"
                            disabled={editingEVSEId !== null || editingConnectorId !== null}
                          >
                            <IconTrash size={14} />
                          </ActionIcon>
                          <Button
                            size="xs"
                            variant="light"
                            leftSection={<IconPlus size={12} />}
                            onClick={() => handleAddConnector(evse.id)}
                            disabled={editingEVSEId !== null || editingConnectorId !== null}
                          >
                            新增充電槍
                          </Button>
                        </Group>
                      </Group>
                    </Box>

                    {/* 充電槍表格 */}
                    <Collapse in={expandedEVSEs.has(evse.id)}>
                      <Box mt="xs" style={{ backgroundColor: '#ffffff', border: '1px solid #dee2e6', borderRadius: '8px' }}>
                        {evse.connectors.length === 0 ? (
                          <Box p="md" style={{ textAlign: 'center' }}>
                            <Text size="sm" c="dimmed">此充電樁尚未配置充電槍</Text>
                            <Button
                              size="xs"
                              variant="light"
                              mt="xs"
                              leftSection={<IconPlus size={12} />}
                              onClick={() => handleAddConnector(evse.id)}
                              disabled={editingEVSEId !== null || editingConnectorId !== null}
                            >
                              新增第一支充電槍
                            </Button>
                          </Box>
                        ) : (
                          <Table>
                            <Table.Thead>
                              <Table.Tr>
                                <Table.Th style={{ width: '100px' }}>槍號</Table.Th>
                                <Table.Th style={{ width: '100px' }}>狀態</Table.Th>
                                <Table.Th style={{ width: '100px' }}>規格</Table.Th>
                                <Table.Th style={{ width: '80px' }}>功率</Table.Th>
                                <Table.Th style={{ width: '80px' }}>輸出</Table.Th>
                                <Table.Th style={{ width: '100px' }}>EVCCID</Table.Th>
                                <Table.Th>操作</Table.Th>
                              </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                              {evse.connectors.map((connector) => {
                                const isEditing = editingConnectorId === connector.id;
                                const displayConnector = isEditing ? tempConnector : connector;
                                
                                return (
                                  <Table.Tr key={connector.id} style={{ 
                                    backgroundColor: isEditing ? '#e3f2fd' : undefined 
                                  }}>
                                    <Table.Td>
                                      {isEditing ? (
                                        <TextInput
                                          size="xs"
                                          placeholder="A1, B2..."
                                          value={displayConnector.connectorNumber || ''}
                                          onChange={(e) => {
                                            const value = e.currentTarget.value;
                                            setTempConnector(prev => ({ ...prev, connectorNumber: value }));
                                          }}
                                        />
                                      ) : (
                                        <Text size="sm" fw={500}>{connector.connectorNumber}</Text>
                                      )}
                                    </Table.Td>
                                    <Table.Td>
                                      {isEditing ? (
                                        <Select
                                          size="xs"
                                          data={connectorStatusOptions}
                                          value={displayConnector.status || 'Unknown'}
                                          onChange={(value) => setTempConnector(prev => ({ ...prev, status: value || 'Unknown' }))}
                                        />
                                      ) : (
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
                                      )}
                                    </Table.Td>
                                    <Table.Td>
                                      {isEditing ? (
                                        <Select
                                          size="xs"
                                          data={connectorTypeOptions}
                                          value={displayConnector.connectorType || 'Type 2'}
                                          onChange={(value) => setTempConnector(prev => ({ ...prev, connectorType: value || 'Type 2' }))}
                                        />
                                      ) : (
                                        <Text size="sm">{connector.connectorType}</Text>
                                      )}
                                    </Table.Td>
                                    <Table.Td>
                                      {isEditing ? (
                                        <TextInput
                                          size="xs"
                                          type="number"
                                          value={displayConnector.powerKw?.toString() || '22'}
                                          onChange={(e) => {
                                            const value = parseFloat(e.currentTarget.value) || 0;
                                            setTempConnector(prev => ({ ...prev, powerKw: value }));
                                          }}
                                        />
                                      ) : (
                                        <Text size="sm">{connector.powerKw}kW</Text>
                                      )}
                                    </Table.Td>
                                    <Table.Td>
                                      {isEditing ? (
                                        <Select
                                          size="xs"
                                          data={powerOutputOptions}
                                          value={displayConnector.powerOutput || 'AC'}
                                          onChange={(value) => setTempConnector(prev => ({ ...prev, powerOutput: value || 'AC' }))}
                                        />
                                      ) : (
                                        <Badge variant="light" size="sm">
                                          {connector.powerOutput}
                                        </Badge>
                                      )}
                                    </Table.Td>
                                    <Table.Td>
                                      {isEditing ? (
                                        <Select
                                          size="xs"
                                          data={[
                                            { value: 'yes', label: '是' },
                                            { value: 'no', label: '否' }
                                          ]}
                                          value={displayConnector.supportsEVCCID ? 'yes' : 'no'}
                                          onChange={(value) => setTempConnector(prev => ({ ...prev, supportsEVCCID: value === 'yes' }))}
                                        />
                                      ) : (
                                        <Text size="sm" c={connector.supportsEVCCID ? 'green' : 'gray'}>
                                          {connector.supportsEVCCID ? '是' : '否'}
                                        </Text>
                                      )}
                                    </Table.Td>
                                    <Table.Td>
                                      {isEditing ? (
                                        <Group gap="xs">
                                          <Button
                                            size="xs"
                                            variant="outline"
                                            onClick={handleCancelConnector}
                                          >
                                            取消
                                          </Button>
                                          <Button
                                            size="xs"
                                            onClick={() => handleUpdateConnector(evse.id)}
                                            disabled={!tempConnector.connectorNumber}
                                          >
                                            儲存
                                          </Button>
                                        </Group>
                                      ) : (
                                        <Group gap="xs">
                                          <ActionIcon
                                            variant="subtle"
                                            size="sm"
                                            color="blue"
                                            onClick={() => handleEditConnector(evse.id, connector)}
                                            disabled={editingEVSEId !== null || editingConnectorId !== null}
                                          >
                                            <IconEdit size={14} />
                                          </ActionIcon>
                                          <ActionIcon
                                            variant="subtle"
                                            size="sm"
                                            color="red"
                                            disabled={editingEVSEId !== null || editingConnectorId !== null}
                                          >
                                            <IconTrash size={14} />
                                          </ActionIcon>
                                        </Group>
                                      )}
                                    </Table.Td>
                                  </Table.Tr>
                                );
                              })}
                              
                              {/* 新增充電槍表單行 */}
                              {editingConnectorId && !evse.connectors.find(c => c.id === editingConnectorId) && tempConnector.evseId === evse.id && (
                                <Table.Tr style={{ backgroundColor: '#f0f8ff' }}>
                                  <Table.Td>
                                    <TextInput
                                      size="xs"
                                      placeholder="A1, B2..."
                                      value={tempConnector.connectorNumber || ''}
                                      onChange={(e) => {
                                        const value = e.currentTarget.value;
                                        setTempConnector(prev => ({ ...prev, connectorNumber: value }));
                                      }}
                                    />
                                  </Table.Td>
                                  <Table.Td>
                                    <Select
                                      size="xs"
                                      data={connectorStatusOptions}
                                      value={tempConnector.status || 'Unknown'}
                                      onChange={(value) => setTempConnector(prev => ({ ...prev, status: value || 'Unknown' }))}
                                    />
                                  </Table.Td>
                                  <Table.Td>
                                    <Select
                                      size="xs"
                                      data={connectorTypeOptions}
                                      value={tempConnector.connectorType || 'Type 2'}
                                      onChange={(value) => setTempConnector(prev => ({ ...prev, connectorType: value || 'Type 2' }))}
                                    />
                                  </Table.Td>
                                  <Table.Td>
                                    <TextInput
                                      size="xs"
                                      type="number"
                                      value={tempConnector.powerKw?.toString() || '22'}
                                      onChange={(e) => {
                                        const value = parseFloat(e.currentTarget.value) || 0;
                                        setTempConnector(prev => ({ ...prev, powerKw: value }));
                                      }}
                                    />
                                  </Table.Td>
                                  <Table.Td>
                                    <Select
                                      size="xs"
                                      data={powerOutputOptions}
                                      value={tempConnector.powerOutput || 'AC'}
                                      onChange={(value) => setTempConnector(prev => ({ ...prev, powerOutput: value || 'AC' }))}
                                    />
                                  </Table.Td>
                                  <Table.Td>
                                    <Select
                                      size="xs"
                                      data={[
                                        { value: 'yes', label: '是' },
                                        { value: 'no', label: '否' }
                                      ]}
                                      value={tempConnector.supportsEVCCID ? 'yes' : 'no'}
                                      onChange={(value) => setTempConnector(prev => ({ ...prev, supportsEVCCID: value === 'yes' }))}
                                    />
                                  </Table.Td>
                                  <Table.Td>
                                    <Group gap="xs">
                                      <Button
                                        size="xs"
                                        variant="outline"
                                        onClick={handleCancelConnector}
                                      >
                                        取消
                                      </Button>
                                      <Button
                                        size="xs"
                                        onClick={() => handleSaveConnector(evse.id)}
                                        disabled={!tempConnector.connectorNumber}
                                      >
                                        儲存
                                      </Button>
                                    </Group>
                                  </Table.Td>
                                </Table.Tr>
                              )}
                            </Table.Tbody>
                          </Table>
                        )}
                      </Box>
                    </Collapse>
                  </Box>
                ))}
                
                {/* 新增充電樁表單 */}
                {editingEVSEId && !currentService.evses.find(e => e.id === editingEVSEId) && (
                  <Card withBorder bg="#f0f8ff" style={{ 
                    border: '2px dashed #228be6',
                    borderRadius: '8px',
                    marginTop: '16px'
                  }}>
                    <Stack gap="md">
                      <Group gap="sm">
                        <IconGasStation size={18} color="#228be6" />
                        <Text fw={600} style={{ color: '#495057' }}>新增充電樁</Text>
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
                          onClick={handleSaveEVSE}
                          disabled={!tempEVSE.floor}
                        >
                          儲存充電樁
                        </Button>
                      </Group>
                    </Stack>
                  </Card>
                )}
              </Stack>
            )}
          </Box>
        </Stack>
      </Box>
    </Box>
  )
}