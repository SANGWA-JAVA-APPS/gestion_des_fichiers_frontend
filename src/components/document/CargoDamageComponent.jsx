import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { getAllCargoDamage } from '../../services/GetRequests';
import { createCargoDamage, createCargoDamageWithFile } from '../../services/Inserts';
import { updateCargoDamage, updateCargoDamageWithFile, deleteCargoDamage } from '../../services/UpdRequests';
import { getAllDocStatuses, getAllAccounts } from '../../services/GetRequests';
import { getText } from '../../data/texts';
import SearchComponent from '../SearchComponent';
import HeaderTitle from '../HeaderTitle';
import { API_BASE_URL } from '../../services/apiConfig';

const CargoDamageComponent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [docStatuses, setDocStatuses] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
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

  // Search filters state
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
      const [statusesData, accountsData] = await Promise.all([
        getAllDocStatuses(),
        getAllAccounts()
      ]);
      setDocStatuses(Array.isArray(statusesData) ? statusesData : []);
      setAccounts(Array.isArray(accountsData) ? accountsData : []);
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
        refeRequest: item.refeRequest || '',
        description: item.description || '',
        quotationContractNum: item.quotationContractNum || '',
        dateRequest: item.dateRequest ? item.dateRequest.split('T')[0] : '',
        dateContract: item.dateContract ? item.dateContract.split('T')[0] : '',
        doneBy: { id: item.doneBy?.id || '' },
        document: { id: item.document?.id || '' },
        status: { id: item.status?.id || '' }
      });
      setSelectedFile(null);
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

        // Build cargoDamage object as JSON
        const cargoDamageData = {
          refeRequest: formData.refeRequest || null,
          description: formData.description || null,
          quotationContractNum: formData.quotationContractNum || null,
          dateRequest: formData.dateRequest ? new Date(formData.dateRequest).toISOString() : null,
          dateContract: formData.dateContract ? new Date(formData.dateContract).toISOString() : null,
          doneBy: { id: parseInt(formData.doneBy.id) },
          status: formData.status.id ? { id: parseInt(formData.status.id) } : null
        };

        // Add cargoDamage as JSON blob
        formDataToSend.append('cargoDamage', new Blob([JSON.stringify(cargoDamageData)], {
          type: 'application/json'
        }));

        if (editingItem) {
          await updateCargoDamageWithFile(editingItem.id, formDataToSend);
        } else {
          await createCargoDamageWithFile(formDataToSend);
        }
      } else {
        const dataToSubmit = {
          ...formData,
          dateRequest: formData.dateRequest ? new Date(formData.dateRequest).toISOString() : null,
          dateContract: formData.dateContract ? new Date(formData.dateContract).toISOString() : null,
          doneBy: formData.doneBy.id ? { id: parseInt(formData.doneBy.id) } : null,
          document: formData.document.id ? { id: parseInt(formData.document.id) } : null
        };

        if (editingItem) {
          dataToSubmit.status = formData.status.id ? { id: parseInt(formData.status.id) } : null;
          await updateCargoDamage(editingItem.id, dataToSubmit);
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
      await deleteCargoDamage(itemToDelete.id);
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

  const handleViewDocument = async (documentId) => {
    if (!documentId) {
      alert(language === 'fr' ? 'Aucun document disponible' : 'No document available');
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
        throw new Error('Failed to fetch document metadata');
      }

      const documentData = await documentResponse.json();
      const filePath = documentData.data?.filePath;

      if (!filePath) {
        throw new Error('File path not found in document data');
      }

      // Now fetch the actual file content using the file path
      const fileResponse = await fetch(`${API_BASE_URL}/files/download/${filePath}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!fileResponse.ok) {
        throw new Error('Failed to download file');
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
      alert(language === 'fr' ? `Erreur lors de l'ouverture du document: ${err.message}` : `Error opening document: ${err.message}`);
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
                  <HeaderTitle>{getText('document.cargoDamage', language)}</HeaderTitle>
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
                          <td>{item.refeRequest}</td>
                          <td className="text-truncate" style={{ maxWidth: '200px' }}>{item.description}</td>
                          <td>{item.quotationContractNum}</td>
                          <td>{formatDate(item.dateRequest)}</td>
                          <td>{formatDate(item.dateContract)}</td>
                          <td className="text-center">
                            <div className="d-flex gap-1 justify-content-center action-buttons">
                              {/* View Document Button */}
                              {item.document?.id && (
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => handleViewDocument(item.document.id)}
                                  className="d-flex align-items-center"
                                  title={language === 'fr' ? 'Voir le document' : 'View Document'}
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
                <strong>{getText('document.fields.refeRequest', language)}:</strong> {itemToDelete.refeRequest}
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
    </div>
  );
};

export default CargoDamageComponent;
