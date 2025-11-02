import { projectId, publicAnonKey } from './supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-63060bc2`;

// Get auth token from session storage
function getAuthToken(): string | null {
  return sessionStorage.getItem('auth_token');
}

// Set auth token in session storage
export function setAuthToken(token: string) {
  sessionStorage.setItem('auth_token', token);
}

// Clear auth token
export function clearAuthToken() {
  sessionStorage.removeItem('auth_token');
}

// API call helper with auth
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : `Bearer ${publicAnonKey}`,
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    
    // Only log errors that are not authentication-related to reduce console noise
    if (response.status !== 401) {
      console.error('API Error:', {
        endpoint,
        status: response.status,
        error: error.error
      });
    }
    
    throw new Error(error.error || error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// ==================== AUTH API ====================

export async function signUp(email: string, password: string, name: string, role: string, permissions?: any) {
  return apiCall('/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, name, role, permissions }),
  });
}

export async function getCurrentUser() {
  return apiCall('/user');
}

// ==================== DEPOSITS API ====================

export async function getDeposits() {
  return apiCall('/deposits');
}

export async function createDeposit(depositData: any) {
  return apiCall('/deposits', {
    method: 'POST',
    body: JSON.stringify(depositData),
  });
}

export async function updateDeposit(id: string, depositData: any) {
  return apiCall(`/deposits/${id}`, {
    method: 'PUT',
    body: JSON.stringify(depositData),
  });
}

export async function deleteDeposit(id: string) {
  return apiCall(`/deposits/${id}`, {
    method: 'DELETE',
  });
}

// ==================== BANK DEPOSITS API ====================

export async function getBankDeposits() {
  return apiCall('/bank-deposits');
}

export async function createBankDeposit(bankDepositData: any) {
  return apiCall('/bank-deposits', {
    method: 'POST',
    body: JSON.stringify(bankDepositData),
  });
}

export async function updateBankDeposit(id: string, bankDepositData: any) {
  return apiCall(`/bank-deposits/${id}`, {
    method: 'PUT',
    body: JSON.stringify(bankDepositData),
  });
}

export async function deleteBankDeposit(id: string) {
  return apiCall(`/bank-deposits/${id}`, {
    method: 'DELETE',
  });
}

// ==================== STAFF API ====================

export async function getStaff() {
  return apiCall('/staff');
}

export async function updateStaff(id: string, staffData: any) {
  return apiCall(`/staff/${id}`, {
    method: 'PUT',
    body: JSON.stringify(staffData),
  });
}

export async function deleteStaff(id: string) {
  return apiCall(`/staff/${id}`, {
    method: 'DELETE',
  });
}

// ==================== ACTIVITIES API ====================

export async function getActivities() {
  return apiCall('/activities');
}

export async function deleteActivity(activityId: string) {
  return apiCall(`/activities/${activityId}`, {
    method: 'DELETE',
  });
}

export async function bulkDeleteActivities(activityIds: string[]) {
  return apiCall('/activities/bulk-delete', {
    method: 'POST',
    body: JSON.stringify({ activityIds }),
  });
}

// ==================== ROLES API ====================

export async function getRoles() {
  return apiCall('/roles');
}

export async function addRole(roleName: string) {
  return apiCall('/roles', {
    method: 'POST',
    body: JSON.stringify({ roleName }),
  });
}

export async function updateRole(roleId: string, roleName: string) {
  return apiCall(`/roles/${roleId}`, {
    method: 'PUT',
    body: JSON.stringify({ roleName }),
  });
}

export async function deleteRole(roleId: string) {
  return apiCall(`/roles/${roleId}`, {
    method: 'DELETE',
  });
}

// ==================== BANKS API ====================

export async function getBanks() {
  return apiCall('/banks');
}

export async function addBank(bankName: string) {
  return apiCall('/banks', {
    method: 'POST',
    body: JSON.stringify({ bankName }),
  });
}

export async function updateBank(id: string, bankName: string) {
  return apiCall(`/banks/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ bankName }),
  });
}

export async function deleteBank(id: string) {
  return apiCall(`/banks/${id}`, {
    method: 'DELETE',
  });
}

// ==================== DASHBOARD API ====================

export async function getDashboardMetrics() {
  return apiCall('/dashboard-metrics');
}

// ==================== UTILITIES API ====================

export async function refreshAllPermissions() {
  return apiCall('/refresh-permissions', {
    method: 'POST',
  });
}
