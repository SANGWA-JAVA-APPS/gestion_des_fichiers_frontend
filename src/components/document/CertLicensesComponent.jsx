/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table, Modal, Form, Alert, Spinner, Badge, Dropdown, ListGroup, Nav } from 'react-bootstrap';
import { getAllCertLicenses } from '../../services/GetRequests';
import { createCertLicensesWithFile } from '../../services/Inserts';
import { updateCertLicenses, updateCertLicensesWithFile, deleteCertLicenses } from '../../services/UpdRequests';
import { getAllDocStatuses } from '../../services/GetRequests';
import SearchComponent from '../SearchComponent';
import HeaderTitle from '../HeaderTitle';
import DocumentCard from '../DocumentCard';
import GenericDocumentDetailsModal from '../GenericDocumentDetailsModal';
import { CurrentUserId } from '../../services/authUtils';
import { useSearchParams } from 'react-router-dom';
import SimpleSearchComponent from '../SimpleSearchComponent';
import PaginationControl from '../PaginationControl';
import { useLanguage } from '../../i18n/LanguageContext';


const CertLicensesComponent = () => {
  // Use your existing language context
  const { language, t } = useLanguage();
  
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

  const [totalPages, setTotalPages] = useState(0);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [activeView, setActiveView] = useState('table'); // 'table' or 'cards'
  const [totalElements, setTotalElements] = useState(0);

  const [searchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '0', 10);
  const size = parseInt(searchParams.get('size') || '20', 10);
  const search = searchParams.get('search') || undefined;
  const statusId = searchParams.get('statusId')
    ? parseInt(searchParams.get('statusId'), 10)
    : undefined;

  useEffect(() => {
    loadData();
    loadDropdownData();
  }, [searchParams]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getAllCertLicenses({
        page,
        size,
        search,
        statusId
      });
      setData(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      setError(t('document.messages.loadError') + ': ' + (err.message || t('common.unknownError')));
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
        setError(t('document.messages.fileRequired'));
        return;
      }

      if (selectedFile) {
        const formDataToSend = new FormData();
        formDataToSend.append('file', selectedFile);

        const certLicenseData = {
          description: formData.description || null,
          agentCertifica: formData.agentCertifica || null,
          numeroAgent: formData.numeroAgent || null,
          dateCertificate: formData.dateCertificate ? new Date(formData.dateCertificate).toISOString() : null,
          dureeCertificat: formData.dureeCertificat || null,
          doneBy: { id: CurrentUserId },
          status: formData.status.id ? { id: parseInt(formData.status.id) } : null
        };

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
          doneBy: { id: CurrentUserId },
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
      await deleteCertLicenses(itemToDelete.id);
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

  const handleShowDetails = (certLicense) => {
    setSelectedDocument(certLicense);
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
                  <HeaderTitle>{t('sidebar.certLicenses')}</HeaderTitle>
                </Col>
                <Col xs={12} md={6} lg={9} className="text-end">
                  <Button variant="primary" size="sm" className="me-2" onClick={() => handleShowModal()}>
                    <i className="bi bi-plus-circle me-1"></i>{t('common.add')}
                  </Button>
                  <Button variant="outline-secondary" size="sm" onClick={loadData}>
                    <i className="bi bi-arrow-clockwise me-1"></i>{t('document.actions.refresh')}
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
                        {t('common.cardsView') || t('common.cards') || 'Cards'}
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="table">
                        <i className="bi bi-table me-1"></i>
                        {t('common.tableView') || t('common.table') || 'Table'}
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body>
              <SimpleSearchComponent />
              {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

              {/* Table View */}
              {activeView === 'table' && (
              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>{t('document.fields.id')}</th>
                      <th>{t('document.fields.description')}</th>
                      <th>{t('document.fields.agentCertifica')}</th>
                      <th>{t('document.fields.numeroAgent')}</th>
                      <th>{t('document.fields.dateCertificate')}</th>
                      <th>{t('document.fields.dureeCertificat')}</th>
                      <th className="text-center" style={{ width: '200px' }}>{t('common.actions') || 'Actions'}</th>
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
                          <td className="text-truncate" style={{ maxWidth: '200px' }}>{item.description}</td>
                          <td>{item.agentCertifica}</td>
                          <td>{item.numeroAgent}</td>
                          <td>{formatDate(item.dateCertificate)}</td>
                          <td>{item.dureeCertificat}</td>
                          <td className="text-center">
                            <div className="d-flex gap-1 justify-content-center action-buttons">
                              {item.document?.id && (
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => handleShowDetails(item)}
                                  className="d-flex align-items-center"
                                  title={t('document.messages.viewDocument')}
                                >
                                  <i className="bi bi-eye me-1"></i>
                                  <span className="d-none d-sm-inline">
                                    {t('common.view') || 'View'}
                                  </span>
                                </Button>
                              )}
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

              {/* Cards View */}
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
                        getDisplayName={(it) => it.document?.originalFileName || it.description}
                        getDescription={(it) => it.agentCertifica}
                      />
                    ))
                  )}
                </Row>
              )} 

              <PaginationControl totalElements={totalElements} totalPages={totalPages}/>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingItem 
              ? `${t('common.edit')} ${t('sidebar.certLicenses')}`
              : `${t('common.add')} ${t('sidebar.certLicenses')}`}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

            <Form.Group className="mb-3">
              <Form.Label>{t('document.fields.description')} *</Form.Label>
              <Form.Control as="textarea" rows={2} name="description" value={formData.description} onChange={handleChange} required />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('document.fields.agentCertifica')} *</Form.Label>
                  <Form.Control type="text" name="agentCertifica" value={formData.agentCertifica} onChange={handleChange} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('document.fields.numeroAgent')}</Form.Label>
                  <Form.Control type="text" name="numeroAgent" value={formData.numeroAgent} onChange={handleChange} />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('document.fields.dateCertificate')}</Form.Label>
                  <Form.Control type="date" name="dateCertificate" value={formData.dateCertificate} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('document.fields.dureeCertificat')}</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="dureeCertificat" 
                    value={formData.dureeCertificat} 
                    onChange={handleChange} 
                    placeholder={t('document.placeholders.dureeCertificat') || (language === 'fr' ? 'Ex: 2 ans' : 'Ex: 2 years')} 
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              {/* {!editingItem && ( */}
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('document.fields.docId')} *</Form.Label>
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
              {/* )} */}
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('document.fields.status')} *</Form.Label>
                  <Form.Select name="status.id" value={formData.status.id} onChange={handleChange} required>
                    <option value="">{t('common.select')}</option>
                    {docStatuses.map(status => (
                      <option key={status.id} value={status.id}>{status.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>{t('common.cancel')}</Button>
            <Button variant="primary" type="submit">{t('common.save')}</Button>
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
              {t('document.messages.confirmDelete')}
            </h5>
            {itemToDelete && (
              <div className="bg-light p-3 rounded">
                <strong>{t('document.fields.agentCertifica')}:</strong> {itemToDelete.agentCertifica}
                {itemToDelete.description && (
                  <>
                    <br />
                    <strong>{t('document.fields.description')}:</strong> {itemToDelete.description}
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

      {/* Document Details Modal */}
      <GenericDocumentDetailsModal
        show={showDetailsModal}
        onHide={handleCloseDetails}
        title={selectedDocument?.document?.originalFileName || t('document.documentDetails')}
        document={selectedDocument}
        language={language}
        onEdit={(doc) => { handleCloseDetails(); handleShowModal(doc); }}
        showEditButton={true}
      />
    </div>
  );
};

export default CertLicensesComponent;