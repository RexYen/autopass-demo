import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Stack, NavLink, Box } from '@mantine/core'
import {
  IconBrandAsana,
  IconAddressBook,
  IconMap2,
  IconBuildingStore,
  IconReportMoney,
  IconChevronDown,
  IconClipboardList,
  IconHistory,
  IconFileText,
  IconLicense,
  IconRoad,
  IconSteeringWheel,
} from '@tabler/icons-react'

const autopassLogo = '/autopass.png'

export type NavigationView =
  | 'vendor-list'
  | 'map-management'
  | 'store-management'
  | 'task-management'
  | 'autopass-tickets'
  | 'autopass-history'
  | 'autopass-applications'
  | 'driver-accounts'

interface NavigationProps {
  currentView?: string
  onNavigate?: (view: NavigationView) => void
}

// 通行費自動繳收合群組內的 active key（決定群組預設是否展開）
const AUTOPASS_KEYS = ['autopass-tickets', 'autopass-history', 'autopass-applications']

export function Navigation({ currentView, onNavigate }: NavigationProps) {
  const navigate = useNavigate()
  const getActiveKey = useCallback(() => {
    switch (currentView) {
      case 'vendor-list':
      case 'vendor-detail':
        return 'vendors'
      case 'map-management':
        return 'maps'
      case 'store-management':
        return 'stores'
      case 'task-management':
        return 'tasks'
      case 'autopass-tickets':
      case 'autopass-ticket-detail':
        return 'autopass-tickets'
      case 'autopass-history':
        return 'autopass-history'
      case 'autopass-applications':
        return 'autopass-applications'
      case 'driver-accounts':
        return 'driver-accounts'
      default:
        return 'none'
    }
  }, [currentView])

  const [active, setActive] = useState(getActiveKey())

  React.useEffect(() => {
    setActive(getActiveKey())
  }, [currentView, getActiveKey])

  const navItemStyles = (isActive: boolean) => ({
    root: {
      borderRadius: 4,
      padding: '12px',
      height: '50px',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      marginBottom: 0,
      backgroundColor: isActive ? 'rgba(34,139,230,0.1)' : '#ffffff',
      color: isActive ? '#228be6' : '#000000',
    },
    label: {
      fontWeight: 700,
      fontSize: '14px',
      lineHeight: '20px',
      fontFamily: 'Noto Sans TC, sans-serif',
    },
    section: {
      marginRight: '12px',
    },
  } as const)

  return (
    <Stack gap={0} h="100%" style={{ minHeight: '901px' }}>
      {/* Logo */}
      <Box
        mx="12px"
        mb="0"
        onClick={() => navigate('/')}
        style={{
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px',
          backgroundColor: '#ffffff',
          borderRadius: '4px',
          width: 'calc(100% - 24px)',
          maxWidth: '216px',
          minWidth: '192px',
          overflow: 'hidden',
          cursor: 'pointer',
        }}
      >
        <img
          src={autopassLogo}
          alt="Autopass"
          style={{
            height: '40px',
            width: 'auto',
            maxWidth: '140px',
            objectFit: 'contain',
            flexShrink: 0,
            imageRendering: 'crisp-edges',
          }}
        />
      </Box>

      {/* 扁平選單（無群組小標）；通行費自動繳與駕駛管理為可收合群組 */}
      <Stack gap={0} px="12px" mt="8px">
        <NavLink
          href="#"
          label="任務管理"
          leftSection={<IconBrandAsana size={16} />}
          active={active === 'tasks'}
          onClick={() => {
            setActive('tasks')
            onNavigate?.('task-management')
          }}
          styles={navItemStyles(active === 'tasks')}
        />
        <NavLink
          href="#"
          label="業者管理"
          leftSection={<IconAddressBook size={16} />}
          active={active === 'vendors'}
          onClick={() => {
            setActive('vendors')
            onNavigate?.('vendor-list')
          }}
          styles={navItemStyles(active === 'vendors')}
        />
        <NavLink
          href="#"
          label="圖資管理"
          leftSection={<IconMap2 size={16} />}
          active={active === 'maps'}
          onClick={() => {
            setActive('maps')
            onNavigate?.('map-management')
          }}
          styles={navItemStyles(active === 'maps')}
        />
        <NavLink
          href="#"
          label="商店管理"
          leftSection={<IconBuildingStore size={16} />}
          active={active === 'stores'}
          onClick={() => {
            setActive('stores')
            onNavigate?.('store-management')
          }}
          styles={navItemStyles(active === 'stores')}
        />
        <NavLink
          href="#"
          label="財務管理"
          leftSection={<IconReportMoney size={16} />}
          rightSection={<IconChevronDown size={16} />}
          active={active === 'finance'}
          onClick={() => setActive('finance')}
          styles={navItemStyles(active === 'finance')}
        />

        {/* 通行費自動繳（可收合） */}
        <NavLink
          label="通行費自動繳"
          leftSection={<IconRoad size={16} />}
          childrenOffset={16}
          defaultOpened={AUTOPASS_KEYS.includes(getActiveKey())}
          styles={navItemStyles(false)}
        >
          <NavLink
            href="#"
            label="查繳任務"
            leftSection={<IconClipboardList size={16} />}
            active={active === 'autopass-tickets'}
            onClick={() => {
              setActive('autopass-tickets')
              onNavigate?.('autopass-tickets')
            }}
            styles={navItemStyles(active === 'autopass-tickets')}
          />
          <NavLink
            href="#"
            label="歷史任務"
            leftSection={<IconHistory size={16} />}
            active={active === 'autopass-history'}
            onClick={() => {
              setActive('autopass-history')
              onNavigate?.('autopass-history')
            }}
            styles={navItemStyles(active === 'autopass-history')}
          />
          <NavLink
            href="#"
            label="通行費申請單"
            leftSection={<IconFileText size={16} />}
            active={active === 'autopass-applications'}
            onClick={() => {
              setActive('autopass-applications')
              onNavigate?.('autopass-applications')
            }}
            styles={navItemStyles(active === 'autopass-applications')}
          />
        </NavLink>

        {/* 駕駛管理（可收合） */}
        <NavLink
          label="駕駛管理"
          leftSection={<IconSteeringWheel size={16} />}
          childrenOffset={16}
          defaultOpened={getActiveKey() === 'driver-accounts'}
          styles={navItemStyles(false)}
        >
          <NavLink
            href="#"
            label="行駕照/保單"
            leftSection={<IconLicense size={16} />}
            active={active === 'driver-accounts'}
            onClick={() => {
              setActive('driver-accounts')
              onNavigate?.('driver-accounts')
            }}
            styles={navItemStyles(active === 'driver-accounts')}
          />
        </NavLink>
      </Stack>
    </Stack>
  )
}
