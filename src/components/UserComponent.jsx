import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Button, Table, Modal, Form, Alert, Spinner, Badge } from 'react-bootstrap'
import {  getAllUsers,  getAccountById } from '../services/GetRequests'

import { updateUserProfile } from '../services/UpdRequests'
import { CurrentUserId, getUserInfo, isAdmin } from '../services/authUtils'

const UserComponent = ({ userId = null }) => {
  const [users, setUsers] = useState([])
  const [profileUser, setProfileUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    gender: ''
  })

  const authUser = getUserInfo()
  const admin = isAdmin()

const loadProfileUser = async () => {
  try {
    setLoading(true)
    setError('')

    let userData

    if (userId) {
      const response = await getAccountById(userId)
      userData = response.data || response
    } else {
      const response = await getAccountById(CurrentUserId)
      userData = response.data || response
    }

    setProfileUser(userData)

    if (admin) {
      const allUsers = await getAllUsers()
      setUsers(allUsers.data || allUsers)
    }
  } catch (err) {
    setError(err.message || 'Failed to load user profile')
  } finally {
    setLoading(false)
  }
}


  useEffect(() => {
    loadProfileUser()
  }, [userId, admin])

  const handleShowModal = (user = null) => {
    const target = user || profileUser

    if (!target) return

    setEditingUser(target)
    setFormData({
      fullName: target.fullName || '',
      email: target.email || '',
      phoneNumber: target.phoneNumber || '',
      gender: target.gender || ''
    })
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingUser(null)
    setFormData({
      fullName: '',
      email: '',
      phoneNumber: '',
      gender: ''
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!editingUser?.id) return

    try {
      await updateUserProfile(editingUser.id, formData)
      handleCloseModal()
      await loadProfileUser()
    } catch (err) {
      setError(err.message || 'Failed to update user profile')
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" role="status" />
      </div>
    )
  }

  return (
    <div className="container-fluid">
      <Row className="mb-4">
        <Col>
          <h3 className="fw-semibold">
            {userId ? 'User Profile' : 'My Profile'}
          </h3>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {profileUser && (
        <Card className="mb-4 shadow-sm">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <span className="fw-semibold">Profile Details</span>
            <Button variant="primary" size="sm" onClick={() => handleShowModal()}>
              Edit Profile
            </Button>
          </Card.Header>

          <Card.Body>
            <Row>
              <Col md={6}>
                <p><strong>Username:</strong> {profileUser.username}</p>
                <p><strong>Full Name:</strong> {profileUser.fullName}</p>
                <p><strong>Email:</strong> {profileUser.email}</p>
                <p><strong>Phone:</strong> {profileUser.phoneNumber || '-'}</p>
                <p><strong>Gender:</strong> {profileUser.gender || '-'}</p>
              </Col>

              <Col md={6}>
                <p>
                  <strong>Role:</strong>{' '}
                  <Badge bg={profileUser.categoryName === 'ADMIN' ? 'danger' : 'secondary'}>
                    {profileUser.categoryName}
                  </Badge>
                </p>

                <p>
                  <strong>Status:</strong>{' '}
                  <Badge bg={profileUser.active ? 'success' : 'warning'}>
                    {profileUser.active ? 'Active' : 'Inactive'}
                  </Badge>
                </p>

                {profileUser.sectionCategories?.length > 0 && (
                  <>
                    <strong>Section Categories:</strong>
                    <div className="mt-2 d-flex flex-wrap gap-2">
                      {profileUser.sectionCategories.map(sc => (
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
      )}

      {admin && !userId && (
        <Card className="shadow-sm">
          <Card.Header>
            <span className="fw-semibold">All Users</span>
          </Card.Header>

          <Card.Body>
            {users.length === 0 ? (
              <div className="text-center py-4 text-muted">
                No users found.
              </div>
            ) : (
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.username}</td>
                      <td>{user.fullName}</td>
                      <td>{user.email}</td>
                      <td>
                        <Badge bg={user.categoryName === 'ADMIN' ? 'danger' : 'secondary'}>
                          {user.categoryName}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={user.active ? 'success' : 'warning'}>
                          {user.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => handleShowModal(user)}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      )}

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit User Profile</Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={!admin && editingUser?.id !== authUser?.id}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Gender</Form.Label>
              <Form.Select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  )
}

export default UserComponent
