import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { DashboardPage } from '@/pages/dashboard'
import { AuthProvider } from '@/contexts/AuthContext'

function App() {
  return (
    <AuthProvider>
      <DashboardLayout>
        <DashboardPage />
      </DashboardLayout>
    </AuthProvider>
  )
}

export default App