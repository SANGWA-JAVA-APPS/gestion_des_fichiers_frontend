import React, { useState, useEffect } fro  const loadData = async () => {
    try {
      setLoading(true);
      // Load entities and countries
      const entitiesData = await getAllLocationEntities();
      const countriesData = await getAllCountries();
      setEntities(entitiesData);
      setCountries(countriesData);
    } catch (err) {
      setError('Failed to load entities: ' + err.message);
    } finally {
      setLoading(false);
    }
  };ort { Container, Row, Col, Card, Button, Table, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { 
  getAllLocationEntities, 
  createLocationEntity, 
  updateLocationEntity, 
  deleteLocationEntity,
  getAllCountries 
} from '../../services/locationServices';

const EntityComponent = () => {
  const [entities, setEntities] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEntity, setEditingEntity] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    entityType: '',
    code: '',
    postalCode: '',
    countryId: '',
    active: true
  });

  const entityTypes = [
    'PROVINCE',
    'STATE', 
    'REGION',
    'DISTRICT',
    'CITY',
    'TOWN',
    'VILLAGE'
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load entities and countries (for now using the same endpoint)
      const entitiesData = await getAllLocations();
      const countriesData = await getAllLocations();
      setEntities(entitiesData);
      setCountries(countriesData);
    } catch (err) {
      setError('Failed to load entities: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (entity = null) => {
    if (entity) {
      setEditingEntity(entity);
      setFormData({
        name: entity.name || '',
        description: entity.description || '',
        entityType: entity.entityType || '',
        code: entity.code || '',
        postalCode: entity.postalCode || '',
        countryId: entity.countryId || '',
        active: entity.active !== undefined ? entity.active : true
      });
    } else {
      setEditingEntity(null);
      setFormData({
        name: '',
        description: '',
        entityType: '',
        code: '',
        postalCode: '',
        countryId: '',
        active: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEntity(null);
    setFormData({
      name: '',
      description: '',
      entityType: '',
      code: '',
      postalCode: '',
      countryId: '',
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
      if (editingEntity) {
        await updateLocation(editingEntity.id, formData);
      } else {
        await createLocation(formData);
      }
      handleCloseModal();
      loadData();
    } catch (err) {
      setError('Failed to save entity: ' + err.message);
    }
  };

  const handleDelete = async (entityId) => {
    if (window.confirm('Are you sure you want to delete this entity?')) {
      try {
        await deleteLocation(entityId);
        loadData();
      } catch (err) {
        setError('Failed to delete entity: ' + err.message);
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
          <h4>Location Entity Management</h4>
          <p className="text-muted">Manage provinces, states, cities, and other geographical entities</p>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => handleShowModal()}>
            <i className="fas fa-plus me-2"></i>
            Add New Entity
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
              {entities.length === 0 ? (
                <Row>
                  <Col xs={12} className="text-center py-4">
                    <p className="text-muted">No entities found. Add your first entity!</p>
                  </Col>
                </Row>
              ) : (
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Code</th>
                      <th>Postal Code</th>
                      <th>Country</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entities.map((entity) => (
                      <tr key={entity.id}>
                        <td><strong>{entity.name}</strong></td>
                        <td>
                          <span className="badge bg-info">{entity.entityType}</span>
                        </td>
                        <td>
                          <code className="text-primary">{entity.code || 'N/A'}</code>
                        </td>
                        <td>{entity.postalCode || 'N/A'}</td>
                        <td>
                          {countries.find(c => c.id === entity.countryId)?.name || 'N/A'}
                        </td>
                        <td>
                          <span className={`badge ${entity.active ? 'bg-success' : 'bg-secondary'}`}>
                            {entity.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => handleShowModal(entity)}
                          >
                            <i className="fas fa-edit"></i> Edit
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(entity.id)}
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

      {/* Modal for Add/Edit Entity */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingEntity ? 'Edit Location Entity' : 'Add New Location Entity'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Container>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Entity Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Enter entity name"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Entity Type *</Form.Label>
                    <Form.Select
                      name="entityType"
                      value={formData.entityType}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select entity type</option>
                      {entityTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Country *</Form.Label>
                    <Form.Select
                      name="countryId"
                      value={formData.countryId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select country</option>
                      {countries.map((country) => (
                        <option key={country.id} value={country.id}>
                          {country.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Entity Code</Form.Label>
                    <Form.Control
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      maxLength="20"
                      placeholder="Unique entity code"
                      style={{fontFamily: 'monospace'}}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Postal Code</Form.Label>
                    <Form.Control
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      maxLength="20"
                      placeholder="Postal/ZIP code"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <div className="mt-2">
                      <Form.Check
                        type="checkbox"
                        name="active"
                        checked={formData.active}
                        onChange={handleChange}
                        label="Active Entity"
                      />
                    </div>
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
                      placeholder="Enter entity description"
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
              {editingEntity ? 'Update' : 'Create'} Entity
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default EntityComponent;