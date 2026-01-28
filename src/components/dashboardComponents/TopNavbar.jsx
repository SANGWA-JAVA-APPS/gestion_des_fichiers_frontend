import { useNavigate } from 'react-router-dom'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

import {
  Bell,
  LogOut,
  User,
  Settings,
  Menu
} from 'lucide-react'
import { clearAuthData, getUserInfo } from '../../services/authUtils'
import { getFlagUrl } from '../../services/commonUtils'
import LanguageSwitcher from '../../i18n/LanguageSwitcher'
import { useState } from 'react'
import { Modal } from 'react-bootstrap'
import UserProfile from '../user/UserProfile'
import logo from '../../assets/magerwa-logo.png'


export function TopNavbar({ onSidebarToggle }) {
  const navigate = useNavigate()
  const user = getUserInfo()
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [flagLoaded, setFlagLoaded] = useState(false)
  const [flagError, setFlagError] = useState(false)
  
  const initials =
    user?.fullName
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() || 'U'

  // Debug: Log user info to check if countryFlagUrl is available
  console.log('TopNavbar - User Info:', user)
  console.log('TopNavbar - Country Flag URL:', user?.countryFlagUrl)
  console.log('TopNavbar - Flag Loaded:', flagLoaded)
  console.log('TopNavbar - Flag Error:', flagError)

  return (
    <nav className="navbar navbar-dark bg-dark px-3">
      {/* Sidebar toggle */}
      <button
        className="btn btn-outline-light me-3 d-flex align-items-center"
        onClick={onSidebarToggle}
      >
        <Menu size={18} />
      </button>

      {/* Brand with Logo */}
      <div 
        className="navbar-brand fw-bold d-flex align-items-center gap-2" 
        style={{ cursor: 'pointer' }}
        onClick={() => navigate('/dashboard')}
      >
        <img src={logo} alt="MAGERWA" style={{ height: '32px' }} />
        <span>INGENZI</span>
      </div>

      {/* Right section */}
      <div className="ms-auto d-flex align-items-center gap-3">
        {/* Notifications */}
        <button className="btn btn-outline-light d-flex align-items-center">
          <Bell size={18} />
        </button>
             <button className="btn btn-outline-light d-flex align-items-center">
          <LanguageSwitcher />
        </button>
        
        


        {/* User dropdown */}
        <div className="dropdown">
          <button
            className="btn btn-outline-light dropdown-toggle d-flex align-items-center gap-2"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            {user?.countryFlagUrl ? (
              <div 
                style={{ 
                  width: '28px', 
                  height: '20px', 
                  borderRadius: '3px', 
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: flagError ? '#ff6b6b' : (flagLoaded ? 'transparent' : '#f8f9fa')
                }}
              >
                <img 
                  src={user.countryFlagUrl} 
                  alt={user.countryName}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    display: flagError ? 'none' : 'block'
                  }}
                  onLoad={() => {
                    console.log('Flag image loaded successfully:', user.countryFlagUrl);
                    setFlagLoaded(true);
                    setFlagError(false);
                  }}
                  onError={(e) => {
                    console.error('Flag image failed to load:', user.countryFlagUrl);
                    setFlagError(true);
                    setFlagLoaded(false);
                  }}
                />
                {flagError && <span style={{ fontSize: '12px' }}>🏴</span>}
                {!flagLoaded && !flagError && (
                  <span style={{ fontSize: '10px', color: '#999' }}>...</span>
                )}
              </div>
            ) : (
              <div 
                style={{ 
                  width: '28px', 
                  height: '20px', 
                  borderRadius: '3px', 
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#e9ecef',
                  fontSize: '12px'
                }}
              >
                🏴
              </div>
            )}
            <span className="small fw-semibold">{user?.countryName}</span>
            <span className="small">{user?.role}</span>
          </button>

          <ul className="dropdown-menu dropdown-menu-end shadow">
            {/* User info */}
            <li className="px-3 py-2">
              <div className="fw-semibold">{user?.fullName}</div>
              <div className="text-muted small">{user?.email}</div>
              {user?.countryName && (
                <div className="d-flex align-items-center gap-2 mt-2">
                  {user?.countryFlagUrl && (
                    <img 
                      src={user.countryFlagUrl} 
                      alt={user.countryName}
                      style={{ width: '20px', height: '15px', objectFit: 'cover' }}
                    />
                  )}
                  <span className="small text-muted">{user.countryName}</span>
                </div>
              )}
            </li>

            <li><hr className="dropdown-divider" /></li>

            {/* Actions */}
   <li>
  <button
    className="dropdown-item d-flex align-items-center gap-2"
    onClick={() => setShowProfileModal(true)}
  >
    <User size={16} />
    Profile
  </button>
</li>


            <li><hr className="dropdown-divider" /></li>

            <li>
              <button
                className="dropdown-item text-danger d-flex align-items-center gap-2"
                onClick={() => {
                  clearAuthData()
                  navigate('/login')
                }}
              >
                <LogOut size={16} />
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
      
      <Modal
  show={showProfileModal}
  onHide={() => setShowProfileModal(false)}
  size="lg"
  backdrop="static"
  centered
>
  <Modal.Header closeButton>
    <Modal.Title>My Profile</Modal.Title>
  </Modal.Header>

  <Modal.Body>
    <UserProfile />
  </Modal.Body>
</Modal>

    </nav>
  )
}
