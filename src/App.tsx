import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
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

function MemberPortalLayout() {
  return (
    <ProtectedRoute allowedUserType="member">
      <PendingPaymentGate>
        <MemberLayout>
          <Outlet />
        </MemberLayout>
      </PendingPaymentGate>
    </ProtectedRoute>
  );
}

function StaffLayout() {
  return (
    <ProtectedRoute allowedUserType="staff">
      <DashboardLayout>
        <Outlet />
      </DashboardLayout>
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
      <Route path="/member" element={<MemberPortalLayout />}>
        <Route index element={<MemberDashboardPage />} />
        <Route path="profile" element={<MemberProfilePage />} />
        <Route path="membership" element={<MemberMembershipPage />} />
        <Route path="services" element={<MemberServicesPage />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="jobs" element={<JobsPage />} />
        <Route path="certificates" element={<CertificatesPage />} />
        <Route path="cancel" element={<CancelPage />} />
      </Route>

      {/* Staff routes — single auth gate + layout */}
      <Route path="/staff" element={<StaffLayout />}>
        <Route index element={<StaffDashboardPage />} />
        <Route path="members" element={<MembersPage />} />
        <Route path="members/:id" element={<MemberDetailPage />} />
        <Route path="engineers" element={<EngineersPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="emails" element={<EmailLogsPage />} />
        <Route path="team" element={<StaffPage />} />
      </Route>

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
