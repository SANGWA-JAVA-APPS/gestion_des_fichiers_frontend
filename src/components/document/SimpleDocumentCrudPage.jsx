import { useEffect, useState } from 'react'
import { Alert, Button, Card, Col, Form, Modal, Row, Spinner, Table } from 'react-bootstrap'
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa'
import { getAllDocStatuses } from '../../services/GetRequests'
import { CurrentUserId } from '../../services/authUtils'
import { getText } from '../../data/texts'
import { useLanguage } from '../../i18n/LanguageContext'

const toInputDate = (value) => {
  if (!value) return ''
  const str = String(value)
  return str.includes('T') ? str.split('T')[0] : str
}

const toLocalDateTime = (value) => (value ? `${value}T00:00:00` : null)

export default function SimpleDocumentCrudPage ({
  title,
  titleKey,
  fields,
  getAll,
  createItem,
  updateItem,
  deleteItem,
  listSort = 'dateTime'
}) {
  const { language } = useLanguage()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)

  const [docStatuses, setDocStatuses] = useState([])
  const [formData, setFormData] = useState(() => {
    const initial = { documentId: '', statusId: '' }
    fields.forEach(f => { initial[f.name] = '' })
    return initial
  })

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      const [res, statuses] = await Promise.all([
        getAll({ page: 0, size: 50, sort: listSort, direction: 'desc' }),
        getAllDocStatuses()
      ])
      setRecords(Array.isArray(res?.content) ? res.content : Array.isArray(res?.data) ? res.data : [])
      setDocStatuses(Array.isArray(statuses) ? statuses : [])
    } catch (err) {
      console.error('Load page data error:', err)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const resetForm = () => {
    const initial = { documentId: '', statusId: '' }
    fields.forEach(f => { initial[f.name] = '' })
    setFormData(initial)
    setEditing(null)
  }

  const handleOpenCreate = () => {
    resetForm()
    setShowModal(true)
  }

  const handleOpenEdit = (item) => {
    const initial = {
      documentId: item?.document?.id ? String(item.document.id) : '',
      statusId: item?.status?.id ? String(item.status.id) : ''
    }

    fields.forEach(f => {
      const raw = item?.[f.name]
      initial[f.name] = f.type === 'date' ? toInputDate(raw) : (raw ?? '')
    })

    setFormData(initial)
    setEditing(item)
    setShowModal(true)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const buildPayload = () => {
    const payload = {
      doneBy: { id: Number(CurrentUserId) },
      document: { id: Number(formData.documentId) },
      status: { id: Number(formData.statusId) }
    }

    fields.forEach(f => {
      const value = formData[f.name]
      if (f.type === 'date') {
        payload[f.name] = toLocalDateTime(value)
      } else if (f.type === 'number') {
        payload[f.name] = value === '' ? null : Number(value)
      } else {
        payload[f.name] = value
      }
    })

    return payload
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = buildPayload()
      if (editing) {
        await updateItem(editing.id, payload)
      } else {
        await createItem(payload)
      }
      setShowModal(false)
      resetForm()
      await loadData()
    } catch (err) {
      console.error('Save item error:', err)
      setError('Failed to save record')
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteItem(id)
      await loadData()
    } catch (err) {
      console.error('Delete item error:', err)
      setError('Failed to delete record')
    }
  }

  const resolvedTitle = titleKey ? getText(titleKey, language) : title

  return (
    <Card>
      <Card.Header className='d-flex justify-content-between align-items-center'>
        <h5 className='mb-0'>{resolvedTitle}</h5>
        <Button size='sm' onClick={handleOpenCreate}>
          <FaPlus className='me-2' /> {getText('common.add', language)}
        </Button>
      </Card.Header>
      <Card.Body>
        {loading && <Spinner animation='border' />}
        {error && <Alert variant='danger'>{error}</Alert>}

        {!loading && (
          <Table bordered hover responsive>
            <thead>
              <tr>
                {fields.map(f => <th key={f.name}>{f.labelKey ? getText(f.labelKey, language) : f.label}</th>)}
                <th>{getText('common.status', language)}</th>
                <th>{getText('document.fields.docId', language)}</th>
                <th>{getText('common.actions', language)}</th>
              </tr>
            </thead>
            <tbody>
              {records.map(item => (
                <tr key={item.id}>
                  {fields.map(f => (
                    <td key={`${item.id}-${f.name}`}>
                      {f.type === 'date' ? toInputDate(item?.[f.name]) : String(item?.[f.name] ?? '')}
                    </td>
                  ))}
                  <td>{item?.status?.name || '-'}</td>
                  <td>{item?.document?.id || '-'}</td>
                  <td>
                    <Button size='sm' variant='outline-primary' className='me-1' onClick={() => handleOpenEdit(item)}>
                      <FaEdit />
                    </Button>
                    <Button size='sm' variant='outline-danger' onClick={() => handleDelete(item.id)}>
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>

      <Modal show={showModal} onHide={() => setShowModal(false)} size='lg'>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>{editing ? `${getText('common.edit', language)} ${resolvedTitle}` : `${getText('common.add', language)} ${resolvedTitle}`}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              {fields.map(f => (
                <Col md={6} key={f.name}>
                  <Form.Group className='mb-3'>
                    <Form.Label>{f.labelKey ? getText(f.labelKey, language) : f.label}{f.required ? ' *' : ''}</Form.Label>
                    <Form.Control
                      as={f.type === 'textarea' ? 'textarea' : 'input'}
                      rows={f.type === 'textarea' ? 3 : undefined}
                      type={f.type === 'date' ? 'date' : f.type === 'number' ? 'number' : 'text'}
                      name={f.name}
                      value={formData[f.name]}
                      onChange={handleChange}
                      required={Boolean(f.required)}
                    />
                  </Form.Group>
                </Col>
              ))}
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label>{getText('document.fields.docId', language)} *</Form.Label>
                  <Form.Control
                    type='number'
                    name='documentId'
                    value={formData.documentId}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label>{getText('common.status', language)} *</Form.Label>
                  <Form.Select name='statusId' value={formData.statusId} onChange={handleChange} required>
                    <option value=''>{`${getText('common.select', language)} ${getText('common.status', language)}`}</option>
                    {docStatuses.map(status => (
                      <option key={status.id} value={status.id}>{status.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant='secondary' onClick={() => setShowModal(false)}>{getText('common.cancel', language)}</Button>
            <Button type='submit' variant='primary'>{getText('common.save', language)}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Card>
  )
}