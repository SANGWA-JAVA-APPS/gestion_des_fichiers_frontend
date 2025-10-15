import React, { useState } from 'react';
import { Container, Row, Col, Card, Nav, Button, Alert } from 'react-bootstrap';
import { getUserInfo } from '../services/authUtils';

// Document Components (User can only view their own documents)
import DocumentComponent from './DocumentComponent';

const UserDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const userInfo = getUserInfo();

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div>
            <h3 className="mb-4">My Dashboard</h3>
            <Alert variant="info" className="mb-4">
              <i className="fas fa-info-circle me-2"></i>
              <strong>Welcome!</strong> You can view and manage your personal documents here.
            </Alert>
            <Row className="g-4">
              <Col xs={12} md={6}>
                <Card className="text-center shadow-sm border-primary h-100">
                  <Card.Body className="d-flex flex-column justify-content-between">
                    <div>
                      <i className="fas fa-file-alt fa-3x text-primary mb-3"></i>
                      <Card.Title>My Documents</Card.Title>
                      <Card.Text>View and manage your personal documents</Card.Text>
                    </div>
                    <Button variant="primary" size="sm" onClick={() => setActiveTab('document')}>
                      <i className="fas fa-folder-open me-2"></i>
                      Open Documents
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col xs={12} md={6}>
                <Card className="text-center shadow-sm border-success h-100">
                  <Card.Body className="d-flex flex-column justify-content-between">
                    <div>
                      <i className="fas fa-user-circle fa-3x text-success mb-3"></i>
                      <Card.Title>My Profile</Card.Title>
                      <Card.Text>View your profile information</Card.Text>
                    </div>
                    <Button variant="success" size="sm" onClick={() => setActiveTab('profile')}>
                      <i className="fas fa-id-card me-2"></i>
                      View Profile
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row className="mt-4">
              <Col xs={12}>
                <Card className="bg-light">
                  <Card.Body>
                    <h5 className="mb-3">
                      <i className="fas fa-question-circle me-2 text-info"></i>
                      Quick Help
                    </h5>
                    <p><strong>What you can do:</strong></p>
                    <ul className="mb-0">
                      <li>View your personal documents</li>
                      <li>Upload new documents</li>
                      <li>Download your documents</li>
                      <li>Check document status and expiry dates</li>
                      <li>Update your profile information</li>
                    </ul>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>
        );
      
      case 'document':
        return <DocumentComponent />;
      
      case 'profile':
        return (
          <div>
            <h3 className="mb-4">
              <i className="fas fa-user-circle me-2"></i>
              My Profile
            </h3>
            <Card>
              <Card.Body>
                <Row className="mb-3">
                  <Col xs={12} md={4} className="text-md-end fw-bold">
                    Username:
                  </Col>
                  <Col xs={12} md={8}>
                    {userInfo?.username}
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col xs={12} md={4} className="text-md-end fw-bold">
                    Full Name:
                  </Col>
                  <Col xs={12} md={8}>
                    {userInfo?.fullName}
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col xs={12} md={4} className="text-md-end fw-bold">
                    Email:
                  </Col>
                  <Col xs={12} md={8}>
                    {userInfo?.email}
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col xs={12} md={4} className="text-md-end fw-bold">
                    Role:
                  </Col>
                  <Col xs={12} md={8}>
                    <span className="badge bg-primary">{userInfo?.role}</span>
                  </Col>
                </Row>
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
      <Row className="g-0 bg-info text-white shadow">
        <Col xs={12} className="py-3">
          <Container>
            <Row className="align-items-center">
              <Col>
                <h4 className="mb-0 fw-bold">
                  <i className="fas fa-user me-2"></i>
                  INGENZI - User Portal
                </h4>
                <small className="text-light opacity-75">
                  Welcome, {userInfo?.fullName}
                </small>
              </Col>
              <Col xs="auto">
                <Button variant="outline-light" size="sm" onClick={onLogout}>
                  <i className="fas fa-sign-out-alt me-2"></i>
                  Logout
                </Button>
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
              <Nav.Item>
                <Nav.Link 
                  active={activeTab === 'document'} 
                  onClick={() => setActiveTab('document')}
                  className="text-dark"
                >
                  <i className="fas fa-file-alt me-2"></i>
                  My Documents
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link 
                  active={activeTab === 'profile'} 
                  onClick={() => setActiveTab('profile')}
                  className="text-dark"
                >
                  <i className="fas fa-user-circle me-2"></i>
                  Profile
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

export default UserDashboard;
