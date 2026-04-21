import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Button, Table, Modal, Form, Alert, Spinner, Badge, ListGroup, Nav } from 'react-bootstrap'
import { getAllInduction } from '../../services/GetRequests'
import { createInductionWithFile } from '../../services/Inserts'
import { updateInduction, updateInductionWithFile, deleteInduction } from '../../services/UpdRequests'
import { getAllDocStatuses } from '../../services/GetRequests'
import { getText } from '../../data/texts'
import HeaderTitle from '../HeaderTitle'
import DocumentDetailsView from './DocumentDetailsView'
import DownloadConfirmationModal from './DownloadConfirmationModal'
import { downloadFile, formatFileSize, removeFileExtension as removeExtension, openFileInNewTab } from '../../services/downloadService'

import { getUserInfo } from '../../services/authUtils'
import { useLanguage } from '../../i18n/LanguageContext'
import PaginationControl from '../PaginationControl'
import { useSearchParams } from 'react-router-dom'
import SimpleSearchComponent from '../SimpleSearchComponent'
import DocumentCard from '../DocumentCard'

const toInputDate = (value) => {
  if (!value) return ''
  const str = String(value)
  return str.includes('T') ? str.split('T')[0] : str
}

export default function InductionComponent () {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [docStatuses, setDocStatuses] = useState([])

  const CurrentUserId = getUserInfo().userId
  const [formData, setFormData] = useState({
    reference: '',
    description: '',
    dateMiseAJourDeLaPolice: '',
    statusId: ''
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const { language } = useLanguage()

  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [totalPages, setTotalPages] = useState(0)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [totalElements, setTotalElements] = useState(0)

  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [fileToDownload, setFileToDownload] = useState(null)

  const [activeView, setActiveView] = useState('cards')

  const [searchParams, setSearchParams] = useSearchParams()

  const page = parseInt(searchParams.get('page') || '0', 10)
  const size = parseInt(searchParams.get('size') || '20', 10)
  const search = searchParams.get('search') || null
  const statusId = searchParams.get('statusId')
    ? Number(searchParams.get('statusId'))
    : null

  useEffect(() => {
    loadData()
    loadDropdownData()
  }, [searchParams])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await getAllInduction({ page, size, search, statusId })
      setData(response.content || [])
      setTotalPages(response.totalPages)
      setTotalElements(response.totalElements)
    } catch (err) {
      const errorMsg = err?.message || err?.data?.message || (typeof err === 'string' ? err : 'Unknown error')
      setError(getText('document.messages.loadError', language) + ': ' + errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const loadDropdownData = async () => {
    try {
      const statusesData = await getAllDocStatuses()
      setDocStatuses(Array.isArray(statusesData) ? statusesData : [])
    } catch (err) {
      console.error('Load dropdown data error:', err)
    }
  }

  const handleShowModal = (item = null) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        reference: item.reference || '',
        description: item.description || '',
        dateMiseAJourDeLaPolice: toInputDate(item.dateMiseAJourDeLaPolice),
        statusId: item.status?.id ? String(item.status.id) : ''
      })
      setSelectedFile(null)
    } else {
      setEditingItem(null)
      setFormData({
        reference: '',
        description: '',
        dateMiseAJourDeLaPolice: '',
        statusId: ''
      })
      setSelectedFile(null)
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingItem(null)
    setFormData({ reference: '', description: '', dateMiseAJourDeLaPolice: '', statusId: '' })
    setSelectedFile(null)
    setError('')
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) setSelectedFile(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setError('')

      if (!editingItem && !selectedFile) {
        setError(language === 'fr' ? 'Veuillez sélectionner un fichier' : 'Please select a file')
        return
      }

      if (!editingItem && selectedFile) {
        const formDataToSend = new FormData()
        formDataToSend.append('file', selectedFile)
        const inductionData = {
          reference: formData.reference,
          description: formData.description || null,
          dateMiseAJourDeLaPolice: formData.dateMiseAJourDeLaPolice ? `${formData.dateMiseAJourDeLaPolice}T00:00:00` : null,
          doneBy: { id: Number(CurrentUserId) },
          status: formData.statusId ? { id: parseInt(formData.statusId) } : null
        }
        formDataToSend.append('induction', new Blob([JSON.stringify(inductionData)], { type: 'application/json' }))
        await createInductionWithFile(formDataToSend)
      } else if (editingItem) {
        const dataToSubmit = {
          reference: formData.reference,
          description: formData.description || null,
          dateMiseAJourDeLaPolice: formData.dateMiseAJourDeLaPolice ? `${formData.dateMiseAJourDeLaPolice}T00:00:00` : null,
          doneBy: { id: Number(CurrentUserId) },
          document: editingItem.document?.id ? { id: parseInt(editingItem.document.id) } : null,
          status: formData.statusId ? { id: parseInt(formData.statusId) } : null
        }
        if (selectedFile) {
          const formDataToSend = new FormData()
          formDataToSend.append('file', selectedFile)
          formDataToSend.append('induction', new Blob([JSON.stringify(dataToSubmit)], { type: 'application/json' }))
          await updateInductionWithFile(editingItem.id, formDataToSend)
        } else {
          await updateInduction(editingItem.id, dataToSubmit)
        }
      }

      handleCloseModal()
      loadData()
    } catch (err) {
      const errorMsg = err?.details || err?.message || err?.data?.message || err?.data?.details || (typeof err === 'string' ? err : 'Unknown error')
      setError(errorMsg)
      console.error('Save error:', err)
    }
  }

  const handleDeleteClick = (item) => {
    setItemToDelete(item)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return
    try {
      setError('')
      await deleteInduction(itemToDelete.id)
      loadData()
      setShowDeleteModal(false)
      setItemToDelete(null)
    } catch (err) {
      const errorMsg = err?.details || err?.message || err?.data?.message || err?.data?.details || (typeof err === 'string' ? err : 'Unknown error')
      setError(getText('document.messages.deleteError', language) + ': ' + errorMsg)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
    setItemToDelete(null)
  }

  const handleShowDetails = (item) => {
    setSelectedDocument(item)
    setShowDetailsModal(true)
  }

  const handleCloseDetails = () => {
    setShowDetailsModal(false)
    setSelectedDocument(null)
  }

  const handleTitleClick = (item) => {
    if (item.document && item.document.filePath) {
      setFileToDownload(item)
      setShowDownloadModal(true)
    } else {
      alert(language === 'fr' ? 'Aucun fichier disponible' : 'No file available')
    }
  }

  const handleConfirmDownload = async () => {
    if (!fileToDownload || !fileToDownload.document) return
    try {
      await downloadFile(fileToDownload.document)
      setShowDownloadModal(false)
      setFileToDownload(null)
    } catch (err) {
      console.error('Download error:', err)
      alert(language === 'fr' ? `Erreur lors du téléchargement: ${err.message}` : `Download error: ${err.message}`)
    }
  }

  const handleCancelDownload = () => {
    setShowDownloadModal(false)
    setFileToDownload(null)
  }

  if (loading) {
    return (
      <div className='text-center my-5'>
        <Spinner animation='border' role='status'>
          <span className='visually-hidden'>{getText('common.loading', language)}</span>
        </Spinner>
      </div>
    )
  }

  return (
    <div className='induction-component'>
      <style>{`
        .action-buttons .btn { font-size: 0.8rem; padding: 0.25rem 0.5rem; border-radius: 0.375rem; transition: all 0.2s ease-in-out; }
        .action-buttons .btn:hover { transform: translateY(-1px); box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .hover-shadow { transition: box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out; }
        .hover-shadow:hover { box-shadow: 0 8px 16px rgba(0,0,0,0.15) !important; transform: translateY(-4px); }
      `}</style>
      <Row className='mb-4'>
        <Col>
          <Card>
            <Card.Header>
              <Row className='align-items-center mb-3'>
                <Col xs={12} md={6} lg={3}>
                  <HeaderTitle>{getText('document.categoryValues.induction', language)}</HeaderTitle>
                </Col>
                <Col xs={12} md={6} lg={9} className='text-end'>
                  <Button variant='primary' size='sm' className='me-2' onClick={() => handleShowModal()}>
                    <i className='bi bi-plus-circle me-1'></i>
                    {getText('common.add', language)}
                  </Button>
                  <Button variant='outline-secondary' size='sm' onClick={loadData}>
                    <i className='bi bi-arrow-clockwise me-1'></i>
                    {getText('document.actions.refresh', language)}
                  </Button>
                </Col>
              </Row>

              <Nav variant='tabs' activeKey={activeView} onSelect={(k) => setActiveView(k)}>
                <Nav.Item>
                  <Nav.Link eventKey='cards'>
                    <i className='bi bi-grid-3x3-gap me-2'></i>
                    {language === 'fr' ? 'Vue Carte' : 'Card View'}
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey='table'>
                    <i className='bi bi-table me-2'></i>
                    {language === 'fr' ? 'Vue Tableau' : 'Table View'}
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>
            <Card.Body>
              <SimpleSearchComponent />

              {error && (
                <Alert variant='danger' dismissible onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              {activeView === 'cards' && (
                <Row className='g-4'>
                  {data.length === 0 ? (
                    <Col xs={12}>
                      <Alert variant='info' className='text-center'>
                        <i className='bi bi-info-circle me-2'></i>
                        {language === 'fr' ? 'Aucune donnée disponible' : 'No data available'}
                      </Alert>
                    </Col>
                  ) : (
                    data.map((item) => (
                      <DocumentCard
                        key={item.id}
                        item={item}
                        language={language}
                        onViewDetails={handleShowDetails}
                        onEdit={handleShowModal}
                        onDelete={handleDeleteClick}
                        getDisplayName={(it) => it.document?.originalFileName || it.reference}
                        getDescription={(it) => it.description || ''}
                      />
                    ))
                  )}
                </Row>
              )}

              {activeView === 'table' && (
                <div className='table-responsive'>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>{getText('document.fields.reference', language)}</th>
                        <th>{getText('document.fields.description', language)}</th>
                        <th>{getText('document.fields.dateMiseAJourDeLaPolice', language)}</th>
                        <th>{getText('document.fields.status', language)}</th>
                        <th className='text-center' style={{ width: '200px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.length === 0 ? (
                        <tr>
                          <td colSpan='6' className='text-center text-muted'>
                            {language === 'fr' ? 'Aucune donnée disponible' : 'No data available'}
                          </td>
                        </tr>
                      ) : (
                        data.map((item) => (
                          <tr key={item.id}>
                            <td>{item.id}</td>
                            <td>{item.reference}</td>
                            <td>{item.description || '-'}</td>
                            <td>{item.dateMiseAJourDeLaPolice ? new Date(item.dateMiseAJourDeLaPolice).toLocaleDateString(language) : '-'}</td>
                            <td><Badge bg='info'>{item.status?.name || '-'}</Badge></td>
                            <td className='text-center'>
                              <div className='d-flex gap-1 justify-content-center action-buttons'>
                                <Button variant='outline-primary' size='sm' onClick={() => handleShowDetails(item)} title={language === 'fr' ? 'Voir' : 'View'}>
                                  <i className='bi bi-eye me-1'></i><span className='d-none d-sm-inline'>{language === 'fr' ? 'Voir' : 'View'}</span>
                                </Button>
                                <Button variant='outline-warning' size='sm' onClick={() => handleShowModal(item)} title={getText('common.edit', language)}>
                                  <i className='bi bi-pencil me-1'></i><span className='d-none d-sm-inline'>{getText('common.edit', language)}</span>
                                </Button>
                                <Button variant='outline-danger' size='sm' onClick={() => handleDeleteClick(item)} title={getText('common.delete', language)}>
                                  <i className='bi bi-trash me-1'></i><span className='d-none d-sm-inline'>{getText('common.delete', language)}</span>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
              )}

              <PaginationControl totalElements={totalElements} totalPages={totalPages} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered size='lg'>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingItem
              ? `${getText('common.edit', language)} ${getText('document.categoryValues.induction', language)}`
              : `${getText('common.add', language)} ${getText('document.categoryValues.induction', language)}`}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && <Alert variant='danger' dismissible onClose={() => setError('')}>{error}</Alert>}

            <Row>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label>{getText('document.fields.reference', language)} *</Form.Label>
                  <Form.Control type='text' name='reference' value={formData.reference} onChange={handleChange} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label>{getText('document.fields.dateMiseAJourDeLaPolice', language)}</Form.Label>
                  <Form.Control type='date' name='dateMiseAJourDeLaPolice' value={formData.dateMiseAJourDeLaPolice} onChange={handleChange} />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className='mb-3'>
              <Form.Label>{getText('document.fields.description', language)} *</Form.Label>
              <Form.Control as='textarea' rows={3} name='description' value={formData.description} onChange={handleChange} required />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label>{getText('document.fields.docId', language)} *</Form.Label>
                  <Form.Control type='file' onChange={handleFileChange} required={!editingItem} accept='.pdf,.doc,.docx,.xls,.xlsx,.txt,.png,.jpg,.jpeg' />
                  {selectedFile && (
                    <Form.Text className='text-success'>
                      <i className='bi bi-check-circle me-1'></i>
                      {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                    </Form.Text>
                  )}
                  {editingItem && editingItem.document?.id && !selectedFile && (
                    <Form.Text className='text-muted'>
                      <i className='bi bi-file-earmark me-1'></i>
                      {language === 'fr' ? 'Document actuel conservé' : 'Current document retained'}
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label>{getText('document.fields.status', language)} *</Form.Label>
                  <Form.Select name='statusId' value={formData.statusId} onChange={handleChange} required>
                    <option value=''>{getText('common.select', language)}</option>
                    {docStatuses.map(status => (
                      <option key={status.id} value={status.id}>{status.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant='secondary' onClick={handleCloseModal}>{getText('common.cancel', language)}</Button>
            <Button variant='primary' type='submit'>{getText('common.save', language)}</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleDeleteCancel} centered>
        <Modal.Header closeButton className='bg-danger text-white'>
          <Modal.Title className='d-flex align-items-center'>
            <i className='bi bi-exclamation-triangle me-2'></i>
            {getText('common.confirmDelete', language)}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className='p-4'>
          <div className='text-center'>
            <i className='bi bi-trash text-danger' style={{ fontSize: '3rem' }}></i>
            <h5 className='mt-3 mb-3'>
              {language === 'fr' ? 'Êtes-vous sûr de vouloir supprimer cet élément ?' : 'Are you sure you want to delete this item?'}
            </h5>
            {itemToDelete && (
              <div className='bg-light p-3 rounded'>
                <strong>{getText('document.fields.reference', language)}:</strong> {itemToDelete.reference}
              </div>
            )}
            <p className='text-muted mt-3 mb-0'>
              <i className='bi bi-info-circle me-1'></i>
              {language === 'fr' ? 'Cette action est irréversible.' : 'This action cannot be undone.'}
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer className='bg-light'>
          <Button variant='outline-secondary' onClick={handleDeleteCancel}>
            <i className='bi bi-x-circle me-2'></i>{getText('common.cancel', language)}
          </Button>
          <Button variant='danger' onClick={handleDeleteConfirm}>
            <i className='bi bi-trash me-2'></i>{getText('common.delete', language)}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Document Details Modal */}
      <DocumentDetailsView
        show={showDetailsModal}
        onHide={handleCloseDetails}
        title={selectedDocument?.document?.originalFileName || 'Document Details'}
        closeButtonText={language === 'fr' ? 'Fermer' : 'Close'}
      >
        {selectedDocument && (
          <div>
            <Row className='mb-3'>
              <Col md={6}>
                <h6 className='text-muted'>{language === 'fr' ? 'Informations Générales' : 'General Information'}</h6>
                <ListGroup variant='flush'>
                  <ListGroup.Item><strong>{getText('document.fields.reference', language)}:</strong> {selectedDocument.reference || '-'}</ListGroup.Item>
                  <ListGroup.Item><strong>{getText('document.fields.description', language)}:</strong> {selectedDocument.description || '-'}</ListGroup.Item>
                  <ListGroup.Item>
                    <strong>{getText('document.fields.dateMiseAJourDeLaPolice', language)}:</strong>{' '}
                    {selectedDocument.dateMiseAJourDeLaPolice ? new Date(selectedDocument.dateMiseAJourDeLaPolice).toLocaleDateString(language) : '-'}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>{getText('document.fields.status', language)}:</strong>{' '}
                    <Badge bg='info'>{selectedDocument.status?.name || '-'}</Badge>
                  </ListGroup.Item>
                </ListGroup>
              </Col>
              <Col md={6}>
                <h6 className='text-muted'>{language === 'fr' ? 'Informations du Document' : 'Document Information'}</h6>
                {selectedDocument.document ? (
                  <ListGroup variant='flush'>
                    <ListGroup.Item><strong>{language === 'fr' ? 'Nom du fichier:' : 'File name:'}</strong> <small>{selectedDocument.document.fileName}</small></ListGroup.Item>
                    <ListGroup.Item><strong>{language === 'fr' ? 'Nom original:' : 'Original name:'}</strong> {selectedDocument.document.originalFileName}</ListGroup.Item>
                    <ListGroup.Item><strong>{language === 'fr' ? 'Type:' : 'Type:'}</strong> {selectedDocument.document.contentType}</ListGroup.Item>
                    <ListGroup.Item><strong>{language === 'fr' ? 'Taille:' : 'Size:'}</strong> {(selectedDocument.document.fileSize / 1024).toFixed(2)} KB</ListGroup.Item>
                    <ListGroup.Item><strong>{language === 'fr' ? 'Version:' : 'Version:'}</strong> {selectedDocument.document.version || '-'}</ListGroup.Item>
                    <ListGroup.Item>
                      <strong>{language === 'fr' ? 'Statut:' : 'Status:'}</strong>{' '}
                      <Badge bg={selectedDocument.document.status === 'ACTIVE' ? 'success' : 'secondary'}>{selectedDocument.document.status}</Badge>
                    </ListGroup.Item>
                    <ListGroup.Item><strong>{language === 'fr' ? 'Créé le:' : 'Created:'}</strong> {new Date(selectedDocument.document.createdAt).toLocaleString(language)}</ListGroup.Item>
                    {selectedDocument.document.updatedAt && (
                      <ListGroup.Item><strong>{language === 'fr' ? 'Modifié le:' : 'Updated:'}</strong> {new Date(selectedDocument.document.updatedAt).toLocaleString(language)}</ListGroup.Item>
                    )}
                    {selectedDocument.document.owner?.fullName && (
                      <ListGroup.Item><strong>{language === 'fr' ? 'Propriétaire:' : 'Owner:'}</strong> {selectedDocument.document.owner.fullName}</ListGroup.Item>
                    )}
                  </ListGroup>
                ) : (
                  <Alert variant='warning'>{language === 'fr' ? 'Aucune information de document disponible' : 'No document information available'}</Alert>
                )}
              </Col>
            </Row>

            {selectedDocument.document?.owner && (
              <Row className='mb-3'>
                <Col>
                  <h6 className='text-muted'>{language === 'fr' ? 'Propriétaire du Document' : 'Document Owner'}</h6>
                  <ListGroup variant='flush'>
                    <ListGroup.Item><strong>{language === 'fr' ? 'Nom complet:' : 'Full name:'}</strong> {selectedDocument.document.owner.fullName}</ListGroup.Item>
                    <ListGroup.Item><strong>{language === 'fr' ? "Nom d'utilisateur:" : 'Username:'}</strong> {selectedDocument.document.owner.username}</ListGroup.Item>
                    <ListGroup.Item><strong>{language === 'fr' ? 'Email:' : 'Email:'}</strong> {selectedDocument.document.owner.email}</ListGroup.Item>
                  </ListGroup>
                </Col>
              </Row>
            )}

            {selectedDocument.doneBy && (
              <Row>
                <Col>
                  <h6 className='text-muted'>{getText('document.fields.doneBy', language)}</h6>
                  <ListGroup variant='flush'>
                    <ListGroup.Item><strong>{language === 'fr' ? 'Nom complet:' : 'Full name:'}</strong> {selectedDocument.doneBy.fullName}</ListGroup.Item>
                    <ListGroup.Item><strong>{language === 'fr' ? "Nom d'utilisateur:" : 'Username:'}</strong> {selectedDocument.doneBy.username}</ListGroup.Item>
                  </ListGroup>
                </Col>
              </Row>
            )}

            <div className='mt-4 d-flex gap-2'>
              <Button variant='primary' size='sm' onClick={async () => {
                try { if (selectedDocument?.document) await openFileInNewTab(selectedDocument.document) } catch (err) { alert(`Error: ${err.message}`) }
              }} disabled={!selectedDocument?.document?.filePath}>
                <i className='bi bi-eye me-2'></i>{language === 'fr' ? 'Ouvrir le document' : 'Open Document'}
              </Button>
              <Button variant='warning' size='sm' onClick={() => { handleCloseDetails(); handleShowModal(selectedDocument) }}>
                <i className='bi bi-pencil me-2'></i>{getText('common.edit', language)}
              </Button>
            </div>
          </div>
        )}
      </DocumentDetailsView>

      <DownloadConfirmationModal
        show={showDownloadModal}
        onHide={handleCancelDownload}
        onConfirm={handleConfirmDownload}
        fileName={fileToDownload?.document?.originalFileName}
        fileSize={fileToDownload?.document?.fileSize ? formatFileSize(fileToDownload.document.fileSize) : null}
        language={language}
      />
    </div>
  )
}