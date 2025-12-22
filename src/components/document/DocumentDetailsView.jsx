import React from 'react';
import { Modal, Button } from 'react-bootstrap';

/**
 * Reusable modal component for displaying document details
 * @param {boolean} show - Controls modal visibility
 * @param {function} onHide - Callback when modal is closed
 * @param {string} title - Modal title
 * @param {ReactNode} children - Modal body content
 * @param {string} size - Modal size ('sm', 'lg', 'xl', or default)
 * @param {boolean} centered - Whether to center the modal vertically
 * @param {string} closeButtonText - Text for close button
 * @param {string} closeButtonVariant - Bootstrap variant for close button
 * @param {ReactNode} footer - Optional custom footer content
 */
const DocumentDetailsView = ({
  show = false,
  onHide,
  title = 'Document',
  children,
  size = 'lg',
  centered = true,
  closeButtonText = 'Close',
  closeButtonVariant = 'secondary',
  footer = null
}) => {
  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      size={size} 
      centered={centered}
      backdrop="static"
      keyboard={true}
    >
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          <i className="bi bi-file-earmark-text me-2"></i>
          {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {children}
      </Modal.Body>
      <Modal.Footer>
        {footer || (
          <Button variant={closeButtonVariant} onClick={onHide}>
            <i className="bi bi-x-circle me-2"></i>
            {closeButtonText}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default DocumentDetailsView;
