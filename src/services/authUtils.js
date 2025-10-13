// Authentication utility functions

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('authToken');
  return token !== null;
};

// Get stored user information
export const getUserInfo = () => {
  const userInfo = localStorage.getItem('userInfo');
  return userInfo ? JSON.parse(userInfo) : null;
};

// Get stored auth token
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Get stored refresh token
export const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};

// Store user information after login
export const setUserInfo = (userData) => {
  localStorage.setItem('authToken', userData.token);
  localStorage.setItem('refreshToken', userData.refreshToken);
  localStorage.setItem('userInfo', JSON.stringify({
    userId: userData.userId,
    username: userData.username,
    fullName: userData.fullName,
    email: userData.email,
    role: userData.role
  }));
};

// Clear all authentication data
export const clearAuthData = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userInfo');
};

// Get user role
export const getUserRole = () => {
  const userInfo = getUserInfo();
  return userInfo?.role || null;
};

// Check if user has specific role
export const hasRole = (requiredRole) => {
  const userInfo = getUserInfo();
  return userInfo && userInfo.role === requiredRole;
};

// Check if user has one of multiple roles
export const hasAnyRole = (roles = []) => {
  const userInfo = getUserInfo();
  return userInfo && roles.includes(userInfo.role);
};

// Role-based checks
export const isAdmin = () => {
  return hasAnyRole(['ADMIN', 'Admin', 'Administrator']);
};

export const isManager = () => {
  return hasAnyRole(['MANAGER', 'Manager']);
};

export const isUser = () => {
  return hasAnyRole(['USER', 'User']);
};

// Check if user has permission to perform action
export const hasPermission = (permission) => {
  const userRole = getUserRole();
  
  // Define permission matrix
  const permissions = {
    'ADMIN': ['*'], // Admin has all permissions
    'MANAGER': [
      'view_documents',
      'create_documents',
      'edit_documents',
      'delete_documents',
      'view_locations'
    ],
    'USER': [
      'view_own_documents',
      'create_own_documents',
      'edit_own_documents'
    ]
  };

  // Admin role variations
  if (userRole?.toUpperCase().includes('ADMIN')) {
    return true; // Admin has all permissions
  }

  const rolePermissions = permissions[userRole?.toUpperCase()] || [];
  return rolePermissions.includes(permission) || rolePermissions.includes('*');
};