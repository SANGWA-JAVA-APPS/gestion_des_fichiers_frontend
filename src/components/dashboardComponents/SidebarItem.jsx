export function SidebarItem({ item, isActive, onClick, sidebarState, expandedGroups, toggleGroup }) {
  const hasChildren = item.items && item.items.length > 0;
  const isExpanded = expandedGroups.includes(item.title);
  const isIconOnly = sidebarState === 'icon-only';

  if (hasChildren) {
    return (
      <div className="mb-4 border-start border-3 border-primary">
        <div
          className={`d-flex align-items-center px-1 py-1 text-white text-decoration-none fs-3 ${isExpanded ? 'bg-primary bg-opacity-25' : ''}`}
          onClick={() => toggleGroup(item.title)}
          style={{ cursor: 'pointer' }}
          role="button"
        >
          {item.icon && <item.icon />}
          {!isIconOnly && (
            <>
              <span className="ms-2 flex-grow-1 ">{item.title}</span>
              <i className={`bi bi-chevron-${isExpanded ? 'down' : 'right'}`}></i>
            </>
          )}
        </div>
        {isExpanded && !isIconOnly && (
          <div className="bg-dark bg-opacity-25 ps-5 ">
            {item.items.map((child, idx) => (
              <div
                key={idx}
                className={`d-flex align-items-center py-2 text-decoration-none  ps-1  border-start border-2 gap-3  ${isActive === child.url ? 'bg-primary text-white' : 'text-white'}`}
                onClick={() => onClick(child.url)}
                style={{ cursor: 'pointer' }}
                role="button"
              >
                {child.icon && <child.icon style={{ minWidth: '20px' }} />}
                <span className=" medium">{child.title}</span>
                {child.badge && <span className="badge bg-primary rounded-pill ms-2">{child.badge}</span>
                }
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Standalone item
  return (
    <div
      className={`d-flex align-items-center px-3 py-2 mb-1 text-decoration-none ${isActive === item.url ? 'bg-primary text-white' : 'text-white-50'}`}
      onClick={() => onClick(item.url)}
      style={{ cursor: 'pointer' }}
      role="button"
    >
      {item.icon && <item.icon className="fs-5" style={{ minWidth: '30px' }} />}
      {!isIconOnly && <span className="ms-2">{item.title}</span>}
    </div>
  );
}
