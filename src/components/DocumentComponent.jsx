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
    <div className="document-management">
      <Row className="mb-3">
        <Col>
          <h3 className="mb-3">
            <i className="fas fa-file-alt me-2"></i>
            {getText('document.title', language) || 'Gestion des Documents'}
          </h3>
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
                <Nav.Link 
                  active={activeTab === 'docStatus'} 
                  onClick={() => setActiveTab('docStatus')}
                  className="border-bottom"
                >
                  <i className="fas fa-tag me-2"></i>
                  {getText('document.docStatus', language)}
                </Nav.Link>
                <Nav.Link 
                  active={activeTab === 'sectionCategory'} 
                  onClick={() => setActiveTab('sectionCategory')}
                  className="border-bottom"
                >
                  <i className="fas fa-folder me-2"></i>
                  {getText('document.sectionCategory', language)}
                </Nav.Link>
                <Nav.Link 
                  active={activeTab === 'normeLoi'} 
                  onClick={() => setActiveTab('normeLoi')}
                  className="border-bottom"
                >
                  <i className="fas fa-gavel me-2"></i>
                  {getText('document.normeLoi', language)}
                </Nav.Link>
                <Nav.Link 
                  active={activeTab === 'commAssetLand'} 
                  onClick={() => setActiveTab('commAssetLand')}
                  className="border-bottom"
                >
                  <i className="fas fa-map-marked me-2"></i>
                  {getText('document.commAssetLand', language)}
                </Nav.Link>
                <Nav.Link 
                  active={activeTab === 'permiConstruction'} 
                  onClick={() => setActiveTab('permiConstruction')}
                  className="border-bottom"
                >
                  <i className="fas fa-hard-hat me-2"></i>
                  {getText('document.permiConstruction', language)}
                </Nav.Link>
                <Nav.Link 
                  active={activeTab === 'accordConcession'} 
                  onClick={() => setActiveTab('accordConcession')}
                  className="border-bottom"
                >
                  <i className="fas fa-handshake me-2"></i>
                  {getText('document.accordConcession', language)}
                </Nav.Link>
                <Nav.Link 
                  active={activeTab === 'estate'} 
                  onClick={() => setActiveTab('estate')}
                  className="border-bottom"
                >
                  <i className="fas fa-building me-2"></i>
                  {getText('document.estate', language)}
                </Nav.Link>
                <Nav.Link 
                  active={activeTab === 'certLicenses'} 
                  onClick={() => setActiveTab('certLicenses')}
                  className="border-bottom"
                >
                  <i className="fas fa-certificate me-2"></i>
                  {getText('document.certLicenses', language)}
                </Nav.Link>
                <Nav.Link 
                  active={activeTab === 'cargoDamage'} 
                  onClick={() => setActiveTab('cargoDamage')}
                  className="border-bottom"
                >
                  <i className="fas fa-box-open me-2"></i>
                  {getText('document.cargoDamage', language)}
                </Nav.Link>
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
