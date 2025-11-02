import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import * as api from '../utils/api';
import { toast } from 'sonner@2.0.3';

export type AdminPage = 
  | 'login' 
  | 'signup'
  | 'forgot-password' 
  | 'otp-verification' 
  | 'change-password' 
  | 'dashboard' 
  | 'profile' 
  | 'staff-management' 
  | 'add-staff'
  | 'deposits'
  | 'bank-deposits'
  | 'activity';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  permissions?: UserPermissions;
  status?: 'active' | 'inactive';
}

export type ModulePermission = {
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
  activity?: boolean;
};

export type UserPermissions = {
  dashboard: ModulePermission;
  deposits: ModulePermission;
  bankDeposits: ModulePermission;
  staffManagement: ModulePermission;
};

export type UserRole = string;

export interface Staff {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: UserPermissions;
  status: 'active' | 'inactive';
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
  isArchived?: boolean;
  archivedAt?: string;
}

export interface ClientIncentive {
  id: string;
  name: string;
  amount: number;
}

export interface ExpenseItem {
  id: string;
  type: 'Promotion' | 'Salary' | 'Miscellaneous' | 'IB Commission' | 'Travel Expense';
  amount: number;
  description?: string;
}

export interface DepositEntry {
  id: string;
  date: string;
  localDeposit: number;
  usdtDeposit: number;
  cashDeposit: number;
  localWithdraw: number;
  usdtWithdraw: number;
  cashWithdraw: number;
  clientIncentives: ClientIncentive[];
  expenses: ExpenseItem[];
  submittedBy: string;
  submittedByName: string;
}

export interface Bank {
  id: string;
  name: string;
}

export interface BankTransaction {
  id: string;
  date: string;
  bankId: string;
  deposit: number;
  withdraw: number;
  pnl?: number;
  remaining: number;
  remainingBalance?: number;
  submittedBy: string;
  submittedByName: string;
}

export type ActivityType =
  | 'login' 
  | 'logout'
  | 'signup'
  | 'add_staff' 
  | 'edit_staff' 
  | 'delete_staff'
  | 'add_bank' 
  | 'edit_bank' 
  | 'delete_bank'
  | 'add_deposit' 
  | 'edit_deposit' 
  | 'delete_deposit'
  | 'add_bank_deposit'
  | 'edit_bank_deposit'
  | 'delete_bank_deposit'
  | 'add_bank_transaction'
  | 'edit_bank_transaction'
  | 'delete_bank_transaction';

export interface ActivityLog {
  id: string;
  action: ActivityType;
  description: string;
  userId: string;
  userName: string;
  timestamp: string;
  details?: string;
  ipAddress?: string;
}

interface AdminContextType {
  currentPage: AdminPage;
  setCurrentPage: (page: AdminPage) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  staff: Staff[];
  setStaff: (staff: Staff[]) => void;
  roles: { id: string; name: string; permissions: UserPermissions }[];
  setRoles: (roles: { id: string; name: string; permissions: UserPermissions }[]) => void;
  loadRoles: () => Promise<void>;
  otpData: { email: string; purpose: 'forgot-password' | 'verification' } | null;
  setOtpData: (data: { email: string; purpose: 'forgot-password' | 'verification' } | null) => void;
  deposits: DepositEntry[];
  setDeposits: (deposits: DepositEntry[]) => void;
  banks: Bank[];
  setBanks: (banks: Bank[]) => void;
  bankTransactions: BankTransaction[];
  setBankTransactions: (transactions: BankTransaction[]) => void;
  withdrawals: { id: string; date: string; amount: number }[];
  setWithdrawals: (withdrawals: { id: string; date: string; amount: number }[]) => void;
  activityLogs: ActivityLog[];
  addActivityLog: (type: ActivityType, description: string, details?: string) => void;
  isAdmin: () => boolean;
  canViewAllEntries: () => boolean;
  getFilteredDeposits: () => DepositEntry[];
  getFilteredBankTransactions: () => BankTransaction[];
  canAccessStaffManagement: () => boolean;
  canViewDashboardExtras: () => boolean;
  canAccessDashboard: () => boolean;
  getDefaultPageForUser: () => AdminPage;
  // New functions for backend integration
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  loadData: () => Promise<void>;
  isLoading: boolean;
  accountStatus: 'active' | 'deactivated' | 'deleted';
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Create Supabase client (singleton - exported for reuse across app)
export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState<AdminPage>('login');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [otpData, setOtpData] = useState<{ email: string; purpose: 'forgot-password' | 'verification' } | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [roles, setRoles] = useState<{ id: string; name: string; permissions: UserPermissions }[]>([]);
  const [accountStatus, setAccountStatus] = useState<'active' | 'deactivated' | 'deleted'>('active');
  const [deposits, setDeposits] = useState<DepositEntry[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<{ id: string; date: string; amount: number }[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Calculate withdrawals from deposits whenever deposits change
  useEffect(() => {
    const calculatedWithdrawals: { id: string; date: string; amount: number }[] = [];
    
    deposits.forEach((deposit) => {
      const totalWithdraw = deposit.localWithdraw + deposit.usdtWithdraw + deposit.cashWithdraw;
      if (totalWithdraw > 0) {
        calculatedWithdrawals.push({
          id: `withdraw-${deposit.id}`,
          date: deposit.date,
          amount: totalWithdraw,
        });
      }
    });
    
    setWithdrawals(calculatedWithdrawals);
  }, [deposits]);

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  // Periodically check if user is still active (every 30 seconds)
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const interval = setInterval(async () => {
      try {
        const userData = await api.getCurrentUser();
        
        if (!userData?.user) {
          // User deleted or deactivated
          handleAccountStatusError('ACCOUNT_DELETED');
        }
      } catch (error: any) {
        if (error.message?.includes('ACCOUNT_DELETED') || error.message?.includes('ACCOUNT_DEACTIVATED')) {
          handleAccountStatusError(error.message);
        } else if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
          // Session expired or invalid, logout silently
          console.log('Session expired, logging out');
          await logout();
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  async function checkSession() {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      // If there's an error getting session, clear everything
      if (sessionError) {
        console.log('Session error:', sessionError.message);
        await supabase.auth.signOut();
        api.clearAuthToken();
        setIsAuthenticated(false);
        setUser(null);
        setCurrentPage('login');
        setIsLoading(false);
        return;
      }
      
      if (session?.access_token) {
        api.setAuthToken(session.access_token);
        
        try {
          const userData = await api.getCurrentUser();
          
          if (userData?.user) {
            setUser({
              id: userData.user.id,
              name: userData.user.name,
              email: userData.user.email,
              role: userData.user.role,
              permissions: userData.user.permissions,
              status: userData.user.status,
            });
            setIsAuthenticated(true);
            
            // Navigate to default page first
            const defaultPage = getDefaultPageForUserInternal(userData.user);
            setCurrentPage(defaultPage);
            
            // Load data after page is set (pages will show their own loading states)
            await loadData();
          }
        } catch (userError: any) {
          console.log('User verification failed:', userError.message);
          
          // If account is deleted or deactivated, sign out
          if (userError.message?.includes('ACCOUNT_DELETED') || userError.message?.includes('ACCOUNT_DEACTIVATED')) {
            await supabase.auth.signOut();
            api.clearAuthToken();
            handleAccountStatusError(userError.message);
          } else if (userError.message?.includes('No permission')) {
            // Permission error - redirect to fix page but keep session
            console.log('Permission error detected, redirecting to fix page');
            setCurrentPage('permission-fix' as any);
            toast.error('Your account needs permission setup. Please use the fix tool.');
          } else if (userError.message?.includes('Invalid JWT') || userError.message?.includes('jwt')) {
            // Invalid JWT - clear session silently and redirect to login
            console.log('Invalid JWT detected, clearing session');
            await supabase.auth.signOut();
            api.clearAuthToken();
            setIsAuthenticated(false);
            setUser(null);
            setCurrentPage('login');
          } else {
            // For other errors (401, etc), just clear session silently
            await supabase.auth.signOut();
            api.clearAuthToken();
            setIsAuthenticated(false);
            setUser(null);
            setCurrentPage('login');
          }
        }
      } else {
        // No session, ensure we're on login page
        setCurrentPage('login');
      }
    } catch (error: any) {
      console.log('Session check error:', error.message);
      // Clear everything on any error
      await supabase.auth.signOut();
      api.clearAuthToken();
      setIsAuthenticated(false);
      setUser(null);
      setCurrentPage('login');
    } finally {
      setIsLoading(false);
    }
  }

  // Handle account status errors (deleted/deactivated)
  function handleAccountStatusError(errorType: string) {
    if (errorType.includes('ACCOUNT_DELETED')) {
      setAccountStatus('deleted');
      toast.error('Your account has been deleted by the administrator. Please contact support for assistance.', { duration: 6000 });
    } else if (errorType.includes('ACCOUNT_DEACTIVATED')) {
      setAccountStatus('deactivated');
      toast.error('Your account is temporarily deactivated by the administrator. Please contact support to reactivate your account.', { duration: 6000 });
    }
    
    // Logout after 3 seconds
    setTimeout(() => {
      logout();
    }, 3000);
  }

  async function login(email: string, password: string) {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.session?.access_token) {
        api.setAuthToken(data.session.access_token);
        
        // Get user data from backend - this will check if account is active
        try {
          const userData = await api.getCurrentUser();
          
          if (userData?.user) {
            setUser({
              id: userData.user.id,
              name: userData.user.name,
              email: userData.user.email,
              role: userData.user.role,
              permissions: userData.user.permissions,
              status: userData.user.status,
            });
            setIsAuthenticated(true);
            
            // Load all data in background while showing toast
            const loadDataPromise = loadData();
            
            // Show success message and wait for it to be visible
            toast.success('Login successful!', { duration: 2000 });
            
            // Wait for toast to be visible (2 seconds)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Ensure data loading is complete
            await loadDataPromise;
            
            // Navigate to default page
            const defaultPage = getDefaultPageForUserInternal(userData.user);
            setCurrentPage(defaultPage);
            
            // Small delay to ensure page renders, then remove loading
            await new Promise(resolve => setTimeout(resolve, 100));
            setIsLoading(false);
          }
        } catch (userError: any) {
          setIsLoading(false);
          // Handle account status errors - sign out and throw clean error
          await supabase.auth.signOut();
          api.clearAuthToken();
          
          if (userError.message?.includes('ACCOUNT_DELETED')) {
            throw new Error('Your account has been deleted by the administrator. Please contact support for assistance.');
          } else if (userError.message?.includes('ACCOUNT_DEACTIVATED')) {
            throw new Error('Your account is temporarily deactivated by the administrator. Please contact support to reactivate your account.');
          } else {
            throw userError;
          }
        }
      }
    } catch (error: any) {
      setIsLoading(false);
      // Don't show toast here - let the login page handle the error display
      // to avoid duplicate error messages
      throw error;
    }
  }

  async function signup(email: string, password: string, name: string, role: UserRole) {
    try {
      setIsLoading(true);
      
      const result = await api.signUp(email, password, name, role);
      
      if (result?.success) {
        toast.success('Account created successfully! Please login.', { duration: 2000 });
        // Wait for toast to be visible before redirect
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsLoading(false);
      }
      
      return result;
    } catch (error: any) {
      setIsLoading(false);
      // Don't show toast here - let the signup page handle the error display
      // to avoid duplicate error messages
      throw error;
    }
  }

  async function logout() {
    try {
      await supabase.auth.signOut();
      api.clearAuthToken();
      setUser(null);
      setIsAuthenticated(false);
      setStaff([]);
      setDeposits([]);
      setBankTransactions([]);
      setActivityLogs([]);
      setCurrentPage('login');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  }

  async function loadData() {
    try {
      // Load deposits
      const depositsData = await api.getDeposits();
      if (depositsData?.deposits) {
        setDeposits(depositsData.deposits);
      }

      // Load bank deposits
      const bankDepositsData = await api.getBankDeposits();
      if (bankDepositsData?.bankDeposits) {
        setBankTransactions(bankDepositsData.bankDeposits);
      }

      // Load banks
      const banksData = await api.getBanks();
      if (banksData?.banks) {
        setBanks(banksData.banks);
      }

      // Load staff
      const staffData = await api.getStaff();
      if (staffData?.staff) {
        setStaff(staffData.staff);
      }

      // Load roles
      await loadRoles();

      // Load activities
      const activitiesData = await api.getActivities();
      if (activitiesData?.activities) {
        setActivityLogs(activitiesData.activities);
      }
    } catch (error: any) {
      console.log('Load data error:', error.message);
      
      // If JWT is invalid during data load, logout
      if (error.message?.includes('Invalid JWT') || error.message?.includes('jwt') || error.message?.includes('401')) {
        console.log('Invalid session during data load, logging out');
        await logout();
      }
    }
  }

  async function loadRoles() {
    try {
      const rolesData = await api.getRoles();
      if (rolesData?.roles) {
        setRoles(rolesData.roles);
      }
    } catch (error: any) {
      console.log('Load roles error:', error.message);
    }
  }

  const addActivityLog = (type: ActivityType, description: string, details?: string) => {
    // Activity logs are now handled by backend
    // This is kept for backward compatibility
    console.log('Activity logged:', type, description, details);
  };

  // Helper functions
  function getDefaultPageForUserInternal(userData: any): AdminPage {
    if (!userData) return 'login';
    
    // Check if user has dashboard view permission
    if (userData.permissions?.dashboard?.view) {
      return 'dashboard';
    }
    return 'deposits';
  }

  const isAdmin = () => {
    return user?.role === 'Super Admin' || user?.role === 'Admin';
  };

  const canViewAllEntries = () => {
    return isAdmin();
  };

  const canAccessStaffManagement = () => {
    if (!user) return false;
    const currentStaff = staff.find(s => s.id === user.id);
    return currentStaff?.permissions.staffManagement.view || false;
  };

  const canViewDashboardExtras = () => {
    return user?.role === 'Super Admin' || user?.role === 'Admin' || user?.role === 'Manager';
  };

  const canAccessDashboard = () => {
    if (!user) return false;
    // Check if user has dashboard view permission
    return user.permissions?.dashboard?.view || false;
  };

  const getDefaultPageForUser = (): AdminPage => {
    if (!user) return 'login';
    if (canAccessDashboard()) {
      return 'dashboard';
    }
    return 'deposits';
  };

  const getFilteredDeposits = () => {
    if (canViewAllEntries()) {
      return deposits;
    }
    return deposits.filter(deposit => deposit.submittedBy === user?.id);
  };

  const getFilteredBankTransactions = () => {
    if (canViewAllEntries()) {
      return bankTransactions;
    }
    return bankTransactions.filter(transaction => transaction.submittedBy === user?.id);
  };

  return (
    <AdminContext.Provider value={{
      currentPage,
      setCurrentPage,
      user,
      setUser,
      isAuthenticated,
      setIsAuthenticated,
      staff,
      setStaff,
      otpData,
      setOtpData,
      deposits,
      setDeposits,
      banks,
      setBanks,
      bankTransactions,
      setBankTransactions,
      withdrawals,
      setWithdrawals,
      activityLogs,
      addActivityLog,
      isAdmin,
      canViewAllEntries,
      getFilteredDeposits,
      getFilteredBankTransactions,
      canAccessStaffManagement,
      canViewDashboardExtras,
      canAccessDashboard,
      getDefaultPageForUser,
      login,
      logout,
      signup,
      loadData,
      roles,
      setRoles,
      loadRoles,
      isLoading,
      accountStatus,
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
