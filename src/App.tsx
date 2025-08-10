import { AppShell } from '@mantine/core'
import { VendorManagement } from './components/VendorManagement'
import { Navigation } from './components/Navigation'

function App() {
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
        }
      }}
    >
      <AppShell.Navbar p={0}>
        <Navigation />
      </AppShell.Navbar>

      <AppShell.Main>
        <VendorManagement />
      </AppShell.Main>
    </AppShell>
  )
}

export default App
