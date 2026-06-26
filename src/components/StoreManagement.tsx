import {
  Paper,
  Title,
  Group,
  Button,
  TextInput,
  Table,
  Badge,
  Pagination,
  Text,
  Box,
  Modal,
  Stack,
  Checkbox,
  Select,
} from '@mantine/core'
import {
  IconPlus,
  IconSearch,
  IconFilter,
} from '@tabler/icons-react'

import { useState } from 'react'
import { useNotification } from '../hooks/useNotification'

// Mock data for stores
const mockStores = [
  {
    id: 1,
    storeName: '世潮咖啡廳',
    vendorName: '世潮企業股份有限公司',
    vendorId: 1,
    placeName: '台北101停車場',
    placeId: 1,
    status: '啟用',
    description: '位於台北101地下室的精品咖啡廳',
    createdAt: '2024-01-15',
  },
  {
    id: 2,
    storeName: '經國便利商店',
    vendorName: '經國能源股份有限公司平鎮分公司',
    vendorId: 2,
    placeName: '中正紀念堂停車場',
    placeId: 2,
    status: '啟用',
    description: '24小時營業的便利商店',
    createdAt: '2024-01-20',
  },
  {
    id: 3,
    storeName: '連展充電服務中心',
    vendorName: '連展電能科技股份有限公司',
    vendorId: 3,
    placeName: '台北車站充電站',
    placeId: 3,
    status: '停用',
    description: '專業電動車充電諮詢服務',
    createdAt: '2024-02-01',
  },
  {
    id: 4,
    storeName: '車容坊汽車美容',
    vendorName: '車容坊股份有限公司鳳壹營業所',
    vendorId: 4,
    placeName: '西門町停車場',
    placeId: 4,
    status: '啟用',
    description: '專業汽車美容保養服務',
    createdAt: '2024-02-10',
  },
  {
    id: 5,
    storeName: '坤業機車維修',
    vendorName: '坤業加油站有限公司莒光路營業所',
    vendorId: 5,
    placeName: '士林夜市停車場',
    placeId: 5,
    status: '啟用',
    description: '機車維修及保養專門店',
    createdAt: '2024-02-15',
  },
  {
    id: 6,
    storeName: '世潮餐廳',
    vendorName: '世潮企業股份有限公司',
    vendorId: 1,
    placeName: '台北101停車場',
    placeId: 1,
    status: '啟用',
    description: '台式料理餐廳',
    createdAt: '2024-02-20',
  },
]

// Mock vendor data for dropdown
const mockVendors = [
  { value: '1', label: '世潮企業股份有限公司' },
  { value: '2', label: '經國能源股份有限公司平鎮分公司' },
  { value: '3', label: '連展電能科技股份有限公司' },
  { value: '4', label: '車容坊股份有限公司鳳壹營業所' },
  { value: '5', label: '坤業加油站有限公司莒光路營業所' },
]

// Mock place data for dropdown  
const mockPlaces = [
  { value: '1', label: '台北101停車場' },
  { value: '2', label: '中正紀念堂停車場' },
  { value: '3', label: '台北車站充電站' },
  { value: '4', label: '西門町停車場' },
  { value: '5', label: '士林夜市停車場' },
]

const statusOptions = ['啟用', '停用']

interface StoreManagementProps {
  onViewVendor?: (vendorId: number) => void;
  onViewPlace?: (placeId: number) => void;
  onViewStore?: (storeId: number) => void;
}

export function StoreManagement({ onViewStore }: StoreManagementProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVendor, setFilterVendor] = useState<string | null>(null);
  const [filterPlace, setFilterPlace] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [selectedStores, setSelectedStores] = useState<number[]>([]);
  
  // Add store modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [newVendorId, setNewVendorId] = useState<string | null>(null);
  const [newPlaceId, setNewPlaceId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<string | null>('啟用');
  
  const { showSuccess } = useNotification();

  const filteredStores = mockStores.filter(store => {
    const matchesSearch = store.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         store.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         store.placeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVendor = !filterVendor || store.vendorId.toString() === filterVendor;
    const matchesPlace = !filterPlace || store.placeId.toString() === filterPlace;
    const matchesStatus = !filterStatus || store.status === filterStatus;
    
    return matchesSearch && matchesVendor && matchesPlace && matchesStatus;
  });

  const handleStoreSelect = (storeId: number, checked: boolean) => {
    if (checked) {
      setSelectedStores(prev => [...prev, storeId]);
    } else {
      setSelectedStores(prev => prev.filter(id => id !== storeId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStores(filteredStores.map(s => s.id));
    } else {
      setSelectedStores([]);
    }
  };

  const handleAddStore = () => {
    if (newStoreName.trim() && newVendorId && newPlaceId && newStatus) {
      console.log('新增商店:', {
        storeName: newStoreName,
        vendorId: newVendorId,
        placeId: newPlaceId,
        status: newStatus
      });
      
      showSuccess(`已新增商店「${newStoreName}」`, '新增商店成功');
      
      setNewStoreName('');
      setNewVendorId(null);
      setNewPlaceId(null);
      setNewStatus('啟用');
      setIsAddModalOpen(false);
    }
  };

  const handleCancelAdd = () => {
    setNewStoreName('');
    setNewVendorId(null);
    setNewPlaceId(null);
    setNewStatus('啟用');
    setIsAddModalOpen(false);
  };


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
          商店管理
        </Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => setIsAddModalOpen(true)}
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
          新增商店
        </Button>
      </Group>

      {/* Search and Filters */}
      <Box px="20px" pb="24px" style={{ flexShrink: 0 }}>
        <Group gap="16px" align="end">
          {/* Search */}
          <TextInput
            placeholder="請輸入商店名稱、業者或圖資位置"
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

          {/* Vendor Filter */}
          <Select
            placeholder="業者"
            data={mockVendors}
            value={filterVendor}
            onChange={setFilterVendor}
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

          {/* Place Filter */}
          <Select
            placeholder="圖資位置"
            data={mockPlaces}
            value={filterPlace}
            onChange={setFilterPlace}
            clearable
            leftSection={<IconFilter size={16} />}
            style={{ width: '180px' }}
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

          {/* Status Filter */}
          <Select
            placeholder="交易啟用狀態"
            data={statusOptions}
            value={filterStatus}
            onChange={setFilterStatus}
            clearable
            leftSection={<IconFilter size={16} />}
            style={{ width: '150px' }}
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

      {/* Table Container */}
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
              minHeight: '50px',
              borderBottom: '1px solid #dee2e6',
              verticalAlign: 'middle',
              overflow: 'visible',
            },
            tr: {
              backgroundColor: '#ffffff',
              '&:hover': {
                backgroundColor: '#ffffff',
              },
            },
          }}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: '50px' }}>
                <Checkbox
                  checked={selectedStores.length === filteredStores.length && filteredStores.length > 0}
                  indeterminate={selectedStores.length > 0 && selectedStores.length < filteredStores.length}
                  onChange={(event) => handleSelectAll(event.currentTarget.checked)}
                  size="sm"
                />
              </Table.Th>
              <Table.Th style={{ width: '25%' }}>商店名稱</Table.Th>
              <Table.Th style={{ width: '35%' }}>所屬業者</Table.Th>
              <Table.Th style={{ width: '25%' }}>圖資位置</Table.Th>
              <Table.Th style={{ width: '15%' }}>交易啟用狀態</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredStores.map((store) => (
              <Table.Tr key={store.id}>
                <Table.Td>
                  <Checkbox
                    checked={selectedStores.includes(store.id)}
                    onChange={(event) => handleStoreSelect(store.id, event.currentTarget.checked)}
                    size="sm"
                  />
                </Table.Td>
                <Table.Td>
                  <Text 
                    onClick={() => onViewStore?.(store.id)}
                    style={{
                      color: '#228be6',
                      fontSize: '14px',
                      lineHeight: '20px',
                      fontFamily: 'Noto Sans TC, sans-serif',
                      fontWeight: 400,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    {store.storeName}
                  </Text>
                </Table.Td>
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
                    {store.vendorName}
                  </Text>
                </Table.Td>
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
                    {store.placeName}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge
                    variant="light"
                    styles={{
                      root: {
                        backgroundColor: `rgba(${
                          store.status === '啟用' ? '18,184,134' : '250,82,82'
                        },0.1)`,
                        color: '#212529',
                        fontSize: '12px',
                        lineHeight: '16px',
                        fontWeight: 400,
                        padding: '4px 8px',
                        borderRadius: '16px',
                        border: 'none',
                        fontFamily: 'Noto Sans TC, sans-serif',
                      },
                    }}
                  >
                    {store.status}
                  </Badge>
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
        style={{ 
          borderTop: 'none',
          flexShrink: 0,
        }}
      >
        <Text 
          style={{
            color: '#868e96',
            fontSize: '14px',
            lineHeight: '20px',
            fontFamily: 'Noto Sans TC, sans-serif',
          }}
        >
          顯示 1 - {filteredStores.length} 筆商店，共 {mockStores.length} 筆
        </Text>
        <Pagination 
          total={Math.ceil(filteredStores.length / 10)} 
          value={currentPage}
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
            },
          }}
        />
      </Group>

      {/* Add Store Modal */}
      <Modal
        opened={isAddModalOpen}
        onClose={handleCancelAdd}
        title=""
        centered
        size={480}
        padding="16px"
        styles={{
          content: {
            background: '#ffffff',
            boxShadow: '0px 7px 7px -5px rgba(0,0,0,0.04), 0px 10px 15px -5px rgba(0,0,0,0.1), 0px 1px 3px 0px rgba(0,0,0,0.05)',
            borderRadius: '4px',
            width: '480px',
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
          {/* Header */}
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
              新增商店
            </Title>
          </Box>

          {/* Form */}
          <Stack gap="16px">
            {/* Store Name */}
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
                  商店名稱{' '}
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
                placeholder="請輸入商店名稱"
                value={newStoreName}
                onChange={(event) => setNewStoreName(event.currentTarget.value)}
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

            {/* Vendor */}
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
                  所屬業者{' '}
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
              <Select
                placeholder="請選擇業者"
                data={mockVendors}
                value={newVendorId}
                onChange={setNewVendorId}
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

            {/* Place */}
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
                  圖資位置{' '}
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
              <Select
                placeholder="請選擇圖資位置"
                data={mockPlaces}
                value={newPlaceId}
                onChange={setNewPlaceId}
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

            {/* Status */}
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
                交易啟用狀態
              </Text>
              <Select
                placeholder="請選擇交易啟用狀態"
                data={statusOptions}
                value={newStatus}
                onChange={setNewStatus}
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

          </Stack>

          {/* Action buttons */}
          <Group justify="flex-end" gap="16px">
            <Button
              variant="outline"
              onClick={handleCancelAdd}
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
              取消
            </Button>
            <Button
              onClick={handleAddStore}
              disabled={!newStoreName.trim() || !newVendorId || !newPlaceId || !newStatus}
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
              新增
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Paper>
  )
}