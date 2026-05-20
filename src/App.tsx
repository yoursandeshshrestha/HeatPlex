import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MemberLayout } from '@/components/layout/MemberLayout';
import { DashboardPage as StaffDashboardPage } from '@/pages/staff/dashboard';
import { MembersPage } from '@/pages/staff/members';
import { StaffPage } from '@/pages/staff/team';
import { MemberDashboardPage } from '@/pages/members/DashboardPage';
import { LoginPage } from '@/pages/common/auth/LoginPage';
import { VerifyPage } from '@/pages/common/auth/VerifyPage';
import { LoadingScreen } from '@/components/ui/loading-screen';

// Protected route wrapper
function ProtectedRoute({ children, allowedUserType }: { children: React.ReactNode; allowedUserType?: 'member' | 'staff' }) {
  const { user, userType, loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Check if user type matches required type
  if (allowedUserType && userType !== allowedUserType) {
    // Redirect to appropriate dashboard
    return <Navigate to={userType === 'staff' ? '/staff' : '/member'} replace />;
  }

  return <>{children}</>;
}

// Auto-redirect to correct dashboard after login
function DashboardRedirect() {
  const { userType, loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Loading..." />;
  }

  if (userType === 'staff') {
    return <Navigate to="/staff" replace />;
  }

  if (userType === 'member') {
    return <Navigate to="/member" replace />;
  }

  return <Navigate to="/" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/login/verify" element={<VerifyPage />} />

      {/* Auto-redirect to correct dashboard */}
      <Route path="/account" element={<DashboardRedirect />} />

      {/* Member routes */}
      <Route
        path="/member"
        element={
          <ProtectedRoute allowedUserType="member">
            <MemberLayout>
              <MemberDashboardPage />
            </MemberLayout>
          </ProtectedRoute>
        }
      />

      {/* Staff routes */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute allowedUserType="staff">
            <DashboardLayout>
              <StaffDashboardPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/members"
        element={
          <ProtectedRoute allowedUserType="staff">
            <DashboardLayout>
              <MembersPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/team"
        element={
          <ProtectedRoute allowedUserType="staff">
            <DashboardLayout>
              <StaffPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
