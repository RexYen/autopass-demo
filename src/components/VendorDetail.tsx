import {
  Paper,
  Title,
  Group,
  Button,
  Table,
  Badge,
  ActionIcon,
  Pagination,
  Text,
  Box,
  Tabs,
  Modal,
  TextInput,
  Stack,
  Select,
  Radio,
} from '@mantine/core'
import {
  IconChevronLeft,
  IconPlus,
} from '@tabler/icons-react'
import { useState } from 'react'

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

interface VendorDetailProps {
  vendorName: string;
  onBack: () => void;
}

export function VendorDetail({ vendorName, onBack }: VendorDetailProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedVendorName, setEditedVendorName] = useState(vendorName);
  const [currentVendorName, setCurrentVendorName] = useState(vendorName);
  
  const handleEditName = () => {
    setEditedVendorName(currentVendorName);
    setIsEditingName(true);
  };

  const handleSaveName = () => {
    setCurrentVendorName(editedVendorName);
    setIsEditingName(false);
  };

  const handleCancelEditName = () => {
    setEditedVendorName(currentVendorName);
    setIsEditingName(false);
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
            marginBottom: '28px',
            fontSize: '14px',
            fontFamily: 'Noto Sans TC',
            fontWeight: 400,
            color: '#868E96',
          }}
        >
          返回業者管理列表
        </Button>

        {/* Vendor Name */}
        <Group align="center" gap="12px" style={{ marginBottom: '30px', paddingLeft: '15px' }}>
          <Title
            order={1}
            style={{
              color: 'black',
              fontSize: '32px',
              fontFamily: 'Noto Sans TC',
              fontWeight: 700,
              lineHeight: '40px',
              margin: 0,
            }}
          >
            {currentVendorName}
          </Title>
          <ActionIcon
            variant="light"
            color="blue"
            size={32}
            radius={4}
            onClick={handleEditName}
            style={{
              background: 'rgba(34, 139, 230, 0.12)',
              '&:hover': {
                background: 'rgba(34, 139, 230, 0.2)',
              }
            }}
          >
            <svg width="21" height="20" viewBox="0 0 21 20" fill="none">
              <path 
                fillRule="evenodd" 
                clipRule="evenodd" 
                d="M14.4239 2.42271C14.9083 1.93863 15.5651 1.66669 16.25 1.66669C16.9352 1.66669 17.5923 1.93887 18.0768 2.42335C18.5612 2.90784 18.8334 3.56494 18.8334 4.25011C18.8334 4.93508 18.5614 5.59201 18.0772 6.07646C18.077 6.07659 18.0773 6.07632 18.0772 6.07646L17.0237 7.13368C16.9945 7.17679 16.9608 7.21776 16.9226 7.25594C16.8851 7.2934 16.845 7.32654 16.8028 7.35537L11.0903 13.0883C10.9339 13.2452 10.7215 13.3334 10.5 13.3334H8C7.53976 13.3334 7.16667 12.9603 7.16667 12.5001V10.0001C7.16667 9.77858 7.25487 9.56617 7.4118 9.4098L13.1443 3.69777C13.1732 3.65537 13.2065 3.61505 13.2441 3.57743C13.2824 3.53908 13.3236 3.50525 13.3669 3.47593L14.4232 2.42335C14.4235 2.42314 14.4237 2.42292 14.4239 2.42271ZM13.8427 5.35461L8.83333 10.3462V11.6668H10.1539L15.1455 6.65737L13.8427 5.35461ZM16.3219 5.47675L15.0234 4.1782L15.6018 3.60187C15.7737 3.42994 16.0069 3.33335 16.25 3.33335C16.4931 3.33335 16.7263 3.42994 16.8982 3.60187C17.0702 3.77379 17.1668 4.00697 17.1668 4.25011C17.1668 4.49325 17.0702 4.72643 16.8982 4.89835L16.3219 5.47675ZM3.73223 5.73225C4.20107 5.26341 4.83696 5.00002 5.5 5.00002H6.33333C6.79357 5.00002 7.16667 5.37312 7.16667 5.83335C7.16667 6.29359 6.79357 6.66669 6.33333 6.66669H5.5C5.27899 6.66669 5.06702 6.75448 4.91074 6.91076C4.75446 7.06704 4.66667 7.27901 4.66667 7.50002V15C4.66667 15.221 4.75446 15.433 4.91074 15.5893C5.06702 15.7456 5.27899 15.8334 5.5 15.8334H13C13.221 15.8334 13.433 15.7456 13.5893 15.5893C13.7455 15.433 13.8333 15.221 13.8333 15V14.1667C13.8333 13.7064 14.2064 13.3334 14.6667 13.3334C15.1269 13.3334 15.5 13.7064 15.5 14.1667V15C15.5 15.6631 15.2366 16.2989 14.7678 16.7678C14.2989 17.2366 13.663 17.5 13 17.5H5.5C4.83696 17.5 4.20107 17.2366 3.73223 16.7678C3.26339 16.2989 3 15.6631 3 15V7.50002C3 6.83698 3.26339 6.20109 3.73223 5.73225Z" 
                fill="#228BE6"
              />
            </svg>
          </ActionIcon>
        </Group>

        {/* Contract Management Section */}
        <Paper
          style={{
            width: '100%',
            background: 'white',
            boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.05)',
            borderRadius: '16px',
            marginBottom: '25px',
          }}
        >
          {/* Section Header */}
          <Group justify="space-between" px="25px" py="25px" style={{ paddingLeft: '40px' }}>
            <Title
              order={3}
              style={{
                color: 'black',
                fontSize: '24px',
                fontFamily: 'Noto Sans TC',
                fontWeight: 700,
                lineHeight: '32px',
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
            <Tabs defaultValue="active" variant="default">
              <Tabs.List>
                <Tabs.Tab
                  value="active"
                  style={{
                    color: '#228BE6',
                    fontSize: '12px',
                    fontFamily: 'Noto Sans TC',
                    fontWeight: 400,
                    lineHeight: '16px',
                  }}
                >
                  執行中合約（4）
                </Tabs.Tab>
                <Tabs.Tab
                  value="expired"
                  style={{
                    color: 'black',
                    fontSize: '12px',
                    fontFamily: 'Noto Sans TC',
                    fontWeight: 400,
                    lineHeight: '16px',
                  }}
                >
                  已到期合約（2）
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="active">
                <ContractTable />
              </Tabs.Panel>

              <Tabs.Panel value="expired">
                <ContractTable />
              </Tabs.Panel>
            </Tabs>
          </Box>
        </Paper>

        {/* Contact Info Section */}
        <ContactInfoSection />

        {/* Bank Info Section */}
        <BankInfoSection />

        {/* 編輯業者名稱 Modal */}
        <Modal
          opened={isEditingName}
          onClose={handleCancelEditName}
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
              編輯業者名稱
            </Title>

            <Stack gap="16px">
              <Box>
                <Group gap="0" mb="4px">
                  <Text style={{ color: 'black', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 400, lineHeight: '20px' }}>
                    業者名稱{' '}
                  </Text>
                  <Text style={{ color: '#FA5252', fontSize: '12px', fontFamily: 'Noto Sans TC', fontWeight: 500, lineHeight: '16px' }}>
                    *
                  </Text>
                </Group>

                <TextInput
                  value={editedVendorName}
                  onChange={(event) => setEditedVendorName(event.currentTarget.value)}
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
                    },
                  }}
                />
              </Box>
            </Stack>

            <Group justify="flex-end" gap="16px">
              <Button
                variant="outline"
                onClick={handleCancelEditName}
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
                onClick={handleSaveName}
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
    </div>
  )
}

// Contract table component
function ContractTable() {
  return (
    <Box mt="20px" pb="25px">
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ color: '#868E96', fontSize: '14px' }}>合約類型</Table.Th>
            <Table.Th style={{ color: '#868E96', fontSize: '14px' }}>服務類型</Table.Th>
            <Table.Th style={{ color: '#868E96', fontSize: '14px' }}>適用場站數</Table.Th>
            <Table.Th style={{ color: '#868E96', fontSize: '14px' }}>合約起迄時間</Table.Th>
            <Table.Th style={{ color: '#868E96', fontSize: '14px', textAlign: 'center' }}>操作</Table.Th>
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
                  style={{
                    backgroundColor: `rgba(${
                      contract.type === '停車場' ? '76,110,245' : 
                      contract.type === '加油站' ? '250,82,82' : 
                      '18,184,134'
                    },0.1)`,
                    color: '#212529',
                    fontSize: '12px',
                    borderRadius: '16px',
                  }}
                >
                  {contract.type}
                </Badge>
              </Table.Td>
              <Table.Td style={{ fontSize: '14px', color: 'black' }}>{contract.service}</Table.Td>
              <Table.Td style={{ fontSize: '14px', color: 'black' }}>{contract.stations}</Table.Td>
              <Table.Td style={{ fontSize: '14px', color: 'black' }}>{contract.period}</Table.Td>
              <Table.Td>
                <Group justify="center" gap="15px">
                  <ActionIcon variant="transparent" size="20px">
                    <ViewIcon />
                  </ActionIcon>
                  <ActionIcon variant="transparent" size="20px">
                    <EditIcon />
                  </ActionIcon>
                  <ActionIcon variant="transparent" size="20px">
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
function ContactInfoSection() {
  const [isAddPersonModalOpen, setIsAddPersonModalOpen] = useState(false);
  const [isEditPersonModalOpen, setIsEditPersonModalOpen] = useState(false);
  const [isDeletePersonModalOpen, setIsDeletePersonModalOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [newPerson, setNewPerson] = useState({
    name: '',
    role: '',
    isAccountant: '',
    phone: '',
    email: '',
  });
  const [contactList, setContactList] = useState([
    { name: 'Walter Chang', role: '管理員', isAccountant: '是', phone: '0911111111', email: 'walter51004@pklotcorp.com' },
    { name: 'Rex Yen', role: '檢視者', isAccountant: '否', phone: '02-12345678 #123', email: 'rexyen@pklotcorp.com' },
  ]);

  const handleAddPerson = () => {
    setContactList([...contactList, newPerson]);
    setNewPerson({ name: '', role: '', isAccountant: '', phone: '', email: '' });
    setIsAddPersonModalOpen(false);
  };

  const handleEditPerson = (person: any, index: number) => {
    setSelectedPerson({ ...person, index });
    setNewPerson(person);
    setIsEditPersonModalOpen(true);
  };

  const handleSaveEditPerson = () => {
    const updatedList = [...contactList];
    updatedList[selectedPerson.index] = newPerson;
    setContactList(updatedList);
    setNewPerson({ name: '', role: '', isAccountant: '', phone: '', email: '' });
    setSelectedPerson(null);
    setIsEditPersonModalOpen(false);
  };

  const handleDeletePerson = (person: any, index: number) => {
    setSelectedPerson({ ...person, index });
    setIsDeletePersonModalOpen(true);
  };

  const handleConfirmDeletePerson = () => {
    const updatedList = contactList.filter((_, index) => index !== selectedPerson.index);
    setContactList(updatedList);
    setSelectedPerson(null);
    setIsDeletePersonModalOpen(false);
  };

  const handleCancelModal = () => {
    setNewPerson({ name: '', role: '', isAccountant: '', phone: '', email: '' });
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
            fontSize: '24px',
            fontFamily: 'Noto Sans TC',
            fontWeight: 700,
            lineHeight: '32px',
          }}
        >
          聯絡資訊與權限管理
        </Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => setIsAddPersonModalOpen(true)}
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
      </Group>

      <Box px="15px" pb="20px">
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ color: '#868E96', fontSize: '14px' }}>聯絡人名稱</Table.Th>
              <Table.Th style={{ color: '#868E96', fontSize: '14px' }}>後台權限</Table.Th>
              <Table.Th style={{ color: '#868E96', fontSize: '14px' }}>是否為會計</Table.Th>
              <Table.Th style={{ color: '#868E96', fontSize: '14px' }}>聯絡電話</Table.Th>
              <Table.Th style={{ color: '#868E96', fontSize: '14px' }}>Email</Table.Th>
              <Table.Th style={{ color: '#868E96', fontSize: '14px', textAlign: 'center' }}>操作</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {contactList.map((contact, index) => (
              <Table.Tr key={index}>
                <Table.Td style={{ fontSize: '14px', color: 'black' }}>{contact.name}</Table.Td>
                <Table.Td>
                  <Badge
                    style={{
                      backgroundColor: 'rgba(134, 142, 150, 0.10)',
                      color: '#212529',
                      fontSize: '12px',
                      borderRadius: '16px',
                    }}
                  >
                    {contact.role}
                  </Badge>
                </Table.Td>
                <Table.Td style={{ fontSize: '14px', color: 'black' }}>{contact.isAccountant}</Table.Td>
                <Table.Td style={{ fontSize: '14px', color: 'black' }}>{contact.phone}</Table.Td>
                <Table.Td style={{ fontSize: '14px', color: 'black' }}>{contact.email}</Table.Td>
                <Table.Td>
                  <Group justify="center" gap="15px">
                    <ActionIcon 
                      variant="transparent" 
                      size="20px"
                      onClick={() => handleEditPerson(contact, index)}
                    >
                      <EditIcon />
                    </ActionIcon>
                    <ActionIcon 
                      variant="transparent" 
                      size="20px"
                      onClick={() => handleDeletePerson(contact, index)}
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

      {/* 新增人員 Modal */}
      <Modal
        opened={isAddPersonModalOpen}
        onClose={handleCancelModal}
        title=""
        centered
        size="md"
        padding="24px"
        styles={{
          content: { background: 'white', boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.05)', borderRadius: '4px' },
          header: { display: 'none' },
          body: { paddingTop: '24px' },
        }}
      >
        <Stack gap="24px">
          <Title order={4} style={{ color: 'black', fontSize: '16px', fontFamily: 'Noto Sans TC', fontWeight: 700, lineHeight: '20px' }}>
            新增人員
          </Title>
          <Stack gap="16px">
            <Box>
              <Group gap="0" mb="4px">
                <Text style={{ color: 'black', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 400, lineHeight: '20px' }}>聯絡人名稱 </Text>
                <Text style={{ color: '#FA5252', fontSize: '12px', fontFamily: 'Noto Sans TC', fontWeight: 500, lineHeight: '16px' }}>*</Text>
              </Group>
              <TextInput
                placeholder="請輸入聯絡人名稱"
                value={newPerson.name}
                onChange={(event) => setNewPerson({ ...newPerson, name: event.currentTarget.value })}
                styles={{ input: { paddingLeft: '12px', paddingRight: '12px', paddingTop: '6px', paddingBottom: '6px', background: 'white', borderRadius: '4px', border: '1px solid #DEE2E6', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 400, lineHeight: '20px', '&::placeholder': { color: '#ADB5BD' } } }}
              />
            </Box>
            <Box>
              <Group gap="0" mb="4px">
                <Text style={{ color: 'black', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 400, lineHeight: '20px' }}>後台權限 </Text>
                <Text style={{ color: '#FA5252', fontSize: '12px', fontFamily: 'Noto Sans TC', fontWeight: 500, lineHeight: '16px' }}>*</Text>
              </Group>
              <Select
                placeholder="請選擇後台權限"
                value={newPerson.role}
                onChange={(value) => setNewPerson({ ...newPerson, role: value || '' })}
                data={[{ value: '管理員', label: '管理員' },{ value: '編輯者', label: '編輯者' }, { value: '檢視者', label: '檢視者' }]}
                styles={{ input: { paddingLeft: '12px', paddingRight: '12px', paddingTop: '6px', paddingBottom: '6px', background: 'white', borderRadius: '4px', border: '1px solid #DEE2E6', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 400, lineHeight: '20px' } }}
              />
            </Box>
            <Box>
              <Group gap="0" mb="4px">
                <Text style={{ color: 'black', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 400, lineHeight: '20px' }}>是否為會計 </Text>
                <Text style={{ color: '#FA5252', fontSize: '12px', fontFamily: 'Noto Sans TC', fontWeight: 500, lineHeight: '16px' }}>*</Text>
              </Group>
              <Select
                placeholder="請選擇是否為會計"
                value={newPerson.isAccountant}
                onChange={(value) => setNewPerson({ ...newPerson, isAccountant: value || '' })}
                data={[{ value: '是', label: '是' }, { value: '否', label: '否' }]}
                styles={{ input: { paddingLeft: '12px', paddingRight: '12px', paddingTop: '6px', paddingBottom: '6px', background: 'white', borderRadius: '4px', border: '1px solid #DEE2E6', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 400, lineHeight: '20px' } }}
              />
            </Box>
            <Box>
              <Group gap="0" mb="4px">
                <Text style={{ color: 'black', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 400, lineHeight: '20px' }}>聯絡電話 </Text>
                <Text style={{ color: '#FA5252', fontSize: '12px', fontFamily: 'Noto Sans TC', fontWeight: 500, lineHeight: '16px' }}>*</Text>
              </Group>
              <TextInput
                placeholder="請輸入聯絡電話"
                value={newPerson.phone}
                onChange={(event) => setNewPerson({ ...newPerson, phone: event.currentTarget.value })}
                styles={{ input: { paddingLeft: '12px', paddingRight: '12px', paddingTop: '6px', paddingBottom: '6px', background: 'white', borderRadius: '4px', border: '1px solid #DEE2E6', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 400, lineHeight: '20px', '&::placeholder': { color: '#ADB5BD' } } }}
              />
            </Box>
            <Box>
              <Group gap="0" mb="4px">
                <Text style={{ color: 'black', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 400, lineHeight: '20px' }}>Email </Text>
                <Text style={{ color: '#FA5252', fontSize: '12px', fontFamily: 'Noto Sans TC', fontWeight: 500, lineHeight: '16px' }}>*</Text>
              </Group>
              <TextInput
                placeholder="請輸入Email"
                value={newPerson.email}
                onChange={(event) => setNewPerson({ ...newPerson, email: event.currentTarget.value })}
                styles={{ input: { paddingLeft: '12px', paddingRight: '12px', paddingTop: '6px', paddingBottom: '6px', background: 'white', borderRadius: '4px', border: '1px solid #DEE2E6', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 400, lineHeight: '20px', '&::placeholder': { color: '#ADB5BD' } } }}
              />
            </Box>
          </Stack>
          <Group justify="flex-end" gap="16px">
            <Button variant="outline" onClick={handleCancelModal} style={{ paddingLeft: '16px', paddingRight: '16px', paddingTop: '6px', paddingBottom: '6px', background: 'white', borderRadius: '4px', border: '1px solid #DEE2E6', color: '#212529', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 400, lineHeight: '20px' }}>取消</Button>
            <Button onClick={handleAddPerson} style={{ paddingLeft: '16px', paddingRight: '16px', paddingTop: '6px', paddingBottom: '6px', background: '#228BE6', borderRadius: '4px', color: 'white', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 400, lineHeight: '20px' }}>新增</Button>
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
          content: { background: 'white', boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.05)', borderRadius: '4px' },
          header: { display: 'none' },
          body: { paddingTop: '24px' },
        }}
      >
        <Stack gap="24px">
          <Title order={4} style={{ color: 'black', fontSize: '16px', fontFamily: 'Noto Sans TC', fontWeight: 700, lineHeight: '20px' }}>
            編輯人員
          </Title>
          <Stack gap="16px">
            <Box>
              <Group gap="0" mb="4px">
                <Text style={{ color: 'black', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 400, lineHeight: '20px' }}>聯絡人名稱 </Text>
                <Text style={{ color: '#FA5252', fontSize: '12px', fontFamily: 'Noto Sans TC', fontWeight: 500, lineHeight: '16px' }}>*</Text>
              </Group>
              <TextInput
                value={newPerson.name}
                onChange={(event) => setNewPerson({ ...newPerson, name: event.currentTarget.value })}
                styles={{ input: { paddingLeft: '12px', paddingRight: '12px', paddingTop: '6px', paddingBottom: '6px', background: 'white', borderRadius: '4px', border: '1px solid #DEE2E6', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 400, lineHeight: '20px' } }}
              />
            </Box>
            <Box>
              <Group gap="0" mb="4px">
                <Text style={{ color: 'black', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 400, lineHeight: '20px' }}>後台權限 </Text>
                <Text style={{ color: '#FA5252', fontSize: '12px', fontFamily: 'Noto Sans TC', fontWeight: 500, lineHeight: '16px' }}>*</Text>
              </Group>
              <Select
                value={newPerson.role}
                onChange={(value) => setNewPerson({ ...newPerson, role: value || '' })}
                data={[{ value: '管理員', label: '管理員' },{ value: '編輯者', label: '編輯者' }, { value: '檢視者', label: '檢視者' }]}
                styles={{ input: { paddingLeft: '12px', paddingRight: '12px', paddingTop: '6px', paddingBottom: '6px', background: 'white', borderRadius: '4px', border: '1px solid #DEE2E6', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 400, lineHeight: '20px' } }}
              />
            </Box>
            <Box>
              <Group gap="0" mb="4px">
                <Text style={{ color: 'black', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 400, lineHeight: '20px' }}>是否為會計 </Text>
                <Text style={{ color: '#FA5252', fontSize: '12px', fontFamily: 'Noto Sans TC', fontWeight: 500, lineHeight: '16px' }}>*</Text>
              </Group>
              <Select
                value={newPerson.isAccountant}
                onChange={(value) => setNewPerson({ ...newPerson, isAccountant: value || '' })}
                data={[{ value: '是', label: '是' }, { value: '否', label: '否' }]}
                styles={{ input: { paddingLeft: '12px', paddingRight: '12px', paddingTop: '6px', paddingBottom: '6px', background: 'white', borderRadius: '4px', border: '1px solid #DEE2E6', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 400, lineHeight: '20px' } }}
              />
            </Box>
            <Box>
              <Group gap="0" mb="4px">
                <Text style={{ color: 'black', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 400, lineHeight: '20px' }}>聯絡電話 </Text>
                <Text style={{ color: '#FA5252', fontSize: '12px', fontFamily: 'Noto Sans TC', fontWeight: 500, lineHeight: '16px' }}>*</Text>
              </Group>
              <TextInput
                value={newPerson.phone}
                onChange={(event) => setNewPerson({ ...newPerson, phone: event.currentTarget.value })}
                styles={{ input: { paddingLeft: '12px', paddingRight: '12px', paddingTop: '6px', paddingBottom: '6px', background: 'white', borderRadius: '4px', border: '1px solid #DEE2E6', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 400, lineHeight: '20px' } }}
              />
            </Box>
            <Box>
              <Group gap="0" mb="4px">
                <Text style={{ color: 'black', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 400, lineHeight: '20px' }}>Email </Text>
                <Text style={{ color: '#FA5252', fontSize: '12px', fontFamily: 'Noto Sans TC', fontWeight: 500, lineHeight: '16px' }}>*</Text>
              </Group>
              <TextInput
                value={newPerson.email}
                onChange={(event) => setNewPerson({ ...newPerson, email: event.currentTarget.value })}
                styles={{ input: { paddingLeft: '12px', paddingRight: '12px', paddingTop: '6px', paddingBottom: '6px', background: 'white', borderRadius: '4px', border: '1px solid #DEE2E6', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 400, lineHeight: '20px' } }}
              />
            </Box>
          </Stack>
          <Group justify="flex-end" gap="16px">
            <Button variant="outline" onClick={handleCancelModal} style={{ paddingLeft: '16px', paddingRight: '16px', paddingTop: '6px', paddingBottom: '6px', background: 'white', borderRadius: '4px', border: '1px solid #DEE2E6', color: '#212529', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 400, lineHeight: '20px' }}>取消</Button>
            <Button onClick={handleSaveEditPerson} style={{ paddingLeft: '16px', paddingRight: '16px', paddingTop: '6px', paddingBottom: '6px', background: '#228BE6', borderRadius: '4px', color: 'white', fontSize: '14px', fontFamily: 'Noto Sans TC', fontWeight: 400, lineHeight: '20px' }}>確認</Button>
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
function BankInfoSection() {
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
            fontSize: '24px',
            fontFamily: 'Noto Sans TC',
            fontWeight: 700,
            lineHeight: '32px',
          }}
        >
          匯款資訊
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
          新增人員
        </Button>
      </Group>

      <Box px="15px" pb="20px">
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ color: '#868E96', fontSize: '14px' }}>人員名稱</Table.Th>
              <Table.Th style={{ color: '#868E96', fontSize: '14px' }}>後台權限</Table.Th>
              <Table.Th style={{ color: '#868E96', fontSize: '14px' }}>是否為會計</Table.Th>
              <Table.Th style={{ color: '#868E96', fontSize: '14px' }}>聯絡電話</Table.Th>
              <Table.Th style={{ color: '#868E96', fontSize: '14px' }}>Email</Table.Th>
              <Table.Th style={{ color: '#868E96', fontSize: '14px', textAlign: 'center' }}>操作</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {[
              { name: 'Walter Chang', role: '管理員', isAccountant: '是', phone: '0911111111', email: 'walter51004@pklotcorp.com' },
              { name: 'Rex Yen', role: '檢視者', isAccountant: '否', phone: '02-12345678 #123', email: 'rexyen@pklotcorp.com' },
            ].map((contact, index) => (
              <Table.Tr key={index}>
                <Table.Td style={{ fontSize: '14px', color: 'black' }}>{contact.name}</Table.Td>
                <Table.Td>
                  <Badge
                    style={{
                      backgroundColor: 'rgba(134, 142, 150, 0.10)',
                      color: '#212529',
                      fontSize: '12px',
                      borderRadius: '16px',
                    }}
                  >
                    {contact.role}
                  </Badge>
                </Table.Td>
                <Table.Td style={{ fontSize: '14px', color: 'black' }}>{contact.isAccountant}</Table.Td>
                <Table.Td style={{ fontSize: '14px', color: 'black' }}>{contact.phone}</Table.Td>
                <Table.Td style={{ fontSize: '14px', color: 'black' }}>{contact.email}</Table.Td>
                <Table.Td>
                  <Group justify="center" gap="15px">
                    <ActionIcon variant="transparent" size="20px">
                      <EditIcon />
                    </ActionIcon>
                    <ActionIcon variant="transparent" size="20px">
                      <DeleteIcon />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Box>
    </Paper>
  )
}