import { useState, useEffect } from 'react';
import { AdminProvider, useAdmin, AdminPage } from './components/admin-context-new';
import { LoginPage } from './components/login-page';
import { SignupPage } from './components/signup-page';
import { ForgotPasswordPage } from './components/forgot-password-page';
import { OTPVerificationPage } from './components/otp-verification-page';
import { ChangePasswordPage } from './components/change-password-page';
import { DashboardPage } from './components/dashboard-page';
import { ProfilePage } from './components/profile-page';
import { StaffManagementPage } from './components/staff-management-page';
import { AddStaffPage } from './components/add-staff-page';
import { ActivityPage } from './components/activity-page';
import { FixPermissionsPage } from './components/fix-permissions-page';
import { PermissionFixPage } from './components/permission-fix-page';

import { EnhancedDepositsNew } from './components/enhanced-deposits-new';
import { EnhancedBankDeposits } from './components/enhanced-bank-deposits';
import { Header } from './components/header';
import { Sidebar } from './components/sidebar';
import { Toaster } from './components/ui/sonner';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { currentPage, isAuthenticated, canAccessStaffManagement, canAccessDashboard, isAdmin, setCurrentPage, isLoading } = useAdmin();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showFixPage, setShowFixPage] = useState(false);

  // Check URL for ?fix-permissions query parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('fix-permissions') === 'true') {
      setShowFixPage(true);
    }
  }, []);

  // Show fix permissions page if requested
  if (showFixPage) {
    return <FixPermissionsPage />;
  }

  // Show permission fix page (special case - needs auth but no permissions)
  if (currentPage === 'permission-fix' as any) {
    return <PermissionFixPage />;
  }

  // Show central loading spinner during transitions
  if (isLoading && isAuthenticated) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#6a40ec]/5 to-[#8b5cf6]/5">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#6a40ec]/20 rounded-full"></div>
            <Loader2 className="w-16 h-16 text-[#6a40ec] animate-spin absolute top-0 left-0" />
          </div>
          <p className="text-gray-700 font-medium text-lg">Loading Dashboard...</p>
          <p className="text-gray-500 text-sm">Please wait</p>
        </div>
      </div>
    );
  }

  // Show authentication pages
  if (!isAuthenticated) {
    switch (currentPage) {
      case 'login':
        return <LoginPage />;
      case 'signup':
        return <SignupPage />;
      case 'forgot-password':
        return <ForgotPasswordPage onBackToLogin={() => setCurrentPage('login')} />;
      case 'otp-verification':
        return <OTPVerificationPage />;
      case 'change-password':
        return <ChangePasswordPage />;
      default:
        return <LoginPage />;
    }
  }

  // Show authenticated pages with layout
  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <Header onMenuClick={() => setIsSidebarOpen(true)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-1 overflow-auto">
          {currentPage === 'dashboard' && (
            canAccessDashboard() ? (
              <DashboardPage />
            ) : (
              <div className="p-6">
                <div className="text-center py-12">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                  <p className="text-gray-600 mb-4">You don't have permission to access the Dashboard.</p>
                  <button 
                    onClick={() => setCurrentPage('deposits')}
                    className="bg-[#6a40ec] hover:bg-[#5a2fd9] text-white px-4 py-2 rounded-lg"
                  >
                    Go to Deposits
                  </button>
                </div>
              </div>
            )
          )}
          {currentPage === 'deposits' && <EnhancedDepositsNew />}
          {currentPage === 'bank-deposits' && <EnhancedBankDeposits />}
          {currentPage === 'profile' && <ProfilePage />}
          {currentPage === 'staff-management' && (
            canAccessStaffManagement() ? (
              <StaffManagementPage />
            ) : (
              <div className="p-6">
                <div className="text-center py-12">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                  <p className="text-gray-600 mb-4">You don't have permission to access Staff Management.</p>
                  <button 
                    onClick={() => setCurrentPage('dashboard')}
                    className="bg-[#6a40ec] hover:bg-[#5a2fd9] text-white px-4 py-2 rounded-lg"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            )
          )}
          {currentPage === 'add-staff' && (
            canAccessStaffManagement() ? (
              <AddStaffPage />
            ) : (
              <div className="p-6">
                <div className="text-center py-12">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                  <p className="text-gray-600 mb-4">You don't have permission to add staff members.</p>
                  <button 
                    onClick={() => setCurrentPage('dashboard')}
                    className="bg-[#6a40ec] hover:bg-[#5a2fd9] text-white px-4 py-2 rounded-lg"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            )
          )}
          {currentPage === 'activity' && (
            isAdmin() ? (
              <ActivityPage />
            ) : (
              <div className="p-6">
                <div className="text-center py-12">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                  <p className="text-gray-600 mb-4">You don't have permission to view Activity Logs.</p>
                  <button 
                    onClick={() => setCurrentPage('deposits')}
                    className="bg-[#6a40ec] hover:bg-[#5a2fd9] text-white px-4 py-2 rounded-lg"
                  >
                    Go to Deposits
                  </button>
                </div>
              </div>
            )
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AdminProvider>
      <div className="size-full">
        <AppContent />
        <Toaster position="top-center" expand={true} richColors />
      </div>
    </AdminProvider>
  );
}