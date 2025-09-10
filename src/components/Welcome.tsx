import {
  Paper,
  Title,
  Text,
  Group,
  Stack,
  Grid,
  Badge,
  Card,
  Button,
  Container,
  ThemeIcon,
  SimpleGrid,
  Progress,
  Center,
  Divider,
} from '@mantine/core'
import {
  IconUsers,
  IconMap2,
  IconBuildingStore,
  IconReportMoney,
  IconClock,
  IconCheck,
  IconTrendingUp,
  IconSettings,
  IconBell,
  IconShield,
} from '@tabler/icons-react'

interface WelcomeProps {
  onNavigate?: (view: 'vendor-list' | 'map-management' | 'store-management' | 'task-management') => void;
}

// 簡單的圖表組件
function SimpleChart() {
  const data = [
    { day: '週一', hours: 6.5, label: '6.5h' },
    { day: '週二', hours: 8.2, label: '8.2h' },
    { day: '週三', hours: 7.8, label: '7.8h' },
    { day: '週四', hours: 9.1, label: '9.1h' },
    { day: '週五', hours: 7.3, label: '7.3h' },
    { day: '週六', hours: 4.2, label: '4.2h' },
    { day: '週日', hours: 3.8, label: '3.8h' },
  ];

  const maxHours = Math.max(...data.map(d => d.hours));

  return (
    <div style={{ width: '100%', height: '200px', position: 'relative' }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'end', 
        justifyContent: 'space-between',
        height: '160px',
        paddingBottom: '20px',
        gap: '8px'
      }}>
        {data.map((item, index) => (
          <div key={item.day} style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            flex: 1,
            position: 'relative'
          }}>
            <div
              style={{
                width: '100%',
                maxWidth: '32px',
                height: `${(item.hours / maxHours) * 120}px`,
                background: `linear-gradient(135deg, #667eea ${index * 10}%, #764ba2 ${100 - index * 5}%)`,
                borderRadius: '4px 4px 0 0',
                position: 'relative',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                position: 'absolute',
                top: '-25px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,0.8)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '10px',
                whiteSpace: 'nowrap',
                opacity: 0,
                transition: 'opacity 0.3s ease',
                pointerEvents: 'none',
                zIndex: 10,
              }} className="tooltip">
                {item.label}
              </div>
            </div>
            <Text size="xs" mt="8px" c="dimmed" fw={500}>
              {item.day}
            </Text>
          </div>
        ))}
      </div>
      
      <style>{`
        .tooltip {
          opacity: 0;
        }
        div:hover .tooltip {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}

export function Welcome({ onNavigate }: WelcomeProps) {
  const systemStats = [
    {
      title: '業者管理',
      value: '12',
      icon: IconUsers,
      color: '#4c6ef5',
      description: '已註冊業者',
      trend: '+2 本月',
    },
    {
      title: '圖資管理',
      value: '85',
      icon: IconMap2,
      color: '#12b886',
      description: '場站位置',
      trend: '+5 本週',
    },
    {
      title: '商店管理',
      value: '156',
      icon: IconBuildingStore,
      color: '#fd7e14',
      description: '營運商店',
      trend: '+8 本月',
    },
    {
      title: '任務管理',
      value: '23',
      icon: IconReportMoney,
      color: '#e03131',
      description: '待處理任務',
      trend: '-3 今日',
    },
  ];

  const quickActions = [
    {
      title: '業者管理',
      description: '管理充電站業者資訊',
      icon: IconUsers,
      color: '#4c6ef5',
      action: () => onNavigate?.('vendor-list'),
    },
    {
      title: '圖資管理',
      description: '查看場站地理位置',
      icon: IconMap2,
      color: '#12b886',
      action: () => onNavigate?.('map-management'),
    },
    {
      title: '商店管理',
      description: '管理商店營運狀況',
      icon: IconBuildingStore,
      color: '#fd7e14',
      action: () => onNavigate?.('store-management'),
    },
    {
      title: '任務管理',
      description: '處理系統任務',
      icon: IconReportMoney,
      color: '#e03131',
      action: () => onNavigate?.('task-management'),
    },
  ];

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* 歡迎標題區塊 */}
        <Paper
          p="xl"
          radius="lg"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '200px',
              height: '200px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              transform: 'translate(50%, -50%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '150px',
              height: '150px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '50%',
              transform: 'translate(-50%, 50%)',
            }}
          />
          
          <Stack gap="md" style={{ position: 'relative', zIndex: 1 }}>
            <Group justify="space-between" align="flex-start">
              <div>
                <Title order={1} size="h1" mb="sm">
                  歡迎系統管理員
                </Title>
                <Title order={2} size="h2" c="rgba(255,255,255,0.9)" fw={400}>
                  來到 Autopass v2.0.0-demo
                </Title>
                <Text size="lg" mt="md" c="rgba(255,255,255,0.8)">
                  智慧充電站管理平台 - 統一管理您的充電基礎設施
                </Text>
              </div>
              <Badge
                size="lg"
                variant="light"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                }}
              >
                DEMO 版本
              </Badge>
            </Group>
            
            <Group mt="xl">
              <Group gap="xs">
                <ThemeIcon size="sm" radius="xl" color="green">
                  <IconCheck size={12} />
                </ThemeIcon>
                <Text size="sm" c="rgba(255,255,255,0.9)">系統運行正常</Text>
              </Group>
              <Group gap="xs">
                <ThemeIcon size="sm" radius="xl" color="blue">
                  <IconShield size={12} />
                </ThemeIcon>
                <Text size="sm" c="rgba(255,255,255,0.9)">安全連線</Text>
              </Group>
              <Group gap="xs">
                <ThemeIcon size="sm" radius="xl" color="orange">
                  <IconClock size={12} />
                </ThemeIcon>
                <Text size="sm" c="rgba(255,255,255,0.9)">
                  最後更新：{new Date().toLocaleDateString('zh-TW')}
                </Text>
              </Group>
            </Group>
          </Stack>
        </Paper>

        {/* 統計數據卡片 */}
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
          {systemStats.map((stat) => (
            <Card key={stat.title} shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="md">
                <ThemeIcon size="lg" radius="md" style={{ backgroundColor: `${stat.color}15` }}>
                  <stat.icon style={{ color: stat.color }} size={24} />
                </ThemeIcon>
                <Badge
                  size="sm"
                  variant="light"
                  color={stat.trend.startsWith('+') ? 'green' : stat.trend.startsWith('-') ? 'red' : 'blue'}
                >
                  {stat.trend}
                </Badge>
              </Group>
              
              <Text size="lg" fw={700} mb="xs">
                {stat.value}
              </Text>
              <Text size="sm" c="dimmed" mb="xs">
                {stat.title}
              </Text>
              <Text size="xs" c="dimmed">
                {stat.description}
              </Text>
              
              <Progress
                value={75}
                size="xs"
                mt="md"
                color={stat.color}
                style={{ opacity: 0.6 }}
              />
            </Card>
          ))}
        </SimpleGrid>

        {/* 系統狀態總覽 */}
        <Grid gutter="lg">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Paper p="lg" radius="md" withBorder>
              <Group justify="space-between" mb="md">
                <Title order={3} size="h4">系統狀態總覽</Title>
                <Badge color="green" variant="light">
                  <Group gap={4}>
                    <IconTrendingUp size={12} />
                    運行良好
                  </Group>
                </Badge>
              </Group>
              
              <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                <div>
                  <Text size="sm" c="dimmed" mb="xs">系統負載</Text>
                  <Progress value={65} size="md" color="blue" mb="xs" />
                  <Text size="xs" c="dimmed">65% - 正常</Text>
                </div>
                <div>
                  <Text size="sm" c="dimmed" mb="xs">存儲使用</Text>
                  <Progress value={42} size="md" color="green" mb="xs" />
                  <Text size="xs" c="dimmed">42% - 良好</Text>
                </div>
                <div>
                  <Text size="sm" c="dimmed" mb="xs">網路狀態</Text>
                  <Progress value={88} size="md" color="orange" mb="xs" />
                  <Text size="xs" c="dimmed">88% - 優秀</Text>
                </div>
              </SimpleGrid>
              
              <Divider my="lg" />
              
              {/* 每日使用時間圖表 */}
              <div>
                <Group justify="space-between" mb="md">
                  <div>
                    <Text size="sm" fw={600} mb="xs">每日後台使用時間</Text>
                    <Text size="xs" c="dimmed">本週系統管理員活躍度統計</Text>
                  </div>
                  <Badge color="blue" variant="light" size="sm">
                    週平均 6.7h
                  </Badge>
                </Group>
                <SimpleChart />
              </div>
            </Paper>
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Paper p="lg" radius="md" withBorder h="100%" style={{ position: 'relative' }}>
              <Group justify="space-between" mb="lg">
                <Group gap="xs">
                  <Title order={3} size="h4">通知中心</Title>
                  <Badge size="xs" color="red" variant="filled" 
                    style={{ 
                      minWidth: '16px', 
                      height: '16px', 
                      padding: 0,
                      fontSize: '10px',
                      borderRadius: '8px',
                    }}
                  >
                    3
                  </Badge>
                </Group>
                <ThemeIcon size="md" radius="xl" variant="light" color="blue">
                  <IconBell size={16} />
                </ThemeIcon>
              </Group>
              
              <Stack gap="md">
                {/* 新業者註冊申請 */}
                <Paper p="sm" radius="md" style={{ 
                  backgroundColor: '#f8f9ff',
                  border: '1px solid #e7f5ff',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#eef2ff';
                  e.currentTarget.style.borderColor = '#d0ebff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9ff';
                  e.currentTarget.style.borderColor = '#e7f5ff';
                }}
                >
                  <div style={{ 
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#228be6',
                  }} />
                  <Group gap="sm" wrap="nowrap">
                    <ThemeIcon size="sm" radius="md" variant="light" color="blue">
                      <IconUsers size={12} />
                    </ThemeIcon>
                    <div style={{ flex: 1 }}>
                      <Text size="sm" fw={500} lineClamp={1}>新業者註冊申請</Text>
                      <Text size="xs" c="dimmed">連展電能科技申請加入平台</Text>
                      <Text size="xs" c="blue" mt={2}>2 小時前</Text>
                    </div>
                  </Group>
                </Paper>

                {/* 系統更新完成 */}
                <Paper p="sm" radius="md" style={{ 
                  backgroundColor: '#f3faf3',
                  border: '1px solid #d3f9d8',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e6f7e6';
                  e.currentTarget.style.borderColor = '#b2f2bb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3faf3';
                  e.currentTarget.style.borderColor = '#d3f9d8';
                }}
                >
                  <Group gap="sm" wrap="nowrap">
                    <ThemeIcon size="sm" radius="md" variant="light" color="green">
                      <IconCheck size={12} />
                    </ThemeIcon>
                    <div style={{ flex: 1 }}>
                      <Text size="sm" fw={500} lineClamp={1}>系統更新完成</Text>
                      <Text size="xs" c="dimmed">v2.0.0 更新已成功部署</Text>
                      <Text size="xs" c="green" mt={2}>6 小時前</Text>
                    </div>
                  </Group>
                </Paper>

                {/* 維護計畫提醒 */}
                <Paper p="sm" radius="md" style={{ 
                  backgroundColor: '#fff8e1',
                  border: '1px solid #ffe8cc',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#fff3cd';
                  e.currentTarget.style.borderColor = '#ffd8a8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#fff8e1';
                  e.currentTarget.style.borderColor = '#ffe8cc';
                }}
                >
                  <Group gap="sm" wrap="nowrap">
                    <ThemeIcon size="sm" radius="md" variant="light" color="orange">
                      <IconClock size={12} />
                    </ThemeIcon>
                    <div style={{ flex: 1 }}>
                      <Text size="sm" fw={500} lineClamp={1}>維護計畫提醒</Text>
                      <Text size="xs" c="dimmed">定期維護將於明日凌晨進行</Text>
                      <Text size="xs" c="orange" mt={2}>1 天前</Text>
                    </div>
                  </Group>
                </Paper>
                
                <Center mt="md">
                  <Button 
                    variant="light" 
                    size="sm" 
                    fullWidth
                    style={{
                      borderRadius: '8px',
                      height: '36px',
                    }}
                  >
                    查看全部通知
                  </Button>
                </Center>
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>

        {/* 快捷導航 */}
        <Paper p="lg" radius="md" withBorder>
          <Title order={3} size="h4" mb="md">快捷導航</Title>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
            {quickActions.map((action) => (
              <Button
                key={action.title}
                variant="light"
                size="lg"
                leftSection={<action.icon size={20} />}
                onClick={action.action}
                style={{
                  height: 'auto',
                  padding: '16px',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                }}
                styles={{
                  inner: {
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                  },
                  label: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '4px',
                  },
                }}
              >
                <Text fw={600} size="sm">{action.title}</Text>
                <Text size="xs" c="dimmed" fw={400}>
                  {action.description}
                </Text>
              </Button>
            ))}
          </SimpleGrid>
        </Paper>

        {/* 版權資訊 */}
        <Paper p="md" radius="md" style={{ backgroundColor: '#f8f9fa' }}>
          <Center>
            <Group>
              <ThemeIcon size="sm" radius="xl" variant="light">
                <IconSettings size={12} />
              </ThemeIcon>
              <Text size="sm" c="dimmed">
                Autopass v2.0.0-demo © 2025
              </Text>
            </Group>
          </Center>
        </Paper>
      </Stack>
    </Container>
  );
}