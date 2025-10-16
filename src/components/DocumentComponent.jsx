import React, { useState } from 'react';
import { Row, Col, Card, Nav } from 'react-bootstrap';
import { getText } from '../data/texts';

// Import all document components
import {
  DocStatusComponent,
  SectionCategoryComponent,
  NormeLoiComponent,
  CommAssetLandComponent,
  PermiConstructionComponent,
  AccordConcessionComponent,
  EstateComponent,
  CertLicensesComponent,
  CargoDamageComponent
} from './document';

const DocumentComponent = () => {
  const [activeTab, setActiveTab] = useState('docStatus');
  const [language] = useState('en');

  // Reusable styles for navigation items
  const getNavLinkStyle = (tabName) => ({
    backgroundColor: activeTab === tabName ? '#ffefa6ff' : 'transparent',
    color: activeTab === tabName ? '#000' : 'inherit',
    
    cursor: 'pointer'
  });

  // Navigation items configuration
  const navigationItems = [
    { key: 'docStatus', icon: 'fas fa-tag', textKey: 'document.docStatus' },
    { key: 'sectionCategory', icon: 'fas fa-folder', textKey: 'document.sectionCategory' },
    { key: 'normeLoi', icon: 'fas fa-gavel', textKey: 'document.normeLoi' },
    { key: 'commAssetLand', icon: 'fas fa-map-marked', textKey: 'document.commAssetLand' },
    { key: 'permiConstruction', icon: 'fas fa-hard-hat', textKey: 'document.permiConstruction' },
    { key: 'accordConcession', icon: 'fas fa-handshake', textKey: 'document.accordConcession' },
    { key: 'estate', icon: 'fas fa-building', textKey: 'document.estate' },
    { key: 'certLicenses', icon: 'fas fa-certificate', textKey: 'document.certLicenses' },
    { key: 'cargoDamage', icon: 'fas fa-box-open', textKey: 'document.cargoDamage' }
  ];

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'docStatus':
        return <DocStatusComponent />;
      case 'sectionCategory':
        return <SectionCategoryComponent />;
      case 'normeLoi':
        return <NormeLoiComponent />;
      case 'commAssetLand':
        return <CommAssetLandComponent />;
      case 'permiConstruction':
        return <PermiConstructionComponent />;
      case 'accordConcession':
        return <AccordConcessionComponent />;
      case 'estate':
        return <EstateComponent />;
      case 'certLicenses':
        return <CertLicensesComponent />;
      case 'cargoDamage':
        return <CargoDamageComponent />;
      default:
        return <DocStatusComponent />;
    }
  };
  return (
    <div className="document-management" >
      <Row className="mb-2  ">
        <Col>
          <h5 className="mb-3">
            <i className="fas fa-file-alt me-2"></i>
            {language === 'fr' ? 'Gestion des Documents' : 'Document Management'}
          </h5>
        </Col>
      </Row>

      <Row>
        <Col md={3} lg={2}>
          <Card className="mb-3">
            <Card.Header className="bg-primary text-white">
              <strong>{language === 'fr' ? 'Types de Documents' : 'Document Types'}</strong>
            </Card.Header>
            <Card.Body className="p-0">
              <Nav className="flex-column">
                {navigationItems.map((item) => (
                  <Nav.Link 
                    key={item.key}
                    active={activeTab === item.key} 
                    onClick={() => setActiveTab(item.key)}
                    className="border-bottom document-nav-item"
                    style={getNavLinkStyle(item.key)}
                  >
                    <i className={`${item.icon} me-2`}></i>
                    {getText(item.textKey, language)}
                  </Nav.Link>
                ))}
              </Nav>
            </Card.Body>
          </Card>
          
          <Card className="bg-light">
            <Card.Body className="p-2 text-center">
              <small className="text-muted">
                {language === 'fr' ? '9/17 types disponibles' : '9/17 types available'}
              </small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={9} lg={10}>
          <div className="document-content">
            {renderActiveComponent()}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default DocumentComponent;
