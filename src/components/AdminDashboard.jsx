import React, { useState } from 'react';
import { Container, Row, Col, Card, Nav, Button, NavDropdown } from 'react-bootstrap';
import { getUserInfo } from '../services/authUtils';

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
  const [activeTab, setActiveTab] = useState('overview');
  const userInfo = getUserInfo();

  const renderContent = () => {
    switch (activeTab) {
      // Overview Dashboard
      case 'overview':
        return (
          <div>
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
    <Container fluid className="min-vh-100 p-0 bg-light">
      {/* Header */}
      <Row className="g-0 bg-primary text-white shadow">
        <Col xs={12} className="py-3">
          <Container>
            <Row className="align-items-center">
              <Col>
                <h4 className="mb-0 fw-bold">
                  <i className="fas fa-shield-alt me-2"></i>
                  INGENZI - Admin Panel
                </h4>
                <small className="text-light opacity-75">
                  Welcome, {userInfo?.fullName} | Role: {userInfo?.role}
                </small>
              </Col>
              <Col xs="auto">
                <div className="d-flex gap-2 align-items-center">
                  {/* Archive Button */}
                  <Button 
                    variant="outline-light" 
                    size="sm"
                    onClick={() => setActiveTab('archive')}
                    className="d-flex align-items-center"
                  >
                    <i className="fas fa-archive me-2"></i>
                    Archive
                  </Button>
                  
                  {/* Expiry Button */}
                  <Button 
                    variant="outline-warning" 
                    size="sm"
                    onClick={() => setActiveTab('expiry')}
                    className="d-flex align-items-center"
                  >
                    <i className="fas fa-clock me-2"></i>
                    Expiry
                  </Button>
                  
                  {/* Active Docs Button */}
                  <Button 
                    variant="outline-success" 
                    size="sm"
                    onClick={() => setActiveTab('activeDocs')}
                    className="d-flex align-items-center"
                  >
                    <i className="fas fa-check-circle me-2"></i>
                    Active Docs
                  </Button>
                  
                  {/* Divider */}
                  <div className="vr bg-light opacity-50" style={{height: '30px'}}></div>
                  
                  {/* Logout Button */}
                  <Button variant="outline-light" size="sm" onClick={onLogout}>
                    <i className="fas fa-sign-out-alt me-2"></i>
                    Logout
                  </Button>
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
        <Col xs={12} className="py-4">
          <Container>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                {renderContent()}
              </Card.Body>
            </Card>
          </Container>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
