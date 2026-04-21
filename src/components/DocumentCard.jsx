
import React, { useState } from 'react';
import { Col, Card, Button, Badge, ListGroup } from 'react-bootstrap';
import { getDocumentIcon } from './document/documentIconUtils';
import DownloadConfirmationModal from './document/DownloadConfirmationModal';
import * as downloadService from '../services/downloadService';

const DocumentCard = ({ 
  item, 
  onTitleClick, 
  onViewDetails, 
  onEdit, 
  onDelete, 
  language = 'fr',
  getDisplayName = (item) => item.document?.originalFileName || item.refeRequest || item.contratConcession || 'Untitled',
  getDescription = (item) => item.description || item.emplacement || '',
  showViewButton = true,
  showEditButton = true,
  showDeleteButton = true
}) => {
  // Helper to remove file extension
  const removeFileExtension = (filename) => {
    if (!filename) return '';
    return filename.replace(/\.[^/.]+$/, '');
  };

  const docIcon = getDocumentIcon(item.document);
  const displayName = getDisplayName(item);
  const description = getDescription(item);

  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [docToDownload, setDocToDownload] = useState(null);

  const handleTitleClick = () => {
    // Backwards compatibility: if parent provided an onTitleClick handler, use it
    if (typeof onTitleClick === 'function') {
      return onTitleClick(item);
    }

    if (item?.document) {
      setDocToDownload(item.document);
      setShowDownloadModal(true);
    } else {
      alert(language === 'fr' ? 'Aucun document disponible' : 'No document available');
    }
  };

  const handleConfirmDownload = async () => {
    try {
      if (docToDownload) {
        await downloadService.downloadFile(docToDownload);
      }
    } catch (err) {
      console.error('Download error:', err);
      alert(language === 'fr' ? `Erreur lors du téléchargement: ${err.message}` : `Download error: ${err.message}`);
    } finally {
      setShowDownloadModal(false);
      setDocToDownload(null);
    }
  };

  return (
    <Col xs={12} sm={6} md={4} lg={3}>
      <Card className={`h-100 shadow-sm hover-shadow ${docIcon ? 'doc-card-with-icon' : ''}`}>
        {docIcon && (
          <div className="doc-icon-badge">
            <img src={docIcon} alt="Document Type" />
          </div>
        )}
        <Card.Body>
          <Card.Title 
            className="text-primary text-truncate-single" 
            title={displayName}
            onClick={handleTitleClick}
            style={{ cursor: 'pointer' }}
          >
            <i className="bi bi-file-earmark-text me-2"></i>
            {removeFileExtension(displayName)}
          </Card.Title>
          <Card.Text className="text-muted small text-clamp-3" style={{ minHeight: '60px' }}>
            {description || (language === 'fr' ? 'Aucune description' : 'No description')}
          </Card.Text>
        </Card.Body>
        <ListGroup className="list-group-flush">
          <ListGroup.Item>
            <strong>{language === 'fr' ? 'Version:' : 'Version:'}</strong>{' '}
            {item.document?.version || '-'}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>{language === 'fr' ? 'Fichier:' : 'File:'}</strong>{' '}
            <small className="text-truncate d-block">
              {item.document?.originalFileName || '-'}
            </small>
          </ListGroup.Item>
          <ListGroup.Item>
            <small className="text-muted d-block mb-2">
              <i className="bi bi-person-check me-1"></i>
              {item.doneBy?.fullName || '—'}
            </small>
            <small className="text-muted d-block mb-2">
              <i className="bi bi-tag me-1"></i>
              {item.status?.name || '—'}
            </small>
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>{language === 'fr' ? 'Statut:' : 'Status:'}</strong>{' '}
            <Badge bg={item.document?.status === 'ACTIVE' ? 'success' : 'secondary'}>
              {item.document?.status || '-'}
            </Badge>
          </ListGroup.Item>
        </ListGroup>
        <Card.Body>
          <div className="d-flex gap-2 flex-wrap">
            {showViewButton && (
              <Button
                variant="link"
                size="sm"
                onClick={() => onViewDetails(item)}
                className="p-0 text-decoration-none"
              >
                <i className="bi bi-eye me-1"></i>
                {language === 'fr' ? 'Détails' : 'Details'}
              </Button>
            )}
            {showEditButton && (
              <Button
                variant="link"
                size="sm"
                onClick={() => onEdit(item)}
                className="p-0 text-decoration-none"
              >
                <i className="bi bi-pencil me-1"></i>
                {language === 'fr' ? 'Modifier' : 'Edit'}
              </Button>
            )}
            {showDeleteButton && (
              <Button
                variant="link"
                size="sm"
                onClick={() => onDelete(item)}
                className="p-0 text-decoration-none text-danger"
              >
                <i className="bi bi-trash me-1"></i>
                {language === 'fr' ? 'Supprimer' : 'Delete'}
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>

      <DownloadConfirmationModal
        show={showDownloadModal}
        onHide={() => { setShowDownloadModal(false); setDocToDownload(null); }}
        onConfirm={handleConfirmDownload}
        fileName={docToDownload?.originalFileName || docToDownload?.fileName || ''}
        fileSize={docToDownload?.fileSize ? (docToDownload.fileSize / 1024).toFixed(2) + ' KB' : null}
        language={language}
      />
    </Col>
  );
};

export default DocumentCard;