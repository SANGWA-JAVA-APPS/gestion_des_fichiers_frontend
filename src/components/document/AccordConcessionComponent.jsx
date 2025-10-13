import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table, Modal, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { getAllAccordConcession } from '../../services/GetRequests';
import { createAccordConcession, createAccordConcessionWithFile } from '../../services/Inserts';
import { updateAccordConcession, updateAccordConcessionWithFile, deleteAccordConcession } from '../../services/UpdRequests';
import { getAllDocStatuses, getAllAccounts, getAllSectionCategories } from '../../services/GetRequests';
import { getText } from '../../data/texts';

const AccordConcessionComponent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [docStatuses, setDocStatuses] = useState([]);
  const [accounts, setAccounts] = useState([]);
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
      const response = await getAllAccordConcession(currentPage, pageSize);
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
      const [statusesData, accountsData, categoriesData] = await Promise.all([
        getAllDocStatuses(),
        getAllAccounts(),
        getAllSectionCategories()
      ]);
      setDocStatuses(Array.isArray(statusesData) ? statusesData : []);
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
        contratConcession: item.contratConcession || '',
        emplacement: item.emplacement || '',
        coordonneesGps: item.coordonneesGps || '',
        rapportTransfertGestion: item.rapportTransfertGestion || '',
        dateSignature: item.dateSignature ? item.dateSignature.split('T')[0] : '',
        dateExpiration: item.dateExpiration ? item.dateExpiration.split('T')[0] : '',
        doneBy: { id: item.doneBy?.id || '' },
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
        doneBy: { id: '' },
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
        formDataToSend.append('contratConcession', formData.contratConcession);
        if (formData.emplacement) formDataToSend.append('emplacement', formData.emplacement);
        if (formData.coordonneesGps) formDataToSend.append('coordonneesGps', formData.coordonneesGps);
        if (formData.rapportTransfertGestion) formDataToSend.append('rapportTransfertGestion', formData.rapportTransfertGestion);
        if (formData.dateSignature) formDataToSend.append('dateSignature', new Date(formData.dateSignature).toISOString());
        if (formData.dateExpiration) formDataToSend.append('dateExpiration', new Date(formData.dateExpiration).toISOString());
        if (formData.doneBy.id) formDataToSend.append('doneById', parseInt(formData.doneBy.id));
        if (formData.sectionCategory.id) formDataToSend.append('sectionCategoryId', parseInt(formData.sectionCategory.id));
        if (editingItem && formData.status.id) {
          formDataToSend.append('statusId', parseInt(formData.status.id));
        }

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
          doneBy: formData.doneBy.id ? { id: parseInt(formData.doneBy.id) } : null,
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

  const handleDelete = async (id) => {
    if (window.confirm(getText('document.messages.confirmDelete', language))) {
      try {
        setError('');
        await deleteAccordConcession(id);
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
    <div className="accord-concession-component">
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">{getText('document.accordConcession', language)}</h4>
              <div>
                <Button variant="primary" size="sm" className="me-2" onClick={() => handleShowModal()}>
                  <i className="bi bi-plus-circle me-1"></i>
                  {getText('common.add', language)}
                </Button>
                <Button variant="outline-secondary" size="sm" onClick={loadData}>
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  {getText('document.actions.refresh', language)}
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
                      <th>{getText('document.fields.contratConcession', language)}</th>
                      <th>{getText('document.fields.emplacement', language)}</th>
                      <th>{getText('document.fields.dateSignature', language)}</th>
                      <th>{getText('document.fields.dateExpiration', language)}</th>
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
                          <td>{item.contratConcession}</td>
                          <td>{item.emplacement}</td>
                          <td>{formatDate(item.dateSignature)}</td>
                          <td>{formatDate(item.dateExpiration)}</td>
                          <td><Badge bg="info">{item.sectionCategory?.name || '-'}</Badge></td>
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
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>{getText('document.fields.doneBy', language)} *</Form.Label>
                  <Form.Select name="doneBy.id" value={formData.doneBy.id} onChange={handleChange} required>
                    <option value="">{getText('common.select', language)}</option>
                    {accounts.map(account => <option key={account.id} value={account.id}>{account.username || account.fullName}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
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
    </div>
  );
};

export default AccordConcessionComponent;
