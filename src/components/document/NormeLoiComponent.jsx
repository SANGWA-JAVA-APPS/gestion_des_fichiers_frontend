import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table, Modal, Form, Alert, Spinner, Badge, Dropdown, ListGroup, Nav } from 'react-bootstrap';
import { getAllNormeLoi } from '../../services/GetRequests';
import { createNormeLoiWithFile } from '../../services/Inserts';
import { updateNormeLoi, deleteNormeLoi } from '../../services/UpdRequests';
import { getAllDocStatuses } from '../../services/GetRequests';
import { getText } from '../../data/texts';
import SearchComponent from '../SearchComponent';
import HeaderTitle from '../HeaderTitle';
import DocumentDetailsView from './DocumentDetailsView';
import DownloadConfirmationModal from './DownloadConfirmationModal';
import { API_BASE_URL } from '../../services/apiConfig';
import { downloadFile, formatFileSize, removeFileExtension as removeExtension, openFileInNewTab } from '../../services/downloadService';
import pdfIcon from '../../assets/documents_icons/pdf.png';
import excelIcon from '../../assets/documents_icons/excel.png';
import wordIcon from '../../assets/documents_icons/word.png';
import powerpointIcon from '../../assets/documents_icons/powerpoint.png';
import { getUserInfo } from '../../services/authUtils';
import { useLanguage } from '../../i18n/LanguageContext';

const NormeLoiComponent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [docStatuses, setDocStatuses] = useState([]);

    const CurrentUserId = getUserInfo().userId
  const [formData, setFormData] = useState({
    reference: '',
    description: '',
    dateVigueur: '',
    domaineApplication: '',
    doneBy: { id: '' },
    document: { id: '' },
    status: { id: '' }
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const { language } = useLanguage();
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;

  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Download confirmation modal state
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [fileToDownload, setFileToDownload] = useState(null);

  // View mode state
  const [activeView, setActiveView] = useState('cards'); // 'table' or 'cards' - default is cards

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getAllNormeLoi(currentPage, pageSize);
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
        reference: item.reference || '',
        description: item.description || '',
        dateVigueur: item.dateVigueur ? item.dateVigueur.split('T')[0] : '',
        domaineApplication: item.domaineApplication || '',
     
        document: { id: item.document?.id || '' },
        status: { id: item.status?.id || '' }
      });
      setSelectedFile(null);
    } else {
      setEditingItem(null);
      setFormData({
        reference: '',
        description: '',
        dateVigueur: '',
        domaineApplication: '',
 
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
    setFormData({
      reference: '',
      description: '',
      dateVigueur: '',
      domaineApplication: '',
   
      document: { id: '' },
      status: { id: '' }
    });
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

      // Check if file is required for new entries
      if (!editingItem && !selectedFile) {
        setError(language === 'fr' ? 'Veuillez sélectionner un fichier' : 'Please select a file');
        return;
      }

      // For CREATE with file
      if (!editingItem && selectedFile) {
        // Handle file upload scenario for NEW items
        const formDataToSend = new FormData();

        // Add file
        formDataToSend.append('file', selectedFile);

        // Build normeLoi object as JSON
        const normeLoiData = {
          reference: formData.reference,
          description: formData.description || null,
          dateVigueur: formData.dateVigueur ? new Date(formData.dateVigueur).toISOString() : null,
          domaineApplication: formData.domaineApplication || null,
          doneBy: { id: CurrentUserId},
          status: formData.status.id ? { id: parseInt(formData.status.id) } : null
        };

        // Add normeLoi as JSON blob
        formDataToSend.append('normeLoi', new Blob([JSON.stringify(normeLoiData)], {
          type: 'application/json'
        }));

        await createNormeLoiWithFile(formDataToSend);
      } else if (editingItem) {
        // Handle UPDATE (with or without file - backend doesn't support file update yet)
        const dataToSubmit = {
          ...formData,
          dateVigueur: formData.dateVigueur ? new Date(formData.dateVigueur).toISOString() : null,
          doneBy: { id: CurrentUserId},
          document: formData.document.id ? { id: parseInt(formData.document.id) } : null,
          status: formData.status.id ? { id: parseInt(formData.status.id) } : null
        };

        await updateNormeLoi(editingItem.id, dataToSubmit);

        // Show info message if user selected a new file (not supported yet)
        if (selectedFile) {
          console.warn('File update not yet supported by backend. Document was not changed.');
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
      await deleteNormeLoi(itemToDelete.id);
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

  // Handle title click to show download confirmation
  const handleTitleClick = (item) => {
    if (item.document && item.document.filePath) {
      setFileToDownload(item);
      setShowDownloadModal(true);
    } else {
      alert(language === 'fr' ? 'Aucun fichier disponible' : 'No file available');
    }
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

  // Helper function to get document icon based on file extension
  const getDocumentIcon = (document) => {
    if (!document) return null;
    
    const fileName = (document.originalFileName || document.fileName || '').toLowerCase();
    const contentType = (document.contentType || '').toLowerCase();
    
    // Check for PDF
    if (fileName.endsWith('.pdf') || contentType.includes('pdf')) {
      return pdfIcon;
    }
    
    // Check for Excel (.xls, .xlsx, .xlsm, .xlsb, .xltx, .xltm, .csv)
    if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx') || 
        fileName.endsWith('.xlsm') || fileName.endsWith('.xlsb') ||
        fileName.endsWith('.xltx') || fileName.endsWith('.xltm') ||
        fileName.endsWith('.csv') ||
        contentType.includes('spreadsheet') || contentType.includes('excel')) {
      return excelIcon;
    }
    
    // Check for Word (.doc, .docx, .docm, .dotx, .dotm)
    if (fileName.endsWith('.doc') || fileName.endsWith('.docx') ||
        fileName.endsWith('.docm') || fileName.endsWith('.dotx') ||
        fileName.endsWith('.dotm') ||
        contentType.includes('word') || contentType.includes('document')) {
      return wordIcon;
    }
    
    // Check for PowerPoint (.ppt, .pptx, .pptm, .potx, .potm, .ppsx, .ppsm)
    if (fileName.endsWith('.ppt') || fileName.endsWith('.pptx') ||
        fileName.endsWith('.pptm') || fileName.endsWith('.potx') ||
        fileName.endsWith('.potm') || fileName.endsWith('.ppsx') ||
        fileName.endsWith('.ppsm') ||
        contentType.includes('presentation') || contentType.includes('powerpoint')) {
      return powerpointIcon;
    }
    
    return null;
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
    <div className="norme-loi-component">
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
                  <HeaderTitle>{getText('document.normeLoi', language)}</HeaderTitle>
                </Col>
                <Col xs={12} md={6} lg={9} className="text-end">
                  <Button
                    variant="primary"
                    size="sm"
                    className="me-2"
                    onClick={() => handleShowModal()}>
                    <i className="bi bi-plus-circle me-1"></i>
                    {getText('common.add', language)}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={loadData}>
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
              {/* Search Component */}
              <SearchComponent
                dropdownLabel="Filter"
                dropdownItems={[]}
                dropdownValue={searchFilters.statusFilter}
                onDropdownChange={(value) => setSearchFilters({ ...searchFilters, statusFilter: value })}

                textbox1Label="Search"
                textbox1Placeholder="Enter search term..."
                textbox1Value={searchFilters.searchText}
                onTextbox1Change={(value) => setSearchFilters({ ...searchFilters, searchText: value })}

                dateStartLabel="From Date"
                dateStartValue={searchFilters.dateStart}
                onDateStartChange={(value) => setSearchFilters({ ...searchFilters, dateStart: value })}

                dateEndLabel="To Date"
                dateEndValue={searchFilters.dateEnd}
                onDateEndChange={(value) => setSearchFilters({ ...searchFilters, dateEnd: value })}

                onSearch={handleSearch}
                searchButtonText="Search"

                showTextbox2={false}
                showTextbox3={false}
              />

              {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              {/* Table View */}
              {activeView === 'table' && (
                <div className="table-responsive">
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>{getText('document.fields.reference', language)}</th>
                        <th>{getText('document.fields.description', language)}</th>
                        <th>{getText('document.fields.dateVigueur', language)}</th>
                        <th>{getText('document.fields.domaineApplication', language)}</th>
                        <th>{getText('document.fields.status', language)}</th>
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
                            <td>{item.reference}</td>
                            <td className="text-truncate" style={{ maxWidth: '200px' }}>
                              {item.description}
                            </td>
                            <td>
                              {item.dateVigueur ? new Date(item.dateVigueur).toLocaleDateString(language) : '-'}
                            </td>
                            <td>{item.domaineApplication}</td>
                            <td>
                              <Badge bg="info">{item.status?.name || '-'}</Badge>
                            </td>
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
                    data.map((item) => {
                      const docIcon = getDocumentIcon(item.document);
                      return (
                        <Col  key={item.id} xs={12} sm={6} md={4} lg={3}>
                          <Card className={`h-100 shadow-sm hover-shadow ${docIcon ? 'doc-card-with-icon' : ''}`}>
                            {docIcon && (
                              <div className="doc-icon-badge">
                                <img src={docIcon} alt="Document Type" />
                              </div>
                            )}
                            <Card.Body>
                              <Card.Title 
                                className="text-primary text-truncate-single" 
                                title={item.document?.originalFileName || item.reference}
                                onClick={() => handleTitleClick(item)}
                                style={{ cursor: 'pointer' }} >
                                <i className="bi bi-file-earmark-text me-2"></i>
                                {removeExtension(item.document?.originalFileName) || item.reference}
                              </Card.Title>
                              <Card.Text className="text-muted small text-clamp-3" style={{ minHeight: '60px' }}>
                                {item.description || (language === 'fr' ? 'Aucune description' : 'No description')}
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
                                
                                </ListGroup.Item >
                                    
                            <ListGroup.Item>
                              <strong>{language === 'fr' ? 'Statut:' : 'Status:'}</strong>{' '}
                              <Badge bg={item.document?.status === 'ACTIVE' ? 'success' : 'secondary'}>
                                {item.document?.status || '-'}
                              </Badge>
                            </ListGroup.Item>
                          </ListGroup>
                          <Card.Body>
                            <div className="d-flex gap-2 flex-wrap">
                              <Button
                                variant="link"
                                size="sm"
                                onClick={() => handleShowDetails(item)}
                                className="p-0 text-decoration-none"
                              >
                                <i className="bi bi-eye me-1"></i>
                                {language === 'fr' ? 'Détails' : 'Details'}
                              </Button>
                              <Button
                                variant="link"
                                size="sm"
                                onClick={() => handleShowModal(item)}         className="p-0 text-decoration-none"                              >
                                <i className="bi bi-pencil me-1"></i>
                                {language === 'fr' ? 'Modifier' : 'Edit'}
                              </Button>
                              <Button
                                variant="link"  size="sm"
                                onClick={() => handleDeleteClick(item)}
                                className="p-0 text-decoration-none text-danger"                              >
                                <i className="bi bi-trash me-1"></i>
                                {language === 'fr' ? 'Supprimer' : 'Delete'}
                              </Button>
                              </div>
                        

                          </Card.Body>
                        </Card>
                      </Col>
                      );
                    })
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div>
                    {language === 'fr'
                      ? `Page ${currentPage + 1} sur ${totalPages}`
                      : `Page ${currentPage + 1} of ${totalPages}`
                    }
                  </div>
                  <div>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      disabled={currentPage === 0}
                      onClick={() => setCurrentPage(prev => prev - 1)}
                    >
                      {language === 'fr' ? 'Précédent' : 'Previous'}
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      disabled={currentPage >= totalPages - 1}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                      {language === 'fr' ? 'Suivant' : 'Next'}
                    </Button>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingItem
              ? `${getText('common.edit', language)} ${getText('document.normeLoi', language)}`
              : `${getText('common.add', language)} ${getText('document.normeLoi', language)}`
            }
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && (
              <Alert variant="danger" dismissible onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{getText('document.fields.reference', language)} *</Form.Label>
                  <Form.Control
                    type="text"
                    name="reference"
                    value={formData.reference}
                    onChange={handleChange}
                    required
                    placeholder={language === 'fr' ? 'Ex: NL-2024-001' : 'Ex: NL-2024-001'}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{getText('document.fields.dateVigueur', language)}</Form.Label>
                  <Form.Control
                    type="date"
                    name="dateVigueur"
                    value={formData.dateVigueur}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>{getText('document.fields.description', language)}</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder={language === 'fr' ? 'Description détaillée...' : 'Detailed description...'}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{getText('document.fields.domaineApplication', language)}</Form.Label>
              <Form.Control
                type="text"
                name="domaineApplication"
                value={formData.domaineApplication}
                onChange={handleChange}
                placeholder={language === 'fr' ? 'Domaine d\'application' : 'Application domain'}
              />
            </Form.Group>

            <Row>
              {!editingItem && (
                
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
              )
              
              }
   
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>{getText('document.fields.status', language)} *</Form.Label>
                  <Form.Select
                    name="status.id"
                    value={formData.status.id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">{getText('common.select', language)}</option>
                    {docStatuses.map(status => (
                      <option key={status.id} value={status.id}>
                        {status.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              {getText('common.cancel', language)}
            </Button>
            <Button variant="primary" type="submit">
              {getText('common.save', language)}
            </Button>
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
                <strong>{getText('document.fields.reference', language)}:</strong> {itemToDelete.reference}
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
      <DocumentDetailsView
        show={showDetailsModal}
        onHide={handleCloseDetails}
        title={selectedDocument?.document?.originalFileName || 'Document Details'}
        closeButtonText={language === 'fr' ? 'Fermer' : 'Close'}      >
        {selectedDocument && (
          <div>
            <Row className="mb-3">
              <Col md={6}>
                <h6 className="text-muted">{language === 'fr' ? 'Informations Générales' : 'General Information'}</h6>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <strong>{getText('document.fields.reference', language)}:</strong> {selectedDocument.reference}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>{getText('document.fields.description', language)}:</strong>{' '}
                    {selectedDocument.description || '-'}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>{getText('document.fields.dateVigueur', language)}:</strong>{' '}
                    {selectedDocument.dateVigueur ? new Date(selectedDocument.dateVigueur).toLocaleDateString(language) : '-'}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>{getText('document.fields.domaineApplication', language)}:</strong>{' '}
                    {selectedDocument.domaineApplication || '-'}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>{getText('document.fields.status', language)}:</strong>{' '}
                    <Badge bg="info">{selectedDocument.status?.name || '-'}</Badge>
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
                disabled={!selectedDocument?.document?.filePath}>
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
      </DocumentDetailsView>

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

export default NormeLoiComponent;
