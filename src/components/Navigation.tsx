import { useState } from 'react'
import { 
  Stack, 
  NavLink,
  Box,
  Badge,
} from '@mantine/core'
import {
  IconBrandAsana,
  IconAddressBook, 
  IconMap2,
  IconBuildingStore,
  IconReportMoney,
  IconChevronDown,
} from '@tabler/icons-react'

// Logo image
const autopassLogo = "/autopass.png"

interface NavigationProps {
  currentView?: string;
  onNavigate?: (view: 'vendor-list' | 'map-management' | 'store-management' | 'task-management') => void;
}

export function Navigation({ currentView, onNavigate }: NavigationProps) {
  const getActiveKey = () => {
    switch (currentView) {
      case 'vendor-list':
      case 'vendor-detail':
        return 'vendors';
      case 'map-management':
        return 'maps';
      case 'store-management':
        return 'stores';
      case 'task-management':
        return 'tasks';
      default:
        return 'vendors';
    }
  };

  const [active, setActive] = useState(getActiveKey())

  return (
    <Stack gap={0} h="100%" style={{ height: '901px' }}>
      {/* Logo 區域 - 純展示，不可點擊 */}
      <Box
        mx="12px"
        mb="0"
        style={{
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px',
          backgroundColor: '#ffffff',
          borderRadius: '4px',
          width: 'calc(100% - 24px)', // 確保不會超出容器寬度
          maxWidth: '216px',
          minWidth: '192px', // 設定最小寬度避免太窄
          overflow: 'hidden', // 防止內容溢出
        }}
      >
        <img 
          src={autopassLogo} 
          alt="Autopass" 
          style={{ 
            height: '40px',
            width: 'auto',
            maxWidth: '140px', // 增加 logo 最大寬度
            objectFit: 'contain',
            flexShrink: 0, // 防止 logo 被壓縮
            imageRendering: 'crisp-edges', // 改善PNG解析度
          }} 
        />
        <Badge
          variant="light"
          size="sm"
          styles={{
            root: {
              backgroundColor: 'rgba(34,139,230,0.1)',
              color: '#228be6',
              fontSize: '12px',
              fontWeight: 500,
              lineHeight: '16px',
              fontFamily: 'Noto Sans TC, sans-serif',
              borderRadius: '16px',
              padding: '2px 12px',
              border: 'none',
              flexShrink: 0, // 防止 badge 被壓縮
              whiteSpace: 'nowrap', // 防止文字換行
            }
          }}
        >
          v2.0.0
        </Badge>
      </Box>

      {/* 導航項目區域 */}
      <Stack gap={0} px="12px">
        {/* 任務管理 */}
        <NavLink
          href="#"
          label="任務管理"
          leftSection={<IconBrandAsana size={16} />}
          active={active === 'tasks'}
          onClick={() => {
            setActive('tasks');
            onNavigate?.('task-management');
          }}
          styles={{
            root: {
              borderRadius: 4,
              padding: '12px',
              height: '50px',
              width: '216px',
              display: 'flex',
              alignItems: 'center',
              marginBottom: 0,
              backgroundColor: active === 'tasks' ? 'rgba(34,139,230,0.1)' : '#ffffff',
              color: active === 'tasks' ? '#228be6' : '#000000',
            },
            label: {
              fontWeight: 700,
              fontSize: '14px',
              lineHeight: '20px',
              fontFamily: 'Noto Sans TC, sans-serif',
            },
            section: {
              marginRight: '12px',
            }
          }}
        />

        {/* 業者管理 - 當前選中 */}
        <NavLink
          href="#"
          label="業者管理"
          leftSection={<IconAddressBook size={16} />}
          active={active === 'vendors'}
          onClick={() => {
            setActive('vendors');
            onNavigate?.('vendor-list');
          }}
          styles={{
            root: {
              borderRadius: 4,
              padding: '12px',
              height: '50px',
              width: '216px',
              display: 'flex',
              alignItems: 'center',
              marginBottom: 0,
              backgroundColor: active === 'vendors' ? 'rgba(34,139,230,0.1)' : '#ffffff',
              color: active === 'vendors' ? '#228be6' : '#000000',
            },
            label: {
              fontWeight: 700,
              fontSize: '14px',
              lineHeight: '20px',
              fontFamily: 'Noto Sans TC, sans-serif',
            },
            section: {
              marginRight: '12px',
            }
          }}
        />

        {/* 圖資管理 */}
        <NavLink
          href="#"
          label="圖資管理"
          leftSection={<IconMap2 size={16} />}
          active={active === 'maps'}
          onClick={() => {
            setActive('maps');
            onNavigate?.('map-management');
          }}
          styles={{
            root: {
              borderRadius: 4,
              padding: '12px',
              height: '50px',
              width: '216px',
              display: 'flex',
              alignItems: 'center',
              marginBottom: 0,
              backgroundColor: active === 'maps' ? 'rgba(34,139,230,0.1)' : '#ffffff',
              color: active === 'maps' ? '#228be6' : '#000000',
            },
            label: {
              fontWeight: 700,
              fontSize: '14px',
              lineHeight: '20px',
              fontFamily: 'Noto Sans TC, sans-serif',
            },
            section: {
              marginRight: '12px',
            }
          }}
        />

        {/* 商店管理 */}
        <NavLink
          href="#"
          label="商店管理"
          leftSection={<IconBuildingStore size={16} />}
          active={active === 'stores'}
          onClick={() => {
            setActive('stores');
            onNavigate?.('store-management');
          }}
          styles={{
            root: {
              borderRadius: 4,
              padding: '12px',
              height: '50px',
              width: '216px',
              display: 'flex',
              alignItems: 'center',
              marginBottom: 0,
              backgroundColor: active === 'stores' ? 'rgba(34,139,230,0.1)' : '#ffffff',
              color: active === 'stores' ? '#228be6' : '#000000',
            },
            label: {
              fontWeight: 700,
              fontSize: '14px',
              lineHeight: '20px',
              fontFamily: 'Noto Sans TC, sans-serif',
            },
            section: {
              marginRight: '12px',
            }
          }}
        />

        {/* 財務管理 */}
        <NavLink
          href="#"
          label="財務管理"
          leftSection={<IconReportMoney size={16} />}
          rightSection={<IconChevronDown size={16} />}
          active={active === 'finance'}
          onClick={() => setActive('finance')}
          styles={{
            root: {
              borderRadius: 4,
              padding: '12px',
              height: '50px',
              width: '216px',
              display: 'flex',
              alignItems: 'center',
              marginBottom: 0,
              backgroundColor: active === 'finance' ? 'rgba(34,139,230,0.1)' : '#ffffff',
              color: active === 'finance' ? '#228be6' : '#000000',
            },
            label: {
              fontWeight: 700,
              fontSize: '14px',
              lineHeight: '20px',
              fontFamily: 'Noto Sans TC, sans-serif',
            },
            section: {
              marginRight: '12px',
            }
          }}
        />
      </Stack>
    </Stack>
  )
}