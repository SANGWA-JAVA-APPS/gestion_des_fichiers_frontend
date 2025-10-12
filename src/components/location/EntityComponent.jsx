import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { getAllLocationEntities, getAllCountries } from '../../services/GetRequests';
import { createLocationEntity } from '../../services/Inserts';
import { updateLocationEntity, deleteLocationEntity } from '../../services/UpdRequests';

const EntityComponent = () => {
  const [entities, setEntities] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEntity, setEditingEntity] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    countryId: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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
  };

  const handleShowModal = (entity = null) => {
    if (entity) {
      setEditingEntity(entity);
      setFormData({
        name: entity.name || '',
        countryId: entity.countryId || ''  // Simple foreign key field
      });
    } else {
      setEditingEntity(null);
      setFormData({
        name: '',
        countryId: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEntity(null);
    setFormData({
      name: '',
      countryId: ''
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
        countryId: formData.countryId  // Simple foreign key instead of nested object
      };
      
      if (editingEntity) {
        await updateLocationEntity(editingEntity.id, submitData);
      } else {
        await createLocationEntity(submitData);
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
        await deleteLocationEntity(entityId);
        loadData();
      } catch (err) {
        setError('Failed to delete entity: ' + err.message);
      }
    }
  };

  const getEntityTypeBadge = (type) => {
    const typeColors = {
      PROVINCE: 'primary',
      STATE: 'info',
      REGION: 'secondary',
      DISTRICT: 'success',
      CITY: 'warning',
      TOWN: 'dark',
      VILLAGE: 'light'
    };
    return (
      <span className={`badge bg-${typeColors[type] || 'secondary'}`}>
        {type}
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
          <h4>Location Entity Management</h4>
          <p className="text-muted">Manage provinces, states, regions, districts, cities, towns, and villages</p>
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
                      <th>Country</th>
                      <th>Postal Code</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entities.map((entity) => (
                      <tr key={entity.id}>
                        <td><strong>{entity.name}</strong></td>
                        <td>{entity.entityType ? getEntityTypeBadge(entity.entityType) : 'N/A'}</td>
                        <td>
                          {entity.code ? (
                            <code className="text-primary">{entity.code}</code>
                          ) : (
                            <span className="text-muted">N/A</span>
                          )}
                        </td>
                        <td>
                          {entity.countryId ? (
                            <span className="badge bg-info">Country ID: {entity.countryId}</span>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td>{entity.postalCode || 'N/A'}</td>
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