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
} from '@mantine/core'
import {
  IconPlus,
  IconSearch,
} from '@tabler/icons-react'

import { useState } from 'react'
import { useNotification } from '../hooks/useNotification'

// Mock data for vendors - matches Figma design
const mockVendors = [
  {
    id: 1,
    name: '世潮企業股份有限公司',
    displayName: '世潮',
    contractTypes: ['停車場', '加油站', '連鎖店'],
  },
  {
    id: 2,
    name: '經國能源股份有限公司平鎮分公司',
    displayName: '-',
    contractTypes: ['停車場', '加油站'],
  },
  {
    id: 3,
    name: '經國能源股份有限公司桃園分公司',
    displayName: '-',
    contractTypes: ['停車場', '連鎖店'],
  },
  {
    id: 4,
    name: '經國聯合開發股份有限公司北海分公司',
    displayName: '-',
    contractTypes: ['停車場'],
  },
  {
    id: 5,
    name: '連展電能科技股份有限公司',
    displayName: '-',
    contractTypes: ['加油站'],
  },
  {
    id: 6,
    name: '車容坊股份有限公司鳳壹營業所',
    displayName: '-',
    contractTypes: ['連鎖店'],
  },
  {
    id: 7,
    name: '坤業加油站有限公司莒光路營業所',
    displayName: '-',
    contractTypes: ['連鎖店'],
  },
  {
    id: 8,
    name: '坤業加油站有限公司深坑營業所',
    displayName: '-',
    contractTypes: ['加油站'],
  },
  {
    id: 9,
    name: '坤業加油站有限公司深坑營業所',
    displayName: '-',
    contractTypes: ['連鎖店'],
  },
  {
    id: 10,
    name: '坤業加油站有限公司深坑營業所',
    displayName: '-',
    contractTypes: ['停車場'],
  },
]


interface VendorManagementProps {
  onViewVendor?: (vendorName: string, isNew?: boolean) => void;
}

export function VendorManagement({ onViewVendor }: VendorManagementProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newVendorName, setNewVendorName] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [selectedStationTypes, setSelectedStationTypes] = useState<string[]>([]);
  
  const { showSuccess } = useNotification();

  const handleAddVendor = () => {
    if (newVendorName.trim() && selectedStationTypes.length > 0) {
      // 這裡之後會連接到後端 API
      console.log('新增業者:', {
        name: newVendorName,
        displayName: newDisplayName || '-',
        contractTypes: selectedStationTypes
      });
      
      // 顯示新增成功通知
      showSuccess(`已新增業者「${newVendorName}」`, '新增業者成功');
      
      // 導航到空的業者詳情頁
      if (onViewVendor) {
        onViewVendor(newVendorName, true);
      }
      setNewVendorName('');
      setNewDisplayName('');
      setSelectedStationTypes([]);
      setIsAddModalOpen(false);
    }
  };

  const handleCancelAdd = () => {
    setNewVendorName('');
    setNewDisplayName('');
    setSelectedStationTypes([]);
    setIsAddModalOpen(false);
  };

  const handleStationTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setSelectedStationTypes(prev => [...prev, type]);
    } else {
      setSelectedStationTypes(prev => prev.filter(t => t !== type));
    }
  };

  const handleVendorNameClick = (vendorName: string) => {
    if (onViewVendor) {
      onViewVendor(vendorName);
    }
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
        maxWidth: '100%', // 使用全寬度
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
          業者管理
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
          新增業者
        </Button>
      </Group>

      {/* Search */}
      <Box px="20px" pb="24px" style={{ flexShrink: 0 }}>
        <TextInput
          placeholder="請輸入業者名稱"
          leftSection={<IconSearch size={16} />}
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

      {/* Table Container */}
      <Box 
        style={{ 
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0, // 允許收縮
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
              <Table.Th style={{ width: '40%' }}>
                業者名稱
              </Table.Th>
              <Table.Th style={{ width: '40%' }}>
                前台顯示名稱
              </Table.Th>
              <Table.Th style={{ width: '20%' }}>
                合約類型
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {mockVendors.map((vendor) => (
              <Table.Tr key={vendor.id}>
                <Table.Td style={{ minWidth: '300px', width: 'auto', maxWidth: 'none' }}>
                  <Text 
                    onClick={() => handleVendorNameClick(vendor.name)}
                    style={{
                      color: '#228be6',
                      fontSize: '14px',
                      lineHeight: '20px',
                      fontFamily: 'Noto Sans TC, sans-serif',
                      fontWeight: 400,
                      wordWrap: 'break-word',
                      whiteSpace: 'normal',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    {vendor.name}
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
                    {vendor.displayName}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Group gap="4px" wrap="wrap">
                    {vendor.contractTypes.map((type) => (
                      <Badge
                        key={type}
                        variant="light"
                        styles={{
                          root: {
                            backgroundColor: `rgba(${
                              type === '停車場' ? '76,110,245' : 
                              type === '加油站' ? '250,82,82' : 
                              '18,184,134'
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
                        {type}
                      </Badge>
                    ))}
                  </Group>
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
          顯示 1 - 10 筆業者資料，共 100 筆
        </Text>
        <Pagination 
          total={10} 
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

      {/* 新增業者 Modal */}
      <Modal
        opened={isAddModalOpen}
        onClose={handleCancelAdd}
        title=""
        centered
        size={440}
        padding="16px"
        styles={{
          content: {
            background: '#ffffff',
            boxShadow: '0px 7px 7px -5px rgba(0,0,0,0.04), 0px 10px 15px -5px rgba(0,0,0,0.1), 0px 1px 3px 0px rgba(0,0,0,0.05)',
            borderRadius: '4px',
            width: '440px',
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
              新增業者
            </Title>
          </Box>

          {/* Form Block */}
          <Stack gap="16px">
            {/* 業者名稱 */}
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
                value={newVendorName}
                onChange={(event) => setNewVendorName(event.currentTarget.value)}
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

            {/* 前台顯示名稱 */}
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
                前台顯示名稱
              </Text>
              <TextInput
                placeholder="請輸入前台顯示名稱"
                value={newDisplayName}
                onChange={(event) => setNewDisplayName(event.currentTarget.value)}
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

            {/* 場站類型 */}
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
                  場站類型
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
              <Group gap="24px">
                <Checkbox
                  label="停車場"
                  checked={selectedStationTypes.includes('停車場')}
                  onChange={(event) => handleStationTypeChange('停車場', event.currentTarget.checked)}
                  size="md"
                  styles={{
                    label: {
                      color: '#000000',
                      fontSize: '14px',
                      fontFamily: 'Noto Sans TC',
                      fontWeight: 400,
                      lineHeight: '20px',
                      paddingLeft: '8px',
                      cursor: 'pointer',
                    },
                  }}
                />
                <Checkbox
                  label="加油站"
                  checked={selectedStationTypes.includes('加油站')}
                  onChange={(event) => handleStationTypeChange('加油站', event.currentTarget.checked)}
                  size="md"
                  styles={{
                    label: {
                      color: '#000000',
                      fontSize: '14px',
                      fontFamily: 'Noto Sans TC',
                      fontWeight: 400,
                      lineHeight: '20px',
                      paddingLeft: '8px',
                      cursor: 'pointer',
                    },
                  }}
                />
                <Checkbox
                  label="連鎖店"
                  checked={selectedStationTypes.includes('連鎖店')}
                  onChange={(event) => handleStationTypeChange('連鎖店', event.currentTarget.checked)}
                  size="md"
                  styles={{
                    label: {
                      color: '#000000',
                      fontSize: '14px',
                      fontFamily: 'Noto Sans TC',
                      fontWeight: 400,
                      lineHeight: '20px',
                      paddingLeft: '8px',
                      cursor: 'pointer',
                    },
                  }}
                />
              </Group>
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
              onClick={handleAddVendor}
              disabled={!newVendorName.trim() || selectedStationTypes.length === 0}
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