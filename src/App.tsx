import { useState } from 'react'
import { AppShell } from '@mantine/core'
import { VendorManagement } from './components/VendorManagement'
import { VendorDetail } from './components/VendorDetail'
import { Navigation } from './components/Navigation'

type CurrentView = 'vendor-list' | 'vendor-detail'

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
      default:
        return <VendorManagement onViewVendor={handleViewVendor} />;
    }
  };

  return (
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
        <Navigation />
      </AppShell.Navbar>

      <AppShell.Main>
        {renderMainContent()}
      </AppShell.Main>
    </AppShell>
  )
}

export default App
