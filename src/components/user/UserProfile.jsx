import React, { useEffect, useState } from 'react'
import {
  Row,
  Col,
  Card,
  Button,
  Alert,
  Spinner,
  Badge,
  Form,
  Modal
} from 'react-bootstrap'

import {
  getAccountById,
  getAllSectionCategories,
  updateUserSections
} from '../../services/GetRequests'

import { getUserSections } from '../../services/Inserts'
import { CurrentUserId, isAdmin } from '../../services/authUtils'
import { useLanguage } from '../../i18n/LanguageContext'
import AccountForm from './AccountForm'


const UserProfile = ({ userId = null }) => {
  const resolvedUserId = userId || CurrentUserId
  const admin = isAdmin()
  const { t } = useLanguage()

  const [profileUser, setProfileUser] = useState(null)
  const [assignedSections, setAssignedSections] = useState([])
  const [allSections, setAllSections] = useState([])
  const [selectedSectionIds, setSelectedSectionIds] = useState([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [showEditModal, setShowEditModal] = useState(false)

  const isOwner = resolvedUserId === CurrentUserId

  const loadUserProfile = async () => {
    try {
      setLoading(true)
      setError('')
      setSuccess('')

      const [userRes, sectionsRes, allSectionsRes] = await Promise.all([
        getAccountById(resolvedUserId),
        getUserSections(resolvedUserId),
        getAllSectionCategories()
      ])

      const user = userRes.data || userRes
      const assigned = sectionsRes.data || sectionsRes
      const all = allSectionsRes.data || allSectionsRes

      setProfileUser(user)
      setAssignedSections(assigned)
      setAllSections(all)
      setSelectedSectionIds(assigned.map(s => s.id))
    } catch (err) {
      setError(err.message || t('errors.loadProfile'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUserProfile()
  }, [resolvedUserId])

  const handleToggleSection = (sectionId) => {
    setSelectedSectionIds(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const handleSaveSections = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      await updateUserSections(resolvedUserId, selectedSectionIds)

      setSuccess(t('profile.sectionsUpdated'))
      await loadUserProfile()
    } catch (err) {
      setError(err.message || t('errors.updateSections'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" role="status" />
      </div>
    )
  }

  if (!profileUser) {
    return (
      <Alert variant="danger">
        {t('errors.profileNotFound')}
      </Alert>
    )
  }

  return (
    <>
      <div className="container-fluid px-2">
        <Row className="mb-3 align-items-center">
          <Col>
            <h5 className="fw-semibold mb-0">
              {userId ? t('profile.userProfile') : t('profile.myProfile')}
            </h5>
          </Col>

          {(admin || isOwner) && (
            <Col className="text-end">
              <Button
                size="sm"
                variant="outline-primary"
                onClick={() => setShowEditModal(true)}
              >
                {t('profile.editProfile')}
              </Button>
            </Col>
          )}
        </Row>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" dismissible onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Profile details */}
        <Card className="mb-3 shadow-sm">
          <Card.Body>
            <Row>
              <Col md={6}>
                <p><strong>{t('profile.username')}:</strong> {profileUser.username}</p>
                <p><strong>{t('profile.fullName')}:</strong> {profileUser.fullName}</p>
                <p><strong>{t('profile.email')}:</strong> {profileUser.email}</p>
                <p><strong>{t('profile.phone')}:</strong> {profileUser.phoneNumber || '-'}</p>
                <p><strong>{t('profile.gender')}:</strong> {profileUser.gender || '-'}</p>
              </Col>

              <Col md={6}>
                <p>
                  <strong>{t('profile.role')}:</strong>{' '}
                  <Badge bg={profileUser.categoryName === 'ADMIN' ? 'danger' : 'secondary'}>
                    {profileUser.categoryName}
                  </Badge>
                </p>

                <p>
                  <strong>{t('profile.status')}:</strong>{' '}
                  <Badge bg={profileUser.active ? 'success' : 'warning'}>
                    {profileUser.active ? t('common.active') : t('common.inactive')}
                  </Badge>
                </p>

                {assignedSections.length > 0 && (
                  <>
                    <strong>{t('profile.assignedSections')}:</strong>
                    <div className="mt-2 d-flex flex-wrap gap-2">
                      {assignedSections.map(sc => (
                        <Badge key={sc.id} bg="info">
                          {sc.name}
                        </Badge>
                      ))}
                    </div>
                  </>
                )}
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Section management – ADMIN only */}
        {admin && (
          <Card className="shadow-sm">
            <Card.Header>
              <span className="fw-semibold">
                {t('profile.manageSections')}
              </span>
            </Card.Header>

            <Card.Body>
              {allSections.length === 0 ? (
                <div className="text-muted">
                  {t('profile.noSections')}
                </div>
              ) : (
                <Form>
                  <Row>
                    {allSections.map(section => (
                      <Col md={4} key={section.id} className="mb-2">
                        <Form.Check
                          type="checkbox"
                          id={`section-${section.id}`}
                          label={section.name}
                          checked={selectedSectionIds.includes(section.id)}
                          onChange={() => handleToggleSection(section.id)}
                        />
                      </Col>
                    ))}
                  </Row>

                  <div className="d-flex justify-content-end mt-3">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={handleSaveSections}
                      disabled={saving}
                    >
                      {saving
                        ? t('common.saving')
                        : t('profile.saveSections')}
                    </Button>
                  </div>
                </Form>
              )}
            </Card.Body>
          </Card>
        )}
      </div>

      {/* Edit profile modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        size="lg"
        centered
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {t('profile.editProfile')}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <AccountForm
            userId={resolvedUserId}
            onSuccess={() => {
              setShowEditModal(false)
              loadUserProfile()
            }}
          />
        </Modal.Body>
      </Modal>
    </>
  )
}

export default UserProfile
