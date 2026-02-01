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
  Spinner,
  Badge
} from 'react-bootstrap'

import { getAllRoles } from '../../services/GetRequests'
import { createRole } from '../../services/Inserts'
import { updateRole, deleteRole } from '../../services/UpdRequests'
import { useLanguage } from '../../i18n/LanguageContext'

const RolesComponent = () => {
  const { t, language } = useLanguage() // Get translation function and current language
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingRole, setEditingRole] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: '',
    level: 1,
    isSystemRole: false,
    status: 'ACTIVE'
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const rolesData = await getAllRoles()
      setRoles(rolesData)
    } catch (err) {
      setError(`${t('roles.errorLoading')}${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleShowModal = (role = null) => {
    if (role) {
      setEditingRole(role)
      setFormData({
        name: role.name || '',
        description: role.description || '',
        permissions: role.permissions || '',
        level: role.level || 1,
        isSystemRole: role.isSystemRole || false,
        status: role.status || 'ACTIVE'
      })
    } else {
      setEditingRole(null)
      setFormData({
        name: '',
        description: '',
        permissions: '',
        level: 1,
        isSystemRole: false,
        status: 'ACTIVE'
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingRole(null)
    setFormData({
      name: '',
      description: '',
      permissions: '',
      level: 1,
      isSystemRole: false,
      status: 'ACTIVE'
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
      if (editingRole) {
        await updateRole(editingRole.id, formData)
      } else {
        await createRole(formData)
      }
      handleCloseModal()
      loadData()
    } catch (err) {
      setError(`${t('roles.errorSaving')}${err.message}`)
    }
  }

  const handleDelete = async (roleId, isSystemRole) => {
    if (isSystemRole) {
      setError(t('roles.deleteSystemRoleError'))
      return
    }

    if (window.confirm(t('roles.deleteConfirm'))) {
      try {
        await deleteRole(roleId)
        loadData()
      } catch (err) {
        setError(`${t('roles.errorDeleting')}${err.message}`)
      }
    }
  }

  const getPermissionBadges = permissions => {
    if (!permissions) {
      return (
        <span className='text-muted'>
          {t('roles.noPermissions')}
        </span>
      )
    }

    const permArray = permissions.split(',').map(p => p.trim())
    return permArray.map((perm, index) =>
      <Badge key={index} bg='secondary' className='me-1'>
        {perm}
      </Badge>
    )
  }

  const getLevelBadge = level => {
    const levelColors = {
      1: 'danger',
      2: 'warning',
      3: 'info',
      4: 'secondary'
    }

    const levelNames = {
      1: t('roles.level1'),
      2: t('roles.level2'),
      3: t('roles.level3'),
      4: t('roles.level4')
    }

    return (
      <Badge bg={levelColors[level] || 'secondary'}>
        {language === 'fr' ? `Niveau ${level}` : `Level ${level}`} -{' '}
        {levelNames[level] || t('roles.custom')}
      </Badge>
    )
  }

  const getStatusText = status => {
    const statusMap = {
      ACTIVE: t('common.active'),
      INACTIVE: t('common.inactive'),
      DEPRECATED: t('roles.deprecated')
    }
    return statusMap[status] || status
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
          <div className='page-title-group'>
            <h4>
              {t('roles.management')}
            </h4>
            <p className='text-muted'>
              {t('roles.subtitle')}
            </p>
          </div>
        </Col>
        <Col xs='auto'>
          {/* <Button variant='primary' onClick={() => handleShowModal()}>
            <i className='fas fa-plus me-2' />
            {t('roles.addNewRole')}
          </Button> */}
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
              {roles.length === 0
                ? <Row>
                  <Col xs={12} className='text-center py-4'>
                    <p className='text-muted'>
                      {t('roles.noRoles')}
                    </p>
                  </Col>
                </Row>
                : <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>
                        {t('roles.roleName')}
                      </th>
                      {/* <th>
                        {language === 'fr' ? 'Niveau' : 'Level'}
                      </th>
                      <th>
                        {t('common.status')}
                      </th>
                      <th>
                        {t('roles.type')}
                      </th>
                      <th>
                        {t('roles.permissions')}
                      </th> */}
                      <th>
                        {t('roles.description')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {roles
                        .sort((a, b) => (a.level || 0) - (b.level || 0))
                        .map(role =>
                          <tr key={role.id}>
                            <td>
                              <strong>
                                {role.name}
                              </strong>
                            </td>
                            {/* <td>
                              {getLevelBadge(role.level)}
                            </td> */}
                            {/* <td>
                              <span
                                className={`badge ${role.status === 'ACTIVE'
                                  ? 'bg-success'
                                  : 'bg-secondary'}`}
                              >
                                {getStatusText(role.status)}
                              </span>
                            </td> */}
                            {/* <td>
                              {role.isSystemRole
                                ? <Badge bg='primary'>
                                  {t('roles.system')}
                                </Badge>
                                : <Badge bg='light' text='dark'>
                                  {t('roles.custom')}
                                </Badge>}
                            </td> */}
                            {/* <td>
                              {getPermissionBadges(role.permissions)}
                            </td> */}
                            <td>
                              <small className='text-muted'>
                                {role.description}
                              </small>
                            </td>
                          </tr>
                        )}
                  </tbody>
                </Table>}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal for Add/Edit Role */}
      <Modal show={showModal} onHide={handleCloseModal} size='lg'>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingRole ? t('roles.editRole') : t('roles.addRole')}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Container>
              <Row>
                <Col md={6}>
                  <Form.Group className='mb-3'>
                    <Form.Label>
                      {t('roles.roleName')}
                    </Form.Label>
                    <Form.Control
                      type='text'
                      name='name'
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder={
                        language === 'fr'
                          ? 'Entrez le nom du rôle'
                          : 'Enter role name'
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className='mb-3'>
                    <Form.Label>
                      {t('roles.accessLevel')}
                    </Form.Label>
                    <Form.Select
                      name='level'
                      value={formData.level}
                      onChange={handleChange}
                      required
                    >
                      <option value={1}>
                        {t('roles.level1')}
                      </option>
                      <option value={2}>
                        {t('roles.level2')}
                      </option>
                      <option value={3}>
                        {t('roles.level3')}
                      </option>
                      <option value={4}>
                        {t('roles.level4')}
                      </option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className='mb-3'>
                    <Form.Label>
                      {t('common.status')}
                    </Form.Label>
                    <Form.Select
                      name='status'
                      value={formData.status}
                      onChange={handleChange}
                      required
                    >
                      <option value='ACTIVE'>
                        {t('common.active')}
                      </option>
                      <option value='INACTIVE'>
                        {t('common.inactive')}
                      </option>
                      <option value='DEPRECATED'>
                        {t('roles.deprecated')}
                      </option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className='mb-3 d-flex align-items-center'>
                    <Form.Check
                      type='checkbox'
                      name='isSystemRole'
                      checked={formData.isSystemRole}
                      onChange={handleChange}
                      label={t('roles.systemRole')}
                      className='mt-4'
                    />
                    <Form.Text className='text-muted ms-2'>
                      {t('roles.systemRoleHint')}
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col xs={12}>
                  <Form.Group className='mb-3'>
                    <Form.Label>
                      {t('roles.permissions')}
                    </Form.Label>
                    <Form.Control
                      type='text'
                      name='permissions'
                      value={formData.permissions}
                      onChange={handleChange}
                      placeholder={t('roles.permissionsPlaceholder')}
                    />
                    <Form.Text className='text-muted'>
                      {t('roles.permissionsHint')}
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col xs={12}>
                  <Form.Group className='mb-3'>
                    <Form.Label>
                      {t('roles.description')}
                    </Form.Label>
                    <Form.Control
                      as='textarea'
                      rows={3}
                      name='description'
                      value={formData.description}
                      onChange={handleChange}
                      placeholder={t('roles.descriptionPlaceholder')}
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
              {editingRole ? t('roles.update') : t('roles.create')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  )
}

export default RolesComponent
