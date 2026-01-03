/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table, Modal, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { getAllPermiConstruction } from '../../services/GetRequests';
import { createPermiConstructionWithFile } from '../../services/Inserts';
import { updatePermiConstruction, updatePermiConstructionWithFile, deletePermiConstruction } from '../../services/UpdRequests';
import { getAllDocStatuses, getAllSectionCategories } from '../../services/GetRequests';
import SearchComponent from '../SearchComponent';
import HeaderTitle from '../HeaderTitle';
import { API_BASE_URL } from '../../services/apiConfig';
import { CurrentUserId } from '../../services/authUtils';
import { useLanguage } from '../../i18n/LanguageContext';

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
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;

  // Search state
  const [searchFilters, setSearchFilters] = useState({
    statusFilter: '',
    searchText: '',
    dateStart: '',
    dateEnd: ''
  });
const formatDateForInput = (date) => {
  if (!date) return '';
  // Convert to a format compatible with <input type="datetime-local">
  const d = new Date(date);
  const pad = (n) => n.toString().padStart(2, '0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};
  useEffect(() => {
    loadData();
    loadDropdownData();
  }, [currentPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getAllPermiConstruction(currentPage, pageSize);
      setData(response.content || []);
      setTotalPages(response.totalPages || 0);
    } catch (err) {
      setError(t('document.messages.loadError') + ': ' + (err.message || t('common.unknownError')));
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
          doneBy: { id: CurrentUserId },
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

  const handleViewDocument = async (documentId) => {
    if (!documentId) {
      alert(t('document.messages.noDocument'));
      return;
    }

    try {
      const token = localStorage.getItem('authToken');

      // First, get the document metadata to extract file path
      const documentResponse = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!documentResponse.ok) {
        throw new Error(t('document.messages.fetchMetadataError'));
      }

      const documentData = await documentResponse.json();
      const filePath = documentData.data?.filePath;

      if (!filePath) {
        throw new Error(t('document.messages.filePathNotFound'));
      }

      // Now fetch the actual file content using the file path
      const fileResponse = await fetch(`${API_BASE_URL}/files/download/${filePath}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!fileResponse.ok) {
        throw new Error(t('document.messages.downloadError'));
      }

      const blob = await fileResponse.blob();
      const url = URL.createObjectURL(blob);

      // Open the file in a new tab
      const win = window.open(url, '_blank');
      if (!win) {
        // If popup was blocked, create a download link
        const link = document.createElement('a');
        link.href = url;
        link.download = documentData.data?.originalFileName || 'document';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

    } catch (err) {
      console.error('View document error:', err);
      alert(t('document.messages.openError') + ': ' + err.message);
    }
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
            </Card.Header>
            <Card.Body>
              {/* Search Component */}
              <SearchComponent
                dropdownLabel={t('search.filter')}
                dropdownItems={[]}
                dropdownValue={searchFilters.statusFilter}
                onDropdownChange={(value) => setSearchFilters({ ...searchFilters, statusFilter: value })}

                textbox1Label={t('search.search')}
                textbox1Placeholder={t('search.placeholder')}
                textbox1Value={searchFilters.searchText}
                onTextbox1Change={(value) => setSearchFilters({ ...searchFilters, searchText: value })}

                dateStartLabel={t('search.dateStart')}
                dateStartValue={searchFilters.dateStart}
                onDateStartChange={(value) => setSearchFilters({ ...searchFilters, dateStart: value })}

                dateEndLabel={t('search.dateEnd')}
                dateEndValue={searchFilters.dateEnd}
                onDateEndChange={(value) => setSearchFilters({ ...searchFilters, dateEnd: value })}

                onSearch={handleSearch}
                searchButtonText={t('search.searchButton')}

                showTextbox2={false}
                showTextbox3={false}
              />

              {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

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
                              {/* View Document Button */}
                              {item.document?.id && (
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => handleViewDocument(item.document.id)}
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

              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div>
                    {t('common.pageInfo', { current: currentPage + 1, total: totalPages })}
                  </div>
                  <div>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      disabled={currentPage === 0}
                      onClick={() => setCurrentPage(prev => prev - 1)}
                    >
                      {t('common.previous')}
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      disabled={currentPage >= totalPages - 1}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                      {t('common.next')}
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