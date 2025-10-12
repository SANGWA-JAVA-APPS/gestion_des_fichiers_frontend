import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table, Modal, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { getAllPermiConstruction } from '../../services/GetRequests';
import { createPermiConstruction } from '../../services/Inserts';
import { updatePermiConstruction, deletePermiConstruction } from '../../services/UpdRequests';
import { getAllDocStatuses, getAllDocuments, getAllAccounts, getAllSectionCategories } from '../../services/GetRequests';
import { getText } from '../../data/texts';

const PermiConstructionComponent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [docStatuses, setDocStatuses] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [sectionCategories, setSectionCategories] = useState([]);
  const [formData, setFormData] = useState({
    referenceTitreFoncier: '',
    refPermisConstuire: '',
    dateValidation: '',
    dateEstimeeTravaux: '',
    doneBy: { id: '' },
    document: { id: '' },
    status: { id: '' },
    sectionCategory: { id: '' }
  });
  const [language] = useState('fr');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;

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
      setError(getText('document.messages.loadError', language) + ': ' + (err.message || 'Unknown error'));
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDropdownData = async () => {
    try {
      const [statusesData, docsData, accountsData, categoriesData] = await Promise.all([
        getAllDocStatuses(),
        getAllDocuments(),
        getAllAccounts(),
        getAllSectionCategories()
      ]);
      setDocStatuses(Array.isArray(statusesData) ? statusesData : []);
      setDocuments(Array.isArray(docsData) ? docsData : []);
      setAccounts(Array.isArray(accountsData) ? accountsData : []);
      setSectionCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (err) {
      console.error('Load dropdown data error:', err);
    }
  };

  const handleShowModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        referenceTitreFoncier: item.referenceTitreFoncier || '',
        refPermisConstuire: item.refPermisConstuire || '',
        dateValidation: item.dateValidation ? item.dateValidation.split('T')[0] : '',
        dateEstimeeTravaux: item.dateEstimeeTravaux ? item.dateEstimeeTravaux.split('T')[0] : '',
        doneBy: { id: item.doneBy?.id || '' },
        document: { id: item.document?.id || '' },
        status: { id: item.status?.id || '' },
        sectionCategory: { id: item.sectionCategory?.id || '' }
      });
    } else {
      setEditingItem(null);
      setFormData({
        referenceTitreFoncier: '',
        refPermisConstuire: '',
        dateValidation: '',
        dateEstimeeTravaux: '',
        doneBy: { id: '' },
        document: { id: '' },
        status: { id: '' },
        sectionCategory: { id: '' }
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({
      referenceTitreFoncier: '',
      refPermisConstuire: '',
      dateValidation: '',
      dateEstimeeTravaux: '',
      doneBy: { id: '' },
      document: { id: '' },
      status: { id: '' },
      sectionCategory: { id: '' }
    });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      
      const dataToSubmit = {
        ...formData,
        dateValidation: formData.dateValidation ? new Date(formData.dateValidation).toISOString() : null,
        dateEstimeeTravaux: formData.dateEstimeeTravaux ? new Date(formData.dateEstimeeTravaux).toISOString() : null,
        doneBy: formData.doneBy.id ? { id: parseInt(formData.doneBy.id) } : null,
        document: formData.document.id ? { id: parseInt(formData.document.id) } : null,
        sectionCategory: formData.sectionCategory.id ? { id: parseInt(formData.sectionCategory.id) } : null
      };
      
      // Only include status for updates (backend sets default status on creation)
      if (editingItem) {
        dataToSubmit.status = formData.status.id ? { id: parseInt(formData.status.id) } : null;
        await updatePermiConstruction(editingItem.id, dataToSubmit);
      } else {
        await createPermiConstruction(dataToSubmit);
      }
      handleCloseModal();
      loadData();
    } catch (err) {
      setError(getText('document.messages.saveError', language) + ': ' + (err.message || 'Unknown error'));
      console.error('Save error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(getText('document.messages.confirmDelete', language))) {
      try {
        setError('');
        await deletePermiConstruction(id);
        loadData();
      } catch (err) {
        setError(getText('document.messages.deleteError', language) + ': ' + (err.message || 'Unknown error'));
        console.error('Delete error:', err);
      }
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
          <span className="visually-hidden">{getText('common.loading', language)}</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="permi-construction-component">
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">{getText('document.permiConstruction', language)}</h4>
              <div>
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="me-2"
                  onClick={() => handleShowModal()}
                >
                  <i className="bi bi-plus-circle me-1"></i>
                  {getText('common.add', language)}
                </Button>
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={loadData}
                >
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  {getText('document.actions.refresh', language)}
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                  {error}
                </Alert>
              )}
              
              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>{getText('document.fields.referenceTitreFoncier', language)}</th>
                      <th>{getText('document.fields.refPermisConstuire', language)}</th>
                      <th>{getText('document.fields.dateValidation', language)}</th>
                      <th>{getText('document.fields.dateEstimeeTravaux', language)}</th>
                      <th>{getText('document.sectionCategory', language)}</th>
                      <th className="text-center" style={{ width: '150px' }}>Actions</th>
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
                          <td>{item.referenceTitreFoncier}</td>
                          <td>{item.refPermisConstuire}</td>
                          <td>{formatDate(item.dateValidation)}</td>
                          <td>{formatDate(item.dateEstimeeTravaux)}</td>
                          <td>
                            <Badge bg="info">{item.sectionCategory?.name || '-'}</Badge>
                          </td>
                          <td className="text-center">
                            <Button
                              variant="warning"
                              size="sm"
                              className="me-2"
                              onClick={() => handleShowModal(item)}
                            >
                              <i className="bi bi-pencil"></i>
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                            >
                              <i className="bi bi-trash"></i>
                            </Button>
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

      <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingItem 
              ? `${getText('common.edit', language)} ${getText('document.permiConstruction', language)}`
              : `${getText('common.add', language)} ${getText('document.permiConstruction', language)}`
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
                  <Form.Label>{getText('document.fields.referenceTitreFoncier', language)} *</Form.Label>
                  <Form.Control
                    type="text"
                    name="referenceTitreFoncier"
                    value={formData.referenceTitreFoncier}
                    onChange={handleChange}
                    required
                    placeholder={language === 'fr' ? 'Référence titre foncier' : 'Land title reference'}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{getText('document.fields.refPermisConstuire', language)} *</Form.Label>
                  <Form.Control
                    type="text"
                    name="refPermisConstuire"
                    value={formData.refPermisConstuire}
                    onChange={handleChange}
                    required
                    placeholder={language === 'fr' ? 'Référence permis de construire' : 'Building permit reference'}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{getText('document.fields.dateValidation', language)}</Form.Label>
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
                  <Form.Label>{getText('document.fields.dateEstimeeTravaux', language)}</Form.Label>
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
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>{getText('document.fields.doneBy', language)} *</Form.Label>
                  <Form.Select
                    name="doneBy.id"
                    value={formData.doneBy.id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">{getText('common.select', language)}</option>
                    {accounts.map(account => (
                      <option key={account.id} value={account.id}>
                        {account.username || account.fullName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>{getText('document.fields.docId', language)} *</Form.Label>
                  <Form.Select
                    name="document.id"
                    value={formData.document.id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">{getText('common.select', language)}</option>
                    {documents.map(doc => (
                      <option key={doc.id} value={doc.id}>
                        {doc.fileName || doc.name || `Document ${doc.id}`}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
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
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>{getText('document.sectionCategory', language)} *</Form.Label>
                  <Form.Select
                    name="sectionCategory.id"
                    value={formData.sectionCategory.id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">{getText('common.select', language)}</option>
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
              {getText('common.cancel', language)}
            </Button>
            <Button variant="primary" type="submit">
              {getText('common.save', language)}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default PermiConstructionComponent;
