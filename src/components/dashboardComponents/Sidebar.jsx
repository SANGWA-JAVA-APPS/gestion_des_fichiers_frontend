import React, { useState, useEffect } from 'react'
import { sidebarData } from './sidebarData'
import { SidebarItem } from './SidebarItem'
import { getUserRole, hasAnyRole } from '../../services/authUtils'


export function Sidebar({ sidebarState, activeUrl, onNavigate }) {
  const [expandedGroups, setExpandedGroups] = useState([])

  const isIconOnly = sidebarState === 'icon-only'
  const isHidden = sidebarState === 'hidden'

  const userRole = getUserRole() 

  useEffect(() => {
    const groupsToExpand = []
    sidebarData.navGroups.forEach(group => {
      group.items.forEach(item => {
        if (item.items) {
          const hasActiveChild = item.items.some(child => child.url === activeUrl)
          if (hasActiveChild) groupsToExpand.push(item.title)
        }
      })
    })
    setExpandedGroups(prev => [...new Set([...prev, ...groupsToExpand])])
  }, [activeUrl])

  const toggleGroup = (groupTitle) => {
    setExpandedGroups(prev =>
      prev.includes(groupTitle)
        ? prev.filter(g => g !== groupTitle)
        : [...prev, groupTitle]
    )
  }



  const sidebarWidth = isHidden ? '0' : isIconOnly ? '70px' : '280px'

  const visibleNavGroups = sidebarData.navGroups.map(group => ({
    ...group,
    items: group.items
      .filter(item => !item.roles || hasAnyRole(item.roles))
      .map(item => ({
        ...item,
        items: item.items
          ? item.items.filter(child => !child.roles || hasAnyRole(child.roles))
          : undefined
      }))
  }))
    const visibleStandaloneItems = sidebarData.standaloneItems.filter(
    item => !item.roles || hasAnyRole(item.roles)
  )


  return (
    <div
      className='bg-dark d-flex flex-column position-fixed position-md-relative'
      style={{
        width: sidebarWidth,
        height: 'calc(100vh - 56px)',
        overflowY: 'auto',
        transition: 'all 0.3s ease',
        zIndex: 1020,
        top: '56px',
        left: 0
      }}
    >

      {/* Sidebar Items */}
      <div className='flex-grow-1 py-2 overflow-auto'>
        {visibleNavGroups.map((group, groupIdx) => (
          <div key={groupIdx} className='mb-3'>
            {!isIconOnly && !isHidden && (
              <div
                className='px-3 py-2 text-muted text-uppercase small fw-bold'
                style={{ fontSize: '0.7rem' }}
              >
                {group.title}
              </div>
            )}
            {group.items.map((item, itemIdx) => (
              <SidebarItem
                key={itemIdx}
                item={item}
                isActive={activeUrl}
                onClick={onNavigate}
                sidebarState={sidebarState}
                expandedGroups={expandedGroups}
                toggleGroup={toggleGroup}
              />
            ))}
          </div>
        ))}

        {visibleStandaloneItems?.map((item, idx) => (
          <SidebarItem
            key={idx}
            item={item}
            isActive={activeUrl}
            onClick={onNavigate}
            sidebarState={sidebarState}
            expandedGroups={expandedGroups}
            toggleGroup={toggleGroup}
          />
        ))}
      </div>
    </div>
  )
}
