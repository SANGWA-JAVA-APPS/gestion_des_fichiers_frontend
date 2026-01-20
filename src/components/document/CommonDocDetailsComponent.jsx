/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
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
} from 'react-bootstrap'
import { useSearchParams, useParams } from 'react-router-dom'
import { FaEdit, FaTrash, FaEye, FaFileAlt } from 'react-icons/fa'

import {
  getAllCommonDocDetails,

  getSectionCategoryByCode 
} from '../../services/GetRequests'
import {
  deleteCommonDocDetails,
  updateCommonDocDetails
} from '../../services/UpdRequests'
import { createCommonDocDetails } from '../../services/Inserts'
import { useLanguage } from '../../i18n/LanguageContext'
import SimpleSearchComponent from '../SimpleSearchComponent'
import PaginationControl from '../PaginationControl'

import {
  DollarSign,
  ShoppingCart,
  UsersIcon,
  Settings,
  Network,
  BuildingIcon,
  PieChart,
  ScaleIcon,
  BadgeCheckIcon,
  ShieldCheck,
  ToolCase,
  Pill,
  AlertCircle,
  FileTextIcon,
  HandshakeIcon,
  Package,
  HomeIcon,
  Building2Icon
} from 'lucide-react'
import { FaPlus } from 'react-icons/fa6'

const sectionIcons = {
  ORG_FIN: DollarSign,
  ORG_PROC: ShoppingCart,
  ORG_HR: UsersIcon,
  ORG_TECH: Settings,
  ORG_IT: Network,
  ORG_RE: BuildingIcon,
  ORG_SH: PieChart,
  ORG_LEGAL: ScaleIcon,
  ORG_QUAL: BadgeCheckIcon,
  ORG_HSE: ShieldCheck,
  ORG_EQUIP: ToolCase,
  ORG_DA: Pill,
  ORG_INC: AlertCircle,
  ORG_SOP: FileTextIcon,
  ORG_SUPP: HandshakeIcon,
  ORG_RENT_CON: Package,
  ORG_CLIENT: Building2Icon,
  ORG_RENT_ASSET: HomeIcon
}

/* -------------------- DATE HELPERS -------------------- */
const toDateOnly = (value) => (value ? value.split('T')[0] : '')
const toLocalDateTime = (value) => (value ? `${value}T00:00:00` : null)

/* -------------------- COMPONENT -------------------- */
const CommonDocDetailsComponent = () => {
  const { t } = useLanguage()
  const [searchParams] = useSearchParams()
  const { sectionCode } = useParams()

  const page = Number(searchParams.get('page') || 0)
  const size = Number(searchParams.get('size') || 5)
  const search = searchParams.get('search') || ''

  const [docsPage, setDocsPage] = useState({ content: [], totalPages: 0, totalElements: 0 })

  const [currentSection, setCurrentSection] = useState(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' })

  const [activeView, setActiveView] = useState('table')
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [editingDoc, setEditingDoc] = useState(null)
  const [docToDelete, setDocToDelete] = useState(null)

  const [formData, setFormData] = useState({
    reference: '',
    description: '',
    status: 'DRAFT',
    dateTime: '',
    expirationDate: '',
    sectionId: ''
  })


  const fetchSectionCategory = async () => {
    const section = await getSectionCategoryByCode(sectionCode)
    setCurrentSection(section)
    setFormData(prev => ({ ...prev, sectionId: String(section.id) }))
  }

  const fetchDocs = async () => {
    setLoading(true)
    try {
      const res = await getAllCommonDocDetails({
        page,
        size,
        search,
        sectionCode
      })
      setDocsPage(res)
    } catch {
      setError(t('commonDocDetails.fetchError'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSectionCategory()
 
  }, [sectionCode])

  useEffect(() => {
    fetchDocs()
  }, [searchParams, sectionCode])

  /* -------------------- TOAST -------------------- */
  const showToast = (message, variant = 'success') => {
    setToast({ show: true, message, variant })
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000)
  }

  /* -------------------- ACTIONS -------------------- */
  const handleEdit = (doc) => {
    setEditingDoc(doc)
    setFormData({
      reference: doc.reference ?? '',
      description: doc.description ?? '',
      status: doc.status ?? 'DRAFT',
      dateTime: toDateOnly(doc.dateTime),
      expirationDate: toDateOnly(doc.expirationDate),
      sectionId: String(doc.sectionId ?? '')
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      reference: formData.reference.trim(),
      description: formData.description.trim(),
      status: formData.status,
      sectionCategoryId: Number(formData.sectionId),
      dateTime: toLocalDateTime(formData.dateTime),
      expirationDate: toLocalDateTime(formData.expirationDate)
    }

    try {
      if (editingDoc) {
        await updateCommonDocDetails(editingDoc.id, payload)
      } else {
        await createCommonDocDetails(payload)
      }

      showToast(t('commonDocDetails.saveSuccess'))
      setShowModal(false)
      setEditingDoc(null)
      fetchDocs()
    } catch {
      showToast(t('commonDocDetails.saveError'), 'danger')
    }
  }

  const handleDeleteConfirm = async () => {
    await deleteCommonDocDetails(docToDelete.id)
    showToast(t('commonDocDetails.deleteSuccess'))
    setShowDeleteModal(false)
    fetchDocs()
  }

  const handleResetForm = () => {
    setFormData(prev => ({
      ...prev,
      reference: '',
      description: '',
      status: 'DRAFT',
      dateTime: '',
      expirationDate: ''
    }))
    setEditingDoc(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'ACTIVE': return 'success'
      case 'INACTIVE': return 'secondary'
      case 'DRAFT': return 'info'
      case 'EXPIRED': return 'danger'
      case 'UNDER_REVIEW': return 'warning'
      case 'ARCHIVED': return 'dark'
      default: return 'secondary'
    }
  }

  const getStatusTranslation = (status) => {
    return t(`commonDocDetails.statusOptions.${status}`) || status
  }

const SectionIcon = sectionIcons[currentSection?.code] || FaFileAlt

  /* -------------------- RENDER -------------------- */
  return (
    <>
      <ToastContainer position="top-end" className="p-3">
        <Toast show={toast.show} bg={toast.variant}>
          <Toast.Body className="text-white">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>

      <Card className="mb-3">
        <Card.Header>
          <Row className="align-items-center">
            <Col>
              <h5>
                { <SectionIcon />}
                {currentSection?.name || t('commonDocDetails.title')}
              </h5>
              <small className="text-muted">{currentSection?.description}</small>
            </Col>
            <Col className="text-end">
              <Button size="sm" onClick={() => { handleResetForm(); setShowModal(true) }}>
                <FaPlus className="me-2" />
                <SectionIcon/>
                {t('commonDocDetails.addDocument')}
              </Button>
            </Col>
          </Row>

          <Nav variant="tabs" activeKey={activeView} onSelect={setActiveView} className="mt-2">
            <Nav.Item>
              <Nav.Link eventKey="table">
                <FaEdit /> {t('common.tableView')}
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="cards">
                <FaEye /> {t('common.cardsView')}
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Header>

        <Card.Body>
          <SimpleSearchComponent />

          {loading && <Spinner animation="border" />}
          {error && <Alert variant="danger">{error}</Alert>}

          {activeView === 'table' && (
            <>
              {docsPage.content.length === 0 ? (
                <Alert variant="info">{t('commonDocDetails.noData')}</Alert>
              ) : (
                <Table bordered hover responsive>
                  <thead>
                    <tr>
                      <th>{t('commonDocDetails.reference')}</th>
                      <th>{t('commonDocDetails.description')}</th>
                      <th>{t('commonDocDetails.dateTime')}</th>
                      <th>{t('commonDocDetails.expirationDate')}</th>
                        <th>{t('commonDocDetails.status')}</th>
                           <th>{t('commonDocDetails.section')}</th>  
                      <th>{t('commonDocDetails.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {docsPage.content.map(d => (
                      <tr key={d.id}>
                        <td>{d.reference}</td>
                        <td>{d.description}</td>
                        <td>{toDateOnly(d.dateTime)}</td>
                        <td>
                          {d.expirationDate ? (
                            <span className={new Date(d.expirationDate) < new Date() ? 'text-danger' : ''}>
                              {toDateOnly(d.expirationDate)}
                            </span>
                          ) : '-'}
                        </td>
                       
                        <td>
                          <span className={`badge bg-${getStatusBadgeColor(d.status)}`}>
                            {getStatusTranslation(d.status)}
                          </span>
                        </td>
                               <td>
                      {d.sectionCategoryName}
                        </td>
                        <td>
                          <Button 
                            size="sm" 
                            variant="outline-primary" 
                            onClick={() => handleEdit(d)}
                            title={t('common.edit')}
                          >
                            <FaEdit />
                          </Button>{' '}
                          <Button 
                            size="sm" 
                            variant="outline-danger" 
                            onClick={() => { setDocToDelete(d); setShowDeleteModal(true) }}
                            title={t('common.delete')}
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </>
          )}

          {activeView === 'cards' && (
            <Row>
              {docsPage.content.length === 0 ? (
                <Col>
                  <Alert variant="info">{t('commonDocDetails.noData')}</Alert>
                </Col>
              ) : (
                docsPage.content.map(d => (
                  <Col md={4} className="mb-3" key={d.id}>
                    <Card>
                      <Card.Body>
                        <div className="d-flex align-items-center mb-2">
                          <SectionIcon className="me-2" size={24} />
                          <strong>{d.reference}</strong>
                        </div>
                        <p>{d.description}</p>
                        <small className="text-muted d-block">
                          {toDateOnly(d.dateTime)} - {d.expirationDate ? toDateOnly(d.expirationDate) : '-'}
                        </small>
                        <div className="mt-2">
                          <span className={`badge bg-${getStatusBadgeColor(d.status)}`}>
                            {getStatusTranslation(d.status)}
                          </span>
                        </div>
                        <div className="mt-2">
                          <Button 
                            size="sm" 
                            variant="outline-primary" 
                            className="me-2"
                            onClick={() => handleEdit(d)}
                          >
                            <FaEdit /> {t('common.edit')}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline-danger"
                            onClick={() => { setDocToDelete(d); setShowDeleteModal(true) }}
                          >
                            <FaTrash /> {t('common.delete')}
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))
              )}
            </Row>
          )}

          <PaginationControl
            totalPages={docsPage.totalPages}
            totalElements={docsPage.totalElements}
            pageParam="page"
            sizeParam="size"
          />
        </Card.Body>
      </Card>

      {/* ---------------- MODAL ---------------- */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editingDoc ? t('commonDocDetails.editDocument') : t('commonDocDetails.addDocument')}
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
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>{t('commonDocDetails.description')} *</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={3} 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>{t('commonDocDetails.status')}</Form.Label>
                  <Form.Select name="status" value={formData.status} onChange={handleChange}>
                    <option value="DRAFT">{t('commonDocDetails.statusOptions.DRAFT')}</option>
                    <option value="ACTIVE">{t('commonDocDetails.statusOptions.ACTIVE')}</option>
                    <option value="INACTIVE">{t('commonDocDetails.statusOptions.INACTIVE')}</option>
                    <option value="ARCHIVED">{t('commonDocDetails.statusOptions.ARCHIVED')}</option>
                    <option value="EXPIRED">{t('commonDocDetails.statusOptions.EXPIRED')}</option>
                    <option value="UNDER_REVIEW">{t('commonDocDetails.statusOptions.UNDER_REVIEW')}</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('commonDocDetails.dateTime')}</Form.Label>
                  <Form.Control type="date" name="dateTime" value={formData.dateTime} onChange={handleChange} />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>{t('commonDocDetails.expirationDate')}</Form.Label>
                  <Form.Control 
                    type="date" 
                    name="expirationDate" 
                    value={formData.expirationDate} 
                    onChange={handleChange} 
                    min={formData.dateTime || undefined} 
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>{t('commonDocDetails.section')}</Form.Label>
                  <Form.Control type="text" value={currentSection?.name || ''} disabled />
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

      {/* ---------------- DELETE MODAL ---------------- */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('commonDocDetails.confirmDeleteTitle')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{t('commonDocDetails.confirmDeleteMessage')}</p>
          <p className="text-muted">{t('common.deleteWarning')}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            {t('common.delete')}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default CommonDocDetailsComponent