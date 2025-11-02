import { Button } from './ui/button';
import { 
  LayoutDashboard, 
  Users, 
  DollarSign,
  Building2,
  Activity,
  LogOut,
  X,
  Check
} from 'lucide-react';
import { useAdmin } from './admin-context-new';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import Group1 from '../imports/Group1-47-1099';

const menuItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    page: 'dashboard' as const,
  },
  {
    id: 'deposits',
    label: 'Deposits',
    icon: DollarSign,
    page: 'deposits' as const,
  },
  {
    id: 'bank-deposits',
    label: 'Bank Deposits',
    icon: Building2,
    page: 'bank-deposits' as const,
  },
  {
    id: 'staff-management',
    label: 'Staff Management',
    icon: Users,
    page: 'staff-management' as const,
  },
  {
    id: 'activity',
    label: 'Activity Logs',
    icon: Activity,
    page: 'activity' as const,
  },
];

export function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const { currentPage, setCurrentPage, logout, user, loadData } = useAdmin();
  
  // Helper to check if user has view permission for a module
  const canViewModule = (moduleName: 'dashboard' | 'deposits' | 'bankDeposits' | 'staffManagement') => {
    if (!user || !user.permissions) return false;
    return user.permissions[moduleName]?.view || false;
  };

  const handleNavigation = async (page: typeof currentPage) => {
    setCurrentPage(page);
    // Refresh data when navigating to ensure latest updates are shown
    await loadData();
    // Close mobile menu after navigation
    if (onClose) {
      onClose();
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-gray-900 text-white h-full flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 flex-1 overflow-y-auto scrollbar-hide">
        {/* Logo Placeholder - Add your logo here */}

        <nav className="space-y-2">
          {menuItems.map((item) => {
            // Hide Dashboard for staff users without permission
            if (item.id === 'dashboard' && !canViewModule('dashboard')) {
              return null;
            }
            // Hide Deposits for users without view permission
            if (item.id === 'deposits' && !canViewModule('deposits')) {
              return null;
            }
            // Hide Bank Deposits for users without view permission
            if (item.id === 'bank-deposits' && !canViewModule('bankDeposits')) {
              return null;
            }
            // Hide Staff Management for users without permission
            if (item.id === 'staff-management' && !canViewModule('staffManagement')) {
              return null;
            }
            // Hide Activity Logs for users without activity permission
            if (item.id === 'activity') {
              const hasActivityPermission = user?.permissions?.dashboard?.activity || 
                                           user?.permissions?.deposits?.activity || 
                                           user?.permissions?.bankDeposits?.activity;
              if (!hasActivityPermission) {
                return null;
              }
            }

            const Icon = item.icon;
            const isActive = currentPage === item.page;
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={`w-full justify-start text-left ${
                  isActive 
                    ? 'bg-[#6a40ec] text-white hover:bg-[#6a40ec] hover:text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
                onClick={() => handleNavigation(item.page)}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
        </nav>
      </div>
      
      {/* Fixed Logout Button at Bottom */}
      <div className="p-4 border-t border-gray-700 space-y-2 flex-shrink-0">
        
        {/* Logout Button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start text-left text-gray-300 hover:text-white hover:bg-gray-800"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Logout
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
              <AlertDialogDescription>
                You will be redirected to the login page and need to sign in again to access your account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="justify-center gap-3">
              <AlertDialogCancel className="min-w-[120px]">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 min-w-[120px]"
              >
                <Check className="w-4 h-4 mr-2" />
                Yes, Logout
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </aside>
    </>
  );
}