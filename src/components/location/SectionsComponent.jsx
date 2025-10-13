import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Form, Alert, Spinner } from 'react-bootstrap';
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
    moduleId: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      // Load sections and modules
      const [sectionsData, modulesData] = await Promise.all([
        getAllSections(),
        getAllModules()
      ]);
      
      console.log('Sections data received:', sectionsData);
      console.log('Modules data received:', modulesData);
      
      // Ensure data is an array
      const sectionsArray = Array.isArray(sectionsData) ? sectionsData : 
                           (sectionsData?.content || sectionsData?.data || []);
      const modulesArray = Array.isArray(modulesData) ? modulesData : 
                          (modulesData?.content || modulesData?.data || []);
      
      setSections(sectionsArray);
      setModules(modulesArray);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load sections: ' + (err.message || 'Unknown error'));
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
        moduleId: section.moduleId || ''  // Simple foreign key field
      });
    } else {
      setEditingSection(null);
      setFormData({
        name: '',
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
      moduleId: ''
    });
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData
      };
      
      if (editingSection) {
        await updateSection(editingSection.id, submitData);
      } else {
        await createSection(submitData);
      }
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
    return (
      <span className={`badge bg-${levelColors[level] || 'secondary'}`}>
        {level}
      </span>
    );
  };

  if (loading) {
    return (
      <Container>
        <Row>
          <Col xs={12} className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h4>Section Management</h4>
          <p className="text-muted">Manage sections within modules with access control and capacity information</p>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => handleShowModal()}>
            <i className="fas fa-plus me-2"></i>
            Add New Section
          </Button>
        </Col>
      </Row>

      {error && (
        <Row className="mb-3">
          <Col xs={12}>
            <Alert variant="danger" dismissible onClose={() => setError('')}>
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      <Row>
        <Col xs={12}>
          <Card>
            <Card.Body>
              {sections.length === 0 ? (
                <Row>
                  <Col xs={12} className="text-center py-4">
                    <p className="text-muted">No sections found. Add your first section!</p>
                  </Col>
                </Row>
              ) : (
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Code</th>
                      <th>Type</th>
                      <th>Floor/Room</th>
                      <th>Module</th>
                      <th>Access Level</th>
                      <th>Capacity</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sections.map((section) => (
                      <tr key={section.id}>
                        <td><strong>{section.name}</strong></td>
                        <td>
                          <code className="text-primary">{section.sectionCode || 'N/A'}</code>
                        </td>
                        <td>
                          <span className="badge bg-secondary">{section.sectionType}</span>
                        </td>
                        <td>
                          {section.floorNumber && (
                            <span>Floor {section.floorNumber}</span>
                          )}
                          {section.floorNumber && section.roomNumber && <br />}
                          {section.roomNumber && (
                            <small className="text-muted">Room {section.roomNumber}</small>
                          )}
                          {!section.floorNumber && !section.roomNumber && 'N/A'}
                        </td>
                        <td>
                          {section.moduleId ? (
                            <span className="badge bg-info">Module ID: {section.moduleId}</span>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td>
                          {section.accessLevel ? getAccessLevelBadge(section.accessLevel) : 'N/A'}
                        </td>
                        <td>{section.capacity || 'N/A'}</td>
                        <td>
                          <span className={`badge ${section.active ? 'bg-success' : 'bg-secondary'}`}>
                            {section.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => handleShowModal(section)}
                          >
                            <i className="fas fa-edit"></i> Edit
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(section.id)}
                          >
                            <i className="fas fa-trash"></i> Delete
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

      {/* Modal for Add/Edit Section */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingSection ? 'Edit Section' : 'Add New Section'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Container>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Section Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Enter section name"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Module *</Form.Label>
                    <Form.Select
                      name="moduleId"
                      value={formData.moduleId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select module</option>
                      {modules.map((module) => (
                        <option key={module.id} value={module.id}>
                          {module.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Container>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingSection ? 'Update' : 'Create'} Section
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default SectionsComponent;