import { useState } from 'react'
import { AppShell } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { VendorManagement } from './components/VendorManagement'
import { VendorDetail } from './components/VendorDetail'
import { MapManagement } from './components/MapManagement'
import { StoreManagement } from './components/StoreManagement'
import { TaskManagement } from './components/TaskManagement'
import { Navigation } from './components/Navigation'
import { Welcome } from './components/Welcome'
import { AutopassDashboard } from './components/AutopassDashboard'
import { AutopassTickets } from './components/AutopassTickets'
import { AutopassTicketDetail } from './components/AutopassTicketDetail'
import { NotificationProvider } from './hooks/useNotification'
import type { TicketStatus } from './types/autopass'

type CurrentView =
  | 'welcome'
  | 'vendor-list'
  | 'vendor-detail'
  | 'map-management'
  | 'store-management'
  | 'task-management'
  | 'autopass-dashboard'
  | 'autopass-tickets'
  | 'autopass-ticket-detail'
  | 'autopass-history'

function App() {
  const [currentView, setCurrentView] = useState<CurrentView>('autopass-dashboard')
  const [selectedVendorName, setSelectedVendorName] = useState<string>('')
  const [isNewVendor, setIsNewVendor] = useState<boolean>(false)
  const [selectedTicketId, setSelectedTicketId] = useState<string>('')
  const [ticketsInitialFilter, setTicketsInitialFilter] = useState<TicketStatus | undefined>()
  const [ticketReturnView, setTicketReturnView] = useState<'autopass-tickets' | 'autopass-history'>(
    'autopass-tickets',
  )

  const handleViewVendor = (vendorName: string, isNew: boolean = false) => {
    setSelectedVendorName(vendorName)
    setIsNewVendor(isNew)
    setCurrentView('vendor-detail')
  }

  const handleBackToList = () => {
    setCurrentView('vendor-list')
    setSelectedVendorName('')
    setIsNewVendor(false)
  }

  const handleNavigate = (view: Exclude<CurrentView, 'vendor-detail' | 'autopass-ticket-detail'>) => {
    setCurrentView(view)
    if (view !== 'autopass-tickets') {
      setTicketsInitialFilter(undefined)
    }
    setSelectedVendorName('')
    setIsNewVendor(false)
  }

  const handleJumpToTickets = (filterStatus?: TicketStatus) => {
    setTicketsInitialFilter(filterStatus)
    setCurrentView('autopass-tickets')
  }

  const handleViewTicket = (ticketId: string, fromView: 'autopass-tickets' | 'autopass-history' = 'autopass-tickets') => {
    setSelectedTicketId(ticketId)
    setTicketReturnView(fromView)
    setCurrentView('autopass-ticket-detail')
  }

  const handleBackToTickets = () => {
    setCurrentView(ticketReturnView)
    setSelectedTicketId('')
  }

  const renderMainContent = () => {
    switch (currentView) {
      case 'welcome':
        return <Welcome onNavigate={handleNavigate} />
      case 'vendor-detail':
        return (
          <VendorDetail
            vendorName={selectedVendorName}
            onBack={handleBackToList}
            isNewVendor={isNewVendor}
          />
        )
      case 'map-management':
        return <MapManagement />
      case 'task-management':
        return <TaskManagement />
      case 'store-management':
        return (
          <StoreManagement
            onViewVendor={(vendorId) => {
              const vendorNames = [
                '世潮企業股份有限公司',
                '經國能源股份有限公司平鎮分公司',
                '連展電能科技股份有限公司',
                '車容坊股份有限公司鳳壹營業所',
                '坤業加油站有限公司莒光路營業所',
              ]
              const vendorName = vendorNames[vendorId - 1]
              if (vendorName) handleViewVendor(vendorName)
            }}
            onViewPlace={() => setCurrentView('map-management')}
            onViewStore={(storeId) => {
              console.log('Navigate to store detail:', storeId)
            }}
          />
        )
      case 'vendor-list':
        return <VendorManagement onViewVendor={handleViewVendor} />
      case 'autopass-dashboard':
        return <AutopassDashboard onJumpToTickets={handleJumpToTickets} />
      case 'autopass-tickets':
        return (
          <AutopassTickets
            onViewDetail={(id) => handleViewTicket(id, 'autopass-tickets')}
            initialStatusFilter={ticketsInitialFilter}
          />
        )
      case 'autopass-ticket-detail':
        return (
          <AutopassTicketDetail
            ticketId={selectedTicketId}
            onBack={handleBackToTickets}
          />
        )
      case 'autopass-history':
        return (
          <AutopassTickets
            onViewDetail={(id) => handleViewTicket(id, 'autopass-history')}
            mode="history"
          />
        )
      default:
        return <AutopassDashboard onJumpToTickets={handleJumpToTickets} />
    }
  }

  return (
    <NotificationProvider>
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

        <AppShell.Main>{renderMainContent()}</AppShell.Main>
      </AppShell>
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
