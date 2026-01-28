/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table, Modal, Form, Alert, Spinner, Badge, Nav } from 'react-bootstrap';
import { getAllEstate } from '../../services/GetRequests';
import {  createEstateWithFile } from '../../services/Inserts';
import { updateEstate, updateEstateWithFile, deleteEstate } from '../../services/UpdRequests';
import { getAllDocStatuses} from '../../services/GetRequests';
import { getText } from '../../data/texts';
import SearchComponent from '../SearchComponent';
import HeaderTitle from '../HeaderTitle';
import DocumentCard from '../DocumentCard';
import GenericDocumentDetailsModal from '../GenericDocumentDetailsModal';
import { CurrentUserId } from '../../services/authUtils';
import { useSearchParams } from 'react-router-dom';
import PaginationControl from '../PaginationControl';
import SimpleSearchComponent from '../SimpleSearchComponent';
import { useLanguage } from '../../i18n/LanguageContext';

const EstateComponent = () => {
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
    reference: '',
    estateType: '',
    emplacement: '',
    coordonneesGps: '',
    dateOfBuilding: '',
    comments: '',

    document: { id: '' },
    status: { id: '' }
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const {language} = useLanguage();

  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

useEffect(() => {
  loadData();
  loadDropdownData();
}, [searchParams]);


  // Details modal + view toggle state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [activeView, setActiveView] = useState('cards'); // 'table' or 'cards' 



const loadData = async () => {
  try {
    setLoading(true);
    setError('');

    const page = parseInt(searchParams.get('page')) || 0;
    const size = parseInt(searchParams.get('size')) || 20;
    const sort = searchParams.get('sort') || 'reference';
    const direction = searchParams.get('direction') || 'asc';
    const statusId = searchParams.get('statusId') || undefined;
    const documentId = searchParams.get('documentId') || undefined;
    const search = searchParams.get('search') || undefined;

    const response = await getAllEstate({
      page,
      size,
      sort,
      direction,
      statusId,
      documentId,
      search
    });

    setData(response.content || []);
    setTotalPages(response.totalPages || 0);
    setTotalElements(response.totalElements||0)
  } catch (err) {
    setError(getText('document.messages.loadError', language));
    console.error(err);
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
        reference: item.reference || '',
        estateType: item.estateType || '',
        emplacement: item.emplacement || '',
        coordonneesGps: item.coordonneesGps || '',
        dateOfBuilding: item.dateOfBuilding ? item.dateOfBuilding.split('T')[0] : '',
        comments: item.comments || '',

        document: { id: item.document?.id || '' },
        status: { id: item.status?.id || '' }
      });
      setSelectedFile(null);
    } else {
      setEditingItem(null);
      setFormData({
        reference: '',
        estateType: '',
        emplacement: '',
        coordonneesGps: '',
        dateOfBuilding: '',
        comments: '',
    
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

        // Build estate object as JSON
        const estateData = {
          reference: formData.reference,
          estateType: formData.estateType || null,
          emplacement: formData.emplacement || null,
          coordonneesGps: formData.coordonneesGps || null,
          dateOfBuilding: formData.dateOfBuilding ? new Date(formData.dateOfBuilding).toISOString() : null,
          comments: formData.comments || null,
          doneBy: { id:CurrentUserId },
          status: formData.status.id ? { id: parseInt(formData.status.id) } : null
        };

        // Add estate as JSON blob
        formDataToSend.append('estate', new Blob([JSON.stringify(estateData)], {
          type: 'application/json'
        }));

        if (editingItem) {
          await updateEstateWithFile(editingItem.id, formDataToSend);
        } else {
          await createEstateWithFile(formDataToSend);
        }
      } else {
        const dataToSubmit = {
          ...formData,
          dateOfBuilding: formData.dateOfBuilding ? new Date(formData.dateOfBuilding).toISOString() : null,
          doneBy:  { id: CurrentUserId } ,
          document: formData.document.id ? { id: parseInt(formData.document.id) } : null
        };

        if (editingItem) {
          dataToSubmit.status = formData.status.id ? { id: parseInt(formData.status.id) } : null;
          await updateEstate(editingItem.id, dataToSubmit);
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
      await deleteEstate(itemToDelete.id);
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

  // Show details modal for the item
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
          <span className="visually-hidden">{getText('common.loading', language)}</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="estate-component">
      <Row className="mb-4" >
        <Col>
          <Card>
            <Card.Header>
              <Row className="align-items-center">
                <Col xs={12} md={6} lg={3}>
                  <HeaderTitle>{getText('document.estate', language)}</HeaderTitle>
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

              {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

              {activeView === 'table' && (
                <div className="table-responsive">
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>{getText('document.fields.reference', language)}</th>
                        <th>{getText('document.fields.estateType', language)}</th>
                        <th>{getText('document.fields.emplacement', language)}</th>
                        <th>{getText('document.fields.dateOfBuilding', language)}</th>
                        <th>{getText('document.fields.comments', language)}</th>
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
                            <td>{item.estateType}</td>
                            <td>{item.emplacement}</td>
                            <td>{formatDate(item.dateOfBuilding)}</td>
                            <td className="text-truncate" style={{ maxWidth: '200px' }}>{item.comments}</td>
                            <td className="text-center">
                              <div className="d-flex gap-1 justify-content-center action-buttons">
                                {/* View Details Button */}
                                {item.document?.id && (
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => handleShowDetails(item)}
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
              )}

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
                    data.map((item) => (
                      <DocumentCard
                        key={item.id}
                        item={item}
                        language={language}
                        onViewDetails={() => handleShowDetails(item)}
                        onEdit={handleShowModal}
                        onDelete={handleDeleteClick}
                        getDisplayName={(it) => it.document?.originalFileName || it.reference}
                        getDescription={(it) => it.emplacement}
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
            {editingItem ? `${getText('common.edit', language)} ${getText('document.estate', language)}` : `${getText('common.add', language)} ${getText('document.estate', language)}`}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{getText('document.fields.reference', language)} *</Form.Label>
                  <Form.Control type="text" name="reference" value={formData.reference} onChange={handleChange} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{getText('document.fields.estateType', language)} *</Form.Label>
                  <Form.Control type="text" name="estateType" value={formData.estateType} onChange={handleChange} required />
                </Form.Group>
              </Col>
            </Row>

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

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{getText('document.fields.dateOfBuilding', language)}</Form.Label>
                  <Form.Control type="date" name="dateOfBuilding" value={formData.dateOfBuilding} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{getText('document.fields.comments', language)}</Form.Label>
                  <Form.Control as="textarea" rows={2} name="comments" value={formData.comments} onChange={handleChange} />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              {/* {!editingItem && ( */}
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
              {/* )} */}
       
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
                <strong>{getText('document.fields.reference', language)}:</strong> {itemToDelete.reference}
                {itemToDelete.estateType && (
                  <>
                    <br />
                    <strong>{getText('document.fields.estateType', language)}:</strong> {itemToDelete.estateType}
                  </>
                )}
                {itemToDelete.emplacement && (
                  <>
                    <br />
                    <strong>{getText('document.fields.emplacement', language)}:</strong> {itemToDelete.emplacement}
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

export default EstateComponent;
