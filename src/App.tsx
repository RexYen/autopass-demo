import { useState } from 'react'
import { AppShell } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { VendorManagement } from './components/VendorManagement'
import { VendorDetail } from './components/VendorDetail'
import { MapManagement } from './components/MapManagement'
import { Navigation } from './components/Navigation'
import { NotificationProvider } from './hooks/useNotification'

type CurrentView = 'vendor-list' | 'vendor-detail' | 'map-management'

function App() {
  const [currentView, setCurrentView] = useState<CurrentView>('vendor-list');
  const [selectedVendorName, setSelectedVendorName] = useState<string>('');
  const [isNewVendor, setIsNewVendor] = useState<boolean>(false);

  const handleViewVendor = (vendorName: string, isNew: boolean = false) => {
    setSelectedVendorName(vendorName);
    setIsNewVendor(isNew);
    setCurrentView('vendor-detail');
  };

  const handleBackToList = () => {
    setCurrentView('vendor-list');
    setSelectedVendorName('');
    setIsNewVendor(false);
  };

  const handleNavigate = (view: CurrentView) => {
    setCurrentView(view);
    if (view !== 'vendor-detail') {
      setSelectedVendorName('');
      setIsNewVendor(false);
    }
  };

  const renderMainContent = () => {
    switch (currentView) {
      case 'vendor-detail':
        return (
          <VendorDetail 
            vendorName={selectedVendorName}
            onBack={handleBackToList}
            isNewVendor={isNewVendor}
          />
        );
      case 'map-management':
        return <MapManagement />;
      default:
        return <VendorManagement onViewVendor={handleViewVendor} />;
    }
  };

  return (
    <NotificationProvider>
      <AppShell
        navbar={{ width: 240, breakpoint: 'sm', collapsed: { desktop: false } }}
        padding='md'
        styles={{
          main: {
            backgroundColor: '#f8f9fa',
            minHeight: '100vh',
          },
          navbar: {
            backgroundColor: '#ffffff',
            borderRight: 'none',
          }
        }}
      >
        <AppShell.Navbar p={0}>
          <Navigation currentView={currentView} onNavigate={handleNavigate} />
        </AppShell.Navbar>

        <AppShell.Main>
          {renderMainContent()}
        </AppShell.Main>
      </AppShell>
      <Notifications 
        position="bottom-right" 
        styles={{
          root: {
            right: '20px !important',
          }
        }}
      />
    </NotificationProvider>
  )
}

export default App
