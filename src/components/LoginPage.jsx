import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { loginUser } from '../services/Inserts';
import { setUserInfo } from '../services/authUtils';
import '../styles/galaxy-animation.css';
import cloudFilesImage from '../assets/cloud-files.png';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await loginUser(formData);
      
      if (response.success) {
        // Store user information in localStorage
        setUserInfo(response);
        
        console.log('Login successful:', {
          username: response.username,
          role: response.role,
          fullName: response.fullName
        });
           navigate('/dashboard/docstatus', { replace: true });
        // Call success callback to redirect to dashboard

      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="vh-100 p-0 position-relative overflow-hidden d-flex flex-column">
      {/* Galaxy Background Animation */}
      <div className="galaxy-background">
        <div className="stars-layer stars-layer-1"></div>
        <div className="stars-layer stars-layer-2"></div>
        <div className="stars-layer stars-layer-3"></div>
        <div className="nebula-layer"></div>
        <div className="gradient-overlay"></div>
      </div>

      {/* Bouncing Cloud Files Image - Left Side */}
      <div className="bouncing-cloud-container">
        <img 
          src={cloudFilesImage} 
          alt="Cloud Files" 
          className="bouncing-cloud-image"
        />
      </div>

      {/* Application Header */}
      <Row className="g-0 position-relative" style={{ zIndex: 10 }}>
        <Col xs={12} className="py-2 text-white text-center shadow-sm backdrop-blur" style={{ backgroundColor: '#236873' }}>
          <h3 className="mb-0 fw-bold">INGENZI</h3>
          <small className="text-light opacity-75" style={{ fontSize: '0.75rem' }}>Secure File Management</small>
        </Col>
      </Row>

      {/* Main Content */}
      <Row className="flex-grow-1 g-0 position-relative d-flex align-items-center" style={{ zIndex: 10 }}>
        <Col xs={12}>
          <Container fluid>
            <Row className="justify-content-end">
              <Col xs={12} sm={10} md={8} lg={6} xl={5} xxl={4} className="ms-auto me-4">
                <Card className="login-card-gradient shadow-lg">
                  <Card.Body className="p-3 p-md-4">
                    <div className="text-center mb-3">
                      <h4 className="fw-bold text-white mb-1">Welcome Back</h4>
                      <p className="text-white-50 small mb-0">Sign in to your account</p>
                    </div>

                    {error && (
                      <Alert variant="danger" className="mb-2 py-2">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        <small>{error}</small>
                      </Alert>
                    )}

                    <Form onSubmit={handleSubmit}>
                      <Row>
                        <Col xs={12}>
                          <Form.Group className="mb-2">
                            <Form.Control
                              type="text"
                              name="username"
                              value={formData.username}
                              onChange={handleChange}
                              required
                              disabled={loading}
                              placeholder="Username"
                              className="py-2 login-input"
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col xs={12}>
                          <Form.Group className="mb-3">
                            <Form.Control
                              type="password"
                              name="password"
                              value={formData.password}
                              onChange={handleChange}
                              required
                              disabled={loading}
                              placeholder="Password"
                              className="py-2 login-input"
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col xs={12}>
                          <Button
                            variant="light"
                            type="submit"
                            className="w-100 py-2 fw-semibold login-submit-btn"
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <Spinner
                                  as="span"
                                  animation="border"
                                  size="sm"
                                  role="status"
                                  className="me-2"
                                />
                                Signing in...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-sign-in-alt me-2"></i>
                                Sign In
                              </>
                            )}
                          </Button>
                        </Col>
                      </Row>
                    </Form>

                    <Row className="mt-2">
                      <Col xs={12} className="text-center">
                        <small className="text-white-50" style={{ fontSize: '0.75rem' }}>
                          <i className="fas fa-shield-alt me-1"></i>
                          Secure & Encrypted
                        </small>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </Col>
      </Row>

      {/* Compact Footer */}
      <Row className="g-0 position-relative" style={{ zIndex: 10 }}>
        <Col xs={12} className="py-2 bg-dark bg-opacity-90 text-white backdrop-blur">
          <Container fluid>
            <Row className="align-items-center">
              <Col xs={12} md={6} className="text-center text-md-start mb-1 mb-md-0">
                <small className="text-light opacity-75" style={{ fontSize: '0.7rem' }}>
                  © 2025 Gestion des Fichiers
                </small>
              </Col>
              <Col xs={12} md={6} className="text-center text-md-end">
                <small style={{ fontSize: '0.7rem' }}>
                  <span className="text-light opacity-75 me-1">Powered by</span>
                  <a 
                    href="https://codeguru-pro.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-decoration-none text-white fw-semibold codeguru-link"
                  >
                    CodeGuru
                  </a>
                </small>
              </Col>
            </Row>
          </Container>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;