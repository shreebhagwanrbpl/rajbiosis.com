/**
 * Raj Biosis User Accounts Management Utility
 * Allows Central Admin to create, manage, and authenticate:
 * - Regional Employees (assigned to district depots)
 * - Central Administrators
 * - Healthcare Customers
 */

export const USER_ACCOUNTS_KEY = 'rajbiosis_registered_accounts';
export const USER_ACCOUNTS_EVENT = 'rajbiosis_user_accounts_updated';

export const DEFAULT_ACCOUNTS = [
  {
    id: 'ACC-ADM-001',
    role: 'admin',
    name: 'Amitabh Saxena',
    email: 'admin@rajbiosis.com',
    district: 'All Rajasthan Districts',
    phone: '9983333469',
    designation: 'Central Operations Director',
    status: 'active',
    createdAt: '2026-01-15T10:00:00.000Z'
  },
  {
    id: 'ACC-EMP-001',
    role: 'employee',
    name: 'Er. Rajesh Sharma',
    email: 'rajesh.sharma@rajbiosis.com',
    district: 'Jaipur',
    phone: '9829012345',
    designation: 'Senior Biomedical Engineer',
    status: 'active',
    createdAt: '2026-02-01T11:30:00.000Z'
  },
  {
    id: 'ACC-EMP-002',
    role: 'employee',
    name: 'Vikram Singh Rathore',
    email: 'vikram.rathore@rajbiosis.com',
    district: 'Jodhpur',
    phone: '9829154321',
    designation: 'Regional Depot Manager',
    status: 'active',
    createdAt: '2026-02-10T14:15:00.000Z'
  },
  {
    id: 'ACC-CUST-001',
    role: 'customer',
    name: 'Dr. Mahendra Verma',
    email: 'dr.verma@smsjaipur.org',
    district: 'Jaipur',
    phone: '9829098765',
    designation: 'HOD ICU & Critical Care',
    hospitalName: 'SMS Medical College & Hospital',
    status: 'active',
    createdAt: '2026-03-05T09:45:00.000Z'
  }
];

/**
 * Retrieve all registered accounts from localStorage (falling back to initial defaults)
 */
export function getUserAccounts() {
  if (typeof window === 'undefined') return DEFAULT_ACCOUNTS;
  try {
    const raw = localStorage.getItem(USER_ACCOUNTS_KEY);
    if (!raw) {
      localStorage.setItem(USER_ACCOUNTS_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
      return DEFAULT_ACCOUNTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_ACCOUNTS;
  } catch (err) {
    console.error('Error reading user accounts:', err);
    return DEFAULT_ACCOUNTS;
  }
}

/**
 * Save user accounts list to localStorage and dispatch event
 */
function saveAccountsList(list) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USER_ACCOUNTS_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent(USER_ACCOUNTS_EVENT, { detail: list }));
  } catch (err) {
    console.error('Error saving user accounts:', err);
  }
}

/**
 * Create a new user account (Employee, Admin, or Customer)
 */
export function createUserAccount(accountData) {
  const current = getUserAccounts();
  const email = (accountData.email || '').trim().toLowerCase();

  // Check if account with email already exists
  const existingIdx = current.findIndex(a => (a.email || '').trim().toLowerCase() === email);
  const rolePrefix = accountData.role === 'admin' ? 'ADM' : accountData.role === 'employee' ? 'EMP' : 'CUST';
  
  const newAccount = {
    id: accountData.id || `ACC-${rolePrefix}-${Date.now().toString().slice(-4)}`,
    role: accountData.role || 'employee',
    name: accountData.name?.trim() || 'Staff Member',
    email,
    district: accountData.district || 'Jaipur',
    phone: accountData.phone?.trim() || '',
    designation: accountData.designation?.trim() || (accountData.role === 'admin' ? 'Administrator' : accountData.role === 'employee' ? 'Regional Depot Officer' : 'Healthcare Representative'),
    hospitalName: accountData.hospitalName?.trim() || '',
    status: 'active',
    createdAt: new Date().toISOString()
  };

  let updatedList;
  if (existingIdx >= 0) {
    // Update existing
    updatedList = [...current];
    updatedList[existingIdx] = { ...current[existingIdx], ...newAccount };
  } else {
    // Add new
    updatedList = [newAccount, ...current];
  }

  saveAccountsList(updatedList);
  return newAccount;
}

/**
 * Delete an account by ID or email
 */
export function deleteUserAccount(identifier) {
  const current = getUserAccounts();
  const idLower = String(identifier).trim().toLowerCase();
  const updated = current.filter(
    a => a.id !== identifier && (a.email || '').toLowerCase() !== idLower
  );
  saveAccountsList(updated);
  return updated;
}

/**
 * Find an account by email
 */
export function findAccountByEmail(email) {
  if (!email) return null;
  const accounts = getUserAccounts();
  const target = email.trim().toLowerCase();
  return accounts.find(a => (a.email || '').toLowerCase() === target) || null;
}
