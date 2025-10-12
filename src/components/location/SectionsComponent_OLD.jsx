import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { getAllLocations } from '../../services/GetRequests';
import { createLocation } from '../../services/Inserts';
import { updateLocation, deleteLocation } from '../../services/UpdRequests';

const SectionsComponent = () => {
  const [sections, setSections] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    moduleId: '',
    order: '',
    permissions: '',
    description: '',
    status: 'ACTIVE'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load sections and modules (for now using the same endpoint)
      const sectionsData = await getAllLocations();
      const modulesData = await getAllLocations();
      setSections(sectionsData);
      setModules(modulesData);
    } catch (err) {
      setError('Failed to load sections: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (section = null) => {
    if (section) {
      setEditingSection(section);
      setFormData({
        name: section.name || '',
        code: section.code || '',
        moduleId: section.moduleId || '',
        order: section.order || '',
        permissions: section.permissions || '',
        description: section.description || '',
        status: section.status || 'ACTIVE'
      });
    } else {
      setEditingSection(null);
      setFormData({
        name: '',
        code: '',
        moduleId: '',
        order: '',
        permissions: '',
        description: '',
        status: 'ACTIVE'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSection(null);
    setFormData({
      name: '',
      code: '',
      moduleId: '',
      order: '',
      permissions: '',
      description: '',
      status: 'ACTIVE'
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSection) {
        await updateLocation(editingSection.id, formData);
      } else {
        await createLocation(formData);
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
        await deleteLocation(sectionId);
        loadData();
      } catch (err) {
        setError('Failed to delete section: ' + err.message);
      }
    }
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
          <p className="text-muted">Manage application sections and access permissions</p>
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
                      <th>Order</th>
                      <th>Section Code</th>
                      <th>Name</th>
                      <th>Module</th>
                      <th>Status</th>
                      <th>Permissions</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sections.sort((a, b) => (a.order || 0) - (b.order || 0)).map((section) => (
                      <tr key={section.id}>
                        <td>
                          <span className="badge bg-info">{section.order || 'N/A'}</span>
                        </td>
                        <td>
                          <code className="text-primary">{section.code}</code>
                        </td>
                        <td>{section.name}</td>
                        <td>
                          {modules.find(m => m.id === section.moduleId)?.name || 'N/A'}
                        </td>
                        <td>
                          <span className={`badge ${section.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'}`}>
                            {section.status}
                          </span>
                        </td>
                        <td>
                          <small className="text-muted">
                            {section.permissions || 'No specific permissions'}
                          </small>
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
                    <Form.Label>Section Name</Form.Label>
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
                    <Form.Label>Section Code</Form.Label>
                    <Form.Control
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      required
                      placeholder="e.g., USER_LIST, FILE_UPLOAD"
                      style={{fontFamily: 'monospace'}}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Module</Form.Label>
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
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Display Order</Form.Label>
                    <Form.Control
                      type="number"
                      name="order"
                      value={formData.order}
                      onChange={handleChange}
                      placeholder="e.g., 1, 2, 3..."
                      min="0"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="DEVELOPMENT">Development</option>
                      <option value="MAINTENANCE">Maintenance</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col xs={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Required Permissions</Form.Label>
                    <Form.Control
                      type="text"
                      name="permissions"
                      value={formData.permissions}
                      onChange={handleChange}
                      placeholder="e.g., READ, WRITE, DELETE (comma-separated)"
                    />
                    <Form.Text className="text-muted">
                      Enter required permissions separated by commas
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col xs={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Enter section description and functionality"
                    />
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