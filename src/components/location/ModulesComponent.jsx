/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Form, Alert, Spinner } from 'react-bootstrap';

import { getAllModules, getAllLocationEntities } from '../../services/GetRequests';
import { createModule } from '../../services/Inserts';
import { updateModule, deleteModule } from '../../services/UpdRequests';
import { useLanguage } from '../../i18n/LanguageContext';

const moduleTypes = [
  'ADMINISTRATIVE', 'COMMERCIAL', 'RESIDENTIAL', 'INDUSTRIAL',
  'AGRICULTURAL', 'RECREATIONAL', 'EDUCATIONAL', 'HEALTHCARE',
  'TRANSPORT', 'OTHER'
];

const ModulesComponent = () => {
  const { t, language } = useLanguage(); // Get translation function and current language
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
      setError(t('modules.errorLoading') + (err.message || t('common.unknownError')));
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
      setError(t('modules.errorSaving') + err.message);
    }
  };

  const handleDelete = async (moduleId) => {
    if (window.confirm(t('modules.deleteConfirm'))) {
      try {
        await deleteModule(moduleId);
        loadData();
      } catch (err) {
        setError(t('modules.errorDeleting') + err.message);
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
    
    const translatedType = t(`modules.types.${type}`) || type?.replace(/_/g, ' ');
    
    return (
      <span className={`badge bg-${typeColors[type] || 'secondary'}`}>
        {translatedType}
      </span>
    );
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" />
        <p className="mt-2">{t('common.loading')}</p>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h4>{t('modules.management')}</h4>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => handleShowModal()}>
            {t('modules.addModule')}
          </Button>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card>
        <Card.Body>
          {modules.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">{t('modules.noModules')}</p>
            </div>
          ) : (
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>{t('modules.name')}</th>
                  <th>{t('modules.code')}</th>
                  <th>{t('modules.type')}</th>
                  <th>{t('modules.locationEntity')}</th>
                  <th>{t('modules.area')}</th>
                  <th>{t('modules.coordinates')}</th>
                  <th>{t('common.status')}</th>
                  <th>{t('modules.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {modules.map(module => (
                  <tr key={module.id}>
                    <td>{module.name}</td>
                    <td>{module.moduleCode || <span className="text-muted">{t('modules.notAvailable')}</span>}</td>
                    <td>{module.moduleType ? getModuleTypeBadge(module.moduleType) : <span className="text-muted">{t('modules.notAvailable')}</span>}</td>
                    <td>{module.locationEntityName || <span className="text-muted">{t('modules.notAvailable')}</span>}</td>
                    <td>
                      {module.areaSize && module.areaUnit 
                        ? `${module.areaSize} ${module.areaUnit}` 
                        : <span className="text-muted">{t('modules.notAvailable')}</span>
                      }
                    </td>
                    <td>{module.coordinates || <span className="text-muted">{t('modules.notAvailable')}</span>}</td>
                    <td>
                      <span className={`badge ${module.active ? 'bg-success' : 'bg-secondary'}`}>
                        {module.active ? t('common.active') : t('common.inactive')}
                      </span>
                    </td>
                    <td>
                      <Button 
                        size="sm" 
                        variant="outline-primary" 
                        onClick={() => handleShowModal(module)}
                        className="me-2"
                      >
                        {t('common.edit')}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline-danger" 
                        onClick={() => handleDelete(module.id)}
                      >
                        {t('common.delete')}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingModule ? t('modules.editModule') : t('modules.addModule')}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('modules.name')} *</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                    placeholder={language === 'fr' ? "Entrez le nom du module" : "Enter module name"}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('modules.locationEntity')} *</Form.Label>
                  <Form.Select 
                    name="locationEntityId" 
                    value={formData.locationEntityId} 
                    onChange={handleChange} 
                    required
                  >
                    <option value="">{t('modules.selectEntity')}</option>
                    {locationEntities.map(e => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('modules.code')}</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="moduleCode" 
                    value={formData.moduleCode} 
                    onChange={handleChange} 
                    placeholder={language === 'fr' ? "Entrez le code du module" : "Enter module code"}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('modules.type')}</Form.Label>
                  <Form.Select 
                    name="moduleType" 
                    value={formData.moduleType} 
                    onChange={handleChange}
                  >
                    <option value="">{t('modules.selectType')}</option>
                    {moduleTypes.map(t => (
                      <option key={t} value={t}>
                     
                        t(`modules.types.${t}`)
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('modules.coordinates')}</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="coordinates" 
                    value={formData.coordinates} 
                    onChange={handleChange} 
                    placeholder={language === 'fr' ? "ex: 40.7128, -74.0060" : "e.g., 40.7128, -74.0060"}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('modules.areaSize')}</Form.Label>
                  <Form.Control 
                    type="number" 
                    name="areaSize" 
                    value={formData.areaSize} 
                    onChange={handleChange} 
                    placeholder={language === 'fr' ? "Taille de la zone" : "Area size"}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('modules.areaUnit')}</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="areaUnit" 
                    value={formData.areaUnit} 
                    onChange={handleChange} 
                    placeholder={language === 'fr' ? "ex: m², ha, acre" : "e.g., m², ha, acre"}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" type="submit">
              {editingModule ? t('modules.update') : t('modules.create')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default ModulesComponent;