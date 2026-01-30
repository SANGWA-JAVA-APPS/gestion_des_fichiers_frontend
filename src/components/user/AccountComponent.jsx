/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react'
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Modal,
  Alert,
  Spinner
} from 'react-bootstrap'
import { useSearchParams } from 'react-router-dom'

import { useLanguage } from '../../i18n/LanguageContext'
import { getAllAccounts } from '../../services/GetRequests'
import { deleteAccount } from '../../services/UpdRequests'
import { updateAccountPermissions } from '../../services/Inserts'
import AccountForm from './AccountForm'
import UserProfile from './UserProfile'
import PermissionsAssignmentForm from './PermissionsAssignmentForm'

const AccountComponent = () => {
  const { t } = useLanguage()
  const [_searchParams, setSearchParams] = useSearchParams()
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [showPermissionsModal, setShowPermissionsModal] = useState(false)
  const [editingUserId, setEditingUserId] = useState(null)
  const [permissionsUserId, setPermissionsUserId] = useState(null)
  const [selectedPermissionsCount, setSelectedPermissionsCount] = useState(0)
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([])

  const [showProfileModal, setShowProfileModal] = useState(false)
  const [profileUserId, setProfileUserId] = useState(null)

  // Load all accounts
  const loadData = async () => {
    try {
      setLoading(true)
      const accountsRes = await getAllAccounts()
      setAccounts(accountsRes || [])
    } catch (err) {
      console.error(err)
      setError(t('accounts.errorLoading'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDelete = async id => {
    if (!window.confirm(t('accounts.deleteConfirm'))) return
    try {
      await deleteAccount(id)
      loadData()
    } catch (err) {
      console.error(err)
      setError(t('accounts.errorDeleting'))
    }
  }

  const handleShowModal = (userId = null) => {
    setEditingUserId(userId)
    setShowModal(true)
  }

  const handleShowPermissionsModal = userId => {
    setPermissionsUserId(userId)
    setSelectedPermissionIds([])
    setSelectedPermissionsCount(0)
    setSearchParams({ userId: userId.toString() })
    setShowPermissionsModal(true)
  }

  const handleCloseModal = () => {
    setEditingUserId(null)
    setShowModal(false)
  }

  const handleClosePermissionsModal = () => {
    setPermissionsUserId(null)
    setSelectedPermissionIds([])
    setSelectedPermissionsCount(0)
    setSearchParams({})
    setShowPermissionsModal(false)
  }

  const handleSavePermissions = async () => {
    setError('')
    if (!permissionsUserId) {
      setError(t('accounts.noUserSelected') || 'No user selected')
      return
    }

    try {
      await updateAccountPermissions(permissionsUserId, selectedPermissionIds)
      handleClosePermissionsModal()
      loadData()
    } catch (err) {
      console.error(err)
      setError(t('accounts.errorSaving'))
    }
  }

  const handleShowProfile = userId => {
    setProfileUserId(userId)
    setShowProfileModal(true)
  }

  const handleCloseProfile = () => {
    setProfileUserId(null)
    setShowProfileModal(false)
  }

  if (loading) {
    return (
      <Container className='text-center py-5'>
        <Spinner animation='border' />
        <p className='mt-2'>
          {t('common.loading')}
        </p>
      </Container>
    )
  }

  return (
    <Container fluid>
      <Row className='mb-4'>
        <Col>
          <h4>
            {t('accounts.management')}
          </h4>
          <p className='text-muted'>
            {t('accounts.subtitle')}
          </p>
        </Col>
        <Col xs='auto'>
          <Button onClick={() => handleShowModal()}>
            {t('accounts.addAccount')}
          </Button>
        </Col>
      </Row>

      {error &&
        <Alert variant='danger' dismissible onClose={() => setError('')}>
          {error}
        </Alert>}

      <Card>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>
                  {t('accounts.fullName')}
                </th>
                <th>
                  {t('accounts.email')}
                </th>
                <th>
                  {t('accounts.phone')}
                </th>
                <th>
                  {t('accounts.category')}
                </th>
                <th>
                  {t('accounts.country')}
                </th>
                <th>
                  {t('accounts.locationEntity')}
                </th>
                <th>
                  {t('common.status')}
                </th>
                <th width='250'>
                  {t('accounts.actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {accounts.map(acc =>
                <tr key={acc.id}>
                  <td>
                    {acc.fullName}
                  </td>
                  <td>
                    {acc.email}
                  </td>
                  <td>
                    {acc.phoneNumber}
                  </td>
                  <td>
                    <span className='badge bg-info'>
                      {acc.categoryName}
                    </span>
                  </td>
                  <td>
                    <span className='badge bg-secondary'>
                      {acc.countryName || '-'}
                    </span>
                  </td>
                  <td>
                    <span className='badge bg-warning text-dark'>
                      {acc.locationEntityName || '-'}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${acc.active
                        ? 'bg-success'
                        : 'bg-secondary'}`}
                    >
                      {acc.active ? t('common.active') : t('common.inactive')}
                    </span>
                  </td>
                  <td>
                    <Button
                      size='sm'
                      variant='outline-primary'
                      className='me-1'
                      onClick={() => handleShowModal(acc.id)}
                    >
                      {t('common.edit')}
                    </Button>
                    <Button
                      size='sm'
                      variant='outline-info'
                      className='me-1'
                      onClick={() => handleShowPermissionsModal(acc.id)}
                    >
                      {t('permissions.manage') || 'Permissions'}
                    </Button>
                    <Button
                      size='sm'
                      variant='outline-secondary'
                      className='me-1'
                      onClick={() => handleShowProfile(acc.id)}
                    >
                      {t('common.view')}
                    </Button>
                    <Button
                      size='sm'
                      variant='outline-danger'
                      onClick={() => handleDelete(acc.id)}
                    >
                      {t('common.delete')}
                    </Button>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Account Form Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size='lg' centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingUserId
              ? t('accounts.editAccount')
              : t('accounts.createAccount')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AccountForm
            userId={editingUserId}
            showModules={false}
            showSections={false}
            showActions={false}
            formId='account-form'
            onSuccess={() => {
              handleCloseModal()
              loadData()
            }}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={handleCloseModal}>
            {t('common.cancel')}
          </Button>
          <Button
            variant='primary'
            onClick={() => {
              const form = document.getElementById('account-form')
              if (form && form.requestSubmit) {
                form.requestSubmit()
              }
            }}
          >
            {t('common.save')}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Permissions Management Modal */}
      <Modal
        show={showPermissionsModal}
        onHide={handleClosePermissionsModal}
        size='lg'
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {t('permissions.managePermissions') || 'Manage Permissions'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <PermissionsAssignmentForm
            showUserSelect={false}
            selectedPermissions={selectedPermissionIds}
            onSelectedPermissionsChange={setSelectedPermissionIds}
            onPermissionsChange={setSelectedPermissionsCount}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={handleClosePermissionsModal}>
            {t('common.cancel')}
          </Button>
          <Button variant='primary' onClick={handleSavePermissions}>
            {t('common.save')} ({selectedPermissionsCount})
          </Button>
        </Modal.Footer>
      </Modal>

      {/* User Profile Modal */}
      <Modal show={showProfileModal} onHide={handleCloseProfile} size='lg'>
        <Modal.Header closeButton>
          <Modal.Title>
            {t('profile.userProfile')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {profileUserId && <UserProfile userId={profileUserId} />}
        </Modal.Body>
      </Modal>
    </Container>
  )
}

export default AccountComponent
