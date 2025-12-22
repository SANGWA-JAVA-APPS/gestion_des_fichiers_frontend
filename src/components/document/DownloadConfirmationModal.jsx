import React from 'react';
import { Modal, Button } from 'react-bootstrap';

/**
 * Reusable Download Confirmation Modal Component
 * 
 * @param {boolean} show - Controls modal visibility
 * @param {function} onHide - Callback when modal is closed
 * @param {function} onConfirm - Callback when download is confirmed
 * @param {string} fileName - Name of the file to download
 * @param {string} fileSize - Size of the file (optional)
 * @param {string} language - Language code ('fr' or 'en')
 */
const DownloadConfirmationModal = ({ 
  show, 
  onHide, 
  onConfirm, 
  fileName, 
  fileSize, 
  language = 'fr' 
}) => {
  
  const getText = (key) => {
    const texts = {
      title: {
        fr: 'Confirmer le téléchargement',
        en: 'Confirm Download'
      },
      message: {
        fr: 'Voulez-vous télécharger ce fichier ?',
        en: 'Do you want to download this file?'
      },
      fileName: {
        fr: 'Nom du fichier :',
        en: 'File name:'
      },
      fileSize: {
        fr: 'Taille :',
        en: 'Size:'
      },
      cancel: {
        fr: 'Annuler',
        en: 'Cancel'
      },
      download: {
        fr: 'Télécharger',
        en: 'Download'
      }
    };
    
    return texts[key]?.[language] || texts[key]?.['fr'] || key;
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title className="d-flex align-items-center">
          <i className="bi bi-download me-2"></i>
          {getText('title')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <div className="text-center mb-3">
          <i className="bi bi-file-earmark-arrow-down text-primary" style={{ fontSize: '3rem' }}></i>
        </div>
        <p className="text-center mb-3">{getText('message')}</p>
        <div className="bg-light p-3 rounded">
          <div className="mb-2">
            <strong>{getText('fileName')}</strong>
            <br />
            <span className="text-break">{fileName}</span>
          </div>
          {fileSize && (
            <div>
              <strong>{getText('fileSize')}</strong>
              <br />
              <span>{fileSize}</span>
            </div>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer className="bg-light">
        <Button variant="outline-secondary" onClick={onHide}>
          <i className="bi bi-x-circle me-2"></i>
          {getText('cancel')}
        </Button>
        <Button variant="primary" onClick={onConfirm}>
          <i className="bi bi-download me-2"></i>
          {getText('download')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DownloadConfirmationModal;
