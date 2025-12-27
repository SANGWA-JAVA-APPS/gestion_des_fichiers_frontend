import { clearAuthData, getUserInfo } from '../../services/authUtils'

export function UserInfo ({ isIconOnly, isHidden, onLogout }) {
  const user = getUserInfo()

  if (!user) return null

  // Compute initials from fullName or username
  const initials = user.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()
    : user.username ? user.username[0].toUpperCase() : ''

  const handleLogout = () => {
    clearAuthData()
    if (onLogout) onLogout()
  }

  return (
    <div className='d-flex flex-column p-3 border-bottom border-secondary'>
      <div className='d-flex align-items-center'>
        {user.avatar
          ? <img
            src={user.avatar}
            alt={user.fullName || user.username}
            className='rounded-circle'
            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
            />
          : <div
            className='rounded-circle bg-secondary d-flex justify-content-center align-items-center text-white'
            style={{ width: '40px', height: '40px', fontWeight: 'bold' }}
            >
            {initials}
          </div>}
        {!isIconOnly &&
          !isHidden &&
          <div className='ms-2 text-white overflow-hidden'>
            <div className='fw-bold small'>
              {user.fullName || user.username}
            </div>
            <div className='text-muted' style={{ fontSize: '0.75rem' }}>
              {user.email}
            </div>
          </div>}
      </div>

      {!isIconOnly &&
        <button
          onClick={handleLogout}
          className='btn btn-sm btn-outline-light mt-2 w-100 text-start'
        >
          Logout
        </button>}
    </div>
  )
}
