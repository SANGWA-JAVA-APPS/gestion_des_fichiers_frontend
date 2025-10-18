import React, { useState } from 'react';
import { Container, Row, Col, Card, Nav, Button, NavDropdown } from 'react-bootstrap';
import { getUserInfo } from '../services/authUtils';
import DashboardBg from '../assets/DashbaordBg.png';

console.log('AdminDashboard.jsx loaded, DashboardBg:', DashboardBg);

// Dashboard Stats
import DashboardStats from './DashboardStats';

// Location Components
import CountryComponent from './location/CountryComponent';
import EntityComponent from './location/EntityComponent';
import ModulesComponent from './location/ModulesComponent';
import SectionsComponent from './location/SectionsComponent';

// User Components
import AccountComponent from './user/AccountComponent';
import RolesComponent from './user/RolesComponent';

// Document Components
import DocumentComponent from './DocumentComponent';

const AdminDashboard = ({ onLogout }) => {
  console.log('AdminDashboard component mounting...');

  const [activeTab, setActiveTab] = useState('overview');
  const userInfo = getUserInfo();

  console.log('AdminDashboard Background Image:', DashboardBg);

  const renderContent = () => {
    switch (activeTab) {
      // Overview Dashboard
      case 'overview':
        return (
          <div className='transparentDiv'>
            <DashboardStats userRole={userInfo?.role} />

            <Row className="g-4 mt-4">
              <Col xs={12}>
                <h4 className="mb-3">Quick Access</h4>
              </Col>
              <Col xs={12} md={6} lg={3}>
                <Card className="text-center shadow-sm border-primary h-100">
                  <Card.Body>
                    <i className="fas fa-users fa-3x text-primary mb-3"></i>
                    <Card.Title>User Management</Card.Title>
                    <Card.Text>Manage all user accounts and roles</Card.Text>
                    <Button variant="primary" size="sm" onClick={() => setActiveTab('account')}>
                      Manage Users
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={12} md={6} lg={3}>
                <Card className="text-center shadow-sm border-success h-100">
                  <Card.Body>
                    <i className="fas fa-file-alt fa-3x text-success mb-3"></i>
                    <Card.Title>Documents</Card.Title>
                    <Card.Text>View and manage all documents</Card.Text>
                    <Button variant="success" size="sm" onClick={() => setActiveTab('document')}>
                      View Documents
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={12} md={6} lg={3}>
                <Card className="text-center shadow-sm border-info h-100">
                  <Card.Body>
                    <i className="fas fa-map-marker-alt fa-3x text-info mb-3"></i>
                    <Card.Title>Locations</Card.Title>
                    <Card.Text>Configure locations and entities</Card.Text>
                    <Button variant="info" size="sm" onClick={() => setActiveTab('country')}>
                      Manage Locations
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={12} md={6} lg={3}>
                <Card className="text-center shadow-sm border-warning h-100">
                  <Card.Body>
                    <i className="fas fa-cog fa-3x text-warning mb-3"></i>
                    <Card.Title>System Settings</Card.Title>
                    <Card.Text>Configure system parameters</Card.Text>
                    <Button variant="warning" size="sm" onClick={() => setActiveTab('roles')}>
                      Settings
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>
        );

      // Location Management
      case 'country':
        return (
          <div>
            <h3 className="mb-4">
              <i className="fas fa-map-marker-alt me-2 text-info"></i>
              Location Management
            </h3>
            <Nav variant="pills" className="mb-4">
              <Nav.Item>
                <Nav.Link onClick={() => setActiveTab('country-list')}>
                  <i className="fas fa-globe me-2"></i>Countries
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link onClick={() => setActiveTab('entity-list')}>
                  <i className="fas fa-building me-2"></i>Entities
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link onClick={() => setActiveTab('modules-list')}>
                  <i className="fas fa-cubes me-2"></i>Modules
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link onClick={() => setActiveTab('sections-list')}>
                  <i className="fas fa-layer-group me-2"></i>Sections
                </Nav.Link>
              </Nav.Item>
            </Nav>
            <Card className="border-info">
              <Card.Body className="text-center py-5">
                <i className="fas fa-map-marker-alt fa-5x text-info mb-3"></i>
                <h5>Select a location type to manage</h5>
                <p className="text-muted">Choose from Countries, Entities, Modules, or Sections above</p>
              </Card.Body>
            </Card>
          </div>
        );
      case 'country-list':
        return <CountryComponent />;
      case 'entity':
      case 'entity-list':
        return <EntityComponent />;
      case 'modules':
      case 'modules-list':
        return <ModulesComponent />;
      case 'sections':
      case 'sections-list':
        return <SectionsComponent />;
      // User Management
      case 'account':
        return <AccountComponent />;
      case 'roles':
        return <RolesComponent />;

      // Document Management
      case 'document':
        return <DocumentComponent />;

      // Archive Documents
      case 'archive':
        return (
          <div>
            <h3 className="mb-4">
              <i className="fas fa-archive me-2 text-secondary"></i>
              Archived Documents
            </h3>
            <Card className="shadow-sm">
              <Card.Body>
                <p className="text-muted mb-3">
                  View and manage archived documents. These documents are no longer active but are retained for records.
                </p>
                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i>
                  <strong>Coming Soon:</strong> Archive management functionality will be implemented here.
                </div>
                {/* TODO: Implement archived documents list */}
              </Card.Body>
            </Card>
          </div>
        );

      // Expiring Documents
      case 'expiry':
        return (
          <div>
            <h3 className="mb-4">
              <i className="fas fa-clock me-2 text-warning"></i>
              Expiring Documents
            </h3>
            <Card className="shadow-sm">
              <Card.Body>
                <p className="text-muted mb-3">
                  Monitor documents that are approaching their expiry date. Take action before they expire.
                </p>
                <div className="alert alert-warning">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  <strong>Coming Soon:</strong> Expiring documents tracking will be implemented here.
                </div>
                {/* TODO: Implement expiring documents list with filters (7 days, 30 days, etc.) */}
              </Card.Body>
            </Card>
          </div>
        );

      // Active Documents
      case 'activeDocs':
        return (
          <div>
            <h3 className="mb-4">
              <i className="fas fa-check-circle me-2 text-success"></i>
              Active Documents
            </h3>
            <Card className="shadow-sm">
              <Card.Body>
                <p className="text-muted mb-3">
                  View all currently active documents in the system. These are valid and in use.
                </p>
                <div className="alert alert-success">
                  <i className="fas fa-check me-2"></i>
                  <strong>Coming Soon:</strong> Active documents overview will be implemented here.
                </div>
                {/* TODO: Implement active documents list with status breakdown */}
              </Card.Body>
            </Card>
          </div>
        );

      default:
        return <div>Select an option from the menu</div>;
    }
  };

  return (
    <Container
      fluid
      className="min-vh-100 p-0 "
      style={{
        // backgroundImage: `url(${DashboardBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Header */}
      <Row className="g-0 modern-navbar">
        <Col xs={12} className="py-3">
          <Container>
            <Row className="align-items-center">
              {/* Left Side - INGENZI Brand */}
              <Col xs="auto">
                <div className="navbar-brand">
                  <i className="fas fa-shield-alt me-3"></i>
                  <div>
                    <h4 className="mb-0 fw-bold">INGENZI</h4>
                    <small className="text-muted">Admin Panel</small>
                  </div>
                </div>
              </Col>

              {/* Center - Action Buttons */}
              <Col className="text-center">
                <div className="d-flex gap-2 justify-content-center">
                  <Button
                    variant="outline-light"
                    size="sm"
                    onClick={() => setActiveTab('archive')}
                    className="action-btn"
                  >
                    <i className="fas fa-archive me-1"></i>
                    <span className="d-none d-lg-inline">Archive</span>
                  </Button>

                  <Button
                    variant="outline-warning"
                    size="sm"
                    onClick={() => setActiveTab('expiry')}
                    className="action-btn"
                  >
                    <i className="fas fa-clock me-1"></i>
                    <span className="d-none d-lg-inline">Expiry</span>
                  </Button>

                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={() => setActiveTab('activeDocs')}
                    className="action-btn"
                  >
                    <i className="fas fa-check-circle me-1"></i>
                    <span className="d-none d-lg-inline">Active Docs</span>
                  </Button>
                </div>
              </Col>

              {/* Right Side - Profile */}
              <Col xs="auto">
                <div className="profile-section">
                  <NavDropdown
                    title={
                      <div className="profile-trigger">
                        <div className="profile-avatar">
                          {userInfo?.fullName?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div className="profile-info d-none d-md-block">
                          <div className="profile-name">{userInfo?.fullName || 'Admin'}</div>
                          <div className="profile-role">Profile</div>
                        </div>
                        <i className="fas fa-chevron-down profile-arrow"></i>
                      </div>
                    }
                    id="profile-dropdown"
                    className="profile-dropdown"
                  >
                    <NavDropdown.Header className="profile-header">
                      <div className="profile-header-content">
                        <div className="profile-avatar-large">
                          {userInfo?.fullName?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div className="profile-details">
                          <div className="profile-name-large">{userInfo?.fullName || 'Admin User'}</div>
                          <div className="profile-email">{userInfo?.email || 'admin@ingenzi.com'}</div>
                        </div>
                      </div>
                    </NavDropdown.Header>

                    <NavDropdown.Item
                      onClick={() => setActiveTab('changePassword')}
                      className="profile-item"
                    >
                      <i className="fas fa-key me-3"></i>
                      Change Password
                    </NavDropdown.Item>

                    <NavDropdown.Divider />

                    <NavDropdown.Item
                      onClick={onLogout}
                      className="profile-item logout-item"
                    >
                      <i className="fas fa-sign-out-alt me-3"></i>
                      Logout
                    </NavDropdown.Item>
                  </NavDropdown>
                </div>
              </Col>
            </Row>
          </Container>
        </Col>
      </Row>

      {/* Navigation Tabs */}
      <Row className="g-0 bg-white border-bottom shadow-sm">
        <Col xs={12}>
          <Container>
            <Nav variant="tabs" className="border-0">
              <Nav.Item>
                <Nav.Link
                  active={activeTab === 'overview'}
                  onClick={() => setActiveTab('overview')}
                  className="text-dark"
                >
                  <i className="fas fa-th-large me-2"></i>
                  Dashboard
                </Nav.Link>
              </Nav.Item>

              {/* Users Dropdown Menu */}
              <NavDropdown
                title={
                  <span className="text-dark">
                    <i className="fas fa-users me-2"></i>
                    Users
                  </span>
                }
                id="users-nav-dropdown"
                active={activeTab === 'account' || activeTab === 'roles'}
              >
                <NavDropdown.Item
                  onClick={() => setActiveTab('account')}
                  active={activeTab === 'account'}
                >
                  <i className="fas fa-user me-2"></i>
                  Accounts
                </NavDropdown.Item>
                <NavDropdown.Item
                  onClick={() => setActiveTab('roles')}
                  active={activeTab === 'roles'}
                >
                  <i className="fas fa-user-tag me-2"></i>
                  Roles
                </NavDropdown.Item>
              </NavDropdown>

              <Nav.Item>
                <Nav.Link
                  active={activeTab === 'document'}
                  onClick={() => setActiveTab('document')}
                  className="text-dark"
                >
                  <i className="fas fa-file-alt me-2"></i>
                  Documents
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  active={activeTab === 'country'}
                  onClick={() => setActiveTab('country')}
                  className="text-dark"
                >
                  <i className="fas fa-map-marker-alt me-2"></i>
                  Locations
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Container>
        </Col>
      </Row>

      {/* Main Content Area */}
      <Row className="g-0">
        <Col xs={12} className="p-0  p-0" >
          <Container fluid className=' m-0 mt-1' >
            <Card className="border-0 shadow-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
              <Card.Body className="p-2">
                {renderContent()}
              </Card.Body>
            </Card>
          </Container>
        </Col>
      </Row>

      <style jsx>{`
        /* Modern Navbar Styling */
        .modern-navbar {
          background: linear-gradient(135deg, #0d6efd 0%, #0056b3 100%);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .navbar-brand {
          display: flex;
          align-items: center;
        }
        
        .navbar-brand i {
          font-size: 1.8rem;
          color: #fff;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .navbar-brand h4 {
          color: #fff;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        
        .navbar-brand small {
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        /* Action Buttons */
        .action-btn {
          border: 2px solid rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          font-weight: 500;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }
        
        .action-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.5);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          color: #fff;
        }
        
        .action-btn.btn-outline-warning {
          border-color: #ffc107;
          color: #ffc107;
        }
        
        .action-btn.btn-outline-warning:hover {
          background: #ffc107;
          color: #000;
        }
        
        .action-btn.btn-outline-success {
          border-color: #28a745;
          color: #28a745;
        }
        
        .action-btn.btn-outline-success:hover {
          background: #28a745;
          color: #fff;
        }
        
        /* Profile Section */
        .profile-section {
          position: relative;
        }
        
        .profile-trigger {
          display: flex;
          align-items: center;
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }
        
        .profile-trigger:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.4);
          transform: translateY(-1px);
        }
        
        .profile-avatar {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
          color: #0d6efd;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          margin-right: 0.75rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
        
        .profile-info {
          text-align: left;
        }
        
        .profile-name {
          color: #fff;
          font-weight: 600;
          font-size: 0.9rem;
          line-height: 1.2;
        }
        
        .profile-role {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .profile-arrow {
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.8rem;
          margin-left: 0.5rem;
          transition: transform 0.3s ease;
        }
        
        .profile-trigger:hover .profile-arrow {
          transform: rotate(180deg);
        }
        
        /* Dropdown Menu */
        .profile-dropdown .dropdown-toggle::after {
          display: none;
        }
        
        .profile-dropdown .dropdown-menu {
          border: none;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          border-radius: 12px;
          padding: 0;
          min-width: 280px;
          margin-top: 0.75rem;
          overflow: hidden;
          backdrop-filter: blur(20px);
        }
        
        .profile-header {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          padding: 1.5rem;
          border-bottom: 1px solid #dee2e6;
        }
        
        .profile-header-content {
          display: flex;
          align-items: center;
        }
        
        .profile-avatar-large {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #0d6efd 0%, #0056b3 100%);
          color: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 18px;
          margin-right: 1rem;
          box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
        }
        
        .profile-details {
          flex: 1;
        }
        
        .profile-name-large {
          font-weight: 700;
          color: #212529;
          font-size: 1rem;
          margin-bottom: 0.25rem;
        }
        
        .profile-email {
          color: #6c757d;
          font-size: 0.85rem;
          font-weight: 500;
        }
        
        .profile-item {
          padding: 0.75rem 1.5rem;
          transition: all 0.2s ease;
          border: none;
          background: none;
          color: #495057;
          font-weight: 500;
        }
        
        .profile-item:hover {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          color: #212529;
          transform: translateX(4px);
        }
        
        .profile-item i {
          width: 20px;
          text-align: center;
        }
        
        .logout-item {
          color: #dc3545;
        }
        
        .logout-item:hover {
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
          color: #dc2626;
        }
        
        .profile-dropdown .dropdown-divider {
          margin: 0;
          border-color: #dee2e6;
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
          .action-btn span {
            display: none !important;
          }
          
          .action-btn {
            padding: 0.5rem;
            min-width: 40px;
          }
          
          .profile-trigger {
            padding: 0.5rem;
          }
          
          .profile-avatar {
            margin-right: 0.5rem;
          }
        }
      `}</style>
    </Container>
  );
};

export default AdminDashboard;
