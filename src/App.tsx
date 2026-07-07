import { AppShell } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { Routes, Route, useNavigate, useParams, Navigate, useLocation } from 'react-router-dom'
import { VendorManagement } from './components/VendorManagement'
import { VendorDetail } from './components/VendorDetail'
import { MapManagement } from './components/MapManagement'
import { StoreManagement } from './components/StoreManagement'
import { TaskManagement } from './components/TaskManagement'
import { Navigation } from './components/Navigation'
import { AutopassTickets } from './components/AutopassTickets'
import { TicketPreview } from './components/TicketPreview'
import { AutopassApplications } from './components/AutopassApplications'
import { DriverCenterAccounts } from './components/DriverCenterAccounts'
import { NotificationProvider } from './hooks/NotificationProvider'

function StoreManagementPage() {
  const navigate = useNavigate()
  const vendorNames = [
    '世潮企業股份有限公司',
    '經國能源股份有限公司平鎮分公司',
    '連展電能科技股份有限公司',
    '車容坊股份有限公司鳳壹營業所',
    '坤業加油站有限公司莒光路營業所',
  ]
  return (
    <StoreManagement
      onViewVendor={(vendorId) => {
        const name = vendorNames[vendorId - 1]
        if (name) navigate(`/vendors/${encodeURIComponent(name)}`)
      }}
      onViewPlace={() => navigate('/map')}
      onViewStore={() => {}}
    />
  )
}

function VendorDetailPage() {
  const { name } = useParams<{ name: string }>()
  const navigate = useNavigate()
  return (
    <VendorDetail
      vendorName={decodeURIComponent(name ?? '')}
      onBack={() => navigate('/vendors')}
      isNewVendor={false}
    />
  )
}

type CurrentView =
  | 'vendor-list'
  | 'vendor-detail'
  | 'map-management'
  | 'store-management'
  | 'task-management'
  | 'autopass-tickets'
  | 'autopass-history'
  | 'autopass-applications'
  | 'driver-accounts'

function AppContent() {
  const navigate = useNavigate()

  const { pathname } = useLocation()

  const pathToView = (path: string): CurrentView => {
    if (path.startsWith('/vendors/')) return 'vendor-detail'
    if (path === '/vendors') return 'vendor-list'
    if (path === '/map') return 'map-management'
    if (path === '/stores') return 'store-management'
    if (path === '/tasks') return 'task-management'
    if (path === '/autopass/tickets') return 'autopass-tickets'
    if (path === '/autopass/history') return 'autopass-history'
    if (path === '/autopass/drivingexpense-applications') return 'autopass-applications'
    if (path === '/driver-center/accounts') return 'driver-accounts'
    return 'autopass-tickets'
  }

  const currentView = pathToView(pathname)

  const handleNavigate = (view: Exclude<CurrentView, 'vendor-detail'>) => {
    const viewToPath: Record<string, string> = {
      'vendor-list': '/vendors',
      'map-management': '/map',
      'store-management': '/stores',
      'task-management': '/tasks',
      'autopass-tickets': '/autopass/tickets',
      'autopass-history': '/autopass/history',
      'autopass-applications': '/autopass/drivingexpense-applications',
      'driver-accounts': '/driver-center/accounts',
    }
    navigate(viewToPath[view] ?? '/autopass/tickets')
  }

  return (
    <AppShell
      navbar={{ width: 240, breakpoint: 'sm', collapsed: { desktop: false } }}
      padding="md"
      styles={{
        main: {
          backgroundColor: '#f8f9fa',
          minHeight: '100vh',
        },
        navbar: {
          backgroundColor: '#ffffff',
          borderRight: 'none',
        },
      }}
    >
      <AppShell.Navbar p={0}>
        <Navigation currentView={currentView} onNavigate={handleNavigate} />
      </AppShell.Navbar>

      <AppShell.Main>
        <Routes>
          <Route path="/" element={<Navigate to="/autopass/tickets" replace />} />
          <Route path="/vendors" element={<VendorManagement onViewVendor={(name) => navigate(`/vendors/${encodeURIComponent(name)}`)} />} />
          <Route path="/vendors/:name" element={<VendorDetailPage />} />
          <Route path="/vendors/new" element={<VendorDetail vendorName="" onBack={() => navigate('/vendors')} isNewVendor={true} />} />
          <Route path="/map" element={<MapManagement />} />
          <Route path="/stores" element={<StoreManagementPage />} />
          <Route path="/tasks" element={<TaskManagement />} />
          <Route path="/autopass/tickets" element={<AutopassTickets />} />
          <Route path="/autopass/tickets/:id" element={<Navigate to="/autopass/tickets" replace />} />
          <Route path="/autopass/history" element={<AutopassTickets mode="history" />} />
          <Route path="/autopass/drivingexpense-applications" element={<AutopassApplications />} />
          <Route path="/driver-center/accounts" element={<DriverCenterAccounts />} />
          <Route path="/preview" element={<TicketPreview />} />
          <Route path="*" element={<Navigate to="/autopass/tickets" replace />} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  )
}

function App() {
  return (
    <NotificationProvider>
      <AppContent />
      <Notifications
        position="bottom-right"
        styles={{
          root: {
            right: '20px !important',
          },
        }}
      />
    </NotificationProvider>
  )
}

export default App
