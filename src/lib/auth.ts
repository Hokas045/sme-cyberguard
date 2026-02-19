import { query, secureQuery } from './turso';

export type UserRole = 'superadmin' | 'owner' | 'admin' | 'user';

// Simple password hashing (SHA-256)
export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export interface User {
  id: string;
  business_id: string;
  email: string;
  role: UserRole;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}

// Session-based authentication (using localStorage for simplicity)
// In production, consider using secure HTTP-only cookies

export const getAuthState = (): AuthState => {
  const token = localStorage.getItem('auth_token');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) {
    return { user: null, token: null };
  }

  try {
    const user = JSON.parse(userStr);
    return { user, token };
  } catch {
    return { user: null, token: null };
  }
};

export const setAuthState = (user: User, token: string) => {
  localStorage.setItem('auth_token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const clearAuthState = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
};

export const isAuthenticated = (): boolean => {
  const { token } = getAuthState();
  return !!token;
};

// Login function - verifies credentials against users table
export const login = async (email: string, password: string): Promise<{ user: User; token: string } | null> => {
  try {
    // Hash the password
    const passwordHash = await hashPassword(password);

    // Query user by email and password hash
    const users = await query(
      'SELECT id, business_id, email, role FROM users WHERE email = ? AND password_hash = ?',
      [email, passwordHash]
    );

    if (users.length === 0) {
      return null;
    }

    const user = users[0] as User;
    // Generate a simple token (in production, use proper JWT)
    const token = `session_${user.id}_${Date.now()}`;

    setAuthState(user, token);
    return { user, token };
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
};

// Logout function
export const logout = () => {
  clearAuthState();
};

// Role-based access control
export const hasRole = (requiredRole: UserRole): boolean => {
  const { user } = getAuthState();
  if (!user) return false;

  const roleHierarchy: Record<UserRole, number> = {
    user: 1,
    admin: 2,
    owner: 3,
    superadmin: 4
  };

  return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
};

export const canAccessRoute = (route: string): boolean => {
  const { user } = getAuthState();
  if (!user) return false;

  // Define route permissions based on roles
  const routePermissions: Record<string, UserRole[]> = {
    '/dashboard': ['user', 'admin', 'owner', 'superadmin'],
    '/dashboard/users': ['admin', 'owner', 'superadmin'],
    '/dashboard/settings': ['owner', 'superadmin'], // Only owner and superadmin can access settings
    '/admin': ['superadmin'], // Superadmin-only routes
    '/admin/stats': ['superadmin'],
    '/admin/businesses': ['superadmin'],
    '/admin/payments': ['superadmin'],
    // Add more routes as needed
  };

  const allowedRoles = routePermissions[route] || ['user', 'admin', 'owner'];
  return allowedRoles.includes(user.role);
};

// Middleware for route protection (use with React Router guards)
export const checkAuth = (): boolean => {
  return isAuthenticated();
};

export const checkRole = (requiredRole: UserRole): boolean => {
  return isAuthenticated() && hasRole(requiredRole);
};

// Helper to redirect if not authenticated
export const redirectIfNotAuthenticated = () => {
  if (!isAuthenticated()) {
    window.location.href = '/login';
  }
};

// Helper to redirect if insufficient role
export const redirectIfInsufficientRole = (requiredRole: UserRole) => {
  if (!checkRole(requiredRole)) {
    window.location.href = '/dashboard';
  }
};
