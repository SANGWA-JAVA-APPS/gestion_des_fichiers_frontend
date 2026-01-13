import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Button, Table, Modal, Form, Alert, Spinner 
} from 'react-bootstrap';
import { 
  Plus, Edit, Trash2, Info, MapPin, Settings, 
  Building, Users, Lock, Type, Hash, 
  DoorOpen, Map, Layers, 
} from 'lucide-react';

import { getAllSections, getAllModules } from '../../services/GetRequests';
import { createSection } from '../../services/Inserts';
import { updateSection, deleteSection } from '../../services/UpdRequests';
import { useLanguage } from '../../i18n/LanguageContext';
import { GiFloorPolisher } from 'react-icons/gi';

const SectionsComponent = () => {
  const { t, language } = useLanguage(); // Get translation function and current language
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

  // Section types with translations
  const sectionTypes = [
    'OFFICE', 'CONFERENCE_ROOM', 'STORAGE', 'LOBBY', 'CORRIDOR', 
    'RESTROOM', 'KITCHEN', 'SERVER_ROOM', 'PARKING', 'SECURITY', 
    'RECEPTION', 'ARCHIVE', 'OTHER'
  ];

  // Access levels with translations
  const accessLevels = [
    'PUBLIC', 'RESTRICTED', 'PRIVATE', 'CONFIDENTIAL', 'TOP_SECRET'
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [sectionsData, modulesData] = await Promise.all([
        getAllSections(), 
        getAllModules()
      ]);
      
      // Handle different response structures
      const sectionsArray = Array.isArray(sectionsData) ? sectionsData : 
        (sectionsData?.content || sectionsData?.data || []);
      const modulesArray = Array.isArray(modulesData) ? modulesData : 
        (modulesData?.content || modulesData?.data || []);
      
      setSections(sectionsArray);
      setModules(modulesArray);
    } catch (err) {
      setError(t('sections.errorLoading') + (err.message || t('common.unknownError')));
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
      editingSection 
        ? await updateSection(editingSection.id, formData) 
        : await createSection(formData);
      handleCloseModal();
      loadData();
    } catch (err) {
      setError(t('sections.errorSaving') + err.message);
    }
  };

  const handleDelete = async (sectionId) => {
    if (window.confirm(t('sections.deleteConfirm'))) {
      try {
        await deleteSection(sectionId);
        loadData();
      } catch (err) {
        setError(t('sections.errorDeleting') + err.message);
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
    
    const translatedLevel = t(`sections.accessLevels.${level}`) || level;
    
    return (
      <span className={`badge bg-${levelColors[level] || 'secondary'}`}>
        {translatedLevel}
      </span>
    );
  };

  const getSectionTypeBadge = (type) => {
    const translatedType = t(`sections.types.${type}`) || type;
    return (
      <span className="badge bg-secondary">
        {translatedType}
      </span>
    );
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status" />
        <p className="mt-2">{t('common.loading')}</p>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row className="mb-4 align-items-center">
        <Col>
          <h4>{t('sections.management')}</h4>
          <p className="text-muted">
            {t('sections.subtitle')}
          </p>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => handleShowModal()}>
            <Plus size={18} className="me-2" />
            {t('sections.addSection')}
          </Button>
        </Col>
      </Row>

      {error && (
        <Row className="mb-3">
          <Col>
            <Alert variant="danger" dismissible onClose={() => setError('')}>
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      <Row>
        <Col>
          <Card>
            <Card.Body>
              {sections.length === 0 ? (
                <p className="text-center text-muted py-4">
                  {t('sections.noSections')}
                </p>
              ) : (
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>{t('sections.name')}</th>
                      <th>{t('sections.description')}</th>
                      <th>{t('sections.code')}</th>
                      <th>{t('sections.type')}</th>
                      <th>{t('sections.floorRoom')}</th>
                      <th>{t('sections.module')}</th>
                      <th>{t('sections.access')}</th>
                      <th>{t('sections.capacity')}</th>
                      <th>{t('common.status')}</th>
                      <th>{t('sections.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sections.map((section) => (
                      <tr key={section.id}>
                        <td>{section.name}</td>
                        <td>{section.description || <span className="text-muted">{t('sections.notAvailable')}</span>}</td>
                        <td>{section.sectionCode || <span className="text-muted">{t('sections.notAvailable')}</span>}</td>
                        <td>
                          {section.sectionType 
                            ? getSectionTypeBadge(section.sectionType) 
                            : <span className="text-muted">{t('sections.notAvailable')}</span>
                          }
                        </td>
                        <td>
                          {section.floorNumber && (
                            <>
                              {t('sections.floor')} {section.floorNumber}
                            </>
                          )}
                          {section.floorNumber && section.roomNumber && <br />}
                          {section.roomNumber && (
                            <small className="text-muted">
                              {t('sections.room')} {section.roomNumber}
                            </small>
                          )}
                          {!section.floorNumber && !section.roomNumber && 
                            <span className="text-muted">{t('sections.notAvailable')}</span>
                          }
                        </td>
                        <td>{section.moduleName || <span className="text-muted">{t('sections.notAvailable')}</span>}</td>
                        <td>
                          {section.accessLevel 
                            ? getAccessLevelBadge(section.accessLevel) 
                            : <span className="text-muted">{t('sections.notAvailable')}</span>
                          }
                        </td>
                        <td>{section.capacity || <span className="text-muted">{t('sections.notAvailable')}</span>}</td>
                        <td>
                          <span className={`badge ${section.active ? 'bg-success' : 'bg-secondary'}`}>
                            {section.active ? t('common.active') : t('common.inactive')}
                          </span>
                        </td>
                        <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-2" 
                            onClick={() => handleShowModal(section)}
                            title={t('common.edit')}
                          >
                            <Edit size={14} />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm" 
                            onClick={() => handleDelete(section.id)}
                            title={t('common.delete')}
                          >
                            <Trash2 size={14} />
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
          <Modal.Title>
            {editingSection ? t('sections.editSection') : t('sections.addSection')}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row className="mb-3">
              <Col md={6}>
                <Card className="p-3 mb-3">
                  <h6>
                    <Info size={16} className="me-2" />
                    {t('sections.basicInfo')}
                  </h6>
                  <Form.Group className="mb-2">
                    <Form.Label>
                      <Type size={14} className="me-1" />
                      {t('sections.name')} *
                    </Form.Label>
                    <Form.Control 
                      type="text" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      required 
                      placeholder={language === 'fr' ? "Entrez le nom de la section" : "Enter section name"}
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>
                      <Info size={14} className="me-1" />
                      {t('sections.description')}
                    </Form.Label>
                    <Form.Control 
                      type="text" 
                      name="description" 
                      value={formData.description} 
                      onChange={handleChange} 
                      placeholder={language === 'fr' ? "Entrez la description" : "Enter description"}
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>
                      <Hash size={14} className="me-1" />
                      {t('sections.code')}
                    </Form.Label>
                    <Form.Control 
                      type="text" 
                      name="sectionCode" 
                      value={formData.sectionCode} 
                      onChange={handleChange} 
                      placeholder={language === 'fr' ? "Entrez le code" : "Enter section code"}
                    />
                  </Form.Group>
                </Card>

                <Card className="p-3">
                  <h6>
                    <MapPin size={16} className="me-2" />
                    {t('sections.locationCapacity')}
                  </h6>
                  <Form.Group className="mb-2">
                    <Form.Label>
                      <GiFloorPolisher size={14} className="me-1" />
                      {t('sections.floorNumber')}
                    </Form.Label>
                    <Form.Control 
                      type="number" 
                      name="floorNumber" 
                      value={formData.floorNumber} 
                      onChange={handleChange} 
                      placeholder={language === 'fr' ? "Numéro d'étage" : "Floor number"}
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>
                      <DoorOpen size={14} className="me-1" />
                      {t('sections.roomNumber')}
                    </Form.Label>
                    <Form.Control 
                      type="text" 
                      name="roomNumber" 
                      value={formData.roomNumber} 
                      onChange={handleChange} 
                      placeholder={language === 'fr' ? "Numéro de salle" : "Room number"}
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>
                      <Users size={14} className="me-1" />
                      {t('sections.capacity')}
                    </Form.Label>
                    <Form.Control 
                      type="number" 
                      name="capacity" 
                      value={formData.capacity} 
                      onChange={handleChange} 
                      placeholder={language === 'fr' ? "Capacité (personnes)" : "Capacity (people)"}
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>
                      <Map size={14} className="me-1" />
                      {t('sections.coordinates')}
                    </Form.Label>
                    <Form.Control 
                      type="text" 
                      name="coordinates" 
                      value={formData.coordinates} 
                      onChange={handleChange} 
                      placeholder={language === 'fr' ? "ex: 40.7128, -74.0060" : "e.g., 40.7128, -74.0060"}
                    />
                  </Form.Group>
                </Card>
              </Col>

              <Col md={6}>
                <Card className="p-3 mb-3">
                  <h6>
                    <Settings size={16} className="me-2" />
                    {t('sections.moduleAccess')}
                  </h6>
                  <Form.Group className="mb-2">
                    <Form.Label>
                      <Building size={14} className="me-1" />
                      {t('sections.module')} *
                    </Form.Label>
                    <Form.Select 
                      name="moduleId" 
                      value={formData.moduleId} 
                      onChange={handleChange} 
                      required
                    >
                      <option value="">{t('sections.selectModule')}</option>
                      {modules.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>
                      <Layers size={14} className="me-1" />
                      {t('sections.type')}
                    </Form.Label>
                    <Form.Select 
                      name="sectionType" 
                      value={formData.sectionType} 
                      onChange={handleChange}
                    >
                      <option value="">{t('sections.selectType')}</option>
                      {sectionTypes.map(tr => (
                        <option key={tr} value={tr}>
                          {language === 'fr' ? t(`sections.types.${tr}`) : tr.replace(/_/g, ' ')}
                          
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>
                      <Lock size={14} className="me-1" />
                      {t('sections.accessLevel')}
                    </Form.Label>
                    <Form.Select 
                      name="accessLevel" 
                      value={formData.accessLevel} 
                      onChange={handleChange}
                    >
                      <option value="">{t('sections.selectAccessLevel')}</option>
                      {accessLevels.map(a => (
                        <option key={a} value={a}>
                          {t(`sections.accessLevels.${a}`)}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Card>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" type="submit">
              {editingSection ? t('sections.update') : t('sections.create')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default SectionsComponent;