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

// Clear all authentication data
export const clearAuthData = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userInfo');
};

// Check if user has specific role
export const hasRole = (requiredRole) => {
  const userInfo = getUserInfo();
  return userInfo && userInfo.role === requiredRole;
};

// Check if user is admin
export const isAdmin = () => {
  return hasRole('ADMIN');
};