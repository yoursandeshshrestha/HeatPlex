import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MemberLayout } from '@/components/layout/MemberLayout';
import { PendingPaymentGate } from '@/components/auth/PendingPaymentGate';
import { DashboardPage as StaffDashboardPage } from '@/pages/staff/dashboard';
import { MembersPage } from '@/pages/staff/members';
import { MemberDetailPage } from '@/pages/staff/members/detail';
import { EngineersPage } from '@/pages/staff/engineers';
import { BookingsPage } from '@/pages/staff/bookings';
import { EmailLogsPage } from '@/pages/staff/emails';
import { StaffPage } from '@/pages/staff/team';
import { MemberDashboardPage } from '@/pages/members/dashboard';
import { MemberProfilePage } from '@/pages/members/profile';
import { MemberMembershipPage } from '@/pages/members/membership';
import { MemberServicesPage } from '@/pages/members/services';
import { BillingPage } from '@/pages/members/billing';
import { JobsPage } from '@/pages/members/jobs';
import { CertificatesPage } from '@/pages/members/certificates';
import { CancelPage } from '@/pages/members/cancel';
import { CompletePaymentPage } from '@/pages/members/complete-payment';
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

function MemberPortalRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedUserType="member">
      <PendingPaymentGate>
        <MemberLayout>{children}</MemberLayout>
      </PendingPaymentGate>
    </ProtectedRoute>
  );
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
        path="/member/complete-payment"
        element={
          <ProtectedRoute allowedUserType="member">
            <CompletePaymentPage />
          </ProtectedRoute>
        }
      />
      <Route path="/member" element={<MemberPortalRoute><MemberDashboardPage /></MemberPortalRoute>} />
      <Route path="/member/profile" element={<MemberPortalRoute><MemberProfilePage /></MemberPortalRoute>} />
      <Route path="/member/membership" element={<MemberPortalRoute><MemberMembershipPage /></MemberPortalRoute>} />
      <Route path="/member/services" element={<MemberPortalRoute><MemberServicesPage /></MemberPortalRoute>} />
      <Route path="/member/billing" element={<MemberPortalRoute><BillingPage /></MemberPortalRoute>} />
      <Route path="/member/jobs" element={<MemberPortalRoute><JobsPage /></MemberPortalRoute>} />
      <Route path="/member/certificates" element={<MemberPortalRoute><CertificatesPage /></MemberPortalRoute>} />
      <Route path="/member/cancel" element={<MemberPortalRoute><CancelPage /></MemberPortalRoute>} />

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
        path="/staff/members/:id"
        element={
          <ProtectedRoute allowedUserType="staff">
            <DashboardLayout>
              <MemberDetailPage />
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
        path="/staff/emails"
        element={
          <ProtectedRoute allowedUserType="staff">
            <DashboardLayout>
              <EmailLogsPage />
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
