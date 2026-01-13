import React, { useState, useEffect } from 'react'
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Modal,
  Form,
  Alert,
  Spinner
} from 'react-bootstrap'

import {
  getAllLocationEntities,
  getAllCountries
} from '../../services/GetRequests'
import { createLocationEntity } from '../../services/Inserts'
import {
  updateLocationEntity,
  deleteLocationEntity
} from '../../services/UpdRequests'
import { getFlagUrl } from '../../services/commonUtils'
import { useLanguage } from '../../i18n/LanguageContext'

const EntityComponent = () => {
  const { t, language } = useLanguage() // Get translation function and current language

  // Entity types with translations
  const entityTypes = [
    'PROVINCE',
    'STATE',
    'REGION',
    'DISTRICT',
    'CITY',
    'TOWN',
    'VILLAGE'
  ]

  const [entities, setEntities] = useState([])
  const [countries, setCountries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingEntity, setEditingEntity] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    code: '',
    postalCode: '',
    entityType: 'CITY',
    countryId: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      // Load entities and countries
      const entitiesData = await getAllLocationEntities()
      const countriesData = await getAllCountries()
      // Handle different response structures
      const entitiesArray =
        entitiesData.content || entitiesData.data || entitiesData
      const countriesArray =
        countriesData.content || countriesData.data || countriesData
      setEntities(Array.isArray(entitiesArray) ? entitiesArray : [])
      setCountries(Array.isArray(countriesArray) ? countriesArray : [])
    } catch (err) {
      setError(t('entities.errorLoading') + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleShowModal = (location = null) => {
    setEditingEntity(location)
    if (location) {
      setFormData({
        name: location.name || '',
        address: location.address || '',
        description: location.description || '',
        code: location.code || '',
        postalCode: location.postalCode || '',
        entityType: location.entityType || 'CITY',
        countryId: location.countryId || ''
      })
    } else {
      setFormData({
        name: '',
        address: '',
        description: '',
        code: '',
        postalCode: '',
        entityType: 'CITY',
        countryId: ''
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingEntity(null)
    setFormData({
      name: '',
      address: '',
      description: '',
      code: '',
      postalCode: '',
      entityType: 'CITY',
      countryId: ''
    })
  }

  const handleChange = e => {
    const value =
      e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData({
      ...formData,
      [e.target.name]: value
    })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      const submitData = {
        ...formData,
        countryId: formData.countryId
      }

      if (editingEntity) {
        await updateLocationEntity(editingEntity.id, submitData)
      } else {
        await createLocationEntity(submitData)
      }
      handleCloseModal()
      loadData()
    } catch (err) {
      setError(t('entities.errorSaving') + err.message)
    }
  }

  const handleDelete = async entityId => {
    if (window.confirm(t('entities.deleteConfirm'))) {
      try {
        await deleteLocationEntity(entityId)
        loadData()
      } catch (err) {
        setError(t('entities.errorDeleting') + err.message)
      }
    }
  }

  const getEntityTypeBadge = type => {
    const typeColors = {
      PROVINCE: 'primary',
      STATE: 'info',
      REGION: 'secondary',
      DISTRICT: 'success',
      CITY: 'warning',
      TOWN: 'dark',
      VILLAGE: 'light'
    }

    const translatedType = t(`entities.types.${type}`) || type

    return (
      <span className={`badge bg-${typeColors[type] || 'secondary'}`}>
        {translatedType}
      </span>
    )
  }

  if (loading) {
    return (
      <Container>
        <Row>
          <Col xs={12} className='text-center'>
            <Spinner animation='border' role='status'>
              <span className='visually-hidden'>
                {t('common.loading')}
              </span>
            </Spinner>
          </Col>
        </Row>
      </Container>
    )
  }

  return (
    <Container fluid>
      <Row className='mb-4'>
        <Col>
          <h4>
            {t('entities.management')}
          </h4>
          <p className='text-muted'>
            {t('entities.subtitle')}
          </p>
        </Col>
        <Col xs='auto'>
          <Button variant='primary' onClick={() => handleShowModal()}>
            <i className='fas fa-plus me-2' />
            {t('entities.addEntity')}
          </Button>
        </Col>
      </Row>

      {error &&
        <Row className='mb-3'>
          <Col xs={12}>
            <Alert variant='danger' dismissible onClose={() => setError('')}>
              {error}
            </Alert>
          </Col>
        </Row>}

      <Row>
        <Col xs={12}>
          <Card>
            <Card.Body>
              {entities.length === 0
                ? <Row>
                  <Col xs={12} className='text-center py-4'>
                    <p className='text-muted'>
                      {t('entities.noEntities')}
                    </p>
                  </Col>
                </Row>
                : <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>
                        {t('entities.name')}
                      </th>
                      <th>
                        {t('entities.type')}
                      </th>
                      <th>
                        {t('entities.code')}
                      </th>
                      <th>
                        {t('entities.country')}
                      </th>
                      <th>
                        {t('entities.postalCode')}
                      </th>
                      <th>
                        {t('common.status')}
                      </th>
                      <th>
                        {t('entities.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {entities.map(entity =>
                      <tr key={entity.id}>
                        <td>
                          <strong>
                            {entity.name}
                          </strong>
                        </td>
                        <td>
                          {entity.entityType
                              ? getEntityTypeBadge(entity.entityType)
                              : <span className='text-muted'>
                                {t('entities.notAvailable')}
                              </span>}
                        </td>
                        <td>
                          {entity.code
                              ? <code className='text-primary'>
                                {entity.code}
                              </code>
                              : <span className='text-muted'>
                                {t('entities.notAvailable')}
                              </span>}
                        </td>
                        <td>
                          {entity.countryId
                              ? <span className=' d-flex items-center gap-1'>
                                {entity.countryFlag &&
                                <img
                                  src={getFlagUrl(entity.countryFlag)}
                                  alt={entity.countryName}
                                  width={40}
                                  height='auto'
                                    />}
                                {entity.countryName}
                              </span>
                              : <span className='text-muted'>
                                {t('entities.notAvailable')}
                              </span>}
                        </td>

                        <td>
                          {entity.postalCode ||
                          <span className='text-muted'>
                            {t('entities.notAvailable')}
                          </span>}
                        </td>
                        <td>
                          <span
                            className={`badge ${entity.active
                                ? 'bg-success'
                                : 'bg-secondary'}`}
                            >
                            {entity.active
                                ? t('common.active')
                                : t('common.inactive')}
                          </span>
                        </td>
                        <td>
                          <Button
                            variant='outline-primary'
                            size='sm'
                            className='me-2'
                            onClick={() => handleShowModal(entity)}
                            >
                            <i className='fas fa-edit' /> {t('common.edit')}
                          </Button>
                          <Button
                            variant='outline-danger'
                            size='sm'
                            onClick={() => handleDelete(entity.id)}
                            >
                            <i className='fas fa-trash' />{' '}
                            {t('common.delete')}
                          </Button>
                        </td>
                      </tr>
                      )}
                  </tbody>
                </Table>}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal for Add/Edit Entity */}
      <Modal show={showModal} onHide={handleCloseModal} size='lg'>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingEntity ? t('entities.editEntity') : t('entities.addEntity')}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Container>
              <Row>
                <Col md={6}>
                  <Form.Group className='mb-3'>
                    <Form.Label>
                      {t('entities.name')} *
                    </Form.Label>
                    <Form.Control
                      type='text'
                      name='name'
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder={
                        language === 'fr'
                          ? "Entrez le nom de l'entité"
                          : 'Enter entity name'
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className='mb-3'>
                    <Form.Label>
                      {t('entities.country')} *
                    </Form.Label>
                    <Form.Select
                      name='countryId'
                      value={formData.countryId}
                      onChange={handleChange}
                      required
                    >
                      <option value=''>
                        {t('entities.selectCountry')}
                      </option>
                      {countries.map(c =>
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      )}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={4}>
                  <Form.Group className='mb-3'>
                    <Form.Label>
                      {t('entities.type')} *
                    </Form.Label>
                    <Form.Select
                      name='entityType'
                      value={formData.entityType}
                      onChange={handleChange}
                      required
                    >
                      {entityTypes.map(type =>
                        <option key={type} value={type}>
                          {t(`entities.types.${type}`)}
                        </option>
                      )}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className='mb-3'>
                    <Form.Label>
                      {t('entities.code')}
                    </Form.Label>
                    <Form.Control
                      type='text'
                      name='code'
                      value={formData.code}
                      onChange={handleChange}
                      placeholder={
                        language === 'fr' ? 'Entrez le code' : 'Enter code'
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className='mb-3'>
                    <Form.Label>
                      {t('entities.postalCode')}
                    </Form.Label>
                    <Form.Control
                      type='text'
                      name='postalCode'
                      value={formData.postalCode}
                      onChange={handleChange}
                      placeholder={
                        language === 'fr'
                          ? 'Entrez le code postal'
                          : 'Enter postal code'
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col>
                  <Form.Group className='mb-3'>
                    <Form.Label>
                      {t('entities.description')}
                    </Form.Label>
                    <Form.Control
                      as='textarea'
                      rows={3}
                      name='description'
                      value={formData.description}
                      onChange={handleChange}
                      placeholder={
                        language === 'fr'
                          ? 'Entrez la description'
                          : 'Enter description'
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Container>
          </Modal.Body>

          <Modal.Footer>
            <Button variant='secondary' onClick={handleCloseModal}>
              {t('common.cancel')}
            </Button>
            <Button variant='primary' type='submit'>
              {editingEntity ? t('entities.update') : t('entities.create')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  )
}

export default EntityComponent
