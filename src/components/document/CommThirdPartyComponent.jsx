/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Button, 
  Table, 
  Modal, 
  Form, 
  Alert, 
  Spinner, 
  Badge, 
  Nav 
} from 'react-bootstrap';
import { useSearchParams, useParams } from 'react-router-dom'; // Add useParams

// Services
import { getAllCommThirdParty, getSectionCategoryByCode } from '../../services/GetRequests'; // Add getSectionCategoryByCode
import { createCommThirdPartyWithFile } from '../../services/Inserts';
import { 
  deleteCommThirdParty,
  updateCommThirdParty 
} from '../../services/UpdRequests';
import { 
  getAllDocStatuses, 
  getAllSectionCategories
} from '../../services/GetRequests';

// Components
import HeaderTitle from '../HeaderTitle';
import DocumentCard from '../DocumentCard';
import GenericDocumentDetailsModal from '../GenericDocumentDetailsModal';
import SimpleSearchComponent from '../SimpleSearchComponent';
import PaginationControl from '../PaginationControl';

// Utils
import { CurrentUserId } from '../../services/authUtils';
import { useLanguage } from '../../i18n/LanguageContext';

// Icons (optional - for section display)
import { FaFileAlt } from 'react-icons/fa';
import {
  DollarSign,
  ShoppingCart,
  UsersIcon,
  Settings,
  Network,
  BuildingIcon,
  PieChart,
  ScaleIcon,
  BadgeCheckIcon,
  ShieldCheck,
  ToolCase,
  Pill,
  AlertCircle,
  FileTextIcon,
  HandshakeIcon,
  Package,
  HomeIcon,
  Building2Icon
} from 'lucide-react';

// Section Icons mapping
const sectionIcons = {
  ORG_FIN: DollarSign,
  ORG_PROC: ShoppingCart,
  ORG_HR: UsersIcon,
  ORG_TECH: Settings,
  ORG_IT: Network,
  ORG_RE: BuildingIcon,
  ORG_SH: PieChart,
  ORG_LEGAL: ScaleIcon,
  ORG_QUAL: BadgeCheckIcon,
  ORG_HSE: ShieldCheck,
  ORG_EQUIP: ToolCase,
  ORG_DA: Pill,
  ORG_INC: AlertCircle,
  ORG_SOP: FileTextIcon,
  ORG_SUPP: HandshakeIcon,
  ORG_RENT_CON: Package,
  ORG_CLIENT: Building2Icon,
  ORG_RENT_ASSET: HomeIcon
};

const CommThirdPartyComponent = () => {
  // State variables
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [searchParams] = useSearchParams();
  const { sectionCode } = useParams(); 
  
  // Current section state
  const [currentSection, setCurrentSection] = useState(null);
  
  // Dropdown data
  const [docStatuses, setDocStatuses] = useState([]);
  const [sectionCategories, setSectionCategories] = useState([]);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    validity: '',
    activities: '',
    section: { id: '' },
    status: { id: '' }
  });

  // File state
  const [selectedFile, setSelectedFile] = useState(null);

  const { language, t } = useLanguage();
  
  // Pagination
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Details modal + view toggle
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [activeView, setActiveView] = useState('cards');

  // Load current section by code
  const fetchCurrentSection = async () => {
    if (sectionCode) {
      try {
        const section = await getSectionCategoryByCode(sectionCode);
        setCurrentSection(section);
        
        // Auto-set the section in form data if available
        if (section && section.id) {
          setFormData(prev => ({
            ...prev,
            section: { id: String(section.id) }
          }));
        }
      } catch (err) {
        console.error('Error fetching section by code:', err);
      }
    }
  };
useEffect(() => {
  fetchCurrentSection();
}, [sectionCode]);
  // Load data
useEffect(() => {
  if (currentSection) {
    loadData();
  }
  loadDropdownData()
}, [currentSection, searchParams]); // Add sectionCode to dependencies
      console.log("the curre section    is",currentSection)
      const sectionId = currentSection?.id;
  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Extract all params from URL
      const page = Number(searchParams.get('page')) || 0;
      const size = Number(searchParams.get('size')) || 50;
      const statusId = searchParams.get('statusId') || undefined;
      const search = searchParams.get('search') || undefined;
      const sort = searchParams.get('sort') || 'name';
      const direction = searchParams.get('direction') || 'asc';
      
      // Add sectionCode to filter if available
      


      const response = await getAllCommThirdParty(
        {page,
        size,
        sort,
        direction,
        statusId,
        sectionId,
        search} 
      );

      setData(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      setError('Error loading data: ' + (err.message || 'Unknown error'));
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDropdownData = async () => {
    try {
      const [statusesData, categoriesData] = await Promise.all([
        getAllDocStatuses(),
        getAllSectionCategories()
      ]);
      
      setDocStatuses(Array.isArray(statusesData) ? statusesData : []);
      setSectionCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (err) {
      console.error('Load dropdown data error:', err);
    }
  };

  // Modal handlers - Updated to preserve section when adding new items
  const handleShowModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name || '',
        location: item.location || '',
        validity: item.validity ? item.validity.split('T')[0] : '',
        activities: item.activities || '',
        section: { id: item.section?.id || '' },
        status: { id: item.status?.id || '' }
      });
      setSelectedFile(null);
    } else {
      setEditingItem(null);
      // For new items, auto-set the section from currentSection
      const newFormData = {
        name: '',
        location: '',
        validity: '',
        activities: '',
        section: { id: currentSection?.id ? String(currentSection.id) : '' },
        status: { id: '' }
      };
      setFormData(newFormData);
      setSelectedFile(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    // Reset form but keep section if we have currentSection
    const resetFormData = {
      name: '',
      location: '',
      validity: '',
      activities: '',
      section: { id: currentSection?.id ? String(currentSection.id) : '' },
      status: { id: '' }
    };
    setFormData(resetFormData);
    setSelectedFile(null);
    setError('');
  };

  // Form handlers
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

      // Validation
      if (!formData.name || !formData.name.trim()) {
        setError('Third party name is required');
        return;
      }
      if (!editingItem && !selectedFile) {
        setError('Document file is required for new entries');
        return;
      }
      if (!formData.status.id) {
        setError('Status is required');
        return;
      }

      // Build FormData for multipart request
      const formDataToSend = new FormData();

      // Append optional file
      if (selectedFile) {
        formDataToSend.append('file', selectedFile);
      }

      // Build JSON object to match DTO
      const commThirdPartyData = {
        name: formData.name,
        location: formData.location,
        validity: formData.validity ? new Date(formData.validity).toISOString() : null,
        activities: formData.activities,
        sectionId: formData.section.id ? parseInt(formData.section.id) : null,
        statusId: formData.status.id ? parseInt(formData.status.id) : null
      };

      // MUST use key "data" to match @RequestPart("data") on backend
      formDataToSend.append(
        'data',
        new Blob([JSON.stringify(commThirdPartyData)], { type: 'application/json' })
      );

      // Call create or update endpoint
      if (editingItem) {
        await updateCommThirdParty(editingItem.id, formDataToSend);
      } else {
        await createCommThirdPartyWithFile(formDataToSend);
      }

      handleCloseModal();
      loadData();
    } catch (err) {
      setError('Error saving commercial third party: ' + (err.message || 'Unknown error'));
      console.error('Save error:', err);
    }
  };

  // Delete handlers
  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      setError('');
      await deleteCommThirdParty(itemToDelete.id);
      loadData();
      setShowDeleteModal(false);
      setItemToDelete(null);
    } catch (err) {
      setError('Error deleting commercial third party: ' + (err.message || 'Unknown error'));
      console.error('Delete error:', err);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  // Details modal handlers
  const handleShowDetails = (item) => {
    setSelectedDocument(item);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedDocument(null);
  };

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString(language);
  };

  const getStatusBadge = (status) => {
    if (!status) return null;
    
    const statusColors = {
      active: 'success',
      pending: 'warning',
      expired: 'danger',
      draft: 'secondary',
      approved: 'info',
      rejected: 'dark'
    };
    
    return (
      <Badge bg={statusColors[status.name?.toLowerCase()] || 'primary'}>
        {status.name}
      </Badge>
    );
  };

  // Get section icon component
  const SectionIcon = currentSection && sectionIcons[currentSection.code] 
    ? sectionIcons[currentSection.code] 
    : FaFileAlt;

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">{t('common.loading')}</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="comm-third-party-component">
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <Row className="align-items-center">
                <Col xs={12} md={6} lg={4}>
                  <div className="page-title-group">
                    <HeaderTitle>
                      <div className="d-flex align-items-center">
                        <SectionIcon className="me-2" size={24} />
                        {currentSection 
                          ? `${currentSection.name} - ${t('document.commThirdParty') || 'Commercial Third Parties'}`
                          : t('document.commThirdParty') || 'Commercial Third Parties'
                        }
                      </div>
                    </HeaderTitle>
                    {currentSection?.description && (
                      <small className="text-muted">{currentSection.description}</small>
                    )}
                  </div>
                </Col>
                <Col xs={12} md={6} lg={8} className="text-end">
                  <Button
                    variant="primary"
                    size="sm"
                    className="me-2"
                    onClick={() => handleShowModal()}
                  >
                    <i className="bi bi-plus-circle me-1"></i>
                    {t('common.add')}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={loadData}
                  >
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    {t('document.actions.refresh') || 'Refresh'}
                  </Button>
                </Col>
              </Row>

              {/* View Toggle Tabs */}
              <Nav variant="tabs" activeKey={activeView} onSelect={(k) => setActiveView(k)} className="mt-2">
                <Nav.Item>
                  <Nav.Link eventKey="cards">
                    <i className="bi bi-grid-3x3-gap me-2"></i>
                    {language === 'fr' ? 'Vue Carte' : 'Card View'}
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="table">
                    <i className="bi bi-table me-2"></i>
                    {language === 'fr' ? 'Tableau' : 'Table'}
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>
            <Card.Body>
              {/* Search Component */}
              <SimpleSearchComponent />

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
                        <th>Name</th>
                        <th>Location</th>
                        <th>Validity</th>
                        <th>Activities</th>
                        <th>Section Category</th>
                        <th>Status</th>
                        <th className="text-center" style={{ width: '200px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="text-center text-muted">
                            {t('common.noData') || 'No data available'}
                          </td>
                        </tr>
                      ) : (
                        data.map((item) => (
                          <tr key={item.id}>
                            <td>{item.id}</td>
                            <td>{item.name}</td>
                            <td>{item.location || '-'}</td>
                            <td>{formatDate(item.validity)}</td>
                            <td>{item.activities ? item.activities.substring(0, 50) + (item.activities.length > 50 ? '...' : '') : '-'}</td>
                            <td>{item.section?.name || '-'}</td>
                            <td>{getStatusBadge(item.status)}</td>
                            <td className="text-center">
                              <div className="d-flex gap-1 justify-content-center action-buttons">
                                {/* View Details Button */}
                                {item.document?.id && (
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => handleShowDetails(item)}
                                    className="d-flex align-items-center"
                                    title="View Details"
                                  >
                                    <i className="bi bi-eye me-1"></i>
                                    <span className="d-none d-sm-inline">
                                      {t('common.view') || 'View'}
                                    </span>
                                  </Button>
                                )}

                                {/* Edit Button */}
                                <Button
                                  variant="outline-warning"
                                  size="sm"
                                  onClick={() => handleShowModal(item)}
                                  className="d-flex align-items-center"
                                  title={t('common.edit') || 'Edit'}
                                >
                                  <i className="bi bi-pencil me-1"></i>
                                  <span className="d-none d-sm-inline">
                                    {t('common.edit') || 'Edit'}
                                  </span>
                                </Button>

                                {/* Delete Button */}
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDeleteClick(item)}
                                  className="d-flex align-items-center"
                                  title={t('common.delete') || 'Delete'}
                                >
                                  <i className="bi bi-trash me-1"></i>
                                  <span className="d-none d-sm-inline">
                                    {t('common.delete') || 'Delete'}
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

              {/* Card View */}
              {activeView === 'cards' && (
                <Row className="g-4">
                  {data.length === 0 ? (
                    <Col xs={12}>
                      <Alert variant="info" className="text-center">
                        <i className="bi bi-info-circle me-2"></i>
                        {t('common.noData') || 'No data available'}
                      </Alert>
                    </Col>
                  ) : (
                    data.map((item) => (
                      <DocumentCard
                        key={item.id}
                        item={item}
                        language={language}
                        onViewDetails={() => handleShowDetails(item)}
                        onEdit={handleShowModal}
                        onDelete={handleDeleteClick}
                        getDisplayName={(it) => it.name}
                        getDescription={(it) => it.activities || it.location}
                        getStatus={(it) => it.status?.name}
                      />
                    ))
                  )}
                </Row>
              )}

              {/* Pagination */}
              <PaginationControl 
                totalElements={totalElements}
                totalPages={totalPages}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Details Modal */}
      <GenericDocumentDetailsModal
        show={showDetailsModal}
        onHide={handleCloseDetails}
        title={selectedDocument?.name || 'Commercial Third Party Details'}
        document={selectedDocument}
        language={language}
        onEdit={(doc) => { handleCloseDetails(); handleShowModal(doc); }}
        showEditButton={true}
      />

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingItem
              ? `Edit Commercial Third Party`
              : `Add Commercial Third Party`
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
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter third party name"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter location"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Validity</Form.Label>
                  <Form.Control
                    type="date"
                    name="validity"
                    value={formData.validity}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Activities</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="activities"
                    value={formData.activities}
                    onChange={handleChange}
                    placeholder="Describe activities"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Section Category</Form.Label>
                  {currentSection ? (
                    <div>
                      <Form.Control
                        type="text"
                        value={currentSection.name}
                        disabled
                        readOnly
                      />
                      <Form.Text className="text-muted">
                        Section auto-selected from route: {sectionCode}
                      </Form.Text>
                      {/* Hidden input to store the section ID */}
                      <Form.Control
                        type="hidden"
                        name="section.id"
                        value={formData.section.id}
                      />
                    </div>
                  ) : (
                    <Form.Select
                      name="section.id"
                      value={formData.section.id}
                      onChange={handleChange}
                    >
                      <option value="">Select Section Category</option>
                      {sectionCategories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </Form.Select>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status *</Form.Label>
                  <Form.Select
                    name="status.id"
                    value={formData.status.id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Status</option>
                    {docStatuses.map(status => (
                      <option key={status.id} value={status.id}>
                        {status.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {/* File Upload Section */}
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Document File {!editingItem && '*'}
                  </Form.Label>
                  <Form.Control
                    type="file"
                    onChange={handleFileChange}
                    required={!editingItem}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.png,.jpg,.jpeg"
                  />
                  <Form.Text className="text-muted">
                    {!editingItem 
                      ? 'Please select a document file (PDF, Word, Excel, images, etc.)'
                      : 'Leave empty to keep the current document'}
                  </Form.Text>
                  
                  {selectedFile && (
                    <Alert variant="success" className="mt-2 p-2">
                      <i className="bi bi-check-circle me-2"></i>
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                    </Alert>
                  )}

                  {editingItem && !selectedFile && (
                    <Alert variant="info" className="mt-2 p-2">
                      <i className="bi bi-info-circle me-2"></i>
                      Current document will be retained
                    </Alert>
                  )}
                </Form.Group>
              </Col>
            </Row>

            {/* Display current user info */}
            <Alert variant="light" className="mt-3">
              <i className="bi bi-person-circle me-2"></i>
              <strong>Created/Modified by:</strong> Current User (ID: {CurrentUserId})
            </Alert>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              {t('common.cancel') || 'Cancel'}
            </Button>
            <Button variant="primary" type="submit">
              {editingItem 
                ? (t('common.update') || 'Update') 
                : (t('common.save') || 'Save')
              }
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleDeleteCancel} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {t('common.confirmDelete') || 'Confirm Delete'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <div className="text-center">
            <i className="bi bi-trash text-danger" style={{ fontSize: '3rem' }}></i>
            <h5 className="mt-3 mb-3">
              {t('common.deleteConfirmation') || 'Are you sure you want to delete this item?'}
            </h5>
            {itemToDelete && (
              <div className="bg-light p-3 rounded">
                <strong>Name:</strong> {itemToDelete.name}
                {itemToDelete.location && (
                  <>
                    <br />
                    <strong>Location:</strong> {itemToDelete.location}
                  </>
                )}
                {itemToDelete.activities && (
                  <>
                    <br />
                    <strong>Activities:</strong> {itemToDelete.activities.substring(0, 100)}...
                  </>
                )}
              </div>
            )}
            <p className="text-muted mt-3 mb-0">
              <i className="bi bi-info-circle me-1"></i>
              {t('common.deleteWarning') || 'This action cannot be undone.'}
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <div className="d-flex gap-2 w-100 justify-content-end">
            <Button variant="outline-secondary" onClick={handleDeleteCancel}>
              <i className="bi bi-x-circle me-2"></i>
              {t('common.cancel') || 'Cancel'}
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              <i className="bi bi-trash me-2"></i>
              {t('common.delete') || 'Delete'}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .action-buttons .btn {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          transition: all 0.2s ease-in-out;
        }
        
        .action-buttons .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .action-buttons .btn i {
          font-size: 0.8rem;
        }
      `}</style>
    </div>
  );
};

export default CommThirdPartyComponent;