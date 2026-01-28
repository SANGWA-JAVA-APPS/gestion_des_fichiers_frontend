/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table, Modal, Form, Alert, Spinner, Badge, Dropdown, ListGroup, Nav } from 'react-bootstrap';
import { getAllAccordConcession, getAllSectionCategories } from '../../services/GetRequests';
import { useSearchParams } from 'react-router-dom';
import PaginationControl from '../PaginationControl';
import {  createAccordConcessionWithFile } from '../../services/Inserts';
import { updateAccordConcession, updateAccordConcessionWithFile, deleteAccordConcession } from '../../services/UpdRequests';
import { getAllDocStatuses} from '../../services/GetRequests';
import { getText } from '../../data/texts';

import HeaderTitle from '../HeaderTitle';
import DownloadConfirmationModal from './DownloadConfirmationModal';
import DocumentCard from '../DocumentCard';
import GenericDocumentDetailsModal from '../GenericDocumentDetailsModal';

import { downloadFile, formatFileSize, openFileInNewTab } from '../../services/downloadService';
import { CurrentUserId } from '../../services/authUtils';
import { useLanguage } from '../../i18n/LanguageContext';
import SimpleSearchComponent from '../SimpleSearchComponent';

const AccordConcessionComponent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [docStatuses, setDocStatuses] = useState([]);

  const [sectionCategories, setSectionCategories] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    contratConcession: '',
    emplacement: '',
    coordonneesGps: '',
    rapportTransfertGestion: '',
    dateSignature: '',
    dateExpiration: '',
    doneBy: { id: '' },
    document: { id: '' },
    status: { id: '' },
    sectionCategory: { id: '' }
  });
  const {language} = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();


const page = parseInt(searchParams.get('page') ||  0);
const size = parseInt(searchParams.get('size') ||  10);
const statusFilter = searchParams.get('statusId') || '';
const searchText = searchParams.get('search') || '';
const dateStart = searchParams.get('dateStart') || '';
const dateEnd = searchParams.get('dateEnd') || '';
 
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);


  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Download confirmation modal state
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [fileToDownload, setFileToDownload] = useState(null);

  // View mode state
  const [activeView, setActiveView] = useState('cards'); // 'table' or 'cards' - default is cards



  useEffect(() => {
    loadData();
    loadDropdownData();
  }, [searchParams]);

const loadData = async () => {
  try {
    setLoading(true);
    const response = await getAllAccordConcession(
      {
        page,
        size,

 
  
        search:searchText 
    }
    );

    setData(response.content || []);
    setTotalPages(response.totalPages || 0);
    setTotalElements(response.totalElements || 0);
  } catch (err) {
    setError(getText('document.messages.loadError', language) + ': ' + (err.message || 'Unknown error'));
  } finally {
    setLoading(false);
  }
};

  const loadDropdownData = async () => {
    try {
      const [statusesData, categoriesData] = await Promise.all([
        getAllDocStatuses(),
        // getAllAccounts(),
        getAllSectionCategories()
      ]);
      
      setDocStatuses(Array.isArray(statusesData) ? statusesData : []);

 
      setSectionCategories(categoriesData) ;

      
    } catch (err) {
      console.error('Load dropdown data error:', err);
    }
  };



  const handleShowModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        contratConcession: item.contratConcession || '',
        emplacement: item.emplacement || '',
        coordonneesGps: item.coordonneesGps || '',
        rapportTransfertGestion: item.rapportTransfertGestion || '',
        dateSignature: item.dateSignature ? item.dateSignature.split('T')[0] : '',
        dateExpiration: item.dateExpiration ? item.dateExpiration.split('T')[0] : '',
     
        document: { id: item.document?.id || '' },
        status: { id: item.status?.id || '' },
        sectionCategory: { id: item.sectionCategory?.id || '' }
      });
      setSelectedFile(null);
    } else {
      setEditingItem(null);
      setFormData({
        contratConcession: '',
        emplacement: '',
        coordonneesGps: '',
        rapportTransfertGestion: '',
        dateSignature: '',
        dateExpiration: '',
   
        document: { id: '' },
        status: { id: '' },
        sectionCategory: { id: '' }
      });
      setSelectedFile(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setSelectedFile(null);
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');

      if (!editingItem && !selectedFile) {
        setError(language === 'fr' ? 'Veuillez sélectionner un fichier' : 'Please select a file');
        return;
      }

      if (selectedFile) {
        const formDataToSend = new FormData();
        formDataToSend.append('file', selectedFile);

        // Build accordConcession object as JSON
        const accordConcessionData = {
          numeroAccord: formData.contratConcession,  // Backend expects numeroAccord
          contratConcession: formData.contratConcession,  // Also keep original field
          emplacement: formData.emplacement || null,
          coordonneesGps: formData.coordonneesGps || null,
          rapportTransfertGestion: formData.rapportTransfertGestion || null,
          dateSignature: formData.dateSignature ? new Date(formData.dateSignature).toISOString() : null,
          dateExpiration: formData.dateExpiration ? new Date(formData.dateExpiration).toISOString() : null,
          doneBy: { id:CurrentUserId },
          sectionCategory: formData.sectionCategory.id ? { id: parseInt(formData.sectionCategory.id) } : null,
          status: formData.status.id ? { id: parseInt(formData.status.id) } : null
        };

        // Add accordConcession as JSON blob
        formDataToSend.append('accordConcession', new Blob([JSON.stringify(accordConcessionData)], {
          type: 'application/json'
        }));

        if (editingItem) {
          await updateAccordConcessionWithFile(editingItem.id, formDataToSend);
        } else {
          await createAccordConcessionWithFile(formDataToSend);
        }
      } else {
        const dataToSubmit = {
          ...formData,
          dateSignature: formData.dateSignature ? new Date(formData.dateSignature).toISOString() : null,
          dateExpiration: formData.dateExpiration ? new Date(formData.dateExpiration).toISOString() : null,
          doneBy:  { id:CurrentUserId } ,
          document: formData.document.id ? { id: parseInt(formData.document.id) } : null,
          sectionCategory: formData.sectionCategory.id ? { id: parseInt(formData.sectionCategory.id) } : null
        };

        // Only include status for updates (backend sets default status on creation)
        if (editingItem) {
          dataToSubmit.status = formData.status.id ? { id: parseInt(formData.status.id) } : null;
          await updateAccordConcession(editingItem.id, dataToSubmit);
        }
      }

      handleCloseModal();
      loadData();
    } catch (err) {
      setError(getText('document.messages.saveError', language) + ': ' + (err.message || 'Unknown error'));
      console.error('Save error:', err);
    }
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      setError('');
      await deleteAccordConcession(itemToDelete.id);
      loadData();
      setShowDeleteModal(false);
      setItemToDelete(null);
    } catch (err) {
      setError(getText('document.messages.deleteError', language) + ': ' + (err.message || 'Unknown error'));
      console.error('Delete error:', err);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  const handleShowDetails = (item) => {
    setSelectedDocument(item);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedDocument(null);
  };

  // Handle download confirmation
  const handleConfirmDownload = async () => {
    if (!fileToDownload || !fileToDownload.document) return;

    try {
      await downloadFile(fileToDownload.document);
      
      // Close the modal
      setShowDownloadModal(false);
      setFileToDownload(null);
    } catch (err) {
      console.error('Download error:', err);
      alert(language === 'fr' ? `Erreur lors du téléchargement: ${err.message}` : `Download error: ${err.message}`);
    }
  };

  // Handle download cancellation
  const handleCancelDownload = () => {
    setShowDownloadModal(false);
    setFileToDownload(null);
  };



  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString(language);
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">{getText('common.loading', language)}</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="accord-concession-component">
      <style jsx>{`
        .action-buttons .btn {
          font-size: 0.8rem;
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          transition: all 0.2s ease-in-out;
        }
        .action-buttons .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .action-buttons .btn-outline-primary:hover {
          background-color: #0d6efd;
          border-color: #0d6efd;
          color: white;
        }
        .action-buttons .btn-outline-warning:hover {
          background-color: #ffc107;
          border-color: #ffc107;
          color: #000;
        }
        .action-buttons .btn-outline-danger:hover {
          background-color: #dc3545;
          border-color: #dc3545;
          color: white;
        }
        @media (max-width: 576px) {
          .action-buttons .btn {
            padding: 0.2rem 0.4rem;
            font-size: 0.75rem;
          }
        }
      `}</style>
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <Row className="align-items-center mb-3">
                <Col xs={12} md={6} lg={3}>
                  <HeaderTitle>{getText('document.accordConcession', language)}</HeaderTitle>
                </Col>
                <Col xs={12} md={6} lg={9} className="text-end">
                  <Button variant="primary" size="sm" className="me-2" onClick={() => handleShowModal()}>
                    <i className="bi bi-plus-circle me-1"></i>
                    {getText('common.add', language)}
                  </Button>
                  <Button variant="outline-secondary" size="sm" onClick={loadData}>
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    {getText('document.actions.refresh', language)}
                  </Button>
                </Col>
              </Row>
              
              {/* View Toggle Tabs */}
              <Nav variant="tabs" activeKey={activeView} onSelect={(k) => setActiveView(k)}>
                <Nav.Item>
                  <Nav.Link eventKey="cards">
                    <i className="bi bi-grid-3x3-gap me-2"></i>
                    {language === 'fr' ? 'Vue Doc' : 'Doc View'}
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="table">
                    <i className="bi bi-table me-2"></i>
                    {language === 'fr' ? 'Vue Tableau' : 'Table View'}
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>
            <Card.Body>
       <SimpleSearchComponent/>
              {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

              {/* Table View */}
              {activeView === 'table' && (
                <div className="table-responsive">
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>{getText('document.fields.contratConcession', language)}</th>
                        <th>{getText('document.fields.emplacement', language)}</th>
                        <th>{getText('document.fields.dateSignature', language)}</th>
                        <th>{getText('document.fields.dateExpiration', language)}</th>
                        <th>{getText('document.sectionCategory', language)}</th>
                        <th className="text-center" style={{ width: '200px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center text-muted">
                            {language === 'fr' ? 'Aucune donnée disponible' : 'No data available'}
                          </td>
                        </tr>
                      ) : (
                        data.map((item) => (
                          <tr key={item.id}>
                            <td>{item.id}</td>
                            <td>{item.contratConcession}</td>
                            <td>{item.emplacement}</td>
                            <td>{formatDate(item.dateSignature)}</td>
                            <td>{formatDate(item.dateExpiration)}</td>
                            <td><Badge bg="info">{item.sectionCategory?.name || '-'}</Badge></td>
                            <td className="text-center">
                              <div className="d-flex gap-1 justify-content-center action-buttons">
                                {/* View Details Button */}
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => handleShowDetails(item)}
                                  className="d-flex align-items-center"
                                  title={language === 'fr' ? 'Voir les détails' : 'View Details'}
                                >
                                  <i className="bi bi-eye me-1"></i>
                                  <span className="d-none d-sm-inline">
                                    {language === 'fr' ? 'Voir' : 'View'}
                                  </span>
                                </Button>

                                {/* Edit Button */}
                                <Button
                                  variant="outline-warning"
                                  size="sm"
                                  onClick={() => handleShowModal(item)}
                                  className="d-flex align-items-center"
                                  title={getText('common.edit', language)}
                                >
                                  <i className="bi bi-pencil me-1"></i>
                                  <span className="d-none d-sm-inline">
                                    {getText('common.edit', language)}
                                  </span>
                                </Button>

                                {/* Delete Button */}
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDeleteClick(item)}
                                  className="d-flex align-items-center"
                                  title={getText('common.delete', language)}
                                >
                                  <i className="bi bi-trash me-1"></i>
                                  <span className="d-none d-sm-inline">
                                    {getText('common.delete', language)}
                                  </span>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
              )}

              {/* Cards Grid (Doc View) */}
              {activeView === 'cards' && (
                <Row className="g-4">
                  {data.length === 0 ? (
                    <Col xs={12}>
                      <Alert variant="info" className="text-center">
                        <i className="bi bi-info-circle me-2"></i>
                        {language === 'fr' ? 'Aucune donnée disponible' : 'No data available'}
                      </Alert>
                    </Col>
                  ) : (
                    data.map((item) => (
                      <DocumentCard
                        key={item.id}
                        item={item}
                        language={language}
                        onViewDetails={handleShowDetails}
                        onEdit={handleShowModal}
                        onDelete={handleDeleteClick}
                        getDisplayName={(it) => it.document?.originalFileName || it.contratConcession}
                        getDescription={(it) => it.emplacement}
                      />
                    ))
                  )}
                </Row>
              )}

              <style jsx>{`
                .hover-shadow {
                  transition: box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out;
                }
                .hover-shadow:hover {
                  box-shadow: 0 8px 16px rgba(0,0,0,0.15) !important;
                  transform: translateY(-4px);
                }
              `}</style>

              <PaginationControl
                totalPages={totalPages}
                totalElements={totalElements}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingItem ? `${getText('common.edit', language)} ${getText('document.accordConcession', language)}` : `${getText('common.add', language)} ${getText('document.accordConcession', language)}`}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

            <Form.Group className="mb-3">
              <Form.Label>{getText('document.fields.contratConcession', language)} *</Form.Label>
              <Form.Control type="text" name="contratConcession" value={formData.contratConcession} onChange={handleChange} required />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{getText('document.fields.emplacement', language)}</Form.Label>
                  <Form.Control type="text" name="emplacement" value={formData.emplacement} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{getText('document.fields.coordonneesGps', language)}</Form.Label>
                  <Form.Control type="text" name="coordonneesGps" value={formData.coordonneesGps} onChange={handleChange} placeholder="Ex: -4.3456, 15.2982" />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>{getText('document.fields.rapportTransfertGestion', language)}</Form.Label>
              <Form.Control as="textarea" rows={2} name="rapportTransfertGestion" value={formData.rapportTransfertGestion} onChange={handleChange} />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{getText('document.fields.dateSignature', language)}</Form.Label>
                  <Form.Control type="date" name="dateSignature" value={formData.dateSignature} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{getText('document.fields.dateExpiration', language)}</Form.Label>
                  <Form.Control type="date" name="dateExpiration" value={formData.dateExpiration} onChange={handleChange} />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              {/* {!editingItem && ( */}
                  <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>{getText('document.fields.docId', language)} *</Form.Label>
                  <Form.Control
                    type="file"
                    onChange={handleFileChange}
                    required={!editingItem}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.png,.jpg,.jpeg"
                  />
                  {selectedFile && (
                    <Form.Text className="text-success">
                      <i className="bi bi-check-circle me-1"></i>
                      {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                    </Form.Text>
                  )}
                  {editingItem && formData.document?.id && !selectedFile && (
                    <Form.Text className="text-muted">
                      <i className="bi bi-file-earmark me-1"></i>
                      {language === 'fr' ? 'Document actuel conservé' : 'Current document retained'}
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
       {/* )} */}
            
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>{getText('document.fields.status', language)} *</Form.Label>
                  <Form.Select name="status.id" value={formData.status.id} onChange={handleChange} required>
                    <option value="">{getText('common.select', language)}</option>
                    {docStatuses.map(status => <option key={status.id} value={status.id}>{status.name}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
               
                  <Form.Label>{getText('document.sectionCategory', language)} *</Form.Label>
                  <Form.Select name="sectionCategory.id" value={formData.sectionCategory.id} onChange={handleChange} required>
              
                    
                    <option value="">{getText('common.select', language)}</option>
                    {sectionCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>{getText('common.cancel', language)}</Button>
            <Button variant="primary" type="submit">{getText('common.save', language)}</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleDeleteCancel} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {getText('common.confirmDelete', language)}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <div className="text-center">
            <i className="bi bi-trash text-danger" style={{ fontSize: '3rem' }}></i>
            <h5 className="mt-3 mb-3">
              {language === 'fr' ? 'Êtes-vous sûr de vouloir supprimer cet élément ?' : 'Are you sure you want to delete this item?'}
            </h5>
            {itemToDelete && (
              <div className="bg-light p-3 rounded">
                <strong>{getText('document.fields.contratConcession', language)}:</strong> {itemToDelete.contratConcession}
                {itemToDelete.emplacement && (
                  <>
                    <br />
                    <strong>{getText('document.fields.emplacement', language)}:</strong> {itemToDelete.emplacement}
                  </>
                )}
              </div>
            )}
            <p className="text-muted mt-3 mb-0">
              <i className="bi bi-info-circle me-1"></i>
              {language === 'fr' ? 'Cette action est irréversible.' : 'This action cannot be undone.'}
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <div className="d-flex gap-2 w-100 justify-content-end">
            <Button variant="outline-secondary" onClick={handleDeleteCancel}>
              <i className="bi bi-x-circle me-2"></i>
              {getText('common.cancel', language)}
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              <i className="bi bi-trash me-2"></i>
              {getText('common.delete', language)}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      {/* Document Details Modal */}
      <GenericDocumentDetailsModal
        show={showDetailsModal}
        onHide={handleCloseDetails}
        title={selectedDocument?.document?.originalFileName || 'Document Details'}
        document={selectedDocument}
        language={language}
        onEdit={(doc) => handleShowModal(doc)}
        showEditButton={true}
      />
        {selectedDocument && (
          <div>
            <Row className="mb-3">
              <Col md={6}>
                <h6 className="text-muted">{language === 'fr' ? 'Informations Générales' : 'General Information'}</h6>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <strong>{getText('document.fields.contratConcession', language)}:</strong> {selectedDocument.contratConcession}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>{getText('document.fields.emplacement', language)}:</strong>{' '}
                    {selectedDocument.emplacement || '-'}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>{getText('document.fields.coordonneesGps', language)}:</strong>{' '}
                    {selectedDocument.coordonneesGps || '-'}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>{getText('document.fields.dateSignature', language)}:</strong>{' '}
                    {selectedDocument.dateSignature ? formatDate(selectedDocument.dateSignature) : '-'}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>{getText('document.fields.dateExpiration', language)}:</strong>{' '}
                    {selectedDocument.dateExpiration ? formatDate(selectedDocument.dateExpiration) : '-'}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>{getText('document.sectionCategory', language)}:</strong>{' '}
                    <Badge bg="info">{selectedDocument.sectionCategory?.name || '-'}</Badge>
                  </ListGroup.Item>
                </ListGroup>
              </Col>
              <Col md={6}>
                <h6 className="text-muted">{language === 'fr' ? 'Informations du Document' : 'Document Information'}</h6>
                {selectedDocument.document ? (
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
                      {(selectedDocument.document.fileSize / 1024).toFixed(2)} KB
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
                      {new Date(selectedDocument.document.createdAt).toLocaleString(language)}
                    </ListGroup.Item>
                    {selectedDocument.document.updatedAt && (
                      <ListGroup.Item>
                        <strong>{language === 'fr' ? 'Modifié le:' : 'Updated:'}</strong>{' '}
                        {new Date(selectedDocument.document.updatedAt).toLocaleString(language)}
                      </ListGroup.Item>
                    )}
                    {selectedDocument.document.owner?.fullName && (
                      <ListGroup.Item>
                        <strong>{language === 'fr' ? 'Propriétaire:' : 'Owner:'}</strong>{' '}
                        {selectedDocument.document.owner.fullName}
                      </ListGroup.Item>
                    )}
                  </ListGroup>
                ) : (
                  <Alert variant="warning">
                    {language === 'fr' ? 'Aucune information de document disponible' : 'No document information available'}
                  </Alert>
                )}
              </Col>
            </Row>

            {selectedDocument.document?.owner && (
              <Row className="mb-3">
                <Col>
                  <h6 className="text-muted">{language === 'fr' ? 'Propriétaire du Document' : 'Document Owner'}</h6>
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
                </Col>
              </Row>
            )}

            {selectedDocument.doneBy && (
              <Row>
                <Col>
                  <h6 className="text-muted">{getText('document.fields.doneBy', language)}</h6>
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
                </Col>
              </Row>
            )}

            <div className="mt-4 d-flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={async () => {
                  try {
                    if (selectedDocument?.document) {
                      await openFileInNewTab(selectedDocument.document);
                    }
                  } catch (err) {
                    console.error('Error opening document:', err);
                    alert(language === 'fr' 
                      ? `Erreur lors de l'ouverture du document: ${err.message}` 
                      : `Error opening document: ${err.message}`);
                  }
                }}
                disabled={!selectedDocument?.document?.filePath}
              >
                <i className="bi bi-eye me-2"></i>
                {language === 'fr' ? 'Ouvrir le document' : 'Open Document'}
              </Button>
              <Button
                variant="warning"
                size="sm"
                onClick={() => {
                  handleCloseDetails();
                  handleShowModal(selectedDocument);
                }}
              >
                <i className="bi bi-pencil me-2"></i>
                {language === 'fr' ? 'Modifier' : 'Edit'}
              </Button>
            </div>
          </div>
        )}
  

      {/* Download Confirmation Modal */}
      <DownloadConfirmationModal
        show={showDownloadModal}
        onHide={handleCancelDownload}
        onConfirm={handleConfirmDownload}
        fileName={fileToDownload?.document?.originalFileName || ''}
        fileSize={fileToDownload?.document?.fileSize ? formatFileSize(fileToDownload.document.fileSize) : null}
        language={language}
      />
    </div>
  );
};

export default AccordConcessionComponent;
