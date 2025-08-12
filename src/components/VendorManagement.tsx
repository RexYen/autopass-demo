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
  Modal,
  Stack,
} from '@mantine/core'
import {
  IconPlus,
  IconSearch,
} from '@tabler/icons-react'

// Custom Eye Icon based on Figma design
const ViewIcon = () => (
  <svg width="21" height="20" viewBox="0 0 21 20" fill="none">
    <path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="M3.13326 9.99999C5.21486 13.4421 7.67736 15 10.5 15C13.3227 15 15.7852 13.4421 17.8668 9.99999C15.7852 6.55789 13.3227 4.99999 10.5 4.99999C7.67736 4.99999 5.21486 6.55789 3.13326 9.99999ZM1.44318 9.58653C3.75604 5.53924 6.7667 3.33333 10.5 3.33333C14.2334 3.33333 17.244 5.53924 19.5569 9.58653C19.7033 9.84273 19.7033 10.1573 19.5569 10.4135C17.244 14.4607 14.2334 16.6667 10.5 16.6667C6.7667 16.6667 3.75604 14.4607 1.44318 10.4135C1.29677 10.1573 1.29677 9.84273 1.44318 9.58653ZM10.5 9.16666C10.0398 9.16666 9.66671 9.53976 9.66671 9.99999C9.66671 10.4602 10.0398 10.8333 10.5 10.8333C10.9603 10.8333 11.3334 10.4602 11.3334 9.99999C11.3334 9.53976 10.9603 9.16666 10.5 9.16666ZM8.00004 9.99999C8.00004 8.61928 9.11933 7.49999 10.5 7.49999C11.8808 7.49999 13 8.61928 13 9.99999C13 11.3807 11.8808 12.5 10.5 12.5C9.11933 12.5 8.00004 11.3807 8.00004 9.99999Z" 
      fill="#212529"
    />
  </svg>
)

// Custom Delete Icon based on Figma design
const DeleteIcon = () => (
  <svg width="21" height="20" viewBox="0 0 21 20" fill="none">
    <path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="M7.65482 2.15483C7.96738 1.84227 8.39131 1.66667 8.83333 1.66667H12.1667C12.6087 1.66667 13.0326 1.84227 13.3452 2.15483C13.6577 2.46739 13.8333 2.89131 13.8333 3.33334V5.00001H16.3236C16.3295 4.99994 16.3353 4.99994 16.3412 5.00001H17.1667C17.6269 5.00001 18 5.3731 18 5.83334C18 6.29358 17.6269 6.66667 17.1667 6.66667H17.1001L16.333 15.8715C16.3231 16.5207 16.0609 17.1413 15.6011 17.6011C15.1323 18.0699 14.4964 18.3333 13.8333 18.3333H7.16667C6.50362 18.3333 5.86774 18.0699 5.3989 17.6011C4.93906 17.1413 4.67685 16.5207 4.66696 15.8715L3.89989 6.66667H3.83333C3.3731 6.66667 3 6.29358 3 5.83334C3 5.3731 3.3731 5.00001 3.83333 5.00001H4.65878C4.66467 4.99994 4.67055 4.99994 4.67641 5.00001H7.16667V3.33334C7.16667 2.89131 7.34226 2.46739 7.65482 2.15483ZM5.57233 6.66667L6.33045 15.7641C6.33237 15.7872 6.33333 15.8102 6.33333 15.8333C6.33333 16.0544 6.42113 16.2663 6.57741 16.4226C6.73369 16.5789 6.94565 16.6667 7.16667 16.6667H13.8333C14.0543 16.6667 14.2663 16.5789 14.4226 16.4226C14.5789 16.2663 14.6667 16.0544 14.6667 15.8333C14.6667 15.8102 14.6676 15.7872 14.6695 15.7641L15.4277 6.66667H5.57233ZM12.1667 5.00001H8.83333V3.33334H12.1667V5.00001ZM8.83333 8.33334C9.29357 8.33334 9.66667 8.70643 9.66667 9.16667V14.1667C9.66667 14.6269 9.29357 15 8.83333 15C8.3731 15 8 14.6269 8 14.1667V9.16667C8 8.70643 8.3731 8.33334 8.83333 8.33334ZM12.1667 8.33334C12.6269 8.33334 13 8.70643 13 9.16667V14.1667C13 14.6269 12.6269 15 12.1667 15C11.7064 15 11.3333 14.6269 11.3333 14.1667V9.16667C11.3333 8.70643 11.7064 8.33334 12.1667 8.33334Z" 
      fill="#FA5252"
    />
  </svg>
)
import { useState } from 'react'
import { useNotification } from '../hooks/useNotification'

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


interface VendorManagementProps {
  onViewVendor?: (vendorName: string, isNew?: boolean) => void;
}

export function VendorManagement({ onViewVendor }: VendorManagementProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newVendorName, setNewVendorName] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<{ id: number; name: string } | null>(null);
  
  const { showSuccess } = useNotification();

  const handleAddVendor = () => {
    if (newVendorName.trim()) {
      // 這裡之後會連接到後端 API
      console.log('新增業者:', newVendorName);
      
      // 顯示新增成功通知
      showSuccess(`已新增業者「${newVendorName}」`, '新增業者成功');
      
      // 導航到空的業者詳情頁
      if (onViewVendor) {
        onViewVendor(newVendorName, true);
      }
      setNewVendorName('');
      setIsAddModalOpen(false);
    }
  };

  const handleCancelAdd = () => {
    setNewVendorName('');
    setIsAddModalOpen(false);
  };

  const handleDeleteClick = (vendor: { id: number; name: string }) => {
    setVendorToDelete(vendor);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (vendorToDelete) {
      // 這裡之後會連接到後端 API
      console.log('刪除業者:', vendorToDelete);
      
      // 顯示刪除成功通知
      showSuccess(`已刪除業者「${vendorToDelete.name}」`, '刪除業者成功');
      
      setVendorToDelete(null);
      setIsDeleteModalOpen(false);
    }
  };

  const handleCancelDelete = () => {
    setVendorToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleViewVendor = (vendorName: string) => {
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
                      onClick={() => handleViewVendor(vendor.name)}
                      style={{
                        width: '20px',
                        height: '20px',
                        aspectRatio: '1/1',
                        minWidth: '20px',
                        minHeight: '20px',
                        cursor: 'pointer',
                      }}
                    >
                      <ViewIcon />
                    </ActionIcon>
                    <ActionIcon 
                      variant="transparent" 
                      color="gray"
                      onClick={() => handleDeleteClick({ id: vendor.id, name: vendor.name })}
                      style={{
                        width: '20px',
                        height: '20px',
                        aspectRatio: '1/1',
                        minWidth: '20px',
                        minHeight: '20px',
                        cursor: 'pointer',
                      }}
                    >
                      <DeleteIcon />
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

      {/* 新增業者 Modal */}
      <Modal
        opened={isAddModalOpen}
        onClose={handleCancelAdd}
        title=""
        centered
        size="md"
        padding="24px"
        styles={{
          content: {
            background: 'white',
            boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.05)',
            borderRadius: '4px',
          },
          header: {
            display: 'none',
          },
          body: {
            paddingTop: '24px',
          },
        }}
      >
        <Stack gap="24px">
          {/* Modal Title */}
          <Title
            order={4}
            style={{
              color: 'black',
              fontSize: '16px',
              fontFamily: 'Noto Sans TC',
              fontWeight: 700,
              lineHeight: '20px',
              wordWrap: 'break-word',
            }}
          >
            新增業者
          </Title>

          {/* Form */}
          <Stack gap="16px">
            <Box>
              {/* Label with required asterisk */}
              <Group gap="0" mb="4px">
                <Text
                  style={{
                    color: 'black',
                    fontSize: '14px',
                    fontFamily: 'Noto Sans TC',
                    fontWeight: 400,
                    lineHeight: '20px',
                    wordWrap: 'break-word',
                  }}
                >
                  業者名稱{' '}
                </Text>
                <Text
                  style={{
                    color: '#FA5252',
                    fontSize: '12px',
                    fontFamily: 'Noto Sans TC',
                    fontWeight: 500,
                    lineHeight: '16px',
                    wordWrap: 'break-word',
                  }}
                >
                  *
                </Text>
              </Group>

              {/* Input */}
              <TextInput
                placeholder="請輸入業者名稱"
                value={newVendorName}
                onChange={(event) => setNewVendorName(event.currentTarget.value)}
                styles={{
                  input: {
                    paddingLeft: '12px',
                    paddingRight: '12px',
                    paddingTop: '6px',
                    paddingBottom: '6px',
                    background: 'white',
                    borderRadius: '4px',
                    border: '1px solid #DEE2E6',
                    fontSize: '14px',
                    fontFamily: 'Noto Sans TC',
                    fontWeight: 400,
                    lineHeight: '20px',
                    '&::placeholder': {
                      color: '#ADB5BD',
                    },
                  },
                }}
              />
            </Box>
          </Stack>

          {/* Action buttons */}
          <Group justify="flex-end" gap="16px">
            <Button
              variant="outline"
              onClick={handleCancelAdd}
              style={{
                paddingLeft: '16px',
                paddingRight: '16px',
                paddingTop: '6px',
                paddingBottom: '6px',
                background: 'white',
                borderRadius: '4px',
                border: '1px solid #DEE2E6',
                color: '#212529',
                fontSize: '14px',
                fontFamily: 'Noto Sans TC',
                fontWeight: 400,
                lineHeight: '20px',
              }}
            >
              取消
            </Button>
            <Button
              onClick={handleAddVendor}
              style={{
                paddingLeft: '16px',
                paddingRight: '16px',
                paddingTop: '6px',
                paddingBottom: '6px',
                background: '#228BE6',
                borderRadius: '4px',
                color: 'white',
                fontSize: '14px',
                fontFamily: 'Noto Sans TC',
                fontWeight: 400,
                lineHeight: '20px',
              }}
            >
              新增
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* 刪除業者確認 Modal */}
      <Modal
        opened={isDeleteModalOpen}
        onClose={handleCancelDelete}
        title=""
        centered
        size="sm"
        padding="24px"
        styles={{
          content: {
            background: 'white',
            boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.05)',
            borderRadius: '4px',
            width: '440px',
          },
          header: {
            display: 'none',
          },
          body: {
            paddingTop: '24px',
          },
        }}
      >
        <Stack gap="24px">
          {/* Modal Title */}
          <Title
            order={4}
            style={{
              color: 'black',
              fontSize: '16px',
              fontFamily: 'Noto Sans TC',
              fontWeight: 700,
              lineHeight: '20px',
              wordWrap: 'break-word',
            }}
          >
            刪除業者
          </Title>

          {/* Confirmation Message */}
          <Text
            style={{
              color: 'black',
              fontSize: '14px',
              fontFamily: 'Noto Sans TC',
              fontWeight: 400,
              lineHeight: '20px',
              wordWrap: 'break-word',
            }}
          >
            是否確認刪除該業者？
          </Text>

          {/* Action buttons */}
          <Group justify="flex-end" gap="16px">
            <Button
              variant="outline"
              onClick={handleCancelDelete}
              style={{
                paddingLeft: '16px',
                paddingRight: '16px',
                paddingTop: '6px',
                paddingBottom: '6px',
                background: 'white',
                borderRadius: '4px',
                border: '1px solid #DEE2E6',
                color: '#212529',
                fontSize: '14px',
                fontFamily: 'Noto Sans TC',
                fontWeight: 400,
                lineHeight: '20px',
              }}
            >
              取消
            </Button>
            <Button
              onClick={handleConfirmDelete}
              style={{
                paddingLeft: '16px',
                paddingRight: '16px',
                paddingTop: '6px',
                paddingBottom: '6px',
                background: '#228BE6',
                borderRadius: '4px',
                color: 'white',
                fontSize: '14px',
                fontFamily: 'Noto Sans TC',
                fontWeight: 400,
                lineHeight: '20px',
              }}
            >
              確認
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Paper>
  )
}