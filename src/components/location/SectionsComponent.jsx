import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Form, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { getAllSections, getAllModules } from '../../services/GetRequests';
import { createSection } from '../../services/Inserts';
import { updateSection, deleteSection } from '../../services/UpdRequests';

const SectionsComponent = () => {
  const [sections, setSections] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sectionCode: '',
    sectionType: '',
    floorNumber: '',
    roomNumber: '',
    capacity: '',
    coordinates: '',
    accessLevel: '',
    moduleId: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [sectionsData, modulesData] = await Promise.all([getAllSections(), getAllModules()]);
      setSections(Array.isArray(sectionsData) ? sectionsData : (sectionsData?.content || sectionsData?.data || []));
      setModules(Array.isArray(modulesData) ? modulesData : (modulesData?.content || modulesData?.data || []));
    } catch (err) {
      setError('Failed to load data: ' + (err.message || 'Unknown error'));
      setSections([]);
      setModules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (section = null) => {
    if (section) {
      setEditingSection(section);
      setFormData({
        name: section.name || '',
        description: section.description || '',
        sectionCode: section.sectionCode || '',
        sectionType: section.sectionType || '',
        floorNumber: section.floorNumber || '',
        roomNumber: section.roomNumber || '',
        capacity: section.capacity || '',
        coordinates: section.coordinates || '',
        accessLevel: section.accessLevel || '',
        moduleId: section.moduleId || ''
      });
    } else {
      setEditingSection(null);
      setFormData({
        name: '',
        description: '',
        sectionCode: '',
        sectionType: '',
        floorNumber: '',
        roomNumber: '',
        capacity: '',
        coordinates: '',
        accessLevel: '',
        moduleId: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSection(null);
    setFormData({
      name: '',
      description: '',
      sectionCode: '',
      sectionType: '',
      floorNumber: '',
      roomNumber: '',
      capacity: '',
      coordinates: '',
      accessLevel: '',
      moduleId: ''
    });
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      editingSection ? await updateSection(editingSection.id, formData) : await createSection(formData);
      handleCloseModal();
      loadData();
    } catch (err) {
      setError('Failed to save section: ' + err.message);
    }
  };

  const handleDelete = async (sectionId) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      try {
        await deleteSection(sectionId);
        loadData();
      } catch (err) {
        setError('Failed to delete section: ' + err.message);
      }
    }
  };

  const getAccessLevelBadge = (level) => {
    const levelColors = {
      PUBLIC: 'success',
      RESTRICTED: 'warning',
      PRIVATE: 'info',
      CONFIDENTIAL: 'danger',
      TOP_SECRET: 'dark'
    };
    return <span className={`badge bg-${levelColors[level] || 'secondary'}`}>{level}</span>;
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status" />
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row className="mb-4 align-items-center">
        <Col>
          <h4>Section Management</h4>
          <p className="text-muted">Manage sections with module, access, and capacity information</p>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => handleShowModal()}>
            <i className="fas fa-plus me-2"></i>Add Section
          </Button>
        </Col>
      </Row>

      {error && (
        <Row className="mb-3">
          <Col>
            <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>
          </Col>
        </Row>
      )}

      <Row>
        <Col>
          <Card>
            <Card.Body>
              {sections.length === 0 ? (
                <p className="text-center text-muted py-4">No sections found. Add your first section!</p>
              ) : (
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Code</th>
                      <th>Type</th>
                      <th>Floor/Room</th>
                      <th>Module</th>
                      <th>Access</th>
                      <th>Capacity</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sections.map((section) => (
                      <tr key={section.id}>
                        <td>{section.name}</td>
                        <td>{section.description || 'N/A'}</td>
                        <td>{section.sectionCode || 'N/A'}</td>
                        <td><span className="badge bg-secondary">{section.sectionType}</span></td>
                        <td>
                          {section.floorNumber && `Floor ${section.floorNumber}`}
                          {section.floorNumber && section.roomNumber && <br />}
                          {section.roomNumber && <small className="text-muted">Room {section.roomNumber}</small>}
                          {!section.floorNumber && !section.roomNumber && 'N/A'}
                        </td>
                        <td>{section.moduleName || 'N/A'}</td>
                        <td>{section.accessLevel ? getAccessLevelBadge(section.accessLevel) : 'N/A'}</td>
                        <td>{section.capacity || 'N/A'}</td>
                        <td><span className={`badge ${section.active ? 'bg-success' : 'bg-secondary'}`}>{section.active ? 'Active' : 'Inactive'}</span></td>
                        <td>
                          <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleShowModal(section)}>
                            <i className="fas fa-edit"></i>
                          </Button>
                          <Button variant="outline-danger" size="sm" onClick={() => handleDelete(section.id)}>
                            <i className="fas fa-trash"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingSection ? 'Edit Section' : 'Add Section'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row className="mb-3">
              <Col md={6}>
                <Card className="p-3 mb-3">
                  <h6><i className="fas fa-info-circle me-2"></i>Basic Info</h6>
                  <Form.Group className="mb-2">
                    <Form.Label>Name *</Form.Label>
                    <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>Description</Form.Label>
                    <Form.Control type="text" name="description" value={formData.description} onChange={handleChange} />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>Code</Form.Label>
                    <Form.Control type="text" name="sectionCode" value={formData.sectionCode} onChange={handleChange} />
                  </Form.Group>
                </Card>

                <Card className="p-3">
                  <h6><i className="fas fa-map-marker-alt me-2"></i>Location & Capacity</h6>
                  <Form.Group className="mb-2">
                    <Form.Label>Floor Number</Form.Label>
                    <Form.Control type="number" name="floorNumber" value={formData.floorNumber} onChange={handleChange} />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>Room Number</Form.Label>
                    <Form.Control type="text" name="roomNumber" value={formData.roomNumber} onChange={handleChange} />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>Capacity</Form.Label>
                    <Form.Control type="number" name="capacity" value={formData.capacity} onChange={handleChange} />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>Coordinates</Form.Label>
                    <Form.Control type="text" name="coordinates" value={formData.coordinates} onChange={handleChange} />
                  </Form.Group>
                </Card>
              </Col>

              <Col md={6}>
                <Card className="p-3 mb-3">
                  <h6><i className="fas fa-cogs me-2"></i>Module & Access</h6>
                  <Form.Group className="mb-2">
                    <Form.Label>Module *</Form.Label>
                    <Form.Select name="moduleId" value={formData.moduleId} onChange={handleChange} required>
                      <option value="">Select module</option>
                      {modules.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>Section Type</Form.Label>
                    <Form.Select name="sectionType" value={formData.sectionType} onChange={handleChange}>
                      <option value="">Select type</option>
                      {['OFFICE','CONFERENCE_ROOM','STORAGE','LOBBY','CORRIDOR','RESTROOM','KITCHEN','SERVER_ROOM','PARKING','SECURITY','RECEPTION','ARCHIVE','OTHER'].map(t => <option key={t} value={t}>{t}</option>)}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>Access Level</Form.Label>
                    <Form.Select name="accessLevel" value={formData.accessLevel} onChange={handleChange}>
                      <option value="">Select access level</option>
                      {['PUBLIC','RESTRICTED','PRIVATE','CONFIDENTIAL','TOP_SECRET'].map(a => <option key={a} value={a}>{a}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Card>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
            <Button variant="primary" type="submit">{editingSection ? 'Update' : 'Create'} Section</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default SectionsComponent;
