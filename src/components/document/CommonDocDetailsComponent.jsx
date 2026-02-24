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
  getSectionCategoryByCode,
  getAllDocStatuses,
  getAllSectionCategories
} from '../../services/GetRequests'
import {
  deleteCommonDocDetails,
  updateCommonDocDetails,
  updateCommonDocDetailsWithFile
} from '../../services/UpdRequests'
import { createCommonDocDetailsWithFile } from '../../services/Inserts'
import { CurrentUserId } from '../../services/authUtils'
import { useLanguage } from '../../i18n/LanguageContext'
import SimpleSearchComponent from '../SimpleSearchComponent'
import PaginationControl from '../PaginationControl'
import DocumentCard from '../DocumentCard'
import GenericDocumentDetailsModal from '../GenericDocumentDetailsModal'

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

  const [activeView, setActiveView] = useState('cards')
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const [editingDoc, setEditingDoc] = useState(null)
  const [docToDelete, setDocToDelete] = useState(null)
  const [selectedDocForDetails, setSelectedDocForDetails] = useState(null)

  const [docStatuses, setDocStatuses] = useState([])
  const [sectionCategories, setSectionCategories] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)

  const [formData, setFormData] = useState({
    reference: '',
    description: '',
    status: '',
    dateTime: '',
    expirationDate: '',
    sectionCategoryId: '',
    statusId: ''
  })

  const normalizeDocsPage = (res) => {
    if (res && Array.isArray(res.content)) {
      return {
        content: res.content,
        totalPages: res.totalPages ?? 0,
        totalElements: res.totalElements ?? res.content.length
      }
    }

    if (res && Array.isArray(res.data)) {
      return {
        content: res.data,
        totalPages: res.pagination?.totalPages ?? 0,
        totalElements: res.pagination?.totalElements ?? res.data.length
      }
    }

    if (Array.isArray(res)) {
      return {
        content: res,
        totalPages: 0,
        totalElements: res.length
      }
    }

    return { content: [], totalPages: 0, totalElements: 0 }
  }


  const fetchSectionCategory = async () => {
    const section = await getSectionCategoryByCode(sectionCode)
    setCurrentSection(section)
    setFormData(prev => ({ ...prev, sectionCategoryId: String(section.id) }))
  }

  const fetchDropdownData = async () => {
    try {
      const [statusesData, categoriesData] = await Promise.all([
        getAllDocStatuses(),
        getAllSectionCategories()
      ])
      setDocStatuses(Array.isArray(statusesData) ? statusesData : [])
      setSectionCategories(Array.isArray(categoriesData) ? categoriesData : [])
    } catch (err) {
      console.error('Load dropdown data error:', err)
    }
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
      setDocsPage(normalizeDocsPage(res))
    } catch {
      setError(t('commonDocDetails.fetchError'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSectionCategory()
    fetchDropdownData()
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
      status: doc.status?.name ?? '',
      dateTime: toDateOnly(doc.dateTime),
      expirationDate: toDateOnly(doc.expirationDate),
      sectionCategoryId: String(doc.sectionCategory?.id ?? currentSection?.id ?? ''),
      statusId: String(doc.status?.id ?? '')
    })
    setSelectedFile(null)
    setShowModal(true)
  }

  const handleViewDetails = (doc) => {
    setSelectedDocForDetails(doc)
    setShowDetailsModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (selectedFile || !editingDoc) {
        // CREATE or UPDATE with file
        const formDataToSend = new FormData()
        if (selectedFile) {
          formDataToSend.append('file', selectedFile)
        }

        const commonDocDetailsData = {
          reference: formData.reference.trim(),
          description: formData.description.trim(),
          status: formData.status,
          dateTime: toLocalDateTime(formData.dateTime),
          expirationDate: toLocalDateTime(formData.expirationDate),
          sectionCategoryId: Number(formData.sectionCategoryId),
          statusId: formData.statusId ? Number(formData.statusId) : null,
          doneById: CurrentUserId
        }

        formDataToSend.append('commonDocDetails', new Blob([JSON.stringify(commonDocDetailsData)], {
          type: 'application/json'
        }))

        if (editingDoc) {
          await updateCommonDocDetailsWithFile(editingDoc.id, formDataToSend)
        } else {
          await createCommonDocDetailsWithFile(formDataToSend)
        }
      } else {
        // UPDATE without file
        const payload = {
          reference: formData.reference.trim(),
          description: formData.description.trim(),
          status: formData.status,
          dateTime: toLocalDateTime(formData.dateTime),
          expirationDate: toLocalDateTime(formData.expirationDate),
          sectionCategoryId: Number(formData.sectionCategoryId),
          statusId: formData.statusId ? Number(formData.statusId) : null,
          doneById: CurrentUserId
        }
        await updateCommonDocDetails(editingDoc.id, payload)
      }

      showToast(t('commonDocDetails.saveSuccess'))
      setShowModal(false)
      setEditingDoc(null)
      setSelectedFile(null)
      fetchDocs()
    } catch (err) {
      console.error('Save error:', err)
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
    setFormData({
      reference: '',
      description: '',
      status: '',
      dateTime: '',
      expirationDate: '',
      sectionCategoryId: currentSection?.id ? String(currentSection.id) : '',
      statusId: ''
    })
    setEditingDoc(null)
    setSelectedFile(null)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const getStatusBadgeColor = (status) => {
    const statusName = typeof status === 'object' ? status?.name : status
    switch(statusName) {
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
    const statusName = typeof status === 'object' ? status?.name : status
    return t(`commonDocDetails.statusOptions.${statusName}`) || statusName
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
              <div className="page-title-group">
                <h5>
                  { <SectionIcon />}
                  {currentSection?.name || t('commonDocDetails.title')}
                </h5>
                <small className="text-muted">{currentSection?.description}</small>
              </div>
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
              {docsPage.content?.length === 0 ? (
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
                    {docsPage.content?.map(d => (
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
                          {d.sectionCategory?.name}
                        </td>
                        <td>
                          <Button 
                            size="sm" 
                            variant="outline-info" 
                            onClick={() => handleViewDetails(d)}
                            title={t('common.viewDetails')}
                            className="me-1"
                          >
                            <FaEye />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline-primary" 
                            onClick={() => handleEdit(d)}
                            title={t('common.edit')}
                            className="me-1"
                          >
                            <FaEdit />
                          </Button>
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
              {docsPage.content?.length === 0 ? (
                <Col>
                  <Alert variant="info">{t('commonDocDetails.noData')}</Alert>
                </Col>
              ) : (
                docsPage.content?.map(d => (
             
                    <DocumentCard
                      item={d}
                      onEdit={() => handleEdit(d)}
                      onDelete={() => { setDocToDelete(d); setShowDeleteModal(true) }}
                      onViewDetails={() => handleViewDetails(d)}
                      getStatusBadgeColor={getStatusBadgeColor}
                      getStatusTranslation={getStatusTranslation}
                      SectionIcon={SectionIcon}
                    />
                 
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
                  <Form.Select name="statusId" value={formData.statusId} onChange={handleChange}>
                    <option value="">{t('common.select')}</option>
                    {docStatuses.map(status => (
                      <option key={status.id} value={status.id}>{status.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>{t('document.fields.docId')} {!editingDoc && '*'}</Form.Label>
                  <Form.Control
                    type="file"
                    onChange={handleFileChange}
                    required={!editingDoc}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.png,.jpg,.jpeg"
                  />
                  {selectedFile && (
                    <Form.Text className="text-success">
                      <i className="bi bi-check-circle me-1"></i>
                      {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                    </Form.Text>
                  )}
                  {editingDoc && !selectedFile && (
                    <Form.Text className="text-muted">
                      <i className="bi bi-file-earmark me-1"></i>
                      {t('document.currentDocumentRetained') || 'Current document retained'}
                    </Form.Text>
                  )}
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
                  <Form.Select name="sectionCategoryId" value={formData.sectionCategoryId} onChange={handleChange} disabled>
                    <option value="">{t('common.select')}</option>
                    {sectionCategories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </Form.Select>
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

      {/* ---------------- DOCUMENT DETAILS MODAL ---------------- */}
      {selectedDocForDetails && (
        <GenericDocumentDetailsModal
          show={showDetailsModal}
          onHide={() => setShowDetailsModal(false)}
          document={selectedDocForDetails}
          documentType="commonDocDetails"
        />
      )}
    </>
  )
}

export default CommonDocDetailsComponent