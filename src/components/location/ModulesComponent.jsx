import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { getAllModules, getAllLocationEntities } from '../../services/GetRequests';
import { createModule } from '../../services/Inserts';
import { updateModule, deleteModule } from '../../services/UpdRequests';

const moduleTypes = [
  'ADMINISTRATIVE', 'COMMERCIAL', 'RESIDENTIAL', 'INDUSTRIAL',
  'AGRICULTURAL', 'RECREATIONAL', 'EDUCATIONAL', 'HEALTHCARE',
  'TRANSPORT', 'OTHER'
];

const ModulesComponent = () => {
  const [modules, setModules] = useState([]);
  const [locationEntities, setLocationEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    locationEntityId: '',
    moduleCode: '',
    moduleType: '',
    coordinates: '',
    areaSize: '',
    areaUnit: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [modulesData, entitiesData] = await Promise.all([
        getAllModules(),
        getAllLocationEntities()
      ]);

      const modulesArray = Array.isArray(modulesData) ? modulesData : (modulesData?.content || modulesData?.data || []);
      const entitiesArray = Array.isArray(entitiesData) ? entitiesData : (entitiesData?.content || entitiesData?.data || []);

      setModules(modulesArray);
      setLocationEntities(entitiesArray);
    } catch (err) {
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
        locationEntityId: module.locationEntityId || '',
        moduleCode: module.moduleCode || '',
        moduleType: module.moduleType || '',
        coordinates: module.coordinates || '',
        areaSize: module.areaSize || '',
        areaUnit: module.areaUnit || ''
      });
    } else {
      setEditingModule(null);
      setFormData({
        name: '',
        locationEntityId: '',
        moduleCode: '',
        moduleType: '',
        coordinates: '',
        areaSize: '',
        areaUnit: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingModule(null);
    setFormData({
      name: '',
      locationEntityId: '',
      moduleCode: '',
      moduleType: '',
      coordinates: '',
      areaSize: '',
      areaUnit: ''
    });
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingModule) {
        await updateModule(editingModule.id, formData);
      } else {
        await createModule(formData);
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
    return <span className={`badge bg-${typeColors[type] || 'secondary'}`}>{type?.replace(/_/g, ' ')}</span>;
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col><h4>Module Management</h4></Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => handleShowModal()}>Add New Module</Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card>
        <Card.Body>
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
              {modules.length === 0 ? (
                <tr><td colSpan="8" className="text-center">No modules found</td></tr>
              ) : (
                modules.map(module => (
                  <tr key={module.id}>
                    <td>{module.name}</td>
                    <td>{module.moduleCode || 'N/A'}</td>
                    <td>{module.moduleType ? getModuleTypeBadge(module.moduleType) : 'N/A'}</td>
                    <td>{module.locationEntityName || 'N/A'}</td>
                    <td>{module.areaSize && module.areaUnit ? `${module.areaSize} ${module.areaUnit}` : 'N/A'}</td>
                    <td>{module.coordinates || 'N/A'}</td>
                    <td><span className={`badge ${module.active ? 'bg-success' : 'bg-secondary'}`}>{module.active ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <Button size="sm" variant="outline-primary" onClick={() => handleShowModal(module)}>Edit</Button>
                      <Button size="sm" variant="outline-danger" onClick={() => handleDelete(module.id)}>Delete</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingModule ? 'Edit Module' : 'Add Module'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Module Name *</Form.Label>
                  <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Entity *</Form.Label>
                  <Form.Select name="locationEntityId" value={formData.locationEntityId} onChange={handleChange} required>
                    <option value="">Select entity</option>
                    {locationEntities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Module Code</Form.Label>
                  <Form.Control type="text" name="moduleCode" value={formData.moduleCode} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Module Type</Form.Label>
                  <Form.Select name="moduleType" value={formData.moduleType} onChange={handleChange}>
                    <option value="">Select type</option>
                    {moduleTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Coordinates</Form.Label>
                  <Form.Control type="text" name="coordinates" value={formData.coordinates} onChange={handleChange} />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Area Size</Form.Label>
                  <Form.Control type="number" name="areaSize" value={formData.areaSize} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Area Unit</Form.Label>
                  <Form.Control type="text" name="areaUnit" value={formData.areaUnit} onChange={handleChange} />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
            <Button variant="primary" type="submit">{editingModule ? 'Update' : 'Create'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default ModulesComponent;
