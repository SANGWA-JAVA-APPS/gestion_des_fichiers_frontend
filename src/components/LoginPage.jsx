import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { loginUser } from '../services/Inserts';
import { setUserInfo } from '../services/authUtils';
import '../styles/galaxy-animation.css';
import cloudFilesImage from '../assets/cloud-files.png';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import LanguageSwitcher from '../i18n/LanguageSwitcher';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const { t } = useLanguage();
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
        setUserInfo(response);

        navigate('/dashboard/docstatus', { replace: true });
      } else {
        setError(response.message || t("auth.loginFailed"));
      }
    } catch (err) {
      setError(err.message || t("auth.loginError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="vh-100 p-0 position-relative overflow-hidden d-flex flex-column">
      {/* Background */}
      <div className="galaxy-background">
        <div className="stars-layer stars-layer-1"></div>
        <div className="stars-layer stars-layer-2"></div>
        <div className="stars-layer stars-layer-3"></div>
        <div className="nebula-layer"></div>
        <div className="gradient-overlay"></div>
      </div>

      {/* Image */}
      <div className="bouncing-cloud-container">
        <img src={cloudFilesImage} alt="Cloud Files" className="bouncing-cloud-image" />
      </div>

      {/* Header */}
    {/* Header */}
<Row className="g-0 position-relative" style={{ zIndex: 10 }}>
  <Col
    xs={12}
    className="py-2 text-white shadow-sm backdrop-blur d-flex justify-content-between align-items-center px-3"
    style={{ backgroundColor: "#236873" }}
  >
    <div>
      <h3 className="mb-0 fw-bold">{t("appName")}</h3>
      <small className="text-light opacity-75" style={{ fontSize: "0.75rem" }}>
        {t("common.welcome")}
      </small>
    </div>

    <LanguageSwitcher />
  </Col>
</Row>

      {/* Content */}
      <Row className="flex-grow-1 g-0 position-relative d-flex align-items-center" style={{ zIndex: 10 }}>
        <Col xs={12}>
          <Container fluid>
            <Row className="justify-content-end">
              <Col xs={12} sm={10} md={8} lg={6} xl={5} xxl={4} className="ms-auto me-4">
                <Card className="login-card-gradient shadow-lg">
                  <Card.Body className="p-3 p-md-4">
                    <div className="text-center mb-3">
                      <h4 className="fw-bold text-white mb-1">
                        {t("auth.welcomeBack")}
                      </h4>
                      <p className="text-white-50 small mb-0">
                        {t("auth.signInSubtitle")}
                      </p>
                    </div>

                    {error && (
                      <Alert variant="danger" className="mb-2 py-2">
                        <small>{error}</small>
                      </Alert>
                    )}

                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-2">
                        <Form.Control
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          required
                          disabled={loading}
                          placeholder={t("auth.username")}
                          className="py-2 login-input"
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Control
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          disabled={loading}
                          placeholder={t("auth.password")}
                          className="py-2 login-input"
                        />
                      </Form.Group>

                      <Button
                        variant="light"
                        type="submit"
                        className="w-100 py-2 fw-semibold login-submit-btn"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Spinner as="span" animation="border" size="sm" className="me-2" />
                            {t("auth.signingIn")}
                          </>
                        ) : (
                          <>
                            {t("auth.signIn")}
                          </>
                        )}
                      </Button>
                    </Form>

                    <div className="text-center mt-2">
                      <small className="text-white-50" style={{ fontSize: '0.75rem' }}>
                        {t("auth.secure")}
                      </small>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </Col>
      </Row>

      {/* Footer */}
      <Row className="g-0 position-relative" style={{ zIndex: 10 }}>
        <Col xs={12} className="py-2 bg-dark bg-opacity-90 text-white backdrop-blur">
          <Container fluid>
            <Row>
              <Col xs={12} md={6} className="text-center text-md-start">
                <small style={{ fontSize: '0.7rem' }}>
                  © 2025 {t("appName")}
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
