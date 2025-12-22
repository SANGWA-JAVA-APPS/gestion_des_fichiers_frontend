import React from 'react'
import { Card, Col, Row } from 'react-bootstrap'

const AdminCArdmenu = ({title, icon: Icon, iconSize = 32, iconColor = "#0d6efd", onClick}) => {
  return (
        <Col xs={12} md={6} lg={4} style={{}}>
          <Card 
            className="h-100 border-0 shadow-sm hover-lift" 
            style={{ 
              minHeight: '80px', 
              border:'1px solid #fff', 
              backgroundColor:'#d9d9e4ff',
              cursor: onClick ? 'pointer' : 'default'
            }}
            onClick={onClick}
          >
            <Card.Body className="d-flex align-items-center p-3">
              <div className="  bg-opacity-10 p-0 rounded me-3 adminIconBg" style={{ minWidth: '40px', minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {Icon && <Icon size={iconSize} color={iconColor} />}
              </div>
              <div className="flex-grow-1">
                <p className="text-muted mb-1 small text-uppercase fw-bold">{title}</p>
                                
              </div>
            </Card.Body>
          </Card>
        </Col>
 
    
  )
}

export default AdminCArdmenu