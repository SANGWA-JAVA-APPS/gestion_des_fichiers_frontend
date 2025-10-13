import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/global.scss';
import { isAuthenticated, getUserRole, clearAuthData } from './services/authUtils';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import UserDashboard from './components/UserDashboard';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Check if user is already authenticated on app load
    if (isAuthenticated()) {
      setIsLoggedIn(true);
      setUserRole(getUserRole());
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setUserRole(getUserRole());
  };

  const handleLogout = () => {
    clearAuthData();
    setIsLoggedIn(false);
    setUserRole(null);
  };

  // Render appropriate dashboard based on user role
  const renderDashboard = () => {
    const role = userRole?.toUpperCase();
    
    // Admin Dashboard
    if (role?.includes('ADMIN')) {
      return <AdminDashboard onLogout={handleLogout} />;
    }
    
    // Manager Dashboard
    if (role?.includes('MANAGER')) {
      return <ManagerDashboard onLogout={handleLogout} />;
    }
    
    // User Dashboard (default)
    return <UserDashboard onLogout={handleLogout} />;
  };

  return (
    <div className="App">
      {isLoggedIn ? (
        renderDashboard()
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;
