import {
  Paper,
  Title,
  Group,
  Button,
  Table,
  Badge,
  ActionIcon,
  Text,
  Box,
  Tabs,
  Modal,
  TextInput,
  Stack,
  Select,
  Menu,
  Checkbox,
} from '@mantine/core'
import {
  IconChevronLeft,
  IconPlus,
} from '@tabler/icons-react'
import { useState } from 'react'
import { useNotification } from '../hooks/useNotification'

// Custom icons from VendorManagement
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

const EditIcon = () => (
  <svg width="21" height="20" viewBox="0 0 21 20" fill="none">
    <path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="M14.4239 2.42271C14.9083 1.93863 15.5651 1.66669 16.25 1.66669C16.9352 1.66669 17.5923 1.93887 18.0768 2.42335C18.5612 2.90784 18.8334 3.56494 18.8334 4.25011C18.8334 4.93508 18.5614 5.59201 18.0772 6.07646C18.077 6.07659 18.0773 6.07632 18.0772 6.07646L17.0237 7.13368C16.9945 7.17679 16.9608 7.21776 16.9226 7.25594C16.8851 7.2934 16.845 7.32654 16.8028 7.35537L11.0903 13.0883C10.9339 13.2452 10.7215 13.3334 10.5 13.3334H8C7.53976 13.3334 7.16667 12.9603 7.16667 12.5001V10.0001C7.16667 9.77858 7.25487 9.56617 7.4118 9.4098L13.1443 3.69777C13.1732 3.65537 13.2065 3.61505 13.2441 3.57743C13.2824 3.53908 13.3236 3.50525 13.3669 3.47593L14.4232 2.42335C14.4235 2.42314 14.4237 2.42292 14.4239 2.42271ZM13.8427 5.35461L8.83333 10.3462V11.6668H10.1539L15.1455 6.65737L13.8427 5.35461ZM16.3219 5.47675L15.0234 4.1782L15.6018 3.60187C15.7737 3.42994 16.0069 3.33335 16.25 3.33335C16.4931 3.33335 16.7263 3.42994 16.8982 3.60187C17.0702 3.77379 17.1668 4.00697 17.1668 4.25011C17.1668 4.49325 17.0702 4.72643 16.8982 4.89835L16.3219 5.47675ZM3.73223 5.73225C4.20107 5.26341 4.83696 5.00002 5.5 5.00002H6.33333C6.79357 5.00002 7.16667 5.37312 7.16667 5.83335C7.16667 6.29359 6.79357 6.66669 6.33333 6.66669H5.5C5.27899 6.66669 5.06702 6.75448 4.91074 6.91076C4.75446 7.06704 4.66667 7.27901 4.66667 7.50002V15C4.66667 15.221 4.75446 15.433 4.91074 15.5893C5.06702 15.7456 5.27899 15.8334 5.5 15.8334H13C13.221 15.8334 13.433 15.7456 13.5893 15.5893C13.7455 15.433 13.8333 15.221 13.8333 15V14.1667C13.8333 13.7064 14.2064 13.3334 14.6667 13.3334C15.1269 13.3334 15.5 13.7064 15.5 14.1667V15C15.5 15.6631 15.2366 16.2989 14.7678 16.7678C14.2989 17.2366 13.663 17.5 13 17.5H5.5C4.83696 17.5 4.20107 17.2366 3.73223 16.7678C3.26339 16.2989 3 15.6631 3 15V7.50002C3 6.83698 3.26339 6.20109 3.73223 5.73225Z" 
      fill="#212529"
    />
  </svg>
)

// Empty database icon
const DatabaseOffIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path 
      d="M12 2C16.97 2 22 3.79 22 6C22 8.21 16.97 10 12 10C7.03 10 2 8.21 2 6C2 3.79 7.03 2 12 2ZM2 8.5C2 10.71 7.03 12.5 12 12.5C16.97 12.5 22 10.71 22 8.5V11C22 13.21 16.97 15 12 15C7.03 15 2 13.21 2 11V8.5ZM2 13.5C2 15.71 7.03 17.5 12 17.5C16.97 17.5 22 15.71 22 13.5V16C22 18.21 16.97 20 12 20C7.03 20 2 18.21 2 16V13.5ZM3 3L21 21L19.59 22.41L17 19.82C15.5 19.94 13.8 20 12 20C7.03 20 2 18.21 2 16V13.5L1.59 13.09L3 3Z" 
      fill="#868E96"
    />
  </svg>
)

// EmptyState component
interface EmptyStateProps {
  message: string;
}

function EmptyState({ message }: EmptyStateProps) {
  return (
    <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '140px', gap: '16px' }}>
      <Box style={{ 
        width: '40px', 
        height: '40px', 
        backgroundColor: '#e9ecef', 
        borderRadius: '20px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <DatabaseOffIcon />
      </Box>
      <Text style={{ 
        color: '#868e96', 
        fontSize: '14px', 
        fontFamily: 'Noto Sans TC', 
        fontWeight: 400, 
        lineHeight: '20px', 
        textAlign: 'center' 
      }}>
        {message}
      </Text>
    </Box>
  );
}

interface VendorDetailProps {
  vendorName: string;
  onBack: () => void;
  isNewVendor?: boolean; // 是否為新增業者（顯示空狀態）
}

// 人員（會計人員／廠商後台管理員）資料形狀
interface Contact {
  name: string;
  role: string;          // e.g. '管理員' | '檢視者' | '會計人員'
  isAccountant: string;  // '是' | '否'
  phone: string;
  email: string;
}

// 編輯／刪除時被選中的人員，附帶其在列表中的索引
type SelectedContact = Contact & { index: number };

// 匯款資訊（銀行帳戶）資料形狀
interface BankAccount {
  type: string;        // '預設' | '指定場站'
  bankCode: string;
  bankBranch: string;  // '銀行/分行' 組合字串
  account: string;
  accountName: string;
  feeMode: string;     // '內扣' | '不內扣'
  highlight: boolean;
}

// 編輯／刪除時被選中的匯款資訊，附帶其在列表中的索引
type SelectedBank = BankAccount & { index: number };

export function VendorDetail({ vendorName, onBack, isNewVendor = false }: VendorDetailProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedVendorName, setEditedVendorName] = useState(vendorName);
  const [currentVendorName, setCurrentVendorName] = useState(vendorName);
  const [displayName, setDisplayName] = useState('世潮'); // 前台顯示名稱
  const [editedDisplayName, setEditedDisplayName] = useState('世潮');
  const [editedStationTypes, setEditedStationTypes] = useState<string[]>(['停車場', '連鎖店']);
  
  const handleEditName = () => {
    setEditedVendorName(currentVendorName);
    setEditedDisplayName(displayName);
    setEditedStationTypes(['停車場', '連鎖店']); // 設置當前的場站類型
    setIsEditingName(true);
  };

  const handleSaveName = () => {
    setCurrentVendorName(editedVendorName);
    setDisplayName(editedDisplayName);
    setIsEditingName(false);
  };

  const handleCancelEditName = () => {
    setEditedVendorName(currentVendorName);
    setEditedDisplayName(displayName);
    setEditedStationTypes(['停車場', '連鎖店']);
    setIsEditingName(false);
  };

  const handleEditStationTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setEditedStationTypes(prev => [...prev, type]);
    } else {
      setEditedStationTypes(prev => prev.filter(t => t !== type));
    }
  };

  return (
    <div style={{ width: '100%' }}>
        {/* Back Button */}
        <Button
          variant="subtle"
          color="gray"
          leftSection={<IconChevronLeft size={16} />}
          onClick={onBack}
          style={{
            marginBottom: '16px',
            fontSize: '14px',
            fontFamily: 'Noto Sans TC',
            fontWeight: 400,
            color: '#868E96',
          }}
        >
          返回業者管理列表
        </Button>

        {/* Vendor Name Card */}
        <Paper
          style={{
            background: '#ffffff',
            boxShadow: '0px 7px 7px -5px rgba(0,0,0,0.04), 0px 10px 15px -5px rgba(0,0,0,0.1), 0px 1px 3px 0px rgba(0,0,0,0.05)',
            borderRadius: '16px',
            marginBottom: '16px',
            padding: '24px',
          }}
        >
          <Group justify="space-between" align="center" style={{ marginBottom: '16px' }}>
            <Title
              order={1}
              style={{
                color: '#000000',
                fontSize: '24px',
                fontFamily: 'Noto Sans TC',
                fontWeight: 700,
                lineHeight: '32px',
                margin: 0,
              }}
            >
              {currentVendorName} / {displayName}
            </Title>
            <Button
              variant="light"
              leftSection={
                <svg width="16" height="16" viewBox="0 0 21 20" fill="none">
                  <path 
                    fillRule="evenodd" 
                    clipRule="evenodd" 
                    d="M14.4239 2.42271C14.9083 1.93863 15.5651 1.66669 16.25 1.66669C16.9352 1.66669 17.5923 1.93887 18.0768 2.42335C18.5612 2.90784 18.8334 3.56494 18.8334 4.25011C18.8334 4.93508 18.5614 5.59201 18.0772 6.07646C18.077 6.07659 18.0773 6.07632 18.0772 6.07646L17.0237 7.13368C16.9945 7.17679 16.9608 7.21776 16.9226 7.25594C16.8851 7.2934 16.845 7.32654 16.8028 7.35537L11.0903 13.0883C10.9339 13.2452 10.7215 13.3334 10.5 13.3334H8C7.53976 13.3334 7.16667 12.9603 7.16667 12.5001V10.0001C7.16667 9.77858 7.25487 9.56617 7.4118 9.4098L13.1443 3.69777C13.1732 3.65537 13.2065 3.61505 13.2441 3.57743C13.2824 3.53908 13.3236 3.50525 13.3669 3.47593L14.4232 2.42335C14.4235 2.42314 14.4237 2.42292 14.4239 2.42271ZM13.8427 5.35461L8.83333 10.3462V11.6668H10.1539L15.1455 6.65737L13.8427 5.35461ZM16.3219 5.47675L15.0234 4.1782L15.6018 3.60187C15.7737 3.42994 16.0069 3.33335 16.25 3.33335C16.4931 3.33335 16.7263 3.42994 16.8982 3.60187C17.0702 3.77379 17.1668 4.00697 17.1668 4.25011C17.1668 4.49325 17.0702 4.72643 16.8982 4.89835L16.3219 5.47675ZM3.73223 5.73225C4.20107 5.26341 4.83696 5.00002 5.5 5.00002H6.33333C6.79357 5.00002 7.16667 5.37312 7.16667 5.83335C7.16667 6.29359 6.79357 6.66669 6.33333 6.66669H5.5C5.27899 6.66669 5.06702 6.75448 4.91074 6.91076C4.75446 7.06704 4.66667 7.27901 4.66667 7.50002V15C4.66667 15.221 4.75446 15.433 4.91074 15.5893C5.06702 15.7456 5.27899 15.8334 5.5 15.8334H13C13.221 15.8334 13.433 15.7456 13.5893 15.5893C13.7455 15.433 13.8333 15.221 13.8333 15V14.1667C13.8333 13.7064 14.2064 13.3334 14.6667 13.3334C15.1269 13.3334 15.5 13.7064 15.5 14.1667V15C15.5 15.6631 15.2366 16.2989 14.7678 16.7678C14.2989 17.2366 13.663 17.5 13 17.5H5.5C4.83696 17.5 4.20107 17.2366 3.73223 16.7678C3.26339 16.2989 3 15.6631 3 15V7.50002C3 6.83698 3.26339 6.20109 3.73223 5.73225Z" 
                    fill="currentColor"
                  />
                </svg>
              }
              onClick={handleEditName}
              styles={{
                root: {
                  backgroundColor: 'rgba(34, 139, 230, 0.1)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 12px',
                  color: '#228BE6',
                  fontSize: '14px',
                  fontFamily: 'Noto Sans TC',
                  fontWeight: 400,
                  lineHeight: '20px',
                  '&:hover': {
                    backgroundColor: 'rgba(34, 139, 230, 0.15)',
                  },
                },
              }}
            >
              編輯
            </Button>
          </Group>
          
          {/* Vendor Tags */}
          <Group gap="4px">
            <Badge>停車場</Badge>
            <Badge>加油站</Badge>
            <Badge>連鎖店</Badge>
          </Group>
        </Paper>

        {/* Contract Management Section */}
        <Paper
          style={{
            width: '100%',
            background: 'white',
            boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.05)',
            borderRadius: '16px',
            marginBottom: '16px',
          }}
        >
          {/* Section Header */}
          <Group justify="space-between" px="25px" py="25px" style={{ paddingLeft: '40px' }}>
            <Title
              order={3}
              style={{
                color: 'black',
                fontSize: '20px',
                fontFamily: 'Noto Sans TC',
                fontWeight: 700,
                lineHeight: '24px',
              }}
            >
              合約管理
            </Title>
            <Button
              leftSection={<IconPlus size={16} />}
              style={{
                background: '#228BE6',
                color: 'white',
                fontSize: '16px',
                fontFamily: 'Noto Sans TC',
                fontWeight: 400,
                lineHeight: '24px',
                borderRadius: '4px',
                padding: '8px 20px',
              }}
            >
              新增合約
            </Button>
          </Group>

          {/* Tabs */}
          <Box px="15px">
            <Box>
              <Tabs defaultValue="active" variant="default">
                <Tabs.List
                  styles={{
                    list: {
                      borderBottom: '1px solid #dee2e6',
                    },
                  }}
                >
                  <Tabs.Tab value="active" disabled={isNewVendor}>
                    執行中合約（{isNewVendor ? '0' : '4'}）
                  </Tabs.Tab>
                  <Tabs.Tab value="expired" disabled={isNewVendor}>
                    已到期合約（{isNewVendor ? '0' : '2'}）
                  </Tabs.Tab>
                </Tabs.List>

              <Tabs.Panel value="active">
                <ContractTable isEmpty={isNewVendor} />
              </Tabs.Panel>

              <Tabs.Panel value="expired">
                <ContractTable isEmpty={isNewVendor} />
              </Tabs.Panel>
            </Tabs>
            </Box>
          </Box>
        </Paper>

        {/* Contact Info Section */}
        <ContactInfoSection isEmpty={isNewVendor} />

        {/* Bank Info Section */}
        <BankInfoSection isEmpty={isNewVendor} />

        {/* 編輯業者名稱 Modal */}
        <Modal
          opened={isEditingName}
          onClose={handleCancelEditName}
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
                編輯業者名稱
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
                  value={editedVendorName}
                  onChange={(event) => setEditedVendorName(event.currentTarget.value)}
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
                  value={editedDisplayName}
                  onChange={(event) => setEditedDisplayName(event.currentTarget.value)}
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
                    checked={editedStationTypes.includes('停車場')}
                    onChange={(event) => handleEditStationTypeChange('停車場', event.currentTarget.checked)}
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
                    checked={editedStationTypes.includes('加油站')}
                    onChange={(event) => handleEditStationTypeChange('加油站', event.currentTarget.checked)}
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
                    checked={editedStationTypes.includes('連鎖店')}
                    onChange={(event) => handleEditStationTypeChange('連鎖店', event.currentTarget.checked)}
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

            <Group justify="flex-end" gap="16px">
              <Button
                variant="outline"
                onClick={handleCancelEditName}
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
                onClick={handleSaveName}
                disabled={!editedVendorName.trim() || editedStationTypes.length === 0}
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
                確認
              </Button>
            </Group>
          </Stack>
        </Modal>
    </div>
  )
}

// Contract table component
interface ContractTableProps {
  isEmpty?: boolean;
}

function ContractTable({ isEmpty = false }: ContractTableProps) {
  if (isEmpty) {
    return (
      <Box mt="20px" pb="25px">
        <EmptyState message="目前還沒有任何合約，點擊「新增合約」開始建立！" />
      </Box>
    );
  }

  return (
    <Box mt="20px" pb="25px">
      <Table
        styles={{
          table: {
            backgroundColor: '#ffffff',
          },
          thead: {
            backgroundColor: '#ffffff',
          },
          th: {
            color: '#868e96',
            fontWeight: 400,
            fontSize: '14px',
            lineHeight: '20px',
            padding: '12px 15px',
            borderBottom: '1px solid #dee2e6',
            fontFamily: 'Noto Sans TC, sans-serif',
          },
          td: {
            padding: '12px 15px',
            borderBottom: '1px solid #dee2e6',
            fontSize: '14px',
            fontFamily: 'Noto Sans TC, sans-serif',
            color: '#000000',
          },
        }}
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th>合約類型</Table.Th>
            <Table.Th>服務類型</Table.Th>
            <Table.Th>適用場站數</Table.Th>
            <Table.Th>合約起迄時間</Table.Th>
            <Table.Th style={{ textAlign: 'center', width: '120px' }}>操作</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {[
            { type: '停車場', service: '車辨', stations: '5', period: '2025/01/01 00:00 - 2027/12/31 23:59' },
            { type: '停車場', service: '繳費機線上化', stations: '3', period: '2025/01/01 00:00 - 2027/12/31 23:59' },
            { type: '連鎖店', service: '充電', stations: '全部', period: '2025/01/01 00:00 - 2027/12/31 23:59' },
            { type: '加油站', service: '掃碼付', stations: '全部', period: '2025/01/01 00:00 - 2027/12/31 23:59' },
          ].map((contract, index) => (
            <Table.Tr key={index}>
              <Table.Td>
                <Badge
                  styles={{
                    root: {
                      backgroundColor: `rgba(${
                        contract.type === '停車場' ? '76,110,245' : 
                        contract.type === '加油站' ? '250,82,82' : 
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
                  {contract.type}
                </Badge>
              </Table.Td>
              <Table.Td>{contract.service}</Table.Td>
              <Table.Td>{contract.stations}</Table.Td>
              <Table.Td>{contract.period}</Table.Td>
              <Table.Td style={{ width: '120px' }}>
                <Group justify="center" gap="8px" wrap="nowrap">
                  <ActionIcon 
                    variant="transparent" 
                    size={20}
                    style={{ cursor: 'pointer', minWidth: '20px' }}
                  >
                    <ViewIcon />
                  </ActionIcon>
                  <ActionIcon 
                    variant="transparent" 
                    size={20}
                    style={{ cursor: 'pointer', minWidth: '20px' }}
                  >
                    <EditIcon />
                  </ActionIcon>
                  <ActionIcon 
                    variant="transparent" 
                    size={20}
                    style={{ cursor: 'pointer', minWidth: '20px' }}
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
  )
}

// Contact info section component
interface ContactInfoSectionProps {
  isEmpty?: boolean;
}

function ContactInfoSection({ isEmpty = false }: ContactInfoSectionProps) {
  const [isAddPersonModalOpen, setIsAddPersonModalOpen] = useState(false);
  const [isEditPersonModalOpen, setIsEditPersonModalOpen] = useState(false);
  const [isDeletePersonModalOpen, setIsDeletePersonModalOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<SelectedContact | null>(null);
  const [personnelType, setPersonnelType] = useState<'accountant' | 'admin'>('accountant');
  const [newPerson, setNewPerson] = useState({
    name: '',
    email: '',
  });
  const [contactList, setContactList] = useState<Contact[]>(
    isEmpty
      ? []
      : [
          { name: 'Walter Chang', role: '管理員', isAccountant: '是', phone: '0911111111', email: 'walter51004@pklotcorp.com' },
          { name: 'Rex Yen', role: '檢視者', isAccountant: '否', phone: '02-12345678 #123', email: 'rexyen@pklotcorp.com' },
        ]
  );
  
  const { showSuccess } = useNotification();

  const handleAddPerson = () => {
    const fullPersonData = {
      ...newPerson,
      role: personnelType === 'accountant' ? '會計人員' : '管理員',
      isAccountant: personnelType === 'accountant' ? '是' : '否',
      phone: '尚未設定',
    };
    setContactList([...contactList, fullPersonData]);
    setNewPerson({ name: '', email: '' });
    setIsAddPersonModalOpen(false);
  };

  const handleAddPersonType = (type: 'accountant' | 'admin') => {
    setPersonnelType(type);
    setIsAddPersonModalOpen(true);
  };

  const handleEditPerson = (person: Contact, index: number) => {
    setSelectedPerson({ ...person, index });
    setNewPerson({ name: person.name, email: person.email });
    setIsEditPersonModalOpen(true);
  };

  const handleSaveEditPerson = () => {
    if (!selectedPerson) return;
    const updatedList = [...contactList];
    updatedList[selectedPerson.index] = { ...updatedList[selectedPerson.index], ...newPerson };
    setContactList(updatedList);
    setNewPerson({ name: '', email: '' });
    setSelectedPerson(null);
    setIsEditPersonModalOpen(false);
  };

  const handleDeletePerson = (person: Contact, index: number) => {
    setSelectedPerson({ ...person, index });
    setIsDeletePersonModalOpen(true);
  };

  const handleConfirmDeletePerson = () => {
    if (!selectedPerson) return;
    const updatedList = contactList.filter((_, index) => index !== selectedPerson.index);
    setContactList(updatedList);
    
    // 顯示刪除成功通知
    showSuccess(`已刪除人員「${selectedPerson.name}」`, '刪除人員成功');
    
    setSelectedPerson(null);
    setIsDeletePersonModalOpen(false);
  };

  const handleCancelModal = () => {
    setNewPerson({ name: '', email: '' });
    setSelectedPerson(null);
    setIsAddPersonModalOpen(false);
    setIsEditPersonModalOpen(false);
    setIsDeletePersonModalOpen(false);
  };

  return (
    <Paper
      style={{
        width: '100%',
        background: 'white',
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.05)',
        borderRadius: '16px',
        marginBottom: '16px',
      }}
    >
      <Group justify="space-between" p="25px">
        <Title
          order={3}
          style={{
            color: 'black',
            fontSize: '20px',
            fontFamily: 'Noto Sans TC',
            fontWeight: 700,
            lineHeight: '24px',
          }}
        >
          人員管理
        </Title>
        <Menu shadow="md" width={200}>
          <Menu.Target>
            <Button
              leftSection={<IconPlus size={16} />}
              style={{
                background: '#228BE6',
                color: 'white',
                fontSize: '16px',
                fontFamily: 'Noto Sans TC',
                fontWeight: 400,
                lineHeight: '24px',
                borderRadius: '4px',
                padding: '8px 20px',
              }}
            >
              新增人員
            </Button>
          </Menu.Target>
          
          <Menu.Dropdown>
            <Menu.Item onClick={() => handleAddPersonType('accountant')}>
              會計人員
            </Menu.Item>
            <Menu.Item onClick={() => handleAddPersonType('admin')}>
              廠商後台管理員
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      {/* Tabs for Personnel Management */}
      <Box px="15px">
        <Box>
          <Tabs defaultValue="accountant" variant="default">
            <Tabs.List
              styles={{
                list: {
                  borderBottom: '1px solid #dee2e6',
                },
              }}
            >
              <Tabs.Tab value="accountant" disabled={isEmpty}>
                會計人員（{isEmpty ? '0' : '2'}）
              </Tabs.Tab>
              <Tabs.Tab value="admin" disabled={isEmpty}>
                廠商後台管理員（{isEmpty ? '0' : '2'}）
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="accountant">
              {isEmpty ? (
                <Box mt="20px" pb="25px">
                  <EmptyState message="目前還沒有任何人員，點擊「新增人員」開始建立！" />
                </Box>
              ) : (
                <PersonnelTable contactList={contactList} onEdit={handleEditPerson} onDelete={handleDeletePerson} />
              )}
            </Tabs.Panel>

            <Tabs.Panel value="admin">
              {isEmpty ? (
                <Box mt="20px" pb="25px">
                  <EmptyState message="目前還沒有任何人員，點擊「新增人員」開始建立！" />
                </Box>
              ) : (
                <PersonnelTable contactList={contactList} onEdit={handleEditPerson} onDelete={handleDeletePerson} />
              )}
            </Tabs.Panel>
          </Tabs>
        </Box>
      </Box>

      {/* 新增人員 Modal */}
      <Modal
        opened={isAddPersonModalOpen}
        onClose={handleCancelModal}
        title=""
        centered
        size="md"
        padding="24px"
        styles={{
          content: { 
            background: 'white', 
            boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.05)', 
            borderRadius: '4px',
            width: '512px',
          },
          header: { display: 'none' },
          body: { paddingTop: '24px' },
        }}
      >
        <Stack gap="24px">
          <Title 
            order={4} 
            style={{ 
              color: 'black', 
              fontSize: '16px', 
              fontFamily: 'Noto Sans TC', 
              fontWeight: 700, 
              lineHeight: '20px' 
            }}
          >
            新增{personnelType === 'accountant' ? '會計' : '廠商後台管理'}人員
          </Title>
          
          <Stack gap="16px">
            <Box>
              <Text 
                mb="4px"
                style={{ 
                  color: 'black', 
                  fontSize: '14px', 
                  fontFamily: 'Noto Sans TC', 
                  fontWeight: 400, 
                  lineHeight: '20px' 
                }}
              >
                人員名稱
              </Text>
              <TextInput
                placeholder="請輸入人員名稱"
                value={newPerson.name}
                onChange={(event) => setNewPerson({ ...newPerson, name: event.currentTarget.value })}
                styles={{ 
                  input: { 
                    paddingLeft: '12px', 
                    paddingRight: '12px', 
                    paddingTop: '8px', 
                    paddingBottom: '8px', 
                    background: 'white', 
                    borderRadius: '4px', 
                    border: '1px solid #DEE2E6', 
                    fontSize: '14px', 
                    fontFamily: 'Noto Sans TC', 
                    fontWeight: 400, 
                    lineHeight: '20px', 
                    height: '40px',
                    '&::placeholder': { color: '#ADB5BD' } 
                  } 
                }}
              />
            </Box>
            
            <Box>
              <Text 
                mb="4px"
                style={{ 
                  color: 'black', 
                  fontSize: '14px', 
                  fontFamily: 'Noto Sans TC', 
                  fontWeight: 400, 
                  lineHeight: '20px' 
                }}
              >
                Email
              </Text>
              <TextInput
                placeholder="請輸入Email"
                value={newPerson.email}
                onChange={(event) => setNewPerson({ ...newPerson, email: event.currentTarget.value })}
                styles={{ 
                  input: { 
                    paddingLeft: '12px', 
                    paddingRight: '12px', 
                    paddingTop: '8px', 
                    paddingBottom: '8px', 
                    background: 'white', 
                    borderRadius: '4px', 
                    border: '1px solid #DEE2E6', 
                    fontSize: '14px', 
                    fontFamily: 'Noto Sans TC', 
                    fontWeight: 400, 
                    lineHeight: '20px', 
                    height: '40px',
                    '&::placeholder': { color: '#ADB5BD' } 
                  } 
                }}
              />
            </Box>
          </Stack>
          
          <Group justify="flex-end" gap="16px">
            <Button 
              variant="outline" 
              onClick={handleCancelModal} 
              style={{ 
                paddingLeft: '16px', 
                paddingRight: '16px', 
                paddingTop: '8px', 
                paddingBottom: '8px', 
                background: 'white', 
                borderRadius: '4px', 
                border: '1px solid #DEE2E6', 
                color: '#212529', 
                fontSize: '14px', 
                fontFamily: 'Noto Sans TC', 
                fontWeight: 400, 
                lineHeight: '20px',
                height: '40px',
              }}
            >
              取消
            </Button>
            <Button 
              onClick={handleAddPerson} 
              style={{ 
                paddingLeft: '16px', 
                paddingRight: '16px', 
                paddingTop: '8px', 
                paddingBottom: '8px', 
                background: '#228BE6', 
                borderRadius: '4px', 
                color: 'white', 
                fontSize: '14px', 
                fontFamily: 'Noto Sans TC', 
                fontWeight: 400, 
                lineHeight: '20px',
                height: '40px',
              }}
            >
              新增
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* 編輯人員 Modal */}
      <Modal
        opened={isEditPersonModalOpen}
        onClose={handleCancelModal}
        title=""
        centered
        size="md"
        padding="24px"
        styles={{
          content: { 
            background: 'white', 
            boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.05)', 
            borderRadius: '4px',
            width: '512px',
          },
          header: { display: 'none' },
          body: { paddingTop: '24px' },
        }}
      >
        <Stack gap="24px">
          <Title 
            order={4} 
            style={{ 
              color: 'black', 
              fontSize: '16px', 
              fontFamily: 'Noto Sans TC', 
              fontWeight: 700, 
              lineHeight: '20px' 
            }}
          >
            編輯人員
          </Title>
          
          <Stack gap="16px">
            <Box>
              <Text 
                mb="4px"
                style={{ 
                  color: 'black', 
                  fontSize: '14px', 
                  fontFamily: 'Noto Sans TC', 
                  fontWeight: 400, 
                  lineHeight: '20px' 
                }}
              >
                人員名稱
              </Text>
              <TextInput
                value={newPerson.name}
                onChange={(event) => setNewPerson({ ...newPerson, name: event.currentTarget.value })}
                styles={{ 
                  input: { 
                    paddingLeft: '12px', 
                    paddingRight: '12px', 
                    paddingTop: '8px', 
                    paddingBottom: '8px', 
                    background: 'white', 
                    borderRadius: '4px', 
                    border: '1px solid #DEE2E6', 
                    fontSize: '14px', 
                    fontFamily: 'Noto Sans TC', 
                    fontWeight: 400, 
                    lineHeight: '20px', 
                    height: '40px',
                  } 
                }}
              />
            </Box>
            
            <Box>
              <Text 
                mb="4px"
                style={{ 
                  color: 'black', 
                  fontSize: '14px', 
                  fontFamily: 'Noto Sans TC', 
                  fontWeight: 400, 
                  lineHeight: '20px' 
                }}
              >
                Email
              </Text>
              <TextInput
                value={newPerson.email}
                onChange={(event) => setNewPerson({ ...newPerson, email: event.currentTarget.value })}
                styles={{ 
                  input: { 
                    paddingLeft: '12px', 
                    paddingRight: '12px', 
                    paddingTop: '8px', 
                    paddingBottom: '8px', 
                    background: 'white', 
                    borderRadius: '4px', 
                    border: '1px solid #DEE2E6', 
                    fontSize: '14px', 
                    fontFamily: 'Noto Sans TC', 
                    fontWeight: 400, 
                    lineHeight: '20px', 
                    height: '40px',
                  } 
                }}
              />
            </Box>
          </Stack>
          
          <Group justify="flex-end" gap="16px">
            <Button 
              variant="outline" 
              onClick={handleCancelModal} 
              style={{ 
                paddingLeft: '16px', 
                paddingRight: '16px', 
                paddingTop: '8px', 
                paddingBottom: '8px', 
                background: 'white', 
                borderRadius: '4px', 
                border: '1px solid #DEE2E6', 
                color: '#212529', 
                fontSize: '14px', 
                fontFamily: 'Noto Sans TC', 
                fontWeight: 400, 
                lineHeight: '20px',
                height: '40px',
              }}
            >
              取消
            </Button>
            <Button 
              onClick={handleSaveEditPerson} 
              style={{ 
                paddingLeft: '16px', 
                paddingRight: '16px', 
                paddingTop: '8px', 
                paddingBottom: '8px', 
                background: '#228BE6', 
                borderRadius: '4px', 
                color: 'white', 
                fontSize: '14px', 
                fontFamily: 'Noto Sans TC', 
                fontWeight: 400, 
                lineHeight: '20px',
                height: '40px',
              }}
            >
              確認
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* 刪除人員確認 Modal */}
      <Modal
        opened={isDeletePersonModalOpen}
        onClose={handleCancelModal}
        title=""
        centered
        size="sm"
        padding="24px"
        styles={{
          content: { background: 'white', boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.05)', borderRadius: '4px', width: '440px' },
          header: { display: 'none' },
          body: { paddingTop: '24px' },
        }}
      >
        <Stack gap="24px">
          <Title order={4} style={{ color: 'black', fontSize: '16px', fontFamily: 'Noto Sans TC', fontWeight: 700, lineHeight: '20px' }}>
            刪除人員
          </Title>
          <Text style={{ color: 'black', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 400, lineHeight: '20px' }}>
            是否確認刪除該人員？
          </Text>
          <Group justify="flex-end" gap="16px">
            <Button variant="outline" onClick={handleCancelModal} style={{ paddingLeft: '16px', paddingRight: '16px', paddingTop: '6px', paddingBottom: '6px', background: 'white', borderRadius: '4px', border: '1px solid #DEE2E6', color: '#212529', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 400, lineHeight: '20px' }}>取消</Button>
            <Button onClick={handleConfirmDeletePerson} style={{ paddingLeft: '16px', paddingRight: '16px', paddingTop: '6px', paddingBottom: '6px', background: '#228BE6', borderRadius: '4px', color: 'white', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 400, lineHeight: '20px' }}>確認</Button>
          </Group>
        </Stack>
      </Modal>
    </Paper>
  )
}

// Bank info section component
interface BankInfoSectionProps {
  isEmpty?: boolean;
}

function BankInfoSection({ isEmpty = false }: BankInfoSectionProps) {
  const [isAddBankModalOpen, setIsAddBankModalOpen] = useState(false);
  const [isEditBankModalOpen, setIsEditBankModalOpen] = useState(false);
  const [isDeleteBankModalOpen, setIsDeleteBankModalOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<SelectedBank | null>(null);
  const [newBankInfo, setNewBankInfo] = useState({
    type: '',
    bankCode: '',
    bank: '',
    branch: '',
    account: '',
    accountName: '',
    feeMode: '',
  });
  const [bankList, setBankList] = useState<BankAccount[]>(
    isEmpty
      ? []
      : [
          {
            type: '預設',
            bankCode: '000', 
            bankBranch: '廣吉銀行/和平分行', 
            account: '000000000000', 
            accountName: '廣吉科技', 
            feeMode: '不內扣',
            highlight: false
          },
          { 
            type: '指定場站', 
            bankCode: '013', 
            bankBranch: '國泰世華銀行/和平分行', 
            account: '000000000000', 
            accountName: '廣吉科技', 
            feeMode: '內扣',
            highlight: true
          },
        ]
  );
  
  const { showSuccess } = useNotification();

  const handleAddBank = () => {
    setBankList([...bankList, {
      type: newBankInfo.type,
      bankCode: newBankInfo.bankCode,
      bankBranch: `${newBankInfo.bank}/${newBankInfo.branch}`,
      account: newBankInfo.account,
      accountName: newBankInfo.accountName,
      feeMode: newBankInfo.feeMode,
      highlight: false
    }]);
    setNewBankInfo({ type: '', bankCode: '', bank: '', branch: '', account: '', accountName: '', feeMode: '' });
    setIsAddBankModalOpen(false);
  };

  const handleEditBank = (bank: BankAccount, index: number) => {
    const [bankName, branchName] = bank.bankBranch.split('/');
    setSelectedBank({ ...bank, index });
    setNewBankInfo({
      type: bank.type,
      bankCode: bank.bankCode,
      bank: bankName || '',
      branch: branchName || '',
      account: bank.account,
      accountName: bank.accountName,
      feeMode: bank.feeMode,
    });
    setIsEditBankModalOpen(true);
  };

  const handleSaveEditBank = () => {
    if (!selectedBank) return;
    const updatedList = [...bankList];
    updatedList[selectedBank.index] = {
      ...updatedList[selectedBank.index],
      type: newBankInfo.type,
      bankCode: newBankInfo.bankCode,
      bankBranch: `${newBankInfo.bank}/${newBankInfo.branch}`,
      account: newBankInfo.account,
      accountName: newBankInfo.accountName,
      feeMode: newBankInfo.feeMode,
    };
    setBankList(updatedList);
    setNewBankInfo({ type: '', bankCode: '', bank: '', branch: '', account: '', accountName: '', feeMode: '' });
    setSelectedBank(null);
    setIsEditBankModalOpen(false);
  };

  const handleDeleteBank = (bank: BankAccount, index: number) => {
    setSelectedBank({ ...bank, index });
    setIsDeleteBankModalOpen(true);
  };

  const handleConfirmDeleteBank = () => {
    if (!selectedBank) return;
    const updatedList = bankList.filter((_, index) => index !== selectedBank.index);
    setBankList(updatedList);
    
    // 顯示刪除成功通知
    showSuccess(`已刪除匯款資訊「${selectedBank.type}」`, '刪除匯款資訊成功');
    
    setSelectedBank(null);
    setIsDeleteBankModalOpen(false);
  };

  const handleCancelBankModal = () => {
    setNewBankInfo({ type: '', bankCode: '', bank: '', branch: '', account: '', accountName: '', feeMode: '' });
    setSelectedBank(null);
    setIsAddBankModalOpen(false);
    setIsEditBankModalOpen(false);
    setIsDeleteBankModalOpen(false);
  };

  return (
    <Paper
      style={{
        width: '100%',
        background: 'white',
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.05)',
        borderRadius: '16px',
      }}
    >
      <Group justify="space-between" p="25px">
        <Title
          order={3}
          style={{
            color: 'black',
            fontSize: '20px',
            fontFamily: 'Noto Sans TC',
            fontWeight: 700,
            lineHeight: '24px',
          }}
        >
          匯款資訊
        </Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => setIsAddBankModalOpen(true)}
          style={{
            background: '#228BE6',
            color: 'white',
            fontSize: '16px',
            fontFamily: 'Noto Sans TC',
            fontWeight: 400,
            lineHeight: '24px',
            borderRadius: '4px',
            padding: '8px 20px',
          }}
        >
          新增匯款資訊
        </Button>
      </Group>

      <Box px="15px" pb="20px">
        {isEmpty ? (
          <>
            {/* Empty state with table headers */}
            <Table
              styles={{
                table: {
                  backgroundColor: '#ffffff',
                },
                thead: {
                  backgroundColor: '#ffffff',
                },
                th: {
                  color: '#868e96',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '20px',
                  padding: '12px 15px',
                  borderBottom: '1px solid #dee2e6',
                  fontFamily: 'Noto Sans TC, sans-serif',
                },
              }}
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>適用類型</Table.Th>
                  <Table.Th>銀行代碼</Table.Th>
                  <Table.Th>銀行/分行</Table.Th>
                  <Table.Th>帳號</Table.Th>
                  <Table.Th>戶名</Table.Th>
                  <Table.Th>手續費模式</Table.Th>
                  <Table.Th style={{ textAlign: 'center', width: '120px' }}>操作</Table.Th>
                </Table.Tr>
              </Table.Thead>
            </Table>
            <EmptyState message="目前還沒有任何匯款資訊，點擊「新增匯款資訊」開始建立！" />
          </>
        ) : (
          <Table
            styles={{
              table: {
                backgroundColor: '#ffffff',
              },
              thead: {
                backgroundColor: '#ffffff',
              },
              th: {
                color: '#868e96',
                fontWeight: 400,
                fontSize: '14px',
                lineHeight: '20px',
                padding: '12px 15px',
                borderBottom: '1px solid #dee2e6',
                fontFamily: 'Noto Sans TC, sans-serif',
              },
              td: {
                padding: '12px 15px',
                borderBottom: '1px solid #dee2e6',
                fontSize: '14px',
                fontFamily: 'Noto Sans TC, sans-serif',
                color: '#000000',
              },
            }}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>適用類型</Table.Th>
                <Table.Th>銀行代碼</Table.Th>
                <Table.Th>銀行/分行</Table.Th>
                <Table.Th>帳號</Table.Th>
                <Table.Th>戶名</Table.Th>
                <Table.Th>手續費模式</Table.Th>
                <Table.Th style={{ textAlign: 'center', width: '120px' }}>操作</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {bankList.map((bankInfo, index) => (
                <Table.Tr key={index}>
                  <Table.Td>
                    {bankInfo.highlight ? (
                      <Text style={{ color: '#228BE6', fontSize: '14px' }}>
                        {bankInfo.type}
                      </Text>
                    ) : (
                      bankInfo.type
                    )}
                  </Table.Td>
                  <Table.Td>{bankInfo.bankCode}</Table.Td>
                  <Table.Td>{bankInfo.bankBranch}</Table.Td>
                  <Table.Td>{bankInfo.account}</Table.Td>
                  <Table.Td>{bankInfo.accountName}</Table.Td>
                  <Table.Td>{bankInfo.feeMode}</Table.Td>
                  <Table.Td style={{ width: '120px' }}>
                    <Group justify="center" gap="8px" wrap="nowrap">
                      <ActionIcon 
                        variant="transparent" 
                        size={20}
                        onClick={() => handleEditBank(bankInfo, index)}
                        style={{ cursor: 'pointer', minWidth: '20px' }}
                      >
                        <EditIcon />
                      </ActionIcon>
                      <ActionIcon 
                        variant="transparent" 
                        size={20}
                        onClick={() => handleDeleteBank(bankInfo, index)}
                        style={{ cursor: 'pointer', minWidth: '20px' }}
                      >
                        <DeleteIcon />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Box>

      {/* 新增匯款資訊 Modal */}
      <Modal
        opened={isAddBankModalOpen}
        onClose={handleCancelBankModal}
        title=""
        centered
        size="md"
        padding="16px"
        styles={{
          content: {
            background: 'white',
            boxShadow: '0px 7px 7px -5px rgba(0,0,0,0.04), 0px 10px 15px -5px rgba(0,0,0,0.1), 0px 1px 3px 0px rgba(0,0,0,0.05)',
            borderRadius: '4px',
            width: '440px',
          },
          header: {
            display: 'none',
          },
          body: {
            paddingTop: '16px',
          },
        }}
      >
        <Stack gap="24px">
          <Title
            order={4}
            style={{
              color: 'black',
              fontSize: '16px',
              fontFamily: 'Noto Sans TC',
              fontWeight: 700,
              lineHeight: '24px',
            }}
          >
            新增匯款資訊
          </Title>

          <Stack gap="16px">
            {/* 匯款資訊類型 */}
            <Box>
              <Group gap="0" mb="4px">
                <Text style={{ color: 'black', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 500, lineHeight: '20px' }}>匯款資訊類型</Text>
                <Text style={{ color: '#fa5252', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 500, lineHeight: '20px' }}>*</Text>
              </Group>
              <Select
                placeholder="預設"
                data={['預設', '指定場站']}
                value={newBankInfo.type}
                onChange={(value) => setNewBankInfo({ ...newBankInfo, type: value || '' })}
                styles={{
                  input: {
                    paddingLeft: '12px',
                    paddingRight: '12px',
                    paddingTop: '6px',
                    paddingBottom: '6px',
                    background: newBankInfo.type ? 'white' : '#e9ecef',
                    borderRadius: '4px',
                    border: '1px solid #dee2e6',
                    fontSize: '14px',
                    fontFamily: 'Noto Sans TC',
                    fontWeight: 400,
                    lineHeight: '20px',
                    height: '32px',
                    '&::placeholder': {
                      color: '#adb5bd',
                    },
                  },
                }}
              />
            </Box>

            {/* 銀行代碼 */}
            <Box>
              <Group gap="0" mb="4px">
                <Text style={{ color: 'black', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 500, lineHeight: '20px' }}>銀行代碼 </Text>
                <Text style={{ color: '#fa5252', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 500, lineHeight: '20px' }}>*</Text>
              </Group>
              <TextInput
                placeholder="請輸入銀行代碼"
                value={newBankInfo.bankCode}
                onChange={(event) => setNewBankInfo({ ...newBankInfo, bankCode: event.currentTarget.value })}
                styles={{
                  input: {
                    paddingLeft: '12px',
                    paddingRight: '12px',
                    paddingTop: '6px',
                    paddingBottom: '6px',
                    background: 'white',
                    borderRadius: '4px',
                    border: '1px solid #dee2e6',
                    fontSize: '14px',
                    fontFamily: 'Noto Sans TC',
                    fontWeight: 400,
                    lineHeight: '20px',
                    height: '32px',
                    '&::placeholder': {
                      color: '#adb5bd',
                    },
                  },
                }}
              />
            </Box>

            {/* 銀行 + 銀行分行 */}
            <Group gap="16px" grow>
              <Box>
                <Group gap="0" mb="4px">
                  <Text style={{ color: 'black', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 500, lineHeight: '20px' }}>銀行</Text>
                  <Text style={{ color: '#fa5252', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 500, lineHeight: '20px' }}>*</Text>
                </Group>
                <TextInput
                  placeholder="請輸入銀行"
                  value={newBankInfo.bank}
                  onChange={(event) => setNewBankInfo({ ...newBankInfo, bank: event.currentTarget.value })}
                  styles={{
                    input: {
                      paddingLeft: '12px',
                      paddingRight: '12px',
                      paddingTop: '6px',
                      paddingBottom: '6px',
                      background: 'white',
                      borderRadius: '4px',
                      border: '1px solid #dee2e6',
                      fontSize: '14px',
                      fontFamily: 'Noto Sans TC',
                      fontWeight: 400,
                      lineHeight: '20px',
                      height: '32px',
                      '&::placeholder': {
                        color: '#adb5bd',
                      },
                    },
                  }}
                />
              </Box>
              <Box>
                <Group gap="0" mb="4px">
                  <Text style={{ color: 'black', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 500, lineHeight: '20px' }}>銀行分行</Text>
                  <Text style={{ color: '#fa5252', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 500, lineHeight: '20px' }}>*</Text>
                </Group>
                <TextInput
                  placeholder="請輸入銀行分行"
                  value={newBankInfo.branch}
                  onChange={(event) => setNewBankInfo({ ...newBankInfo, branch: event.currentTarget.value })}
                  styles={{
                    input: {
                      paddingLeft: '12px',
                      paddingRight: '12px',
                      paddingTop: '6px',
                      paddingBottom: '6px',
                      background: 'white',
                      borderRadius: '4px',
                      border: '1px solid #dee2e6',
                      fontSize: '14px',
                      fontFamily: 'Noto Sans TC',
                      fontWeight: 400,
                      lineHeight: '20px',
                      height: '32px',
                      '&::placeholder': {
                        color: '#adb5bd',
                      },
                    },
                  }}
                />
              </Box>
            </Group>

            {/* 帳號 */}
            <Box>
              <Group gap="0" mb="4px">
                <Text style={{ color: 'black', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 500, lineHeight: '20px' }}>帳號</Text>
                <Text style={{ color: '#fa5252', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 500, lineHeight: '20px' }}>*</Text>
              </Group>
              <TextInput
                placeholder="請輸入帳號"
                value={newBankInfo.account}
                onChange={(event) => setNewBankInfo({ ...newBankInfo, account: event.currentTarget.value })}
                styles={{
                  input: {
                    paddingLeft: '12px',
                    paddingRight: '12px',
                    paddingTop: '6px',
                    paddingBottom: '6px',
                    background: 'white',
                    borderRadius: '4px',
                    border: '1px solid #dee2e6',
                    fontSize: '14px',
                    fontFamily: 'Noto Sans TC',
                    fontWeight: 400,
                    lineHeight: '20px',
                    height: '32px',
                    '&::placeholder': {
                      color: '#adb5bd',
                    },
                  },
                }}
              />
            </Box>

            {/* 戶名 */}
            <Box>
              <Group gap="0" mb="4px">
                <Text style={{ color: 'black', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 500, lineHeight: '20px' }}>戶名</Text>
                <Text style={{ color: '#fa5252', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 500, lineHeight: '20px' }}>*</Text>
              </Group>
              <TextInput
                placeholder="請輸入戶名"
                value={newBankInfo.accountName}
                onChange={(event) => setNewBankInfo({ ...newBankInfo, accountName: event.currentTarget.value })}
                styles={{
                  input: {
                    paddingLeft: '12px',
                    paddingRight: '12px',
                    paddingTop: '6px',
                    paddingBottom: '6px',
                    background: 'white',
                    borderRadius: '4px',
                    border: '1px solid #dee2e6',
                    fontSize: '14px',
                    fontFamily: 'Noto Sans TC',
                    fontWeight: 400,
                    lineHeight: '20px',
                    height: '32px',
                    '&::placeholder': {
                      color: '#adb5bd',
                    },
                  },
                }}
              />
            </Box>

            {/* 手續費模式 */}
            <Box>
              <Group gap="0" mb="4px">
                <Text style={{ color: 'black', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 500, lineHeight: '20px' }}>手續費模式</Text>
                <Text style={{ color: '#fa5252', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 500, lineHeight: '20px' }}>*</Text>
              </Group>
              <Select
                placeholder="請選擇手續費模式"
                data={['內扣', '不內扣']}
                value={newBankInfo.feeMode}
                onChange={(value) => setNewBankInfo({ ...newBankInfo, feeMode: value || '' })}
                styles={{
                  input: {
                    paddingLeft: '12px',
                    paddingRight: '12px',
                    paddingTop: '6px',
                    paddingBottom: '6px',
                    background: 'white',
                    borderRadius: '4px',
                    border: '1px solid #dee2e6',
                    fontSize: '14px',
                    fontFamily: 'Noto Sans TC',
                    fontWeight: 400,
                    lineHeight: '20px',
                    height: '32px',
                    '&::placeholder': {
                      color: '#adb5bd',
                    },
                  },
                }}
              />
            </Box>
          </Stack>

          <Group justify="flex-end" gap="16px">
            <Button
              variant="outline"
              onClick={handleCancelBankModal}
              style={{
                paddingLeft: '16px',
                paddingRight: '16px',
                paddingTop: '6px',
                paddingBottom: '6px',
                background: 'white',
                borderRadius: '4px',
                border: '1px solid #dee2e6',
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
              onClick={handleAddBank}
              style={{
                paddingLeft: '16px',
                paddingRight: '16px',
                paddingTop: '6px',
                paddingBottom: '6px',
                background: '#228be6',
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

      {/* 編輯匯款資訊 Modal */}
      <Modal
        opened={isEditBankModalOpen}
        onClose={handleCancelBankModal}
        title=""
        centered
        size="md"
        padding="16px"
        styles={{
          content: {
            background: 'white',
            boxShadow: '0px 7px 7px -5px rgba(0,0,0,0.04), 0px 10px 15px -5px rgba(0,0,0,0.1), 0px 1px 3px 0px rgba(0,0,0,0.05)',
            borderRadius: '4px',
            width: '440px',
          },
          header: {
            display: 'none',
          },
          body: {
            paddingTop: '16px',
          },
        }}
      >
        <Stack gap="24px">
          <Title
            order={4}
            style={{
              color: 'black',
              fontSize: '16px',
              fontFamily: 'Noto Sans TC',
              fontWeight: 700,
              lineHeight: '24px',
            }}
          >
            編輯匯款資訊
          </Title>

          <Stack gap="16px">
            {/* 匯款資訊類型 */}
            <Box>
              <Group gap="0" mb="4px">
                <Text style={{ color: 'black', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 500, lineHeight: '20px' }}>匯款資訊類型</Text>
                <Text style={{ color: '#fa5252', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 500, lineHeight: '20px' }}>*</Text>
              </Group>
              <Select
                placeholder="預設"
                data={['預設', '指定場站']}
                value={newBankInfo.type}
                onChange={(value) => setNewBankInfo({ ...newBankInfo, type: value || '' })}
                styles={{
                  input: {
                    paddingLeft: '12px',
                    paddingRight: '12px',
                    paddingTop: '6px',
                    paddingBottom: '6px',
                    background: newBankInfo.type ? 'white' : '#e9ecef',
                    borderRadius: '4px',
                    border: '1px solid #dee2e6',
                    fontSize: '14px',
                    fontFamily: 'Noto Sans TC',
                    fontWeight: 400,
                    lineHeight: '20px',
                    height: '32px',
                    '&::placeholder': {
                      color: '#adb5bd',
                    },
                  },
                }}
              />
            </Box>

            {/* 銀行代碼 */}
            <Box>
              <Group gap="0" mb="4px">
                <Text style={{ color: 'black', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 500, lineHeight: '20px' }}>銀行代碼 </Text>
                <Text style={{ color: '#fa5252', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 500, lineHeight: '20px' }}>*</Text>
              </Group>
              <TextInput
                placeholder="請輸入銀行代碼"
                value={newBankInfo.bankCode}
                onChange={(event) => setNewBankInfo({ ...newBankInfo, bankCode: event.currentTarget.value })}
                styles={{
                  input: {
                    paddingLeft: '12px',
                    paddingRight: '12px',
                    paddingTop: '6px',
                    paddingBottom: '6px',
                    background: 'white',
                    borderRadius: '4px',
                    border: '1px solid #dee2e6',
                    fontSize: '14px',
                    fontFamily: 'Noto Sans TC',
                    fontWeight: 400,
                    lineHeight: '20px',
                    height: '32px',
                    '&::placeholder': {
                      color: '#adb5bd',
                    },
                  },
                }}
              />
            </Box>

            {/* 銀行 + 銀行分行 */}
            <Group gap="16px" grow>
              <Box>
                <Group gap="0" mb="4px">
                  <Text style={{ color: 'black', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 500, lineHeight: '20px' }}>銀行</Text>
                  <Text style={{ color: '#fa5252', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 500, lineHeight: '20px' }}>*</Text>
                </Group>
                <TextInput
                  placeholder="請輸入銀行"
                  value={newBankInfo.bank}
                  onChange={(event) => setNewBankInfo({ ...newBankInfo, bank: event.currentTarget.value })}
                  styles={{
                    input: {
                      paddingLeft: '12px',
                      paddingRight: '12px',
                      paddingTop: '6px',
                      paddingBottom: '6px',
                      background: 'white',
                      borderRadius: '4px',
                      border: '1px solid #dee2e6',
                      fontSize: '14px',
                      fontFamily: 'Noto Sans TC',
                      fontWeight: 400,
                      lineHeight: '20px',
                      height: '32px',
                      '&::placeholder': {
                        color: '#adb5bd',
                      },
                    },
                  }}
                />
              </Box>
              <Box>
                <Group gap="0" mb="4px">
                  <Text style={{ color: 'black', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 500, lineHeight: '20px' }}>銀行分行</Text>
                  <Text style={{ color: '#fa5252', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 500, lineHeight: '20px' }}>*</Text>
                </Group>
                <TextInput
                  placeholder="請輸入銀行分行"
                  value={newBankInfo.branch}
                  onChange={(event) => setNewBankInfo({ ...newBankInfo, branch: event.currentTarget.value })}
                  styles={{
                    input: {
                      paddingLeft: '12px',
                      paddingRight: '12px',
                      paddingTop: '6px',
                      paddingBottom: '6px',
                      background: 'white',
                      borderRadius: '4px',
                      border: '1px solid #dee2e6',
                      fontSize: '14px',
                      fontFamily: 'Noto Sans TC',
                      fontWeight: 400,
                      lineHeight: '20px',
                      height: '32px',
                      '&::placeholder': {
                        color: '#adb5bd',
                      },
                    },
                  }}
                />
              </Box>
            </Group>

            {/* 帳號 */}
            <Box>
              <Group gap="0" mb="4px">
                <Text style={{ color: 'black', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 500, lineHeight: '20px' }}>帳號</Text>
                <Text style={{ color: '#fa5252', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 500, lineHeight: '20px' }}>*</Text>
              </Group>
              <TextInput
                placeholder="請輸入帳號"
                value={newBankInfo.account}
                onChange={(event) => setNewBankInfo({ ...newBankInfo, account: event.currentTarget.value })}
                styles={{
                  input: {
                    paddingLeft: '12px',
                    paddingRight: '12px',
                    paddingTop: '6px',
                    paddingBottom: '6px',
                    background: 'white',
                    borderRadius: '4px',
                    border: '1px solid #dee2e6',
                    fontSize: '14px',
                    fontFamily: 'Noto Sans TC',
                    fontWeight: 400,
                    lineHeight: '20px',
                    height: '32px',
                    '&::placeholder': {
                      color: '#adb5bd',
                    },
                  },
                }}
              />
            </Box>

            {/* 戶名 */}
            <Box>
              <Group gap="0" mb="4px">
                <Text style={{ color: 'black', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 500, lineHeight: '20px' }}>戶名</Text>
                <Text style={{ color: '#fa5252', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 500, lineHeight: '20px' }}>*</Text>
              </Group>
              <TextInput
                placeholder="請輸入戶名"
                value={newBankInfo.accountName}
                onChange={(event) => setNewBankInfo({ ...newBankInfo, accountName: event.currentTarget.value })}
                styles={{
                  input: {
                    paddingLeft: '12px',
                    paddingRight: '12px',
                    paddingTop: '6px',
                    paddingBottom: '6px',
                    background: 'white',
                    borderRadius: '4px',
                    border: '1px solid #dee2e6',
                    fontSize: '14px',
                    fontFamily: 'Noto Sans TC',
                    fontWeight: 400,
                    lineHeight: '20px',
                    height: '32px',
                    '&::placeholder': {
                      color: '#adb5bd',
                    },
                  },
                }}
              />
            </Box>

            {/* 手續費模式 */}
            <Box>
              <Group gap="0" mb="4px">
                <Text style={{ color: 'black', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 500, lineHeight: '20px' }}>手續費模式</Text>
                <Text style={{ color: '#fa5252', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 500, lineHeight: '20px' }}>*</Text>
              </Group>
              <Select
                placeholder="請選擇手續費模式"
                data={['內扣', '不內扣']}
                value={newBankInfo.feeMode}
                onChange={(value) => setNewBankInfo({ ...newBankInfo, feeMode: value || '' })}
                styles={{
                  input: {
                    paddingLeft: '12px',
                    paddingRight: '12px',
                    paddingTop: '6px',
                    paddingBottom: '6px',
                    background: 'white',
                    borderRadius: '4px',
                    border: '1px solid #dee2e6',
                    fontSize: '14px',
                    fontFamily: 'Noto Sans TC',
                    fontWeight: 400,
                    lineHeight: '20px',
                    height: '32px',
                    '&::placeholder': {
                      color: '#adb5bd',
                    },
                  },
                }}
              />
            </Box>
          </Stack>

          <Group justify="flex-end" gap="16px">
            <Button
              variant="outline"
              onClick={handleCancelBankModal}
              style={{
                paddingLeft: '16px',
                paddingRight: '16px',
                paddingTop: '6px',
                paddingBottom: '6px',
                background: 'white',
                borderRadius: '4px',
                border: '1px solid #dee2e6',
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
              onClick={handleSaveEditBank}
              style={{
                paddingLeft: '16px',
                paddingRight: '16px',
                paddingTop: '6px',
                paddingBottom: '6px',
                background: '#228be6',
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

      {/* 刪除匯款資訊確認 Modal */}
      <Modal
        opened={isDeleteBankModalOpen}
        onClose={handleCancelBankModal}
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
          <Title
            order={4}
            style={{
              color: 'black',
              fontSize: '16px',
              fontFamily: 'Noto Sans TC',
              fontWeight: 700,
              lineHeight: '20px',
            }}
          >
            刪除匯款資訊
          </Title>
          <Text
            style={{
              color: 'black',
              fontSize: '14px',
              fontFamily: 'Noto Sans TC',
              fontWeight: 400,
              lineHeight: '20px',
            }}
          >
            是否確認刪除該匯款資訊？
          </Text>
          <Group justify="flex-end" gap="16px">
            <Button
              variant="outline"
              onClick={handleCancelBankModal}
              style={{
                paddingLeft: '16px',
                paddingRight: '16px',
                paddingTop: '6px',
                paddingBottom: '6px',
                background: 'white',
                borderRadius: '4px',
                border: '1px solid #dee2e6',
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
              onClick={handleConfirmDeleteBank}
              style={{
                paddingLeft: '16px',
                paddingRight: '16px',
                paddingTop: '6px',
                paddingBottom: '6px',
                background: '#228be6',
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

// Personnel table component for tabs
interface PersonnelTableProps {
  contactList: Contact[];
  onEdit: (contact: Contact, index: number) => void;
  onDelete: (contact: Contact, index: number) => void;
}

function PersonnelTable({ contactList, onEdit, onDelete }: PersonnelTableProps) {
  return (
    <Box mt="20px" pb="25px">
      <Table
        styles={{
          table: {
            backgroundColor: '#ffffff',
          },
          thead: {
            backgroundColor: '#ffffff',
          },
          th: {
            color: '#868e96',
            fontWeight: 400,
            fontSize: '14px',
            lineHeight: '20px',
            padding: '12px 15px',
            borderBottom: '1px solid #dee2e6',
            fontFamily: 'Noto Sans TC, sans-serif',
          },
          td: {
            padding: '12px 15px',
            borderBottom: '1px solid #dee2e6',
            fontSize: '14px',
            fontFamily: 'Noto Sans TC, sans-serif',
            color: '#000000',
          },
        }}
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th>人員名稱</Table.Th>
            <Table.Th>Email</Table.Th>
            <Table.Th style={{ textAlign: 'center', width: '120px' }}>操作</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {contactList.map((contact, index) => (
            <Table.Tr key={index}>
              <Table.Td>{contact.name}</Table.Td>
              <Table.Td>{contact.email}</Table.Td>
              <Table.Td style={{ width: '120px' }}>
                <Group justify="center" gap="8px" wrap="nowrap">
                  <ActionIcon 
                    variant="transparent" 
                    size={20}
                    onClick={() => onEdit(contact, index)}
                    style={{ cursor: 'pointer', minWidth: '20px' }}
                  >
                    <EditIcon />
                  </ActionIcon>
                  <ActionIcon 
                    variant="transparent" 
                    size={20}
                    onClick={() => onDelete(contact, index)}
                    style={{ cursor: 'pointer', minWidth: '20px' }}
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
  )
}