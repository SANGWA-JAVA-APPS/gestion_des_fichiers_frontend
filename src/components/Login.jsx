import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { loginUser } from '../services/Inserts';

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        // Call success callback to redirect
        onLoginSuccess();
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="min-vh-100 p-0">
      {/* Application Header */}
      <Row className="g-0">
        <Col xs={12} className="py-4 bg-primary text-white text-center shadow-sm">
          <h1 className="mb-0 fw-bold">INGENZI</h1>
          <small className="text-light opacity-75">Secure File Management System</small>
        </Col>
      </Row>

      {/* Main Content */}
      <Row className="flex-grow-1 g-0 bg-light">
        <Col xs={12} className="py-4 py-md-5 d-flex align-items-center">
          <Container>
            <Row className="justify-content-center">
              <Col xs={12} sm={10} md={8} lg={6} xl={5}>
                <Card className="shadow border-0">
                  <Card.Body className="p-4 p-md-5">
                    <div className="text-center mb-4">
                      <h2 className="fw-bold text-dark mb-2">Welcome Back</h2>
                      <p className="text-muted">Please sign in to your account</p>
                    </div>

                    {error && (
                      <Alert variant="danger" className="mb-3">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        {error}
                      </Alert>
                    )}

                    <Form onSubmit={handleSubmit}>
                      <Row>
                        <Col xs={12}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Username</Form.Label>
                            <Form.Control
                              type="text"
                              name="username"
                              value={formData.username}
                              onChange={handleChange}
                              required
                              disabled={loading}
                              placeholder="Enter your username"
                              className="py-2"
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col xs={12}>
                          <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold">Password</Form.Label>
                            <Form.Control
                              type="password"
                              name="password"
                              value={formData.password}
                              onChange={handleChange}
                              required
                              disabled={loading}
                              placeholder="Enter your password"
                              className="py-2"
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col xs={12}>
                          <Button
                            variant="primary"
                            type="submit"
                            className="w-100 py-2"
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

                    <Row className="mt-4">
                      <Col xs={12} className="text-center">
                        <small className="text-muted">
                          <i className="fas fa-shield-alt me-1"></i>
                          Your data is secure and encrypted
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

      {/* Footer */}
      <Row className="g-0">
        <Col xs={12} className="py-3 bg-dark text-white text-center">
          <Container>
            <Row>
              <Col xs={12}>
                <small className="text-light opacity-75">
                  © 2025 Gestion des Fichiers - Professional File Management Solution
                </small>
              </Col>
            </Row>
          </Container>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;