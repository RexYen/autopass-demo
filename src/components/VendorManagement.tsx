import {
  Paper,
  Title,
  Group,
  Button,
  TextInput,
  Table,
  Badge,
  ActionIcon,
  Pagination,
  Text,
  Box,
} from '@mantine/core'
import {
  IconPlus,
  IconSearch,
  IconSettings,
  IconTrash,
} from '@tabler/icons-react'
import { useState } from 'react'

// Mock data for vendors - matches Figma design
const mockVendors = [
  {
    id: 1,
    name: '世潮企業股份有限公司',
    contractTypes: ['停車場', '加油站', '連鎖店'],
  },
  {
    id: 2,
    name: '經國能源股份有限公司平鎮分公司',
    contractTypes: ['停車場', '加油站'],
  },
  {
    id: 3,
    name: '經國能源股份有限公司桃園分公司',
    contractTypes: ['停車場', '連鎖店'],
  },
  {
    id: 4,
    name: '經國聯合開發股份有限公司北海分公司',
    contractTypes: ['停車場'],
  },
  {
    id: 5,
    name: '連展電能科技股份有限公司',
    contractTypes: ['加油站'],
  },
  {
    id: 6,
    name: '車容坊股份有限公司鳳壹營業所',
    contractTypes: ['連鎖店'],
  },
  {
    id: 7,
    name: '坤業加油站有限公司莒光路營業所',
    contractTypes: ['連鎖店'],
  },
  {
    id: 8,
    name: '坤業加油站有限公司深坑營業所',
    contractTypes: ['加油站'],
  },
  {
    id: 9,
    name: '坤業加油站有限公司深坑營業所',
    contractTypes: ['連鎖店'],
  },
  {
    id: 10,
    name: '坤業加油站有限公司深坑營業所',
    contractTypes: ['停車場'],
  },
]


export function VendorManagement() {
  const [currentPage, setCurrentPage] = useState(1);

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
              <Table.Th style={{ width: '60%' }}>
                業者名稱
              </Table.Th>
              <Table.Th style={{ width: '25%' }}>
                合約類型
              </Table.Th>
              <Table.Th style={{ width: '15%', textAlign: 'center' }}>
                操作
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {mockVendors.map((vendor) => (
              <Table.Tr key={vendor.id}>
                <Table.Td style={{ minWidth: '300px', width: 'auto', maxWidth: 'none' }}>
                  <Text 
                    style={{
                      color: '#000000',
                      fontSize: '14px',
                      lineHeight: '20px',
                      fontFamily: 'Noto Sans TC, sans-serif',
                      fontWeight: 400,
                      wordWrap: 'break-word',
                      whiteSpace: 'normal',
                    }}
                  >
                    {vendor.name}
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
                <Table.Td>
                  <Group justify="center" gap="15px">
                    <ActionIcon 
                      variant="transparent" 
                      color="gray"
                      size="20px"
                    >
                      <IconSettings size={20} />
                    </ActionIcon>
                    <ActionIcon 
                      variant="transparent" 
                      color="gray"
                      size="20px"
                    >
                      <IconTrash size={20} />
                    </ActionIcon>
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
              
              '&[data-active]': {
                backgroundColor: '#228be6',
                color: '#ffffff',
                borderColor: '#228be6',
              },
              
              '&[data-active]:hover': {
                backgroundColor: '#228be6',
                color: '#ffffff',
              },
            },
          }}
        />
      </Group>
    </Paper>
  )
}