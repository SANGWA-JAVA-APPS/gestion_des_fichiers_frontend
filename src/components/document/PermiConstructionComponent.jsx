/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table, Modal, Form, Alert, Spinner, Badge, Nav } from 'react-bootstrap';
import { getAllPermiConstruction } from '../../services/GetRequests';
import { createPermiConstructionWithFile } from '../../services/Inserts';
import { updatePermiConstruction, updatePermiConstructionWithFile, deletePermiConstruction } from '../../services/UpdRequests';
import { getAllDocStatuses, getAllSectionCategories } from '../../services/GetRequests';
import SearchComponent from '../SearchComponent';
import HeaderTitle from '../HeaderTitle';
import DocumentCard from '../DocumentCard';
import GenericDocumentDetailsModal from '../GenericDocumentDetailsModal';
import { CurrentUserId } from '../../services/authUtils';
import { useLanguage } from '../../i18n/LanguageContext';
import SimpleSearchComponent from '../SimpleSearchComponent';
import PaginationControl from '../PaginationControl';
import { useSearchParams } from 'react-router-dom';

const PermiConstructionComponent = () => {
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    numeroPermis: '',
    projet: '',
    autoriteDelivrance: '',
    dateDelivrance: '',
    dateExpiration: '',
    referenceTitreFoncier: '',
    refPermisConstuire: '',
    refePermisConstruire: '',
    dateValidation: '',
    dateEstimeeTravaux: '',
    document: { id: '' },
    status: { id: '' },
    sectionCategory: { id: '' }
  });

  const { language, t } = useLanguage();
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);


  // Details modal + view toggle state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [activeView, setActiveView] = useState('cards'); // 'table' or 'cards' 

  useEffect(() => {
    loadData();
    loadDropdownData();
  }, [searchParams]);
const loadData = async () => {
  try {
    setLoading(true);
    setError('');

    // Extract all params from URL
    const page = parseInt(searchParams.get('page')) || 0;
    const size = parseInt(searchParams.get('size')) || 20;
    const statusId = searchParams.get('statusId') || undefined;
    const sectionCategoryId = searchParams.get('sectionCategoryId') || undefined;
    const search = searchParams.get('search') || undefined;
    const sort = searchParams.get('sort') || 'numeroPermis';
    const direction = searchParams.get('direction') || 'asc';

    const response = await getAllPermiConstruction({
      page,
      size,
      sort,
      direction,
      statusId,
      sectionCategoryId,
      search
    });

    setData(response.content || []);
    setTotalPages(response.totalPages || 0);
 setTotalElements(response.totalElemtns)
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


  const handleShowModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        numeroPermis: item.numeroPermis || '',
        projet: item.projet || '',
        autoriteDelivrance: item.autoriteDelivrance || '',
        dateDelivrance: item.dateDelivrance ? item.dateDelivrance.split('T')[0] : '',
        dateExpiration: item.dateExpiration ? item.dateExpiration.split('T')[0] : '',
        referenceTitreFoncier: item.referenceTitreFoncier || '',
        refPermisConstuire: item.refPermisConstuire || '',
        refePermisConstruire: item.refePermisConstruire || '',
        dateValidation: item.dateValidation ? item.dateValidation.split('T')[0] : '',
        dateEstimeeTravaux: item.dateEstimeeTravaux ? item.dateEstimeeTravaux.split('T')[0] : '',
        document: { id: item.document?.id || '' },
        status: { id: item.status?.id || '' },
        sectionCategory: { id: item.sectionCategory?.id || '' }
      });
      setSelectedFile(null);
    } else {
      setEditingItem(null);
      setFormData({
        numeroPermis: '',
        projet: '',
        autoriteDelivrance: '',
        dateDelivrance: '',
        dateExpiration: '',
        referenceTitreFoncier: '',
        refPermisConstuire: '',
        refePermisConstruire: '',
        dateValidation: '',
        dateEstimeeTravaux: '',
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
    setFormData({
      numeroPermis: '',
      projet: '',
      autoriteDelivrance: '',
      dateDelivrance: '',
      dateExpiration: '',
      referenceTitreFoncier: '',
      refPermisConstuire: '',
      refePermisConstruire: '',
      dateValidation: '',
      dateEstimeeTravaux: '',
      document: { id: '' },
      status: { id: '' },
      sectionCategory: { id: '' }
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

      if (!editingItem && !selectedFile) {
        setError(t('document.messages.fileRequired'));
        return;
      }

      if (selectedFile) {
        const formDataToSend = new FormData();
        formDataToSend.append('file', selectedFile);
        // Build permiConstruction object as JSON
        const permiConstructionData = {
          numeroPermis: formData.numeroPermis,
          refPermisConstuire: formData.refPermisConstuire,
          refePermisConstruire: formData.refePermisConstruire,
          referenceTitreFoncier: formData.referenceTitreFoncier,
          projet: formData.projet,
          autoriteDelivrance: formData.autoriteDelivrance,
          dateDelivrance: formData.dateDelivrance ? new Date(formData.dateDelivrance).toISOString() : null,
          dateExpiration: formData.dateExpiration ? new Date(formData.dateExpiration).toISOString() : null,
          dateValidation: formData.dateValidation ? new Date(formData.dateValidation).toISOString() : null,
          dateEstimeeTravaux: formData.dateEstimeeTravaux ? new Date(formData.dateEstimeeTravaux).toISOString() : null,
          doneBy: { id:CurrentUserId },
          sectionCategory: formData.sectionCategory.id ? { id: parseInt(formData.sectionCategory.id) } : null,
          status: formData.status.id ? { id: parseInt(formData.status.id) } : null
        };

        // Add permiConstruction as JSON blob
        formDataToSend.append('permiConstruction', new Blob([JSON.stringify(permiConstructionData)], {
          type: 'application/json'
        }));

        if (editingItem) {
          await updatePermiConstructionWithFile(editingItem.id, formDataToSend);
        } else {
          await createPermiConstructionWithFile(formDataToSend);
        }
      } else {
        const dataToSubmit = {
          ...formData,
          dateValidation: formData.dateValidation ? new Date(formData.dateValidation).toISOString() : null,
           dateDelivrance: formData.dateDelivrance ? new Date(formData.dateDelivrance).toISOString() : null,
          dateExpiration: formData.dateExpiration ? new Date(formData.dateExpiration).toISOString() : null,
          dateEstimeeTravaux: formData.dateEstimeeTravaux ? new Date(formData.dateEstimeeTravaux).toISOString() : null,
          doneBy: { id: CurrentUserId },
          document: formData.document.id ? { id: parseInt(formData.document.id) } : null,
          sectionCategory: formData.sectionCategory.id ? { id: parseInt(formData.sectionCategory.id) } : null
        };

        if (editingItem) {
          dataToSubmit.status = formData.status.id ? { id: parseInt(formData.status.id) } : null;
          await updatePermiConstruction(editingItem.id, dataToSubmit);
        }
      }
      handleCloseModal();
      loadData();
    } catch (err) {
      setError(t('document.messages.saveError') + ': ' + (err.message || t('common.unknownError')));
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
      await deletePermiConstruction(itemToDelete.id);
      loadData();
      setShowDeleteModal(false);
      setItemToDelete(null);
    } catch (err) {
      setError(t('document.messages.deleteError') + ': ' + (err.message || t('common.unknownError')));
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

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString(language);
  };

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
    <div className="permi-construction-component">
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <Row className="align-items-center">
                <Col xs={12} md={6} lg={3}>
                  <HeaderTitle>{t('document.permiConstruction')}</HeaderTitle>
                </Col>
                <Col xs={12} md={6} lg={9} className="text-end">
                  <Button
                    variant="primary"
                    size="sm"
                    className="me-2"
                    onClick={() => handleShowModal()}>
                    <i className="bi bi-plus-circle me-1"></i>
                    {t('common.add')}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={loadData}>
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    {t('document.actions.refresh')}
                  </Button>
                </Col>
              </Row>

              {/* View Toggle Tabs */}
              <Nav variant="tabs" activeKey={activeView} onSelect={(k) => setActiveView(k)}>
                <Nav.Item>
                  <Nav.Link eventKey="cards">
                    <i className="bi bi-grid-3x3-gap me-2"></i>
                    {language === 'fr' ? 'Cartes' : 'Cards'}
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
          <SimpleSearchComponent/>

              {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              {activeView === 'table' && (
                <div className="table-responsive">
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>{t('common.id')}</th>
                        <th>{t('document.fields.referenceTitreFoncier')}</th>
                        <th>{t('document.fields.refPermisConstuire')}</th>
                        <th>{t('document.fields.dateValidation')}</th>
                        <th>{t('document.fields.dateEstimeeTravaux')}</th>
                        <th>{t('document.sectionCategory')}</th>
                        <th className="text-center" style={{ width: '200px' }}>{t('common.actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center text-muted">
                            {t('common.noData')}
                          </td>
                        </tr>
                      ) : (
                        data.map((item) => (
                          <tr key={item.id}>
                            <td>{item.id}</td>
                            <td>{item.referenceTitreFoncier}</td>
                            <td>{item.refPermisConstuire}</td>
                            <td>{formatDate(item.dateValidation)}</td>
                            <td>{formatDate(item.dateEstimeeTravaux)}</td>
                            <td>
                              <Badge bg="info">{item.sectionCategory?.name || '-'}</Badge>
                            </td>
                            <td className="text-center">
                              <div className="d-flex gap-1 justify-content-center action-buttons">
                                {/* View Details Button */}
                                {item.document?.id && (
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => handleShowDetails(item)}
                                    className="d-flex align-items-center"
                                    title={t('document.actions.viewDocument')}
                                  >
                                    <i className="bi bi-eye me-1"></i>
                                    <span className="d-none d-sm-inline">
                                      {t('common.view')}
                                    </span>
                                  </Button>
                                )}

                                {/* Edit Button */}
                                <Button
                                  variant="outline-warning"
                                  size="sm"
                                  onClick={() => handleShowModal(item)}
                                  className="d-flex align-items-center"
                                  title={t('common.edit')}
                                >
                                  <i className="bi bi-pencil me-1"></i>
                                  <span className="d-none d-sm-inline">
                                    {t('common.edit')}
                                  </span>
                                </Button>

                                {/* Delete Button */}
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDeleteClick(item)}
                                  className="d-flex align-items-center"
                                  title={t('common.delete')}
                                >
                                  <i className="bi bi-trash me-1"></i>
                                  <span className="d-none d-sm-inline">
                                    {t('common.delete')}
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

              {activeView === 'cards' && (
                <Row className="g-4">
                  {data.length === 0 ? (
                    <Col xs={12}>
                      <Alert variant="info" className="text-center">
                        <i className="bi bi-info-circle me-2"></i>
                        {t('common.noData')}
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
                        getDisplayName={(it) => it.document?.originalFileName || it.numeroPermis || it.refPermisConstuire}
                        getDescription={(it) => it.projet}
                      />
                    ))
                  )}
                </Row>
              )}

          
              <PaginationControl totalElements={totalElements}totalPages={totalPages}/>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <GenericDocumentDetailsModal
        show={showDetailsModal}
        onHide={handleCloseDetails}
        title={selectedDocument?.document?.originalFileName || 'Document Details'}
        document={selectedDocument}
        language={language}
        onEdit={(doc) => { handleCloseDetails(); handleShowModal(doc); }}
        showEditButton={true}
      />

      <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingItem
              ? `${t('common.edit')} ${t('document.permiConstruction')}`
              : `${t('common.add')} ${t('document.permiConstruction')}`
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
                  <Form.Label>{t('document.fields.projet')} *</Form.Label>
                  <Form.Control
                    type="text"
                    name="projet"
                    value={formData.projet}
                    onChange={handleChange}
                    placeholder={t('document.placeholders.projet')}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('document.fields.autoriteDelivrance')} *</Form.Label>
                  <Form.Control
                    type="text"
                    name="autoriteDelivrance"
                    value={formData.autoriteDelivrance}
                    onChange={handleChange}
                    placeholder={t('document.placeholders.autoriteDelivrance')}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('document.fields.dateDelivrance')} *</Form.Label>
                  <Form.Control
                    type="date"
                    name="dateDelivrance"
                    value={formData.dateDelivrance}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('document.fields.dateExpiration')} *</Form.Label>
                  <Form.Control
                    type="date"
                    name="dateExpiration"
                    value={formData.dateExpiration}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('document.fields.referenceTitreFoncier')} *</Form.Label>
                  <Form.Control
                    type="text"
                    name="referenceTitreFoncier"
                    value={formData.referenceTitreFoncier}
                    onChange={handleChange}
                    required
                    placeholder={t('document.placeholders.referenceTitreFoncier')}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('document.fields.refPermisConstuire')} *</Form.Label>
                  <Form.Control
                    type="text"
                    name="refPermisConstuire"
                    value={formData.refPermisConstuire}
                    onChange={handleChange}
                    required
                    placeholder={t('document.placeholders.refPermisConstuire')}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('document.fields.dateValidation')}</Form.Label>
                  <Form.Control
                    type="date"
                    name="dateValidation"
                    value={formData.dateValidation}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('document.fields.dateEstimeeTravaux')}</Form.Label>
                  <Form.Control
                    type="date"
                    name="dateEstimeeTravaux"
                    value={formData.dateEstimeeTravaux}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              {!editingItem && (
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('document.fields.document')} *</Form.Label>
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
                        {t('document.messages.documentRetained')}
                      </Form.Text>
                    )}
                  </Form.Group>
                </Col>
              )}

              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('document.fields.status')} *</Form.Label>
                  <Form.Select
                    name="status.id"
                    value={formData.status.id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">{t('common.select')}</option>
                    {docStatuses.map(status => (
                      <option key={status.id} value={status.id}>
                        {status.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={3}>
                <Form.Group className="mb-3" controlId="numeroPermis">
                  <Form.Label>{t('document.fields.numeroPermis')}</Form.Label>
                  <Form.Control
                    type="text"
                    name="numeroPermis"
                    value={formData.numeroPermis}
                    onChange={handleChange}
                    placeholder={t('document.placeholders.numeroPermis')}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('document.sectionCategory')} *</Form.Label>
                  <Form.Select
                    name="sectionCategory.id"
                    value={formData.sectionCategory.id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">{t('common.select')}</option>
                    {sectionCategories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" type="submit">
              {t('common.save')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleDeleteCancel} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {t('common.confirmDelete')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <div className="text-center">
            <i className="bi bi-trash text-danger" style={{ fontSize: '3rem' }}></i>
            <h5 className="mt-3 mb-3">
              {t('common.deleteConfirmation')}
            </h5>
            {itemToDelete && (
              <div className="bg-light p-3 rounded">
                <strong>{t('document.fields.referenceTitreFoncier')}:</strong> {itemToDelete.referenceTitreFoncier}
                {itemToDelete.refPermisConstuire && (
                  <>
                    <br />
                    <strong>{t('document.fields.refPermisConstuire')}:</strong> {itemToDelete.refPermisConstuire}
                  </>
                )}
              </div>
            )}
            <p className="text-muted mt-3 mb-0">
              <i className="bi bi-info-circle me-1"></i>
              {t('common.deleteWarning')}
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <div className="d-flex gap-2 w-100 justify-content-end">
            <Button variant="outline-secondary" onClick={handleDeleteCancel}>
              <i className="bi bi-x-circle me-2"></i>
              {t('common.cancel')}
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              <i className="bi bi-trash me-2"></i>
              {t('common.delete')}
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

export default PermiConstructionComponent;