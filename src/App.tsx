import { useState } from 'react'
import { AppShell } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { VendorManagement } from './components/VendorManagement'
import { VendorDetail } from './components/VendorDetail'
import { MapManagement } from './components/MapManagement'
import { StoreManagement } from './components/StoreManagement'
import { Navigation } from './components/Navigation'
import { NotificationProvider } from './hooks/useNotification'

type CurrentView = 'vendor-list' | 'vendor-detail' | 'map-management' | 'store-management'

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
      case 'store-management':
        return <StoreManagement 
          onViewVendor={(vendorId) => {
            // 根據vendorId找到對應的業者名稱並跳轉到業者詳情
            const vendorNames = ['世潮企業股份有限公司', '經國能源股份有限公司平鎮分公司', '連展電能科技股份有限公司', '車容坊股份有限公司鳳壹營業所', '坤業加油站有限公司莒光路營業所'];
            const vendorName = vendorNames[vendorId - 1];
            if (vendorName) {
              handleViewVendor(vendorName);
            }
          }}
          onViewPlace={(placeId) => {
            // 跳轉到地圖管理頁面
            setCurrentView('map-management');
          }}
          onViewStore={(storeId) => {
            // TODO: 實現商店詳情頁面
            console.log('Navigate to store detail:', storeId);
          }}
        />;
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
