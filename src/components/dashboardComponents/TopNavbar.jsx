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
import LanguageSwitcher from '../../i18n/LanguageSwitcher'

export function TopNavbar({ onSidebarToggle }) {
  const navigate = useNavigate()
  const user = getUserInfo()

  const initials =
    user?.fullName
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() || 'U'

  return (
    <nav className="navbar navbar-dark bg-dark px-3">
      {/* Sidebar toggle */}
      <button
        className="btn btn-outline-light me-3 d-flex align-items-center"
        onClick={onSidebarToggle}
      >
        <Menu size={18} />
      </button>

      {/* Brand */}
      <span className="navbar-brand fw-bold">INGENZI</span>

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
            <div
              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-semibold"
              style={{ width: 32, height: 32 }}
            >
              {initials}
            </div>
            <span className="small">{user?.role}</span>
          </button>

          <ul className="dropdown-menu dropdown-menu-end shadow">
            {/* User info */}
            <li className="px-3 py-2">
              <div className="fw-semibold">{user?.fullName}</div>
              <div className="text-muted small">{user?.email}</div>
            </li>

            <li><hr className="dropdown-divider" /></li>

            {/* Actions */}
            <li>
              <button className="dropdown-item d-flex align-items-center gap-2">
                <User size={16} />
                Profile
              </button>
            </li>

            <li>
              <button className="dropdown-item d-flex align-items-center gap-2">
                <Settings size={16} />
                Settings
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
    </nav>
  )
}
