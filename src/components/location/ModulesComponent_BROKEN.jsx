import React, { useState, useEffect } from 'reac  const loadData = async () => {
    try {
      setLoading(true);
      // Load modules and location entities
      const modulesData = await getAllModules();
      const entitiesData = await getAllLocationEntities();
      setModules(modulesData);
      setLocationEntities(entitiesData);
    } catch (err) {
      setError('Failed to load modules: ' + err.message);
    } finally {
      setLoading(false);
    }
  };ontainer, Row, Col, Card, Button, Table, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { 
  getAllModules, 
  createModule, 
  updateModule, 
  deleteModule,
  getAllLocationEntities 
} from '../../services/locationServices';

const ModulesComponent = () => {
  const [modules, setModules] = useState([]);
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    moduleCode: '',
    moduleType: '',
    coordinates: '',
    areaSize: '',
    areaUnit: '',
    locationEntityId: '',
    active: true
  });

  const moduleTypes = [
    'ADMINISTRATIVE',
    'COMMERCIAL',
    'RESIDENTIAL', 
    'INDUSTRIAL',
    'AGRICULTURAL',
    'RECREATIONAL',
    'EDUCATIONAL',
    'HEALTHCARE',
    'TRANSPORT',
    'OTHER'
  ];

  const areaUnits = ['m²', 'km²', 'hectares', 'acres', 'sqft'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load modules and entities (for now using the same endpoint)
      const modulesData = await getAllLocations();
      const entitiesData = await getAllLocations();
      setModules(modulesData);
      setEntities(entitiesData);
    } catch (err) {
      setError('Failed to load modules: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (module = null) => {
    if (module) {
      setEditingModule(module);
      setFormData({
        name: module.name || '',
        description: module.description || '',
        moduleCode: module.moduleCode || '',
        moduleType: module.moduleType || '',
        coordinates: module.coordinates || '',
        areaSize: module.areaSize || '',
        areaUnit: module.areaUnit || '',
        locationEntityId: module.locationEntityId || '',
        active: module.active !== undefined ? module.active : true
      });
    } else {
      setEditingModule(null);
      setFormData({
        name: '',
        description: '',
        moduleCode: '',
        moduleType: '',
        coordinates: '',
        areaSize: '',
        areaUnit: '',
        locationEntityId: '',
        active: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingModule(null);
    setFormData({
      name: '',
      description: '',
      moduleCode: '',
      moduleType: '',
      coordinates: '',
      areaSize: '',
      areaUnit: '',
      locationEntityId: '',
      active: true
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
        ...formData,
        areaSize: formData.areaSize ? parseFloat(formData.areaSize) : null
      };
      
      if (editingModule) {
        await updateLocation(editingModule.id, submitData);
      } else {
        await createLocation(submitData);
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
        await deleteLocation(moduleId);
        loadData();
      } catch (err) {
        setError('Failed to delete module: ' + err.message);
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
          <h4>Module Management</h4>
          <p className="text-muted">Manage modules within location entities with area and coordinate information</p>
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
                      <th>Entity</th>
                      <th>Area</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modules.map((module) => (
                      <tr key={module.id}>
                        <td><strong>{module.name}</strong></td>
                        <td>
                          <code className="text-primary">{module.moduleCode || 'N/A'}</code>
                        </td>
                        <td>
                          <span className="badge bg-secondary">{module.moduleType}</span>
                        </td>
                        <td>
                          {entities.find(e => e.id === module.locationEntityId)?.name || 'N/A'}
                        </td>
                        <td>
                          {module.areaSize ? `${module.areaSize} ${module.areaUnit || ''}` : 'N/A'}
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
                    <Form.Label>Module Code</Form.Label>
                    <Form.Control
                      type="text"
                      name="moduleCode"
                      value={formData.moduleCode}
                      onChange={handleChange}
                      maxLength="20"
                      placeholder="Unique module code"
                      style={{fontFamily: 'monospace'}}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Module Type *</Form.Label>
                    <Form.Select
                      name="moduleType"
                      value={formData.moduleType}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select module type</option>
                      {moduleTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Location Entity *</Form.Label>
                    <Form.Select
                      name="locationEntityId"
                      value={formData.locationEntityId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select location entity</option>
                      {entities.map((entity) => (
                        <option key={entity.id} value={entity.id}>
                          {entity.name} ({entity.entityType})
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Area Size</Form.Label>
                    <Form.Control
                      type="number"
                      name="areaSize"
                      value={formData.areaSize}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      placeholder="Area size"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Area Unit</Form.Label>
                    <Form.Select
                      name="areaUnit"
                      value={formData.areaUnit}
                      onChange={handleChange}
                    >
                      <option value="">Select unit</option>
                      {areaUnits.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <div className="mt-2">
                      <Form.Check
                        type="checkbox"
                        name="active"
                        checked={formData.active}
                        onChange={handleChange}
                        label="Active Module"
                      />
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col xs={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Coordinates</Form.Label>
                    <Form.Control
                      type="text"
                      name="coordinates"
                      value={formData.coordinates}
                      onChange={handleChange}
                      placeholder="e.g., -1.9441,30.0619 or GPS coordinates"
                    />
                    <Form.Text className="text-muted">
                      GPS coordinates or location reference
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
                      placeholder="Enter module description"
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
              {editingModule ? 'Update' : 'Create'} Module
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default ModulesComponent;