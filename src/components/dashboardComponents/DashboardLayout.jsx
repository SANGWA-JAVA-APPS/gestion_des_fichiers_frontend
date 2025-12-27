import React, { useState, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

import { Sidebar } from './Sidebar'
import { TopNavbar } from './TopNavbar'

export default function DashboardLayout () {
  const location = useLocation()
  const navigate = useNavigate()

  const [sidebarState, setSidebarState] = useState(
    () => localStorage.getItem('sidebarState') || 'full'
  )

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(
    () => {
      localStorage.setItem('sidebarState', sidebarState)
    },
    [sidebarState]
  )

  const handleSidebarToggle = () => {
    if (isMobile) {
      setSidebarState(prev => (prev === 'hidden' ? 'full' : 'hidden'))
    } else {
      setSidebarState(prev => {
        if (prev === 'full') return 'icon-only'
        if (prev === 'icon-only') return 'hidden'
        return 'full'
      })
    }
  }

  const handleNavigate = url => {
    navigate(url)
    if (isMobile) {
      setSidebarState('hidden')
    }
  }

  const marginLeft =
    sidebarState === 'hidden'
      ? '0'
      : sidebarState === 'icon-only' ? '70px' : '280px'

  return (
    <div className='d-flex flex-column vh-100 overflow-hidden'>
      <TopNavbar
        sidebarState={sidebarState}
        onSidebarToggle={handleSidebarToggle}
      />

      <div className='d-flex flex-grow-1 overflow-hidden'>
        <Sidebar
          sidebarState={sidebarState}
          activeUrl={location.pathname}
          onNavigate={handleNavigate}
        />

        {/* MAIN CONTENT VIA OUTLET */}
        <main
          className='flex-grow-1 overflow-auto bg-light'
          style={{
            marginLeft: window.innerWidth >= 768 ? marginLeft : '0',
            transition: 'margin-left 0.3s ease',
            marginTop: '56px'
          }}
        >
          <div className='container-fluid py-4'>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
