/* eslint-disable react-hooks/exhaustive-deps */
import  { useEffect, useState } from 'react';
import {
  Table,
  Card,
  Button,
  Spinner,
  Alert,
  Row,
  Col,
  Form,
  Modal,
  Nav,
  Toast,
  ToastContainer
} from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { FaEdit, FaTrash, FaEye, FaFileAlt } from 'react-icons/fa';

import {
  getAllCommonDocDetails,
  getAllSections
} from '../../services/GetRequests';

import {
  deleteCommonDocDetails,
  updateCommonDocDetails
} from '../../services/UpdRequests';

import { createCommonDocDetails } from '../../services/Inserts';
import { useLanguage } from '../../i18n/LanguageContext';
import { useParams } from 'react-router-dom';
import SimpleSearchComponent from '../SimpleSearchComponent';
import PaginationControl from '../PaginationControl';
/* -------------------- DATE HELPERS -------------------- */
const toDateOnly = (value) => (value ? value.split('T')[0] : '');
const toLocalDateTime = (value) => (value ? `${value}T00:00:00` : null);

/* -------------------- COMPONENT -------------------- */
const CommonDocDetailsComponent = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const { sectionCode } = useParams(); 
  
    console.log('Current sectionCode from URL:', sectionCode);

  const page = Number(searchParams.get('page') || 0);
  const size = Number(searchParams.get('size') || 5);
  const search = searchParams.get('search') || '';

  const [docs, setDocs] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

  const [activeView, setActiveView] = useState('table');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  const [editingDoc, setEditingDoc] = useState(null);

  const [formData, setFormData] = useState({
    reference: '',
    description: '',
    status: 'DRAFT',
    version: '',
    dateTime: '',
    expirationDate: '',
    sectionId: ''
  });

  const [formErrors, setFormErrors] = useState({});

  /* -------------------- FETCH -------------------- */
  const fetchDocs = async () => {
    setLoading(true);
    try {
      
 
      const res = await getAllCommonDocDetails({    page: page,
      size: size,
      search: search,
      sectionCode});
      setDocs(res.content || []);
    } catch (err) {
      setError(t('commonDocDetails.fetchError'));
      showToast(t('commonDocDetails.fetchError'), 'danger');
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async () => {
    try {
      const data = await getAllSections();
      setSections(data || []);
            // Preselect section in form if sectionCode exists in URL
      if (sectionCode) {
        const selectedSection = data.find(s => s.code === sectionCode);
        if (selectedSection) {
          setFormData(prev => ({ ...prev, sectionId: String(selectedSection.id) }));
        }
      }
    } catch (err) {
      showToast('Failed to load sections', 'danger');
    }
  };

  useEffect(() => {
    fetchSections();
    fetchDocs();
  }, [searchParams]);
  
  // Fetch docs after sections are loaded or search params change
  useEffect(() => {
    if (sections.length) fetchDocs();
  }, [sections, searchParams, sectionCode])
  
  

  /* -------------------- TOAST -------------------- */
  const showToast = (message, variant = 'success') => {
    setToast({ show: true, message, variant });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };


  /* -------------------- ACTIONS -------------------- */
  const handleEdit = (doc) => {
    setEditingDoc(doc);
    setFormData({
      reference: doc.reference ?? '',
      description: doc.description ?? '',
      status: doc.status ?? 'DRAFT',
      version: doc.version ?? '',
      dateTime: toDateOnly(doc.dateTime) || '',
      expirationDate: toDateOnly(doc.expirationDate) || '',
      sectionId: doc.sectionId ? String(doc.sectionId) : ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleDeleteClick = (doc) => {
    setDocToDelete(doc);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!docToDelete) return;
    
    try {
      await deleteCommonDocDetails(docToDelete.id);
      showToast(t('commonDocDetails.deleteSuccess'), 'success');
      fetchDocs();
    } catch (err) {
      showToast(t('commonDocDetails.deleteError'), 'danger');
    } finally {
      setShowDeleteModal(false);
      setDocToDelete(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    


    const payload = {
      reference: formData.reference.trim(),
      description: formData.description.trim(),
      status: formData.status,
  
      sectionId: Number(formData.sectionId),
      dateTime: toLocalDateTime(formData.dateTime) || null,
      expirationDate: toLocalDateTime(formData.expirationDate) || null
    };

    try {
      if (editingDoc) {
        await updateCommonDocDetails(editingDoc.id, payload);
        showToast(t('commonDocDetails.saveSuccess'), 'success');
      } else {
        await createCommonDocDetails(payload);
        showToast(t('commonDocDetails.saveSuccess'), 'success');
      }
      
      setShowModal(false);
      setEditingDoc(null);
      setFormData({
        reference: '',
        description: '',
        status: 'DRAFT',

        dateTime: '',
        expirationDate: '',
        sectionId: ''
      });
      fetchDocs();
    } catch (err) {
      showToast(t('commonDocDetails.saveError'), 'danger');
    }
  };

  const handleResetForm = () => {
  setFormData(prev => ({
    ...prev, // keep sectionId as is
    reference: '',
    description: '',
    status: 'DRAFT',
    version: '',
    dateTime: '',
    expirationDate: ''
  }));
    setFormErrors({});
    setEditingDoc(null);
  };

  /* -------------------- RENDER -------------------- */
  return (
    <>
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
        <Toast 
          show={toast.show} 
          onClose={() => setToast(prev => ({ ...prev, show: false }))}
          bg={toast.variant}
          autohide
          delay={3000}
        >
          <Toast.Body className="text-white">
            <strong>{toast.variant === 'success' ? '✓' : '⚠'}</strong> {toast.message}
          </Toast.Body>
        </Toast>
      </ToastContainer>

      <Card>
        <Card.Header>
          <Row className="align-items-center mb-3">
            <Col>
              <h5>{t('commonDocDetails.title')}</h5>
              <p className="text-muted mb-0">{t('commonDocDetails.subtitle')}</p>
            </Col>
            <Col className="text-end">
              <Button 
                size="sm" 
                onClick={() => {
                  handleResetForm();
                  setShowModal(true);
                }}
                variant="primary"
              >
                <FaFileAlt className="me-2" />
                {t('commonDocDetails.addDocument')}
              </Button>
            </Col>
          </Row>

          <Nav variant="tabs" activeKey={activeView} onSelect={setActiveView}>
            <Nav.Item>
              <Nav.Link eventKey="table">
                <FaEdit className="me-2" />
                {t('commonDocDetails.tableView')}
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="cards">
                <FaEye className="me-2" />
                {t('commonDocDetails.cardView')}
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Header>

        <Card.Body>
          {loading && (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">{t('common.loading')}</p>
            </div>
          )}
          <SimpleSearchComponent/>
          {error && <Alert variant="danger">{error}</Alert>}

          {/* ---------------- TABLE VIEW ---------------- */}
          {!loading && activeView === 'table' && (
            <Table bordered hover responsive>
              <thead className="bg-light">
                <tr>
                  <th>{t('commonDocDetails.reference')}</th>
                  <th>{t('commonDocDetails.description')}</th>
                  <th>{t('commonDocDetails.dateTime')}</th>
                  <th>{t('commonDocDetails.expirationDate')}</th>
                  <th>{t('commonDocDetails.section')}</th>
         
                  <th>{t('commonDocDetails.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {docs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-4">
                      {t('commonDocDetails.noData')}
                    </td>
                  </tr>
                ) : (
                  docs.map(d => {
                    const section = sections.find(s => s.id === d.sectionId);
            
                    return (
                      <tr key={d.id}>
                      
                        <td>{d.reference}</td>
                            <td>{d.description}</td>
                        <td>{toDateOnly(d.dateTime)}</td>
                        <td>
                          {d.expirationDate ? (
                            <span className={new Date(d.expirationDate) < new Date() ? 'text-danger' : ''}>
                              {toDateOnly(d.expirationDate)}
                            </span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>{section?.name || '-'}</td>
                        <td>
                          <span className={`badge bg-${getStatusBadgeColor(d.status)}`}>
                                    {d.status}
                          </span>
                        </td>
                        <td>
                          <Button 
                            size="sm" 
                            variant="outline-primary" 
                            className="me-2"
                            onClick={() => handleEdit(d)}
                          >
                            <FaEdit />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline-danger"
                            onClick={() => handleDeleteClick(d)}
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          )}

          {/* ---------------- CARD VIEW ---------------- */}
          {!loading && activeView === 'cards' && (
            <Row xs={1} md={2} lg={3} className="g-4">
              {docs.map(d => {
                const section = sections.find(s => s.id === d.sectionId);
       
                
                return (
                  <Col key={d.id}>
                    <Card className="h-100 shadow-sm">
                      <Card.Header className="bg-light">
                        <div className="d-flex justify-content-between align-items-center">
                          <strong>{d.reference}</strong>
                          <span className={`badge bg-${getStatusBadgeColor(d.status)}`}>
                            {d.status}
                          </span>
                        </div>
          
                      </Card.Header>
                      <Card.Body>
                        <p className="card-text">{d.description}</p>
                        <div className="small text-muted">
                          <div>
                            <strong>{t('commonDocDetails.dateTime')}:</strong> {toDateOnly(d.dateTime) || '-'}
                          </div>
                          <div>
                            <strong>{t('commonDocDetails.expirationDate')}:</strong> 
                            {d.expirationDate ? (
                              <span className={new Date(d.expirationDate) < new Date() ? 'text-danger' : ''}>
                                {' '}{toDateOnly(d.expirationDate)}
                              </span>
                            ) : ' -'}
                          </div>
                          <div>
                            <strong>{t('commonDocDetails.section')}:</strong> {section?.name || '-'}
                          </div>
                        </div>
                      </Card.Body>
                      <Card.Footer className="text-end">
                        <Button 
                          size="sm" 
                          variant="outline-primary" 
                          className="me-2"
                          onClick={() => handleEdit(d)}
                        >
                          <FaEdit className="me-1" />
                          {t('commonDocDetails.edit')}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline-danger"
                          onClick={() => handleDeleteClick(d)}
                        >
                          <FaTrash className="me-1" />
                          {t('commonDocDetails.delete')}
                        </Button>
                      </Card.Footer>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
          <PaginationControl
  totalPages={docs.totalPages || 0}
  totalElements={docs.totalElements || 0}
  pageParam="page"
  sizeParam="size"
/>
        </Card.Body>

        {/* ---------------- ADD/EDIT MODAL ---------------- */}
{/* ---------------- ADD/EDIT MODAL ---------------- */}
<Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
  <Form onSubmit={handleSubmit}>
    <Modal.Header closeButton>
      <Modal.Title>
        {editingDoc
          ? t('commonDocDetails.editDocument')
          : t('commonDocDetails.addDocument')}
      </Modal.Title>
    </Modal.Header>

    <Modal.Body>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>{t('commonDocDetails.reference')} *</Form.Label>
            <Form.Control
              name="reference"
              value={formData.reference}
              onChange={handleChange}
              isInvalid={!!formErrors.reference}
              placeholder="DOC-001"
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.reference}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{t('commonDocDetails.description')} *</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              isInvalid={!!formErrors.description}
              placeholder={t('commonDocDetails.description')}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.description}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{t('commonDocDetails.status')}</Form.Label>
            <Form.Control
              name="status"
              value={formData.status}
              onChange={handleChange}
              placeholder={t('commonDocDetails.status')}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.status}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col md={6}>
   

          <Form.Group className="mb-3">
            <Form.Label>{t('commonDocDetails.dateTime')}</Form.Label>
            <Form.Control
              type="date"
              name="dateTime"
              value={formData.dateTime}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{t('commonDocDetails.expirationDate')}</Form.Label>
            <Form.Control
              type="date"
              name="expirationDate"
              value={formData.expirationDate}
              onChange={handleChange}
              min={formData.dateTime}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{t('commonDocDetails.section')} *</Form.Label>
            <Form.Select
              name="sectionId"
              value={formData.sectionId}
              onChange={handleChange}
              isInvalid={!!formErrors.sectionId}
            >
              <option value="">-- {t('commonDocDetails.selectSection')} --</option>
              {sections.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code || s.id})
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {formErrors.sectionId}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
    </Modal.Body>

    <Modal.Footer>
      <Button variant="secondary" onClick={() => setShowModal(false)}>
        {t('commonDocDetails.cancel')}
      </Button>
      <Button type="submit" variant="primary">
        {t('commonDocDetails.save')}
      </Button>
    </Modal.Footer>
  </Form>
</Modal>


        {/* ---------------- DELETE CONFIRMATION MODAL ---------------- */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title className="text-danger">
              {t('commonDocDetails.confirmDeleteTitle')}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="text-center">
              <FaTrash className="text-danger mb-3" size={40} />
              <h5>{docToDelete?.reference || 'Document'}</h5>
              <p>{t('commonDocDetails.confirmDeleteMessage')}</p>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              {t('commonDocDetails.cancel')}
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              {t('commonDocDetails.delete')}
            </Button>
          </Modal.Footer>
        </Modal>
      </Card>
    </>
  );
};

// Helper function for status badge colors
const getStatusBadgeColor = (status) => {
  switch(status) {
    case 'ACTIVE': return 'success';
    case 'INACTIVE': return 'secondary';
    case 'DRAFT': return 'info';
    case 'EXPIRED': return 'danger';
    case 'UNDER_REVIEW': return 'warning';
    case 'ARCHIVED': return 'dark';
    default: return 'secondary';
  }
};

export default CommonDocDetailsComponent;