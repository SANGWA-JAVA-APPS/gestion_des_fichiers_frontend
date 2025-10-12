import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { getAllCargoDamage } from '../../services/GetRequests';
import { createCargoDamage } from '../../services/Inserts';
import { updateCargoDamage, deleteCargoDamage } from '../../services/UpdRequests';
import { getAllDocStatuses, getAllDocuments, getAllAccounts } from '../../services/GetRequests';
import { getText } from '../../data/texts';

const CargoDamageComponent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [docStatuses, setDocStatuses] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState({
    refeRequest: '',
    description: '',
    quotationContractNum: '',
    dateRequest: '',
    dateContract: '',
    doneBy: { id: '' },
    document: { id: '' },
    status: { id: '' }
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
      const response = await getAllCargoDamage(currentPage, pageSize);
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
      const [statusesData, docsData, accountsData] = await Promise.all([
        getAllDocStatuses(),
        getAllDocuments(),
        getAllAccounts()
      ]);
      setDocStatuses(Array.isArray(statusesData) ? statusesData : []);
      setDocuments(Array.isArray(docsData) ? docsData : []);
      setAccounts(Array.isArray(accountsData) ? accountsData : []);
    } catch (err) {
      console.error('Load dropdown data error:', err);
    }
  };

  const handleShowModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        refeRequest: item.refeRequest || '',
        description: item.description || '',
        quotationContractNum: item.quotationContractNum || '',
        dateRequest: item.dateRequest ? item.dateRequest.split('T')[0] : '',
        dateContract: item.dateContract ? item.dateContract.split('T')[0] : '',
        doneBy: { id: item.doneBy?.id || '' },
        document: { id: item.document?.id || '' },
        status: { id: item.status?.id || '' }
      });
    } else {
      setEditingItem(null);
      setFormData({
        refeRequest: '',
        description: '',
        quotationContractNum: '',
        dateRequest: '',
        dateContract: '',
        doneBy: { id: '' },
        document: { id: '' },
        status: { id: '' }
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
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
        dateRequest: formData.dateRequest ? new Date(formData.dateRequest).toISOString() : null,
        dateContract: formData.dateContract ? new Date(formData.dateContract).toISOString() : null,
        doneBy: formData.doneBy.id ? { id: parseInt(formData.doneBy.id) } : null,
        document: formData.document.id ? { id: parseInt(formData.document.id) } : null
      };
      
      // Only include status for updates (backend sets default status on creation)
      if (editingItem) {
        dataToSubmit.status = formData.status.id ? { id: parseInt(formData.status.id) } : null;
        await updateCargoDamage(editingItem.id, dataToSubmit);
      } else {
        await createCargoDamage(dataToSubmit);
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
        await deleteCargoDamage(id);
        loadData();
      } catch (err) {
        setError(getText('document.messages.deleteError', language) + ': ' + (err.message || 'Unknown error'));
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
    <div className="cargo-damage-component">
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">{getText('document.cargoDamage', language)}</h4>
              <div>
                <Button variant="primary" size="sm" className="me-2" onClick={() => handleShowModal()}>
                  <i className="bi bi-plus-circle me-1"></i>{getText('common.add', language)}
                </Button>
                <Button variant="outline-secondary" size="sm" onClick={loadData}>
                  <i className="bi bi-arrow-clockwise me-1"></i>{getText('document.actions.refresh', language)}
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
              
              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>{getText('document.fields.refeRequest', language)}</th>
                      <th>{getText('document.fields.description', language)}</th>
                      <th>{getText('document.fields.quotationContractNum', language)}</th>
                      <th>{getText('document.fields.dateRequest', language)}</th>
                      <th>{getText('document.fields.dateContract', language)}</th>
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
                          <td>{item.refeRequest}</td>
                          <td className="text-truncate" style={{ maxWidth: '200px' }}>{item.description}</td>
                          <td>{item.quotationContractNum}</td>
                          <td>{formatDate(item.dateRequest)}</td>
                          <td>{formatDate(item.dateContract)}</td>
                          <td className="text-center">
                            <Button variant="warning" size="sm" className="me-2" onClick={() => handleShowModal(item)}>
                              <i className="bi bi-pencil"></i>
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>
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
            {editingItem ? `${getText('common.edit', language)} ${getText('document.cargoDamage', language)}` : `${getText('common.add', language)} ${getText('document.cargoDamage', language)}`}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{getText('document.fields.refeRequest', language)} *</Form.Label>
                  <Form.Control type="text" name="refeRequest" value={formData.refeRequest} onChange={handleChange} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{getText('document.fields.quotationContractNum', language)}</Form.Label>
                  <Form.Control type="text" name="quotationContractNum" value={formData.quotationContractNum} onChange={handleChange} />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>{getText('document.fields.description', language)}</Form.Label>
              <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleChange} />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{getText('document.fields.dateRequest', language)}</Form.Label>
                  <Form.Control type="date" name="dateRequest" value={formData.dateRequest} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{getText('document.fields.dateContract', language)}</Form.Label>
                  <Form.Control type="date" name="dateContract" value={formData.dateContract} onChange={handleChange} />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>{getText('document.fields.doneBy', language)} *</Form.Label>
                  <Form.Select name="doneBy.id" value={formData.doneBy.id} onChange={handleChange} required>
                    <option value="">{getText('common.select', language)}</option>
                    {accounts.map(account => <option key={account.id} value={account.id}>{account.username || account.fullName}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>{getText('document.fields.docId', language)} *</Form.Label>
                  <Form.Select name="document.id" value={formData.document.id} onChange={handleChange} required>
                    <option value="">{getText('common.select', language)}</option>
                    {documents.map(doc => <option key={doc.id} value={doc.id}>{doc.fileName || doc.name || `Document ${doc.id}`}</option>)}
                  </Form.Select>
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
    </div>
  );
};

export default CargoDamageComponent;
