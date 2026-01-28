import { useState, useEffect, useRef } from 'react'

export function SidebarItem({ item, isActive, onClick, sidebarState, expandedGroups, toggleGroup }) {
  const hasChildren = item.items && item.items.length > 0;
  const isExpanded = expandedGroups.includes(item.title);
  const isIconOnly = sidebarState === 'icon-only';
  const [height, setHeight] = useState(0);
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      const scrollHeight = contentRef.current.scrollHeight;
      setHeight(isExpanded && !isIconOnly ? scrollHeight : 0);
    }
  }, [isExpanded, isIconOnly, item.items]);

  if (hasChildren) {
    return (
      <div className="mb-4 border-start border-3 border-primary">
        <div
          className={`sidebar-menu-parent d-flex align-items-center px-1 py-1 text-white text-decoration-none ${isExpanded ? 'bg-primary bg-opacity-25' : ''}`}
          onClick={() => toggleGroup(item.title)}
          role="button"
        >
          {item.icon && <item.icon size={18} />}
          {!isIconOnly && (
            <>
              <span className="ms-2 flex-grow-1">{item.title}</span>
              <i className={`bi bi-chevron-${isExpanded ? 'down' : 'right'}`}></i>
            </>
          )}
        </div>
        <div 
          ref={contentRef}
          className="sidebar-submenu-container bg-dark bg-opacity-25 ps-3"
          style={{
            maxHeight: isExpanded && !isIconOnly ? (height || 1000) + 'px' : '0px',
            opacity: isExpanded && !isIconOnly ? 1 : 0,
            overflow: 'hidden',
            transition: 'max-height 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {item.items.map((child, idx) => (
            child.isLoading ? (
              <div key={idx} className="sidebar-permissions-loader d-flex align-items-center py-2 ps-1 text-white-50">
                <span className="sidebar-permissions-spinner me-2" />
                <span className="sidebar-menu-child-text" style={{ fontSize: '13px' }}>
                  {child.title}
                </span>
              </div>
            ) : child.items ? (
              <div key={idx} className="sidebar-menu-child-group">
                <div className="sidebar-menu-child d-flex align-items-center py-2  ps-1 border-2 gap-2 text-white" style={{fontWeight:'bold'  }}>
                  {child.icon && <child.icon size={14} strokeWidth={2} />}
                  <span className="sidebar-menu-child-text" style={{ fontSize: '13px' }}>{child.title}</span>
                </div>
                <div className="ps-4" style={{fontSize:'12px'}}>
                  {child.items.map((grandchild, gIdx) => (
                    <div  
                      key={`${idx}-${gIdx}`}
                      className={`sidebar-menu-child d-flex align-items-center py-2 text-decoration-none ps-1 border-2 gap-2 ${isActive === grandchild.url ? 'bg-primary text-white' : 'text-white'}`}
                      onClick={() => onClick(grandchild.url)}
                      role="button"
                    >
                      {grandchild.icon && <grandchild.icon size={14} strokeWidth={2} />}
                      <span className="sidebar-menu-child-text" style={{ fontSize: '12px' }}>{grandchild.title}</span>
                      {grandchild.badge && <span className="badge bg-primary rounded-pill ms-4">{grandchild.badge}</span>}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div
                key={idx}
                className={`sidebar-menu-child d-flex align-items-center py-2 text-decoration-none ps-1 border-2 gap-2 ${isActive === child.url ? 'bg-primary text-white' : 'text-white'}`}
                onClick={() => onClick(child.url)}
                role="button"
              >
                {child.icon && <child.icon size={14} strokeWidth={2} />}
                <span className="sidebar-menu-child-text " style={{fontSize:'13px'}}>{child.title}</span>
                {child.badge && <span className="badge bg-primary rounded-pill ms-4">{child.badge}</span>}
              </div>
            )
          ))}
        </div>
      </div>
    );
  }

  // Standalone item
  return (
    <div
      className={`sidebar-standalone-item d-flex align-items-center px-3 py-2 mb-1 text-decoration-none ${isActive === item.url ? 'bg-primary text-white' : 'text-white-50'}`}
      onClick={() => onClick(item.url)}
      role="button"
    >
      {item.icon && <item.icon className="sidebar-standalone-icon fs-5" />}
      {!isIconOnly && <span className="ms-2">{item.title}</span>}
    </div>
  );
}
