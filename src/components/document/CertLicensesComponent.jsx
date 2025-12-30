/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table, Modal, Form, Alert, Spinner, Badge, Dropdown, ListGroup, Nav } from 'react-bootstrap';
import { getAllCertLicenses } from '../../services/GetRequests';
import {  createCertLicensesWithFile } from '../../services/Inserts';
import { updateCertLicenses, updateCertLicensesWithFile, deleteCertLicenses } from '../../services/UpdRequests';
import { getAllDocStatuses} from '../../services/GetRequests';
import { getText } from '../../data/texts';
import SearchComponent from '../SearchComponent';
import HeaderTitle from '../HeaderTitle';
import DocumentDetailsView from './DocumentDetailsView';
import DownloadConfirmationModal from './DownloadConfirmationModal';
import { API_BASE_URL } from '../../services/apiConfig';
import * as downloadService from '../../services/downloadService';
import pdfIcon from '../../assets/documents_icons/pdf.png';
import excelIcon from '../../assets/documents_icons/excel.png';
import wordIcon from '../../assets/documents_icons/word.png';
import powerpointIcon from '../../assets/documents_icons/powerpoint.png';
import { CurrentUserId } from '../../services/authUtils';

const CertLicensesComponent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [docStatuses, setDocStatuses] = useState([]);

  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    agentCertifica: '',
    numeroAgent: '',
    dateCertificate: '',
    dureeCertificat: '',
    doneBy: { id: '' },
    document: { id: '' },
    status: { id: '' }
  });
  const [language] = useState('fr');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;

  // New state for details and download modals
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [fileToDownload, setFileToDownload] = useState(null);
  const [activeView, setActiveView] = useState('table'); // 'table' or 'cards'

  // Search state
  const [searchFilters, setSearchFilters] = useState({
    statusFilter: '',
    searchText: '',
    dateStart: '',
    dateEnd: ''
  });

  useEffect(() => {
    loadData();
    loadDropdownData();
  }, [currentPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getAllCertLicenses(currentPage, pageSize);
      setData(response.content || []);
      setTotalPages(response.totalPages || 0);
    } catch (err) {
      setError(getText('document.messages.loadError', language) + ': ' + (err.message || 'Unknown error'));
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDropdownData = async () => {
    try {
      const [statusesData] = await Promise.all([
        getAllDocStatuses(),
   
      ]);
      setDocStatuses(Array.isArray(statusesData) ? statusesData : []);

    } catch (err) {
      console.error('Load dropdown data error:', err);
    }
  };

  // Handle search
  const handleSearch = (searchData) => {
    console.log('=== SEARCH COMPONENT VALUES ===');
    console.log('All Search Data:', searchData);
    console.log('Dropdown (Status Filter):', searchData.dropdown);
    console.log('Textbox 1 (Search Text):', searchData.textbox1);
    console.log('Textbox 2:', searchData.textbox2);
    console.log('Textbox 3:', searchData.textbox3);
    console.log('Date Start:', searchData.dateStart);
    console.log('Date End:', searchData.dateEnd);
    console.log('===============================');

    setSearchFilters({
      statusFilter: searchData.dropdown,
      searchText: searchData.textbox1,
      dateStart: searchData.dateStart,
      dateEnd: searchData.dateEnd
    });
  };

  const handleShowModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        description: item.description || '',
        agentCertifica: item.agentCertifica || '',
        numeroAgent: item.numeroAgent || '',
        dateCertificate: item.dateCertificate ? item.dateCertificate.split('T')[0] : '',
        dureeCertificat: item.dureeCertificat || '',
        doneBy: { id: item.doneBy?.id || '' },
        document: { id: item.document?.id || '' },
        status: { id: item.status?.id || '' }
      });
      setSelectedFile(null);
    } else {
      setEditingItem(null);
      setFormData({
        description: '',
        agentCertifica: '',
        numeroAgent: '',
        dateCertificate: '',
        dureeCertificat: '',

        document: { id: '' },
        status: { id: '' }
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

        // Build certLicense object as JSON
        const certLicenseData = {
          description: formData.description || null,
          agentCertifica: formData.agentCertifica || null,
          numeroAgent: formData.numeroAgent || null,
          dateCertificate: formData.dateCertificate ? new Date(formData.dateCertificate).toISOString() : null,
          dureeCertificat: formData.dureeCertificat || null,
          doneBy: { id: CurrentUserId },
          status: formData.status.id ? { id: parseInt(formData.status.id) } : null
        };

        // Add certLicense as JSON blob
        formDataToSend.append('certLicense', new Blob([JSON.stringify(certLicenseData)], {
          type: 'application/json'
        }));

        if (editingItem) {
          await updateCertLicensesWithFile(editingItem.id, formDataToSend);
        } else {
          await createCertLicensesWithFile(formDataToSend);
        }
      } else {
        const dataToSubmit = {
          ...formData,
          dateCertificate: formData.dateCertificate ? new Date(formData.dateCertificate).toISOString() : null,
          doneBy:  { id: CurrentUserId } ,
          document: formData.document.id ? { id: parseInt(formData.document.id) } : null
        };

        if (editingItem) {
          dataToSubmit.status = formData.status.id ? { id: parseInt(formData.status.id) } : null;
          await updateCertLicenses(editingItem.id, dataToSubmit);
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
      await deleteCertLicenses(itemToDelete.id);
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

  // Helper function to show details modal
  const handleShowDetails = (certLicense) => {
    setSelectedDocument(certLicense);
    setShowDetailsModal(true);
  };

  // Helper function to close details modal
  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedDocument(null);
  };

  // Helper function for title click - shows download confirmation
  const handleTitleClick = (certLicense) => {
    if (certLicense?.document) {
      setFileToDownload(certLicense.document);
      setShowDownloadModal(true);
    } else {
      alert(language === 'fr' ? 'Aucun document disponible' : 'No document available');
    }
  };

  // Handle download confirmation
  const handleConfirmDownload = () => {
    if (fileToDownload) {
      downloadService.downloadFile(fileToDownload);
      setShowDownloadModal(false);
      setFileToDownload(null);
    }
  };

  // Handle download cancellation
  const handleCancelDownload = () => {
    setShowDownloadModal(false);
    setFileToDownload(null);
  };

  // Helper function to get document icon based on content type
  const getDocumentIcon = (contentType) => {
    if (!contentType) return pdfIcon;
    
    const type = contentType.toLowerCase();
    if (type.includes('pdf')) return pdfIcon;
    if (type.includes('excel') || type.includes('spreadsheet')) return excelIcon;
    if (type.includes('word') || type.includes('document')) return wordIcon;
    if (type.includes('powerpoint') || type.includes('presentation')) return powerpointIcon;
    
    return pdfIcon; // default
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
    <div className="cert-licenses-component">
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
              <Row className="align-items-center">
                <Col xs={12} md={6} lg={3}>
                  <HeaderTitle>{getText('document.certLicenses', language)}</HeaderTitle>
                </Col>
                <Col xs={12} md={6} lg={9} className="text-end">
                  <Button variant="primary" size="sm" className="me-2" onClick={() => handleShowModal()}>
                    <i className="bi bi-plus-circle me-1"></i>{getText('common.add', language)}
                  </Button>
                  <Button variant="outline-secondary" size="sm" onClick={loadData}>
                    <i className="bi bi-arrow-clockwise me-1"></i>{getText('document.actions.refresh', language)}
                  </Button>
                </Col>
              </Row>
              
              {/* View Toggle Tabs */}
              <Row className="mt-3">
                <Col>
                  <Nav variant="tabs" activeKey={activeView} onSelect={(k) => setActiveView(k)}>
                    <Nav.Item>
                      <Nav.Link eventKey="cards">
                        <i className="bi bi-grid-3x3-gap me-1"></i>
                        {language === 'fr' ? 'Cartes' : 'Cards'}
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="table">
                        <i className="bi bi-table me-1"></i>
                        {language === 'fr' ? 'Tableau' : 'Table'}
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body>
              <SearchComponent
                dropdownLabel="Status"
                dropdownItems={[]}
                dropdownValue={searchFilters.statusFilter}
                onDropdownChange={(e) => setSearchFilters({ ...searchFilters, statusFilter: e.target.value })}

                textbox1Label="Search"
                textbox1Placeholder="Enter search term..."
                textbox1Value={searchFilters.searchText}
                onTextbox1Change={(e) => setSearchFilters({ ...searchFilters, searchText: e.target.value })}
                showTextbox2={false}
                showTextbox3={false}

                dateStartLabel="From Date"
                dateStartValue={searchFilters.dateStart}
                onDateStartChange={(e) => setSearchFilters({ ...searchFilters, dateStart: e.target.value })}

                dateEndLabel="To Date"
                dateEndValue={searchFilters.dateEnd}
                onDateEndChange={(e) => setSearchFilters({ ...searchFilters, dateEnd: e.target.value })}

                onSearch={handleSearch}
                searchButtonText="Search"
              />

              {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

              {/* Table View */}
              {activeView === 'table' && (
              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>{getText('document.fields.description', language)}</th>
                      <th>{getText('document.fields.agentCertifica', language)}</th>
                      <th>{getText('document.fields.numeroAgent', language)}</th>
                      <th>{getText('document.fields.dateCertificate', language)}</th>
                      <th>{getText('document.fields.dureeCertificat', language)}</th>
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
                          <td className="text-truncate" style={{ maxWidth: '200px' }}>{item.description}</td>
                          <td>{item.agentCertifica}</td>
                          <td>{item.numeroAgent}</td>
                          <td>{formatDate(item.dateCertificate)}</td>
                          <td>{item.dureeCertificat}</td>
                          <td className="text-center">
                            <div className="d-flex gap-1 justify-content-center action-buttons">
                              {/* View Details Button */}
                              {item.document?.id && (
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
                              )}

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

              {/* Cards View */}
              {activeView === 'cards' && (
                <Row className="g-3 mt-2">
                  {data.length === 0 ? (
                    <Col xs={12}>
                      <div className="text-center py-5">
                        <i className="bi bi-inbox" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                        <p className="mt-3 text-muted">
                          {language === 'fr' ? 'Aucun document trouvé' : 'No documents found'}
                        </p>
                      </div>
                    </Col>
                  ) : (
                    data.map((item) => (
                      <Col key={item.id} xs={12} sm={6} md={4} lg={3}>
                        <Card className="h-100 doc-card-with-icon">
                          <Card.Body className="d-flex flex-column">
                            {/* Document Icon Badge */}
                            {item.document && (
                              <div className="doc-icon-badge">
                                <img 
                                  src={getDocumentIcon(item.document.contentType)} 
                                  alt="Document Type"
                                  style={{ width: '32px', height: '32px' }}
                                />
                              </div>
                            )}
                            
                            {/* Document Title - Clickable */}
                            <Card.Title 
                              className="text-truncate-single mb-2" 
                              style={{ cursor: 'pointer', color: '#0d6efd' }}
                              onClick={() => handleTitleClick(item)}
                              title={item.document?.fileName || language === 'fr' ? 'Document sans nom' : 'Unnamed document'}
                            >
                              {downloadService.removeFileExtension(item.document?.fileName || language === 'fr' ? 'Document sans nom' : 'Unnamed document')}
                            </Card.Title>
                            
                            {/* Description */}
                            <Card.Text className="text-clamp-3 flex-grow-1 small text-muted">
                              {item.description || (language === 'fr' ? 'Aucune description' : 'No description')}
                            </Card.Text>
                            
                            {/* Document Details in ListGroup */}
                            <ListGroup variant="flush" className="mb-3">
                              <ListGroup.Item className="px-0 py-1 small">
                                <strong>{getText('document.fields.agentCertifica', language)}:</strong> {item.agentCertifica || '-'}
                              </ListGroup.Item>
                              <ListGroup.Item className="px-0 py-1 small">
                                <strong>{getText('document.fields.numeroAgent', language)}:</strong> {item.numeroAgent || '-'}
                              </ListGroup.Item>
                              <ListGroup.Item className="px-0 py-1 small">
                                <strong>{getText('document.fields.dateCertificate', language)}:</strong> {formatDate(item.dateCertificate)}
                              </ListGroup.Item>
                              <ListGroup.Item className="px-0 py-1 small">
                                <strong>{language === 'fr' ? 'Fait par' : 'Done by'}:</strong> {item.doneBy?.fullName || '-'}
                              </ListGroup.Item>
                              <ListGroup.Item className="px-0 py-1 small">
                                <strong>Status:</strong>{' '}
                                <Badge bg={item.status?.name === 'Actif' || item.status?.name === 'Active' ? 'success' : 'secondary'}>
                                  {item.status?.name || '-'}
                                </Badge>
                              </ListGroup.Item>
                            </ListGroup>
                            
                            {/* Action Buttons */}
                            <div className="d-flex gap-2 mt-auto">
                              <Button 
                                variant="outline-primary" 
                                size="sm" 
                                className="flex-fill"
                                onClick={() => handleShowDetails(item)}
                              >
                                <i className="bi bi-eye me-1"></i>
                                {language === 'fr' ? 'Détails' : 'Details'}
                              </Button>
                              <Button 
                                variant="outline-secondary" 
                                size="sm" 
                                className="flex-fill"
                                onClick={() => handleShowModal(item)}
                              >
                                <i className="bi bi-pencil me-1"></i>
                                {language === 'fr' ? 'Modifier' : 'Edit'}
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))
                  )}
                </Row>
              )}

              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div>{language === 'fr' ? `Page ${currentPage + 1} sur ${totalPages}` : `Page ${currentPage + 1} of ${totalPages}`}</div>
                  <div>
                    <Button variant="outline-primary" size="sm" className="me-2" disabled={currentPage === 0} onClick={() => setCurrentPage(prev => prev - 1)}>
                      {language === 'fr' ? 'Précédent' : 'Previous'}
                    </Button>
                    <Button variant="outline-primary" size="sm" disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(prev => prev + 1)}>
                      {language === 'fr' ? 'Suivant' : 'Next'}
                    </Button>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingItem ? `${getText('common.edit', language)} ${getText('document.certLicenses', language)}` : `${getText('common.add', language)} ${getText('document.certLicenses', language)}`}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

            <Form.Group className="mb-3">
              <Form.Label>{getText('document.fields.description', language)} *</Form.Label>
              <Form.Control as="textarea" rows={2} name="description" value={formData.description} onChange={handleChange} required />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{getText('document.fields.agentCertifica', language)} *</Form.Label>
                  <Form.Control type="text" name="agentCertifica" value={formData.agentCertifica} onChange={handleChange} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{getText('document.fields.numeroAgent', language)}</Form.Label>
                  <Form.Control type="text" name="numeroAgent" value={formData.numeroAgent} onChange={handleChange} />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{getText('document.fields.dateCertificate', language)}</Form.Label>
                  <Form.Control type="date" name="dateCertificate" value={formData.dateCertificate} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{getText('document.fields.dureeCertificat', language)}</Form.Label>
                  <Form.Control type="text" name="dureeCertificat" value={formData.dureeCertificat} onChange={handleChange} placeholder={language === 'fr' ? 'Ex: 2 ans' : 'Ex: 2 years'} />
                </Form.Group>
              </Col>
            </Row>

            <Row>
        
              <Col md={4}>
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
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>{getText('document.fields.status', language)} *</Form.Label>
                  <Form.Select name="status.id" value={formData.status.id} onChange={handleChange} required>
                    <option value="">{getText('common.select', language)}</option>
                    {docStatuses.map(status => <option key={status.id} value={status.id}>{status.name}</option>)}
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
                <strong>{getText('document.fields.agentCertifica', language)}:</strong> {itemToDelete.agentCertifica}
                {itemToDelete.description && (
                  <>
                    <br />
                    <strong>{getText('document.fields.description', language)}:</strong> {itemToDelete.description}
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
      <Modal show={showDetailsModal} onHide={handleCloseDetails} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-file-earmark-text me-2"></i>
            {language === 'fr' ? 'Détails du Document' : 'Document Details'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDocument && (
            <DocumentDetailsView
              document={selectedDocument}
              language={language}
              fields={[
                { 
                  label: getText('document.fields.description', language), 
                  value: selectedDocument.description 
                },
                { 
                  label: getText('document.fields.agentCertifica', language), 
                  value: selectedDocument.agentCertifica 
                },
                { 
                  label: getText('document.fields.numeroAgent', language), 
                  value: selectedDocument.numeroAgent 
                },
                { 
                  label: getText('document.fields.dateCertificate', language), 
                  value: formatDate(selectedDocument.dateCertificate) 
                },
                { 
                  label: getText('document.fields.dureeCertificat', language), 
                  value: selectedDocument.dureeCertificat 
                }
              ]}
              onOpenDocument={() => {
                if (selectedDocument.document) {
                  downloadService.openFileInNewTab(selectedDocument.document);
                }
              }}
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDetails}>
            <i className="bi bi-x-circle me-2"></i>
            {language === 'fr' ? 'Fermer' : 'Close'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Download Confirmation Modal */}
      <DownloadConfirmationModal
        show={showDownloadModal}
        onHide={handleCancelDownload}
        onConfirm={handleConfirmDownload}
        fileName={fileToDownload?.fileName}
        fileSize={fileToDownload?.fileSize}
        language={language}
      />
    </div>
  );
};

export default CertLicensesComponent;
