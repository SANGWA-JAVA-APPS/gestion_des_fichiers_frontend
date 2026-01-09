import React from 'react';
import { Modal, Button, ListGroup, Badge, Alert, Row, Col } from 'react-bootstrap';
import { downloadFile, openFileInNewTab, getFileUrl } from '../services/downloadService';


const GenericDocumentDetailsModal = ({
  show,
  onHide,
  title = 'Document Details',
  language = 'fr',
  children,
  document: selectedDocument,
  onEdit,
  showEditButton = true,

}) => {
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    return `${(bytes / 1024).toFixed(2)} KB`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString(language);
  };

  // Common document information section
  const renderDocumentInfo = () => (
    <>
      {selectedDocument?.document ? (
        <ListGroup variant="flush">
          <ListGroup.Item>
            <strong>{language === 'fr' ? 'Nom du fichier:' : 'File name:'}</strong>{' '}
            <small>{selectedDocument.document.fileName}</small>
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>{language === 'fr' ? 'Nom original:' : 'Original name:'}</strong>{' '}
            {selectedDocument.document.originalFileName}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>{language === 'fr' ? 'Type:' : 'Type:'}</strong>{' '}
            {selectedDocument.document.contentType}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>{language === 'fr' ? 'Taille:' : 'Size:'}</strong>{' '}
            {formatFileSize(selectedDocument.document.fileSize)}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>{language === 'fr' ? 'Version:' : 'Version:'}</strong>{' '}
            {selectedDocument.document.version || '-'}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>{language === 'fr' ? 'Statut:' : 'Status:'}</strong>{' '}
            <Badge bg={selectedDocument.document.status === 'ACTIVE' ? 'success' : 'secondary'}>
              {selectedDocument.document.status}
            </Badge>
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>{language === 'fr' ? 'Créé le:' : 'Created:'}</strong>{' '}
            {formatDate(selectedDocument.document.createdAt)}
          </ListGroup.Item>
          {selectedDocument.document.updatedAt && (
            <ListGroup.Item>
              <strong>{language === 'fr' ? 'Modifié le:' : 'Updated:'}</strong>{' '}
              {formatDate(selectedDocument.document.updatedAt)}
            </ListGroup.Item>
          )}
        </ListGroup>
      ) : (
        <Alert variant="warning">
          {language === 'fr' ? 'Aucune information de document disponible' : 'No document information available'}
        </Alert>
      )}
    </>
  );

  // Owner information section
  const renderOwnerInfo = () => (
    selectedDocument?.document?.owner && (
      <ListGroup variant="flush">
        <ListGroup.Item>
          <strong>{language === 'fr' ? 'Nom complet:' : 'Full name:'}</strong>{' '}
          {selectedDocument.document.owner.fullName}
        </ListGroup.Item>
        <ListGroup.Item>
          <strong>{language === 'fr' ? 'Nom d\'utilisateur:' : 'Username:'}</strong>{' '}
          {selectedDocument.document.owner.username}
        </ListGroup.Item>
        <ListGroup.Item>
          <strong>{language === 'fr' ? 'Email:' : 'Email:'}</strong>{' '}
          {selectedDocument.document.owner.email}
        </ListGroup.Item>
      </ListGroup>
    )
  );

  // Done by information section
  const renderDoneByInfo = () => (
    selectedDocument?.doneBy && (
      <ListGroup variant="flush">
        <ListGroup.Item>
          <strong>{language === 'fr' ? 'Nom complet:' : 'Full name:'}</strong>{' '}
          {selectedDocument.doneBy.fullName}
        </ListGroup.Item>
        <ListGroup.Item>
          <strong>{language === 'fr' ? 'Nom d\'utilisateur:' : 'Username:'}</strong>{' '}
          {selectedDocument.doneBy.username}
        </ListGroup.Item>
      </ListGroup>
    )
  );

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {children ? children : (
          <div>
            <Row className="mb-3">
              <Col md={6}>
                <h6 className="text-muted">{language === 'fr' ? 'Informations Générales' : 'General Information'}</h6>
                {renderCustomSections(selectedDocument?.customSections)}
              </Col>
              <Col md={6}>
                <h6 className="text-muted">{language === 'fr' ? 'Informations du Document' : 'Document Information'}</h6>
                {renderDocumentInfo()}
              </Col>
            </Row>

            {selectedDocument?.document?.owner && (
              <Row className="mb-3">
                <Col>
                  <h6 className="text-muted">{language === 'fr' ? 'Propriétaire du Document' : 'Document Owner'}</h6>
                  {renderOwnerInfo()}
                </Col>
              </Row>
            )}

            {selectedDocument?.doneBy && (
              <Row>
                <Col>
                  <h6 className="text-muted">{language === 'fr' ? 'Réalisé par' : 'Done By'}</h6>
                  {renderDoneByInfo()}
                </Col>
              </Row>
            )}

            {/* Preview (images / PDFs) */}
            {selectedDocument?.document?.filePath && selectedDocument.document?.contentType && (
              <div className="mb-3 text-center">
                {selectedDocument.document.contentType.startsWith('image/') && (
                  <img src={getFileUrl(selectedDocument.document.filePath)} alt={selectedDocument.document.originalFileName} style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '0.25rem' }} />
                )}
                {selectedDocument.document.contentType === 'application/pdf' && (
                  <iframe src={getFileUrl(selectedDocument.document.filePath)} title={selectedDocument.document.originalFileName} style={{ width: '100%', height: '400px', border: '1px solid #ddd', borderRadius: '0.25rem' }} />
                )}
              </div>
            )}

            <div className="mt-4 d-flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (selectedDocument?.document) {
                    openFileInNewTab(selectedDocument.document);
                  }
                }}
                disabled={!selectedDocument?.document?.filePath}
              >
                <i className="bi bi-eye me-2"></i>
                {language === 'fr' ? 'Ouvrir le document' : 'Open Document'}
              </Button>
              <Button
                variant="success"
                size="sm"
                onClick={() => {
                  if (selectedDocument?.document) {
                    downloadFile(selectedDocument.document);
                  }
                }}
                disabled={!selectedDocument?.document?.filePath}
              >
                <i className="bi bi-download me-2"></i>
                {language === 'fr' ? 'Télécharger' : 'Download'}
              </Button>
              {showEditButton && onEdit && (
                <Button
                  variant="warning"
                  size="sm"
                  onClick={() => {
                    onHide();
                    onEdit(selectedDocument);
                  }}
                >
                  <i className="bi bi-pencil me-2"></i>
                  {language === 'fr' ? 'Modifier' : 'Edit'}
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          {language === 'fr' ? 'Fermer' : 'Close'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// Helper function to render custom sections
const renderCustomSections = (sections) => {
  if (!sections || sections.length === 0) return null;
  
  return sections.map((section, index) => (
    <React.Fragment key={index}>
      <h6 className="text-muted">{section.title}</h6>
      <ListGroup variant="flush">
        {section.fields.map((field, fieldIndex) => (
          <ListGroup.Item key={fieldIndex}>
            <strong>{field.label}:</strong>{' '}
            {field.badge ? <Badge bg={field.badge.type}>{field.value}</Badge> : field.value}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </React.Fragment>
  ));
};

export default GenericDocumentDetailsModal;