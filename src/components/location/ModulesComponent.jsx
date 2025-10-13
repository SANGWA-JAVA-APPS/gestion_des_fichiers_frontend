import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { getAllModules, getAllLocationEntities } from '../../services/GetRequests';
import { createModule } from '../../services/Inserts';
import { updateModule, deleteModule } from '../../services/UpdRequests';

const ModulesComponent = () => {
  const [modules, setModules] = useState([]);
  const [locationEntities, setLocationEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    entityId: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      // Load modules and location entities
      const [modulesData, entitiesData] = await Promise.all([
        getAllModules(),
        getAllLocationEntities()
      ]);
      
      console.log('Modules data received:', modulesData);
      console.log('Entities data received:', entitiesData);
      
      // Ensure data is an array
      const modulesArray = Array.isArray(modulesData) ? modulesData : 
                          (modulesData?.content || modulesData?.data || []);
      const entitiesArray = Array.isArray(entitiesData) ? entitiesData : 
                           (entitiesData?.content || entitiesData?.data || []);
      
      setModules(modulesArray);
      setLocationEntities(entitiesArray);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load modules: ' + (err.message || 'Unknown error'));
      setModules([]);
      setLocationEntities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (module = null) => {
    if (module) {
      setEditingModule(module);
      setFormData({
        name: module.name || '',
        entityId: module.entityId || ''  // Simple foreign key field
      });
    } else {
      setEditingModule(null);
      setFormData({
        name: '',
        entityId: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingModule(null);
    setFormData({
      name: '',
      entityId: ''
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
      
      if (editingModule) {
        await updateModule(editingModule.id, submitData);
      } else {
        await createModule(submitData);
      }
      handleCloseModal();
      loadData();
    } catch (err) {
      setError('Failed to save module: ' + err.message);
    }
  };

  const handleDelete = async (moduleId) => {
    if (window.confirm('Are you sure you want to delete this module?')) {
      try {
        await deleteModule(moduleId);
        loadData();
      } catch (err) {
        setError('Failed to delete module: ' + err.message);
      }
    }
  };

  const getModuleTypeBadge = (type) => {
    const typeColors = {
      ADMINISTRATIVE: 'primary',
      COMMERCIAL: 'success',
      RESIDENTIAL: 'info',
      INDUSTRIAL: 'warning',
      AGRICULTURAL: 'secondary',
      RECREATIONAL: 'light',
      EDUCATIONAL: 'dark',
      HEALTHCARE: 'danger',
      TRANSPORT: 'secondary',
      OTHER: 'secondary'
    };
    return (
      <span className={`badge bg-${typeColors[type] || 'secondary'}`}>
        {type?.replace(/_/g, ' ')}
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
          <h4>Module Management</h4>
          <p className="text-muted">Manage modules within location entities with area and type information</p>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => handleShowModal()}>
            <i className="fas fa-plus me-2"></i>
            Add New Module
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
              {modules.length === 0 ? (
                <Row>
                  <Col xs={12} className="text-center py-4">
                    <p className="text-muted">No modules found. Add your first module!</p>
                  </Col>
                </Row>
              ) : (
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Code</th>
                      <th>Type</th>
                      <th>Location Entity</th>
                      <th>Area</th>
                      <th>Coordinates</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modules.map((module) => (
                      <tr key={module.id}>
                        <td><strong>{module.name}</strong></td>
                        <td>
                          {module.moduleCode ? (
                            <code className="text-primary">{module.moduleCode}</code>
                          ) : (
                            <span className="text-muted">N/A</span>
                          )}
                        </td>
                        <td>
                          {module.moduleType ? getModuleTypeBadge(module.moduleType) : 'N/A'}
                        </td>
                        <td>
                          {module.entityId ? (
                            <span className="badge bg-info">Entity ID: {module.entityId}</span>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td>
                          {module.areaSize && module.areaUnit ? (
                            <span className="badge bg-light text-dark">
                              {module.areaSize} {module.areaUnit}
                            </span>
                          ) : (
                            <span className="text-muted">N/A</span>
                          )}
                        </td>
                        <td>
                          {module.coordinates ? (
                            <small className="text-muted" title={module.coordinates}>
                              {module.coordinates.length > 20 ? 
                                `${module.coordinates.substring(0, 20)}...` : 
                                module.coordinates
                              }
                            </small>
                          ) : (
                            <span className="text-muted">N/A</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${module.active ? 'bg-success' : 'bg-secondary'}`}>
                            {module.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => handleShowModal(module)}
                          >
                            <i className="fas fa-edit"></i> Edit
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(module.id)}
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

      {/* Modal for Add/Edit Module */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingModule ? 'Edit Module' : 'Add New Module'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Container>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Module Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Enter module name"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Entity *</Form.Label>
                    <Form.Select
                      name="entityId"
                      value={formData.entityId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select entity</option>
                      {locationEntities.map((entity) => (
                        <option key={entity.id} value={entity.id}>
                          {entity.name}
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
              {editingModule ? 'Update' : 'Create'} Module
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default ModulesComponent;