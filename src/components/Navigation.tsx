import { useState } from 'react'
import { 
  Stack, 
  NavLink,
  Box,
  Group,
} from '@mantine/core'
import {
  IconBrandAsana,
  IconAddressBook, 
  IconMap2,
  IconBuildingStore,
} from '@tabler/icons-react'

export function Navigation() {
  const [active, setActive] = useState('vendors')

  return (
    <Stack gap={0} h="100%" style={{ height: '901px' }}>
      {/* Logo 區域 - 純展示，不可點擊 */}
      <Box
        style={{
          height: '56px',
          width: '240px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '12px',
          backgroundColor: '#ffffff',
        }}
      >
        <Group justify="flex-start" w="100%">
          <img 
            src="/Nav Link.png" 
            alt="Autopass" 
            style={{ 
              height: '42px',
              width: 'auto',
              objectFit: 'contain'
            }} 
          />
        </Group>
      </Box>

      {/* 導航項目區域 */}
      <Stack gap={0} px="12px">
        {/* 任務管理 */}
        <NavLink
          href="#"
          label="任務管理"
          leftSection={<IconBrandAsana size={16} />}
          active={active === 'tasks'}
          onClick={() => setActive('tasks')}
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
          onClick={() => setActive('vendors')}
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
          onClick={() => setActive('maps')}
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
          onClick={() => setActive('stores')}
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
      </Stack>
    </Stack>
  )
}