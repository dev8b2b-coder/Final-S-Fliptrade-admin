import React, { createContext, useContext, useState, ReactNode } from 'react';

export type AdminPage = 
  | 'login' 
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
}

export type ModulePermission = {
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
};

export type UserPermissions = {
  dashboard: ModulePermission;
  deposits: ModulePermission;
  bankDeposits: ModulePermission;
  staffManagement: ModulePermission;
};

export type UserRole = 'Super Admin' | 'Admin' | 'Manager' | 'Accountant' | 'Viewer';

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
  submittedBy: string; // Staff member ID who submitted this entry
  submittedByName: string; // Staff member name for display
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
  pnl?: number; // Profit and Loss amount
  remaining: number;
  remainingBalance?: number; // For backward compatibility
  submittedBy: string; // Staff member ID who submitted this entry
  submittedByName: string; // Staff member name for display
}

export type ActivityType = 
  | 'login' 
  | 'logout'
  | 'add_staff' 
  | 'edit_staff' 
  | 'delete_staff'
  | 'add_bank' 
  | 'edit_bank' 
  | 'delete_bank'
  | 'add_deposit' 
  | 'edit_deposit' 
  | 'delete_deposit'
  | 'add_bank_transaction'
  | 'edit_bank_transaction'
  | 'delete_bank_transaction';

export interface ActivityLog {
  id: string;
  type: ActivityType;
  description: string;
  userId: string;
  userName: string;
  ipAddress: string;
  timestamp: string;
  details?: string;
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
  // Helper functions for role-based access
  isAdmin: () => boolean;
  canViewAllEntries: () => boolean;
  getFilteredDeposits: () => DepositEntry[];
  getFilteredBankTransactions: () => BankTransaction[];
  canAccessStaffManagement: () => boolean;
  canViewDashboardExtras: () => boolean;
  canAccessDashboard: () => boolean;
  getDefaultPageForUser: () => AdminPage;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState<AdminPage>('login');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [otpData, setOtpData] = useState<{ email: string; purpose: 'forgot-password' | 'verification' } | null>(null);
  const [staff, setStaff] = useState<Staff[]>([
    {
      id: '1',
      name: 'John Smith',
      email: 'john@example.com',
      role: 'Super Admin',
      permissions: {
        dashboard: { view: true, add: false, edit: false, delete: false },
        deposits: { view: true, add: true, edit: true, delete: true },
        bankDeposits: { view: true, add: true, edit: true, delete: true },
        staffManagement: { view: true, add: true, edit: true, delete: true },
      },
      status: 'active',
      createdAt: '2024-01-15',
      lastLogin: '2024-01-20',
      isArchived: false,
    },
    {
      id: '2', 
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      role: 'Manager',
      permissions: {
        dashboard: { view: true, add: false, edit: false, delete: false },
        deposits: { view: true, add: true, edit: true, delete: false },
        bankDeposits: { view: true, add: true, edit: false, delete: false },
        staffManagement: { view: true, add: true, edit: true, delete: false },
      },
      status: 'active',
      createdAt: '2024-02-01',
      lastLogin: '2024-01-19',
      isArchived: false,
    },
    {
      id: '3',
      name: 'Mike Davis',
      email: 'mike@example.com', 
      role: 'Accountant',
      permissions: {
        dashboard: { view: false, add: false, edit: false, delete: false },
        deposits: { view: true, add: true, edit: true, delete: false },
        bankDeposits: { view: true, add: true, edit: true, delete: false },
        staffManagement: { view: false, add: false, edit: false, delete: false },
      },
      status: 'active',
      createdAt: '2024-01-28',
      lastLogin: '2024-01-18',
      isArchived: false,
    },
    {
      id: '4',
      name: 'Emma Wilson',
      email: 'emma@example.com', 
      role: 'Viewer',
      permissions: {
        dashboard: { view: false, add: false, edit: false, delete: false },
        deposits: { view: true, add: true, edit: false, delete: false },
        bankDeposits: { view: true, add: true, edit: false, delete: false },
        staffManagement: { view: false, add: false, edit: false, delete: false },
      },
      status: 'active',
      createdAt: '2024-01-10',
      lastLogin: '2024-01-15',
      isArchived: false,
    },
  ]);

  const [deposits, setDeposits] = useState<DepositEntry[]>([
    {
      id: '1',
      date: '2024-01-20',
      localDeposit: 75000,
      usdtDeposit: 45000,
      cashDeposit: 25000,
      localWithdraw: 0,
      usdtWithdraw: 0,
      cashWithdraw: 0,
      clientIncentives: [
        { id: '1', name: 'John Doe', amount: 8000 },
        { id: '2', name: 'Alice Johnson', amount: 5500 },
        { id: '3', name: 'Robert Chen', amount: 4200 }
      ],
      expenses: [
        { id: '1', type: 'Salary', amount: 12000, description: 'Monthly salary payments - January' },
        { id: '2', type: 'Promotion', amount: 3500, description: 'Social media advertising campaign' }
      ],
      submittedBy: '2',
      submittedByName: 'Sarah Johnson',
    },
    {
      id: '2',
      date: '2024-01-20',
      localDeposit: 60000,
      usdtDeposit: 35000,
      cashDeposit: 18000,
      localWithdraw: 0,
      usdtWithdraw: 0,
      cashWithdraw: 0,
      clientIncentives: [
        { id: '4', name: 'Maria Garcia', amount: 6000 },
        { id: '5', name: 'David Kim', amount: 4800 }
      ],
      expenses: [
        { id: '3', type: 'IB Commission', amount: 8500, description: 'Q1 IB commission payments' },
        { id: '4', type: 'Miscellaneous', amount: 2200, description: 'Office supplies and utilities' }
      ],
      submittedBy: '3',
      submittedByName: 'Mike Davis',
    },
    {
      id: '3',
      date: '2024-01-19',
      localDeposit: 92000,
      usdtDeposit: 28000,
      cashDeposit: 32000,
      localWithdraw: 0,
      usdtWithdraw: 0,
      cashWithdraw: 0,
      clientIncentives: [
        { id: '6', name: 'Jennifer Wilson', amount: 7500 },
        { id: '7', name: 'Michael Brown', amount: 6200 },
        { id: '8', name: 'Lisa Taylor', amount: 3800 },
        { id: '9', name: 'James Anderson', amount: 5100 }
      ],
      expenses: [
        { id: '5', type: 'Travel Expense', amount: 4500, description: 'Client meeting travel costs' },
        { id: '6', type: 'Promotion', amount: 6800, description: 'Trade show participation' }
      ],
      submittedBy: '1',
      submittedByName: 'John Smith',
    },
    {
      id: '4',
      date: '2024-01-19',
      localDeposit: 38000,
      usdtDeposit: 22000,
      cashDeposit: 15000,
      localWithdraw: 0,
      usdtWithdraw: 0,
      cashWithdraw: 0,
      clientIncentives: [
        { id: '10', name: 'Christopher Lee', amount: 4200 },
        { id: '11', name: 'Amanda White', amount: 3600 }
      ],
      expenses: [
        { id: '7', type: 'Salary', amount: 9500, description: 'Part-time staff salaries' }
      ],
      submittedBy: '2',
      submittedByName: 'Sarah Johnson',
    },
    {
      id: '5',
      date: '2024-01-18',
      localDeposit: 48000,
      usdtDeposit: 55000,
      cashDeposit: 12000,
      localWithdraw: 0,
      usdtWithdraw: 0,
      cashWithdraw: 0,
      clientIncentives: [
        { id: '12', name: 'Thomas Martinez', amount: 5800 },
        { id: '13', name: 'Sarah Davis', amount: 4100 }
      ],
      expenses: [
        { id: '8', type: 'IB Commission', amount: 11200, description: 'Monthly IB commissions' },
        { id: '9', type: 'Miscellaneous', amount: 1800, description: 'Software licenses renewal' }
      ],
      submittedBy: '3',
      submittedByName: 'Mike Davis',
    },
    {
      id: '6',
      date: '2024-01-18',
      localDeposit: 65000,
      usdtDeposit: 18000,
      cashDeposit: 28000,
      localWithdraw: 0,
      usdtWithdraw: 0,
      cashWithdraw: 0,
      clientIncentives: [
        { id: '14', name: 'Patricia Johnson', amount: 6500 },
        { id: '15', name: 'Kevin Rodriguez', amount: 4900 },
        { id: '16', name: 'Nicole Thompson', amount: 3700 }
      ],
      expenses: [
        { id: '10', type: 'Travel Expense', amount: 3200, description: 'Regional conference attendance' },
        { id: '11', type: 'Promotion', amount: 4800, description: 'Email marketing campaign' }
      ],
      submittedBy: '1',
      submittedByName: 'John Smith',
    },
    {
      id: '7',
      date: '2024-01-17',
      localDeposit: 82000,
      usdtDeposit: 41000,
      cashDeposit: 19000,
      localWithdraw: 0,
      usdtWithdraw: 0,
      cashWithdraw: 0,
      clientIncentives: [
        { id: '17', name: 'Daniel Wilson', amount: 8200 },
        { id: '18', name: 'Michelle Garcia', amount: 5600 },
        { id: '19', name: 'Ryan Clark', amount: 4300 }
      ],
      expenses: [
        { id: '12', type: 'Salary', amount: 15500, description: 'Senior staff bonus payments' },
        { id: '13', type: 'Miscellaneous', amount: 2800, description: 'Equipment maintenance' }
      ],
      submittedBy: '2',
      submittedByName: 'Sarah Johnson',
    },
    {
      id: '8',
      date: '2024-01-17',
      localDeposit: 29000,
      usdtDeposit: 33000,
      cashDeposit: 21000,
      localWithdraw: 0,
      usdtWithdraw: 0,
      cashWithdraw: 0,
      clientIncentives: [
        { id: '20', name: 'Brandon Moore', amount: 3800 },
        { id: '21', name: 'Stephanie Lewis', amount: 4500 }
      ],
      expenses: [
        { id: '14', type: 'IB Commission', amount: 7900, description: 'Weekly IB payouts' }
      ],
      submittedBy: '3',
      submittedByName: 'Mike Davis',
    },
    {
      id: '9',
      date: '2024-01-16',
      localDeposit: 71000,
      usdtDeposit: 26000,
      cashDeposit: 34000,
      localWithdraw: 0,
      usdtWithdraw: 0,
      cashWithdraw: 0,
      clientIncentives: [
        { id: '22', name: 'Gregory Hall', amount: 6800 },
        { id: '23', name: 'Kimberly Allen', amount: 5200 },
        { id: '24', name: 'Eric Young', amount: 4600 }
      ],
      expenses: [
        { id: '15', type: 'Travel Expense', amount: 5500, description: 'International client visits' },
        { id: '16', type: 'Promotion', amount: 7200, description: 'Website redesign project' }
      ],
      submittedBy: '1',
      submittedByName: 'John Smith',
    },
    {
      id: '10',
      date: '2024-01-15',
      localDeposit: 44000,
      usdtDeposit: 39000,
      cashDeposit: 16000,
      localWithdraw: 0,
      usdtWithdraw: 0,
      cashWithdraw: 0,
      clientIncentives: [
        { id: '25', name: 'Ashley King', amount: 4400 },
        { id: '26', name: 'Jonathan Wright', amount: 3900 }
      ],
      expenses: [
        { id: '17', type: 'Salary', amount: 10800, description: 'Administrative staff salaries' },
        { id: '18', type: 'Miscellaneous', amount: 2100, description: 'Legal consultation fees' }
      ],
      submittedBy: '2',
      submittedByName: 'Sarah Johnson',
    }
  ]);

  const [banks, setBanks] = useState<Bank[]>([
    { id: '1', name: 'Bank of America' },
    { id: '2', name: 'Chase Bank' },
    { id: '3', name: 'Wells Fargo' },
    { id: '4', name: 'JPMorgan Chase' },
    { id: '5', name: 'Citibank' },
    { id: '6', name: 'HSBC Bank' },
    { id: '7', name: 'TD Bank' },
  ]);

  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([
    {
      id: '1',
      date: '2024-01-20',
      bankId: '1',
      deposit: 150000,
      withdraw: 25000,
      remaining: 425000,
      submittedBy: '2',
      submittedByName: 'Sarah Johnson',
    },
    {
      id: '2',
      date: '2024-01-20',
      bankId: '2',
      deposit: 120000,
      withdraw: 35000,
      remaining: 245000,
      submittedBy: '3',
      submittedByName: 'Mike Davis',
    },
    {
      id: '3',
      date: '2024-01-20',
      bankId: '4',
      deposit: 95000,
      withdraw: 0,
      remaining: 385000,
      submittedBy: '1',
      submittedByName: 'John Smith',
    },
    {
      id: '4',
      date: '2024-01-19',
      bankId: '1',
      deposit: 85000,
      withdraw: 15000,
      remaining: 300000,
      submittedBy: '2',
      submittedByName: 'Sarah Johnson',
    },
    {
      id: '5',
      date: '2024-01-19',
      bankId: '3',
      deposit: 110000,
      withdraw: 45000,
      remaining: 165000,
      submittedBy: '1',
      submittedByName: 'John Smith',
    },
    {
      id: '6',
      date: '2024-01-19',
      bankId: '5',
      deposit: 75000,
      withdraw: 20000,
      remaining: 195000,
      submittedBy: '3',
      submittedByName: 'Mike Davis',
    },
    {
      id: '7',
      date: '2024-01-18',
      bankId: '2',
      deposit: 65000,
      withdraw: 18000,
      remaining: 160000,
      submittedBy: '2',
      submittedByName: 'Sarah Johnson',
    },
    {
      id: '8',
      date: '2024-01-18',
      bankId: '4',
      deposit: 140000,
      withdraw: 32000,
      remaining: 290000,
      submittedBy: '1',
      submittedByName: 'John Smith',
    },
    {
      id: '9',
      date: '2024-01-18',
      bankId: '6',
      deposit: 88000,
      withdraw: 12000,
      remaining: 176000,
      submittedBy: '3',
      submittedByName: 'Mike Davis',
    },
    {
      id: '10',
      date: '2024-01-17',
      bankId: '1',
      deposit: 200000,
      withdraw: 55000,
      remaining: 230000,
      submittedBy: '1',
      submittedByName: 'John Smith',
    },
    {
      id: '11',
      date: '2024-01-17',
      bankId: '3',
      deposit: 45000,
      withdraw: 8000,
      remaining: 100000,
      submittedBy: '2',
      submittedByName: 'Sarah Johnson',
    },
    {
      id: '12',
      date: '2024-01-17',
      bankId: '7',
      deposit: 125000,
      withdraw: 28000,
      remaining: 197000,
      submittedBy: '3',
      submittedByName: 'Mike Davis',
    },
    {
      id: '13',
      date: '2024-01-16',
      bankId: '2',
      deposit: 92000,
      withdraw: 22000,
      remaining: 113000,
      submittedBy: '1',
      submittedByName: 'John Smith',
    },
    {
      id: '14',
      date: '2024-01-16',
      bankId: '4',
      deposit: 78000,
      withdraw: 38000,
      remaining: 182000,
      submittedBy: '2',
      submittedByName: 'Sarah Johnson',
    },
    {
      id: '15',
      date: '2024-01-16',
      bankId: '5',
      deposit: 105000,
      withdraw: 15000,
      remaining: 140000,
      submittedBy: '3',
      submittedByName: 'Mike Davis',
    },
    {
      id: '16',
      date: '2024-01-15',
      bankId: '3',
      deposit: 135000,
      withdraw: 42000,
      remaining: 63000,
      submittedBy: '1',
      submittedByName: 'John Smith',
    },
    {
      id: '17',
      date: '2024-01-15',
      bankId: '6',
      deposit: 68000,
      withdraw: 25000,
      remaining: 100000,
      submittedBy: '2',
      submittedByName: 'Sarah Johnson',
    },
    {
      id: '18',
      date: '2024-01-15',
      bankId: '7',
      deposit: 115000,
      withdraw: 18000,
      remaining: 100000,
      submittedBy: '3',
      submittedByName: 'Mike Davis',
    }
  ]);

  const [withdrawals, setWithdrawals] = useState<{ id: string; date: string; amount: number }[]>([
    { id: '1', date: '2024-01-15', amount: 25000 },
    { id: '2', date: '2024-01-16', amount: 18000 },
  ]);

  // Activity logs state with mock data
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    {
      id: '1',
      type: 'login',
      description: 'John Smith logged in',
      userId: '1',
      userName: 'John Smith',
      ipAddress: '192.168.1.105',
      timestamp: new Date().toISOString(),
    },
    {
      id: '2',
      type: 'add_bank_transaction',
      description: 'Added bank transaction for Chase Bank',
      userId: '2',
      userName: 'Sarah Johnson',
      ipAddress: '192.168.1.142',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      details: 'Deposit: $120,000, Withdraw: $35,000',
    },
    {
      id: '3',
      type: 'edit_staff',
      description: 'Updated permissions for: Mike Davis',
      userId: '1',
      userName: 'John Smith',
      ipAddress: '192.168.1.105',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      details: 'Role: Accountant',
    },
    {
      id: '4',
      type: 'add_deposit',
      description: 'Added new deposit entry for Jan 20, 2024',
      userId: '2',
      userName: 'Sarah Johnson',
      ipAddress: '192.168.1.142',
      timestamp: new Date(Date.now() - 5400000).toISOString(),
      details: 'Total Amount: $145,000',
    },
    {
      id: '5',
      type: 'add_bank',
      description: 'Added new bank: HSBC Bank',
      userId: '1',
      userName: 'John Smith',
      ipAddress: '192.168.1.105',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: '6',
      type: 'edit_deposit',
      description: 'Updated deposit entry for Jan 19, 2024',
      userId: '3',
      userName: 'Mike Davis',
      ipAddress: '10.0.0.23',
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      details: 'Total Amount: $113,000',
    },
    {
      id: '7',
      type: 'login',
      description: 'Sarah Johnson logged in',
      userId: '2',
      userName: 'Sarah Johnson',
      ipAddress: '192.168.1.142',
      timestamp: new Date(Date.now() - 14400000).toISOString(),
    },
    {
      id: '8',
      type: 'delete_bank_transaction',
      description: 'Deleted bank transaction from Wells Fargo',
      userId: '1',
      userName: 'John Smith',
      ipAddress: '192.168.1.105',
      timestamp: new Date(Date.now() - 18000000).toISOString(),
      details: 'Date: Jan 15, 2024',
    },
    {
      id: '9',
      type: 'edit_bank',
      description: 'Updated bank name from "Bank of America" to "BOA"',
      userId: '1',
      userName: 'John Smith',
      ipAddress: '192.168.1.105',
      timestamp: new Date(Date.now() - 21600000).toISOString(),
    },
    {
      id: '10',
      type: 'add_staff',
      description: 'Added new staff member: Emma Wilson',
      userId: '1',
      userName: 'John Smith',
      ipAddress: '192.168.1.105',
      timestamp: new Date(Date.now() - 25200000).toISOString(),
      details: 'Role: Viewer, Email: emma@example.com',
    },
  ]);

  // Function to add activity log with mock IP address
  const addActivityLog = (type: ActivityType, description: string, details?: string) => {
    if (!user) return;
    
    // Mock IP addresses for demo
    const mockIPs = ['192.168.1.105', '192.168.1.142', '10.0.0.23', '172.16.0.88'];
    const randomIP = mockIPs[Math.floor(Math.random() * mockIPs.length)];
    
    const newLog: ActivityLog = {
      id: Date.now().toString(),
      type,
      description,
      userId: user.id,
      userName: user.name,
      ipAddress: randomIP,
      timestamp: new Date().toISOString(),
      details,
    };
    
    setActivityLogs(prev => [newLog, ...prev]);
  };

  // Helper functions for role-based access control
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
    // Allow admins and managers to see extended dashboard features
    return user?.role === 'Super Admin' || user?.role === 'Admin' || user?.role === 'Manager';
  };

  const canAccessDashboard = () => {
    if (!user) return false;
    const currentStaff = staff.find(s => s.id === user.id);
    // Only Super Admin, Admin, and Manager can access dashboard
    return user.role === 'Super Admin' || user.role === 'Admin' || user.role === 'Manager';
  };

  const getDefaultPageForUser = (): AdminPage => {
    if (!user) return 'login';
    // If user can access dashboard, default to dashboard
    if (canAccessDashboard()) {
      return 'dashboard';
    }
    // Otherwise, default to deposits for staff users
    return 'deposits';
  };

  const getFilteredDeposits = () => {
    if (canViewAllEntries()) {
      return deposits;
    }
    // Regular staff can only see their own entries
    return deposits.filter(deposit => deposit.submittedBy === user?.id);
  };

  const getFilteredBankTransactions = () => {
    if (canViewAllEntries()) {
      return bankTransactions;
    }
    // Regular staff can only see their own entries
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