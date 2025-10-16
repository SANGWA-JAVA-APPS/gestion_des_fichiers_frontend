import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Navbar, Nav, NavDropdown, Button } from 'react-bootstrap';
import { getUserInfo } from '../services/authUtils';
import { logoutUser } from '../services/UpdRequests';
import DashboardBg from '../assets/DashbaordBg.png';

console.log('Dashboard.jsx file loaded, DashboardBg:', DashboardBg);

// Location Components
import CountryComponent from './location/CountryComponent';
import EntityComponent from './location/EntityComponent';
import ModulesComponent from './location/ModulesComponent';
import SectionsComponent from './location/SectionsComponent';

// User Components
import AccountComponent from './user/AccountComponent';
import RolesComponent from './user/RolesComponent';

// Document Components (to be added later)
import DocumentComponent from './DocumentComponent';

const Dashboard = ({ onLogout }) => {
  console.log('Dashboard component mounting...'); // First log
  
  const [activeComponent, setActiveComponent] = useState('country');
  const [userInfo, setUserInfo] = useState(null);
  const [showBackground, setShowBackground] = useState(true); // Toggle for background

  useEffect(() => {
    console.log('Dashboard useEffect running...'); // Second log
    const user = getUserInfo();
    setUserInfo(user);
    console.log('Dashboard Background Image:', DashboardBg); // Third log
    console.log('Show Background:', showBackground); // Fourth log
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
      // Still logout on frontend even if backend call fails
      onLogout();
    }
  };

  const renderActiveComponent = () => {
    switch (activeComponent) {
      // Location submenu components
      case 'country':
        return <CountryComponent />;
      case 'entity':
        return <EntityComponent />;
      case 'modules':
        return <ModulesComponent />;
      case 'sections':
        return <SectionsComponent />;
      // User submenu components
      case 'account':
        return <AccountComponent />;
      case 'roles':
        return <RolesComponent />;
      
      // Document components
      case 'document':
        return <DocumentComponent />;
      
      default:
        return <CountryComponent />;
    }
  };

  return (
    <Container fluid className="min-vh-100 p-0">
      {/* Header */}
      <Row className="g-0">
        <Col xs={12} className="py-2 bg-primary text-white shadow-sm">
          <Container>
            <Row className="align-items-center">
              <Col>
                <h4 className="mb-0 fw-bold">Gestion des Fichiers</h4>
                {userInfo && (
                  <small className="text-light opacity-75">
                    Welcome, {userInfo.fullName} ({userInfo.role})
                  </small>
                )}
              </Col>
              <Col xs="auto">
                <Button variant="outline-light" size="sm" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt me-1"></i>
                  Logout
                </Button>
              </Col>
            </Row>
          </Container>
        </Col>
      </Row>

      {/* Navigation Menu */}
      <Row className="g-0">
        <Col xs={12} className="bg-light border-bottom">
          <Container>
            <Row>
              <Col xs={12}>
                <Navbar expand="lg" className="px-0">
                  <Navbar.Toggle aria-controls="basic-navbar-nav" />
                  <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                      <NavDropdown title={
                        <span>
                          <i className="fas fa-map-marker-alt me-2"></i>
                          Location
                        </span>
                      } id="location-dropdown">
                        <NavDropdown.Item onClick={() => setActiveComponent('country')}>
                          <i className="fas fa-globe me-2"></i>Country
                        </NavDropdown.Item>
                        <NavDropdown.Item onClick={() => setActiveComponent('entity')}>
                          <i className="fas fa-building me-2"></i>Entity
                        </NavDropdown.Item>
                        <NavDropdown.Item onClick={() => setActiveComponent('modules')}>
                          <i className="fas fa-cubes me-2"></i>Modules
                        </NavDropdown.Item>
                        <NavDropdown.Item onClick={() => setActiveComponent('sections')}>
                          <i className="fas fa-layer-group me-2"></i>Sections
                        </NavDropdown.Item>
                      </NavDropdown>

                      <NavDropdown title={
                        <span>
                          <i className="fas fa-users me-2"></i>
                          User
                        </span>
                      } id="user-dropdown">
                        <NavDropdown.Item onClick={() => setActiveComponent('account')}>
                          <i className="fas fa-user me-2"></i>Account
                        </NavDropdown.Item>
                        <NavDropdown.Item onClick={() => setActiveComponent('roles')}>
                          <i className="fas fa-user-tag me-2"></i>Roles
                        </NavDropdown.Item>
                      </NavDropdown>

                      <Nav.Link onClick={() => setActiveComponent('document')}>
                        <i className="fas fa-file-alt me-2"></i>Document
                      </Nav.Link>
                    </Nav>
                  </Navbar.Collapse>
                </Navbar>
              </Col>
            </Row>
          </Container>
        </Col>
      </Row>

      {/* Main Content */}
      <Row className="g-0 flex-grow-1">
        <Col 
          xs={12} 
          className="py-4" 
          style={{
            ...(showBackground && {
              backgroundImage: `url(${DashboardBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundAttachment: 'fixed'
            }),
            minHeight: '100vh',
            backgroundColor: showBackground ? 'transparent' : '#f8f9fa'
          }}
        >
          <Container>
            <Row>
              <Col xs={12}>
                {/* Toggle button for debugging */}
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="mb-3"
                  onClick={() => setShowBackground(!showBackground)}
                >
                  {showBackground ? 'Hide' : 'Show'} Background
                </Button>
                
                <Card className="border-0 shadow-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
                  <Card.Body className="p-4">
                    {renderActiveComponent()}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;