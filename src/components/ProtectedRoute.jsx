import React from 'react';
import { isAuthenticated } from '../services/authUtils';
import Login from './Login';

const ProtectedRoute = ({ children, onLoginSuccess }) => {
  if (!isAuthenticated()) {
    return <Login onLoginSuccess={onLoginSuccess} />;
  }
  
  return children;
};

export default ProtectedRoute;