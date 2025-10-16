import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table, Modal, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { getAllCommAssetLand } from '../../services/GetRequests';
import { createCommAssetLand, createCommAssetLandWithFile } from '../../services/Inserts';
import { updateCommAssetLand, deleteCommAssetLand } from '../../services/UpdRequests';
import { getAllDocStatuses, getAllAccounts, getAllSections } from '../../services/GetRequests';
import { getText } from '../../data/texts';
import SearchComponent from '../SearchComponent';
import HeaderTitle from '../HeaderTitle';

const CommAssetLandComponent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [docStatuses, setDocStatuses] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    reference: '',
    dateObtention: '',
    coordonneesGps: '',
    emplacement: '',
    doneBy: { id: '' },
    document: { id: '' },
    status: { id: '' },
    section: { id: '' }
  });
  const [language] = useState('fr');
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

  useEffect(() => {
    loadData();
    loadDropdownData();
  }, [currentPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getAllCommAssetLand(currentPage, pageSize);
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
      const [statusesData, accountsData, sectionsData] = await Promise.all([
        getAllDocStatuses(),
        getAllAccounts(),
        getAllSections()
      ]);
      setDocStatuses(Array.isArray(statusesData) ? statusesData : []);
      setAccounts(Array.isArray(accountsData) ? accountsData : []);
      setSections(Array.isArray(sectionsData) ? sectionsData : []);
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
        reference: item.reference || '',
        dateObtention: item.dateObtention ? item.dateObtention.split('T')[0] : '',
        coordonneesGps: item.coordonneesGps || '',
        emplacement: item.emplacement || '',
        doneBy: { id: item.doneBy?.id || '' },
        document: { id: item.document?.id || '' },
        status: { id: item.status?.id || '' },
        section: { id: item.section?.id || '' }
      });
      setSelectedFile(null);
    } else {
      setEditingItem(null);
      setFormData({
        description: '',
        reference: '',
        dateObtention: '',
        coordonneesGps: '',
        emplacement: '',
        doneBy: { id: '' },
        document: { id: '' },
        status: { id: '' },
        section: { id: '' }
      });
      setSelectedFile(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({
      description: '',
      reference: '',
      dateObtention: '',
      coordonneesGps: '',
      emplacement: '',
      doneBy: { id: '' },
      document: { id: '' },
      status: { id: '' },
      section: { id: '' }
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

        // Build commAssetLand object as JSON
        const commAssetLandData = {
          reference: formData.reference,
          description: formData.description || null,
          dateObtention: formData.dateObtention ? new Date(formData.dateObtention).toISOString() : null,
          coordonneesGps: formData.coordonneesGps || null,
          emplacement: formData.emplacement || null,
          doneBy: { id: parseInt(formData.doneBy.id) },
          status: formData.status.id ? { id: parseInt(formData.status.id) } : null,
          section: formData.section.id ? { id: parseInt(formData.section.id) } : null
        };

        // Add commAssetLand as JSON blob
        formDataToSend.append('commAssetLand', new Blob([JSON.stringify(commAssetLandData)], {
          type: 'application/json'
        }));

        await createCommAssetLandWithFile(formDataToSend);
      } else if (editingItem) {
        // Handle UPDATE (with or without file - backend doesn't support file update yet)
        const dataToSubmit = {
          ...formData,
          dateObtention: formData.dateObtention ? new Date(formData.dateObtention).toISOString() : null,
          doneBy: formData.doneBy.id ? { id: parseInt(formData.doneBy.id) } : null,
          document: formData.document.id ? { id: parseInt(formData.document.id) } : null,
          section: formData.section.id ? { id: parseInt(formData.section.id) } : null,
          status: formData.status.id ? { id: parseInt(formData.status.id) } : null
        };

        await updateCommAssetLand(editingItem.id, dataToSubmit);

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

  const handleDelete = async (id) => {
    if (window.confirm(getText('document.messages.confirmDelete', language))) {
      try {
        setError('');
        await deleteCommAssetLand(id);
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
    <div className="comm-asset-land-component">
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <Row className="align-items-center">
                <Col xs={12} md={6} lg={3}>
                  <HeaderTitle>{getText('document.commAssetLand', language)}</HeaderTitle>
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
            </Card.Header>
            <Card.Body>
              {/* Search Component */}
              <SearchComponent
                dropdownLabel="Filter"
                dropdownItems={[]}
                dropdownValue={searchFilters.statusFilter}
                onDropdownChange={(value) => setSearchFilters({...searchFilters, statusFilter: value})}
                
                textbox1Label="Search"
                textbox1Placeholder="Enter search term..."
                textbox1Value={searchFilters.searchText}
                onTextbox1Change={(value) => setSearchFilters({...searchFilters, searchText: value})}
                
                dateStartLabel="From Date"
                dateStartValue={searchFilters.dateStart}
                onDateStartChange={(value) => setSearchFilters({...searchFilters, dateStart: value})}
                
                dateEndLabel="To Date"
                dateEndValue={searchFilters.dateEnd}
                onDateEndChange={(value) => setSearchFilters({...searchFilters, dateEnd: value})}
                
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

              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>{getText('document.fields.reference', language)}</th>
                      <th>{getText('document.fields.description', language)}</th>
                      <th>{getText('document.fields.dateObtention', language)}</th>
                      <th>{getText('document.fields.emplacement', language)}</th>
                      <th>{getText('document.fields.coordonneesGps', language)}</th>
                      <th>{getText('location.section', language)}</th>
                      <th className="text-center" style={{ width: '150px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center text-muted">
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
                          <td>{formatDate(item.dateObtention)}</td>
                          <td>{item.emplacement}</td>
                          <td className="text-truncate" style={{ maxWidth: '150px' }}>
                            {item.coordonneesGps}
                          </td>
                          <td>
                            <Badge bg="secondary">{item.section?.name || '-'}</Badge>
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
              ? `${getText('common.edit', language)} ${getText('document.commAssetLand', language)}`
              : `${getText('common.add', language)} ${getText('document.commAssetLand', language)}`
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
                    placeholder={language === 'fr' ? 'Ex: CAL-2024-001' : 'Ex: CAL-2024-001'}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{getText('document.fields.dateObtention', language)}</Form.Label>
                  <Form.Control
                    type="date"
                    name="dateObtention"
                    value={formData.dateObtention}
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

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{getText('document.fields.emplacement', language)}</Form.Label>
                  <Form.Control
                    type="text"
                    name="emplacement"
                    value={formData.emplacement}
                    onChange={handleChange}
                    placeholder={language === 'fr' ? 'Emplacement' : 'Location'}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{getText('document.fields.coordonneesGps', language)}</Form.Label>
                  <Form.Control
                    type="text"
                    name="coordonneesGps"
                    value={formData.coordonneesGps}
                    onChange={handleChange}
                    placeholder="Ex: -4.3456, 15.2982"
                  />
                  <Form.Text className="text-muted">
                    {language === 'fr' ? 'Format: latitude, longitude' : 'Format: latitude, longitude'}
                  </Form.Text>
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
                  <Form.Label>{getText('location.section', language)} *</Form.Label>
                  <Form.Select
                    name="section.id"
                    value={formData.section.id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">{getText('common.select', language)}</option>
                    {sections.map(section => (
                      <option key={section.id} value={section.id}>
                        {section.name}
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

export default CommAssetLandComponent;
