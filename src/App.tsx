import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MemberLayout } from '@/components/layout/MemberLayout';
import { DashboardPage as StaffDashboardPage } from '@/pages/staff/dashboard';
import { MembersPage } from '@/pages/staff/members';
import { EngineersPage } from '@/pages/staff/engineers';
import { BookingsPage } from '@/pages/staff/bookings';
import { StaffPage } from '@/pages/staff/team';
import { MemberDashboardPage } from '@/pages/members/dashboard';
import { MemberProfilePage } from '@/pages/members/profile';
import { MemberMembershipPage } from '@/pages/members/membership';
import { MemberServicesPage } from '@/pages/members/services';
import { BillingPage } from '@/pages/members/billing';
import { JobsPage } from '@/pages/members/jobs';
import { CertificatesPage } from '@/pages/members/certificates';
import { CancelPage } from '@/pages/members/cancel';
import { LoginPage } from '@/pages/common/auth/LoginPage';
import { VerifyPage } from '@/pages/common/auth/VerifyPage';
import { SignupPlanPage } from '@/pages/common/signup/plan';
import { SignupDetailsPage } from '@/pages/common/signup/details';
import { SignupConfirmMatchPage } from '@/pages/common/signup/confirm-match';
import { SignupPaymentPage } from '@/pages/common/signup/payment';
import { SignupConfirmPage } from '@/pages/common/signup/confirm';
import { SignupDonePage } from '@/pages/common/signup/done';
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

      {/* Signup wizard routes */}
      <Route path="/join/plan" element={<SignupPlanPage />} />
      <Route path="/join/details" element={<SignupDetailsPage />} />
      <Route path="/join/confirm-match" element={<SignupConfirmMatchPage />} />
      <Route path="/join/payment" element={<SignupPaymentPage />} />
      <Route path="/join/confirm" element={<SignupConfirmPage />} />
      <Route path="/join/done" element={<SignupDonePage />} />

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
      <Route
        path="/member/profile"
        element={
          <ProtectedRoute allowedUserType="member">
            <MemberLayout>
              <MemberProfilePage />
            </MemberLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/member/membership"
        element={
          <ProtectedRoute allowedUserType="member">
            <MemberLayout>
              <MemberMembershipPage />
            </MemberLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/member/services"
        element={
          <ProtectedRoute allowedUserType="member">
            <MemberLayout>
              <MemberServicesPage />
            </MemberLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/member/billing"
        element={
          <ProtectedRoute allowedUserType="member">
            <MemberLayout>
              <BillingPage />
            </MemberLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/member/jobs"
        element={
          <ProtectedRoute allowedUserType="member">
            <MemberLayout>
              <JobsPage />
            </MemberLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/member/certificates"
        element={
          <ProtectedRoute allowedUserType="member">
            <MemberLayout>
              <CertificatesPage />
            </MemberLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/member/cancel"
        element={
          <ProtectedRoute allowedUserType="member">
            <MemberLayout>
              <CancelPage />
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
        path="/staff/engineers"
        element={
          <ProtectedRoute allowedUserType="staff">
            <DashboardLayout>
              <EngineersPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/bookings"
        element={
          <ProtectedRoute allowedUserType="staff">
            <DashboardLayout>
              <BookingsPage />
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
