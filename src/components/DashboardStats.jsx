import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Badge, ProgressBar } from 'react-bootstrap';
import { apiClient } from '../services/apiConfig';

const DashboardStats = ({ userRole }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(loadDashboardStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardStats = async () => {
    try {
      const response = await apiClient.get('/dashboard/stats');
      setStats(response.data);
      setError('');
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading dashboard statistics...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Card className="border-danger">
          <Card.Body className="text-center text-danger">
            <i className="fas fa-exclamation-triangle fa-2x mb-2"></i>
            <p>{error}</p>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  const userStats = stats?.users || {};
  const locationStats = stats?.locations || {};
  const totalUsers = userStats.totalUsers || 0;
  const activeUsers = userStats.activeUsers || 0;
  const inactiveUsers = userStats.inactiveUsers || 0;
  const activePercentage = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h3 className="mb-3">
            <i className="fas fa-chart-line me-2 text-primary"></i>
            Dashboard Overview
          </h3>
          <p className="text-muted">Real-time system statistics and insights</p>
        </Col>
      </Row>

      {/* User Statistics Section */}
      <Row className="g-4 mb-4">
        <Col xs={12}>
          <h5 className="text-secondary mb-3">
            <i className="fas fa-users me-2"></i>
            User Management
          </h5>
        </Col>
        
        <Col xs={12} sm={6} lg={3}>
          <Card className="h-100 border-0 shadow-sm hover-lift">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p className="text-muted mb-1 small">Total Users</p>
                  <h2 className="mb-0 fw-bold">{totalUsers}</h2>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <i className="fas fa-users fa-2x text-primary"></i>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">All registered users</small>
                <Badge bg="primary">{totalUsers}</Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="h-100 border-0 shadow-sm hover-lift">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p className="text-muted mb-1 small">Active Users</p>
                  <h2 className="mb-0 fw-bold text-success">{activeUsers}</h2>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <i className="fas fa-user-check fa-2x text-success"></i>
                </div>
              </div>
              <div className="mb-2">
                <ProgressBar 
                  now={activePercentage} 
                  variant="success" 
                  style={{ height: '6px' }}
                />
              </div>
              <small className="text-muted">
                {activePercentage.toFixed(1)}% of total users
              </small>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="h-100 border-0 shadow-sm hover-lift">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p className="text-muted mb-1 small">Inactive Users</p>
                  <h2 className="mb-0 fw-bold text-danger">{inactiveUsers}</h2>
                </div>
                <div className="bg-danger bg-opacity-10 p-3 rounded">
                  <i className="fas fa-user-times fa-2x text-danger"></i>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">Deactivated accounts</small>
                <Badge bg="danger">{inactiveUsers}</Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="h-100 border-0 shadow-sm hover-lift">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p className="text-muted mb-1 small">User Activity</p>
                  <h2 className="mb-0 fw-bold text-info">
                    {activePercentage.toFixed(0)}%
                  </h2>
                </div>
                <div className="bg-info bg-opacity-10 p-3 rounded">
                  <i className="fas fa-chart-pie fa-2x text-info"></i>
                </div>
              </div>
              <small className="text-muted">
                Active user percentage
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Location Statistics Section */}
      <Row className="g-4 mb-4">
        <Col xs={12}>
          <h5 className="text-secondary mb-3">
            <i className="fas fa-map-marker-alt me-2"></i>
            Location Management
          </h5>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="h-100 border-0 shadow-sm hover-lift">
            <Card.Body className="text-center">
              <div className="bg-warning bg-opacity-10 p-3 rounded-circle d-inline-flex mb-3">
                <i className="fas fa-globe fa-2x text-warning"></i>
              </div>
              <h3 className="mb-1 fw-bold">{locationStats.totalCountries || 0}</h3>
              <p className="text-muted mb-0">Countries</p>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="h-100 border-0 shadow-sm hover-lift">
            <Card.Body className="text-center">
              <div className="bg-info bg-opacity-10 p-3 rounded-circle d-inline-flex mb-3">
                <i className="fas fa-building fa-2x text-info"></i>
              </div>
              <h3 className="mb-1 fw-bold">{locationStats.totalEntities || 0}</h3>
              <p className="text-muted mb-0">Entities</p>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="h-100 border-0 shadow-sm hover-lift">
            <Card.Body className="text-center">
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle d-inline-flex mb-3">
                <i className="fas fa-cubes fa-2x text-primary"></i>
              </div>
              <h3 className="mb-1 fw-bold">{locationStats.totalModules || 0}</h3>
              <p className="text-muted mb-0">Modules</p>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="h-100 border-0 shadow-sm hover-lift">
            <Card.Body className="text-center">
              <div className="bg-success bg-opacity-10 p-3 rounded-circle d-inline-flex mb-3">
                <i className="fas fa-layer-group fa-2x text-success"></i>
              </div>
              <h3 className="mb-1 fw-bold">{locationStats.totalSections || 0}</h3>
              <p className="text-muted mb-0">Sections</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions Section */}
      <Row className="g-4">
        <Col xs={12}>
          <h5 className="text-secondary mb-3">
            <i className="fas fa-info-circle me-2"></i>
            System Information
          </h5>
        </Col>

        <Col xs={12} lg={6}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h6 className="mb-3">
                <i className="fas fa-server me-2 text-success"></i>
                System Status
              </h6>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted">Server Status</span>
                <Badge bg="success">
                  <i className="fas fa-circle me-1"></i>
                  ONLINE
                </Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted">Database Connection</span>
                <Badge bg="success">
                  <i className="fas fa-check-circle me-1"></i>
                  Connected
                </Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted">Last Updated</span>
                <small className="text-muted">
                  {new Date().toLocaleTimeString()}
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} lg={6}>
          <Card className="border-0 shadow-sm bg-gradient" style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
          }}>
            <Card.Body className="text-white">
              <h6 className="mb-3">
                <i className="fas fa-lightbulb me-2"></i>
                Quick Insights
              </h6>
              <ul className="mb-0 ps-3">
                <li className="mb-2">
                  {inactiveUsers > 0 ? (
                    <span>
                      <strong>{inactiveUsers}</strong> inactive user{inactiveUsers > 1 ? 's' : ''} need{inactiveUsers === 1 ? 's' : ''} attention
                    </span>
                  ) : (
                    <span>All users are active ✓</span>
                  )}
                </li>
                <li className="mb-2">
                  <span>
                    System covers <strong>{locationStats.totalCountries || 0}</strong> countries
                  </span>
                </li>
                <li className="mb-0">
                  <span>
                    Total of <strong>{locationStats.totalSections || 0}</strong> sections configured
                  </span>
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <style jsx>{`
        .hover-lift {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
        }
      `}</style>
    </Container>
  );
};

export default DashboardStats;
