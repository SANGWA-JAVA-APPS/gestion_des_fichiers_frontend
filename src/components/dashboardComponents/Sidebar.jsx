import React, { useState, useEffect } from 'react'

import { SidebarItem } from './SidebarItem'
import { hasAnyRole, getUserInfo } from '../../services/authUtils'
import { useSidebarData, resolveIcon } from './sidebarData'


export function Sidebar({ sidebarState, activeUrl, onNavigate }) {
    const sidebarData = useSidebarData()
  const [expandedGroups, setExpandedGroups] = useState([])
  const [permissions, setPermissions] = useState([])
  const [permissionsLoading, setPermissionsLoading] = useState(true)

  const isIconOnly = sidebarState === 'icon-only'
  const isHidden = sidebarState === 'hidden'



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

  useEffect(() => {
    let isMounted = true
    let attempts = 0
    const maxAttempts = 30

    const loadPermissions = () => {
      const userInfo = getUserInfo()
      const perms = userInfo?.permissions
      if (Array.isArray(perms) && perms.length > 0) {
        if (isMounted) {
          setPermissions(perms)
          setPermissionsLoading(false)
        }
        return true
      }
      return false
    }

    if (loadPermissions()) return () => { isMounted = false }

    const interval = setInterval(() => {
      attempts += 1
      if (loadPermissions() || attempts >= maxAttempts) {
        if (isMounted) {
          setPermissionsLoading(false)
        }
        clearInterval(interval)
      }
    }, 200)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  const toggleGroup = (groupTitle) => {
    setExpandedGroups(prev =>
      prev.includes(groupTitle)
        ? prev.filter(g => g !== groupTitle)
        : [groupTitle]
    )
  }



  const sidebarWidth = isHidden ? '0' : isIconOnly ? '70px' : '230px'

  /**
   * Build document menu items dynamically from user permissions.
   * Groups permissions by blockName, sorts blocks by blockDisplayOrder,
   * and sorts items within each block by displayOrder.
   */
  const buildDynamicDocumentItems = () => {
    if (!permissions.length) return []

    // Group permissions by block
    const blockGroups = {}
    permissions.forEach(perm => {
      if (!perm.blockName || !perm.url) return
      const key = perm.blockCode || perm.blockName
      if (!blockGroups[key]) {
        blockGroups[key] = {
          blockName: perm.blockName,
          blockDisplayOrder: perm.blockDisplayOrder ?? 999,
          blockIconName: null,
          items: []
        }
      }
      blockGroups[key].items.push({
        title: perm.name,
        url: perm.url,
        icon: resolveIcon(perm.iconName),
        permissionCode: perm.code,
        displayOrder: perm.displayOrder ?? 999
      })
    })

    // Sort items within each block by displayOrder
    Object.values(blockGroups).forEach(group => {
      group.items.sort((a, b) => a.displayOrder - b.displayOrder)
    })

    // Sort blocks by blockDisplayOrder, then return as sub-menu groups
    return Object.values(blockGroups)
      .sort((a, b) => a.blockDisplayOrder - b.blockDisplayOrder)
      .map(group => ({
        title: group.blockName,
        icon: group.items[0]?.icon,
        items: group.items
      }))
  }

  const visibleNavGroups = sidebarData.navGroups.map(group => ({
    ...group,
    items: group.items
      .filter(item => !item.roles || hasAnyRole(item.roles))
      .map(item => {
        if (item.permissionGroup === 'documents') {
          if (permissionsLoading) {
            return {
              ...item,
             items: [
                {
                  title: 'Initializing permissions...',
                  isLoading: true
                }
              ]
            }
          }

          return {
            ...item,
            items: buildDynamicDocumentItems()
          }
        }

        return {
          ...item,
          items: item.items
            ? item.items.filter(child => !child.roles || hasAnyRole(child.roles))
            : undefined
        }
      })
      .filter(item => {
        if (item.permissionGroup === 'documents' && !permissionsLoading) {
          return item.items && item.items.length > 0
        }
        return true
      })
  }))
    const visibleStandaloneItems = sidebarData.standaloneItems.filter(
    item => !item.roles || hasAnyRole(item.roles)
  )


  return (
    <div
      className='bg-dark d-flex flex-column position-fixed position-md-relative sidebar-scroll'
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
                className='px-3 py-1 text-muted text-uppercase small fw-bold'
                style={{ fontSize: '10px' }}
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
