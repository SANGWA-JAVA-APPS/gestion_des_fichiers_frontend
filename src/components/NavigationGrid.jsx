import React from "react";
import { Row, Col, Card } from "react-bootstrap";
import { getText } from "../data/texts";

const NavigationGrid = ({ language, onLanguageChange }) => {
  const navigationItems = [
    {
      id: "location",
      title: getText("navigation.location", language),
      description: getText("descriptions.location", language),
      icon: "📍",
      color: "#3498db",
    },
    {
      id: "users",
      title: getText("navigation.users", language),
      description: getText("descriptions.users", language),
      icon: "👥",
      color: "#27ae60",
    },
    {
      id: "document",
      title: getText("navigation.document", language),
      description: getText("descriptions.document", language),
      icon: "📄",
      color: "#e74c3c",
    },
  ];

  const handleCardClick = (itemId) => {
    console.log(`Navigation to: ${itemId}`);
    // Here you would implement navigation logic
  };

  const toggleLanguage = () => {
    onLanguageChange((prevLang) => (prevLang === "fr" ? "en" : "fr"));
  };

  return (
    <div className="navigation-grid-wrapper">
      {/* Language toggle section */}
      <Row className="mb-4">
        <Col xs={12}>
          <div className="d-flex justify-content-end">
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={toggleLanguage}
              aria-label={`Switch to ${
                language === "fr" ? "English" : "French"
              }`}>
              {language === "fr" ? "🇬🇧 EN" : "🇫🇷 FR"}
            </button>
          </div>
        </Col>
      </Row>

      {/* Welcome section */}
      <Row className="mb-5">
        <Col xs={12}>
          <div className="text-center">
            <h2 className="mb-0 text-primary fw-semibold">
              {getText("common.welcome", language)}
            </h2>
          </div>
        </Col>
      </Row>

      {/* Navigation cards grid */}
      <Row className="g-4">
        {navigationItems.map((item) => (
          <Col
            key={item.id}
            xs={12}
            md={6}
            lg={4}
            className="d-flex">
            <Card 
              className="navigation-card w-100 shadow-sm border-0 h-100"
              onClick={() => handleCardClick(item.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleCardClick(item.id);
                }
              }}
              aria-label={`${getText("common.select", language)} ${item.title}`}
              style={{ cursor: "pointer", transition: "all 0.3s ease" }}>
              <Card.Body className="d-flex align-items-center p-4">
                {/* Icon on the left */}
                <div 
                  className="navigation-card__icon me-4 flex-shrink-0"
                  style={{ 
                    fontSize: '3rem',
                    color: item.color,
                    transition: 'transform 0.3s ease'
                  }}
                  role="img"
                  aria-label={item.title}>
                  {item.icon}
                </div>
                
                {/* Text content on the right */}
                <div className="flex-grow-1">
                  <Card.Title className="navigation-card__title mb-2 h5 fw-bold text-dark">
                    {item.title}
                  </Card.Title>
                  
                  <Card.Text className="navigation-card__description text-muted mb-0">
                    {item.description}
                  </Card.Text>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default NavigationGrid;
