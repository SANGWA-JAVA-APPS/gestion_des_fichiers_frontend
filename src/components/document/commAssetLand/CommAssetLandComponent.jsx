/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table, Modal, Form, Alert, Spinner, Badge, Dropdown, ListGroup, Nav } from 'react-bootstrap';
import { getAllCommAssetLand } from '../../../services/GetRequests';
import {  createCommAssetLandWithFile } from '../../../services/Inserts';
import { updateCommAssetLand, updateCommAssetLandWithFile, deleteCommAssetLand } from '../../../services/UpdRequests';
import { getAllDocStatuses, getAllSectionCategories } from '../../../services/GetRequests';
import { getText } from '../../../data/texts';

import HeaderTitle from '../../HeaderTitle';
import DocumentCard from '../../DocumentCard';
import GenericDocumentDetailsModal from '../../GenericDocumentDetailsModal';

import { getUserInfo } from '../../../services/authUtils';
import { BASE_URL } from '../../../services/apiConfig';
import { useLanguage } from '../../../i18n/LanguageContext';
import { useSearchParams } from 'react-router-dom';
import PaginationControl from '../../PaginationControl';
import SimpleSearchComponent from '../../SimpleSearchComponent';

const CommAssetLandComponent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
   const [searchParams, setSearchParams] = useSearchParams();
  const [itemToDelete, setItemToDelete] = useState(null);
  const [docStatuses, setDocStatuses] = useState([]);
  const [viewModal, setViewModal] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [activeView, setActiveView] = useState('cards');

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
  

const pageSize = parseInt(searchParams.get('size') || '10', 10);
const currentPage = parseInt(searchParams.get('page') || '0', 10);
  const {language} =useLanguage();
  const [totalElemtns, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

const apiParams = {
  page: currentPage,
  size: pageSize,
  statusId: searchParams.get('filter') || undefined,
  search: searchParams.get('search') || undefined,
  dateStart: searchParams.get('start') || undefined,
  dateEnd: searchParams.get('end') || undefined,
};

  useEffect(() => {
    loadData();
    loadDropdownData();
  }, [searchParams]);

const loadData = async () => {
  try {
    setLoading(true);
    setError('');

  

    const response = await getAllCommAssetLand(apiParams);

    setData(response.content?.map(item => buildUIItem(item)) || []);
    setTotalPages(response.totalPages || 0);
    setTotalElements(response.totalElements)
  } catch (err) {
    setError(getText('document.messages.loadError', language) + ': ' + (err.message || 'Unknown error'));
    console.error('Load error:', err);
  } finally {
    setLoading(false);
  }
};


  const loadDropdownData = async () => {
    try {
      const [statusesData,  sectionsData] = await Promise.all([
        getAllDocStatuses(),
  
        getAllSectionCategories()
      ]);
      setDocStatuses(Array.isArray(statusesData) ? statusesData : []);

      setSections(Array.isArray(sectionsData) ? sectionsData : []);
    } catch (err) {
      console.error('Load dropdown data error:', err);
    }
  };


  // Build a UI-friendly item with nested `document`, `doneBy`, `sectionCategory` and `status` objects
  const buildUIItem = (raw) => {
    if (!raw) return null;

    return {
      ...raw,
      document: raw.documentId ? {
        id: raw.documentId,
        fileName: raw.documentFileName,
        originalFileName: raw.documentOriginalFileName,
        fileSize: raw.documentFileSize,
        contentType: raw.documentContentType,
        createdAt: raw.documentCreatedAt,
        updatedAt: raw.documentUpdatedAt,
        status: raw.documentStatus,
        owner: {
          id: raw.documentOwnerId,
          username: raw.documentOwnerUsername,
          email: raw.documentOwnerEmail,
          fullName: raw.documentOwnerFullName
        },
        filePath: raw.documentFilePath,
        version: raw.documentVersion,
        expirationDate: raw.documentExpirationDate
      } : null,
      doneBy: raw.doneById ? { id: raw.doneById, username: raw.doneByUsername, fullName: raw.doneByFullName } : raw.doneBy || null,
      sectionCategory: raw.sectionId ? { id: raw.sectionId, name: raw.sectionName } : null,
      status: raw.statusId ? { id: raw.statusId, name: raw.statusName } : null
    };
  };

  const handleViewDocument = (documentId) => {
    const item = data.find(d => d.documentId === documentId);
    if (item) {
      setViewItem(buildUIItem(item));
      setViewModal(true);
    }
  };

  const handleShowDetails = (item) => {
    setViewItem(buildUIItem(item));
    setViewModal(true);
  };

const handleCloseViewModal = () => {
  setViewModal(false);
  setViewItem(null);
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

  
        status: { id: item.statusId || '' },
        section: { id: item.sectionId || '' }
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
    const CurrentUserId = getUserInfo().userId
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
          doneBy: { id: CurrentUserId },
          status: formData.status.id ? { id: parseInt(formData.status.id) } : null,
          section: formData.section.id ? { id: parseInt(formData.section.id) } : null
        };

        // Add commAssetLand as JSON blob
        formDataToSend.append('commAssetLand', new Blob([JSON.stringify(commAssetLandData)], {
          type: 'application/json'
        }));

        await createCommAssetLandWithFile(formDataToSend);
      } else if (editingItem) {
        // Handle UPDATE
        if (selectedFile) {
          // UPDATE with new file
          const formDataToSend = new FormData();
          formDataToSend.append('file', selectedFile);
          
          const commAssetLandData = {
            reference: formData.reference,
            description: formData.description || null,
            dateObtention: formData.dateObtention ? new Date(formData.dateObtention).toISOString() : null,
            coordonneesGps: formData.coordonneesGps || null,
            emplacement: formData.emplacement || null,
            doneBy: { id: CurrentUserId },
            document: { id: editingItem.documentId },
            status: formData.status.id ? { id: parseInt(formData.status.id) } : null,
            section: formData.section.id ? { id: parseInt(formData.section.id) } : null
          };
          
          formDataToSend.append('commAssetLand', new Blob([JSON.stringify(commAssetLandData)], {
            type: 'application/json'
          }));
          
          await updateCommAssetLandWithFile(editingItem.id, formDataToSend);
        } else {
          // UPDATE without file change
          const dataToSubmit = {
            ...formData,
            dateObtention: formData.dateObtention ? new Date(formData.dateObtention).toISOString() : null,
            doneBy: { id: CurrentUserId },
            document: { id: editingItem.documentId },
            section: formData.section.id ? { id: parseInt(formData.section.id) } : null,
            status: formData.status.id ? { id: parseInt(formData.status.id) } : null
          };
          
          await updateCommAssetLand(editingItem.id, dataToSubmit);
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
      await deleteCommAssetLand(itemToDelete.id);
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
              <Row className="align-items-center mb-3">
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
                        <th>ID</th>
                        <th>{getText('document.fields.reference', language)}</th>
                        <th>{getText('document.fields.description', language)}</th>
                        <th>{getText('document.fields.dateObtention', language)}</th>
                        <th>{getText('document.fields.emplacement', language)}</th>
                        <th>{getText('document.fields.coordonneesGps', language)}</th>
                        <th>{getText('location.section', language)}</th>
                        <th className="text-center" style={{ width: '200px' }}>Actions</th>
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
                              <Badge bg="secondary">{item.sectionName || '-'}</Badge>
                            </td>
                            <td className="text-center">
                              <div className="d-flex gap-1 justify-content-center action-buttons">
                                {/* View Document Button */}
                                {item.documentId && (
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => handleViewDocument(item.documentId)}
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

              {/* Cards View */}
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
                    data.map((item) => {
                      const uiItem = buildUIItem(item);
                      return (
                        <DocumentCard
                          key={item.id}
                          item={uiItem}
                          language={language}
                          onViewDetails={() => handleShowDetails(item)}
                          onEdit={handleShowModal}
                          onDelete={handleDeleteClick}
                          getDisplayName={(it) => it.document?.originalFileName || it.reference}
                          getDescription={(it) => it.description}
                        />
                      );
                    })
                  )}
                </Row>
              )}

      <PaginationControl totalElements={totalElemtns} totalPages={totalPages}/>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <GenericDocumentDetailsModal
        show={viewModal}
        onHide={handleCloseViewModal}
        title={viewItem?.document?.originalFileName || 'Document Details'}
        document={viewItem}
        language={language}
        onEdit={(doc) => { handleCloseViewModal(); handleShowModal(doc); }}
        showEditButton={true}
      />

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
              {/* {!editingItem && ( */}
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
              {/* )} */}
         
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

export default CommAssetLandComponent;
