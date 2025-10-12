import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { getCurrentUser, getAllUsers } from '../services/GetRequests';
import { updateUserProfile } from '../services/UpdRequests';
import { getUserInfo, isAdmin } from '../services/authUtils';

const UserComponent = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    gender: ''
  });

  const userInfo = getUserInfo();
  const isUserAdmin = isAdmin();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Get current user details
        const currentUserData = await getCurrentUser();
        setCurrentUser(currentUserData);
        
        // If admin, get all users
        if (isUserAdmin) {
          const allUsersData = await getAllUsers();
          setUsers(allUsersData);
        }
      } catch (err) {
        setError('Failed to load user data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isUserAdmin]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Get current user details
      const currentUserData = await getCurrentUser();
      setCurrentUser(currentUserData);
      
      // If admin, get all users
      if (isUserAdmin) {
        const allUsersData = await getAllUsers();
        setUsers(allUsersData);
      }
    } catch (err) {
      setError('Failed to load user data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (user = null) => {
    const targetUser = user || currentUser || userInfo;
    setEditingUser(targetUser);
    setFormData({
      fullName: targetUser.fullName || '',
      email: targetUser.email || '',
      phoneNumber: targetUser.phoneNumber || '',
      gender: targetUser.gender || ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      fullName: '',
      email: '',
      phoneNumber: '',
      gender: ''
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUserProfile(editingUser.id || editingUser.userId, formData);
      handleCloseModal();
      loadUserData();
    } catch (err) {
      setError('Failed to update user profile: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div>
      <Row className="mb-4">
        <Col>
          <h3>User Management</h3>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Current User Profile */}
      <Card className="mb-4">
        <Card.Header>
          <h5>My Profile</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <p><strong>Username:</strong> {userInfo?.username}</p>
              <p><strong>Full Name:</strong> {userInfo?.fullName}</p>
              <p><strong>Role:</strong> {userInfo?.role}</p>
            </Col>
            <Col md={6} className="text-md-end">
              <Button variant="primary" onClick={() => handleShowModal()}>
                Edit Profile
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* All Users (Admin only) */}
      {isUserAdmin && (
        <Card>
          <Card.Header>
            <h5>All Users</h5>
          </Card.Header>
          <Card.Body>
            {users.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted">No users found.</p>
              </div>
            ) : (
              <Table responsive striped hover>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.username}</td>
                      <td>{user.fullName}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`badge ${user.role === 'ADMIN' ? 'bg-danger' : 'bg-secondary'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${user.active ? 'bg-success' : 'bg-warning'}`}>
                          {user.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
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

      {/* Modal for Edit User */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit User Profile</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="Enter full name"
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
                placeholder="Enter email address"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Enter phone number"
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
              Update Profile
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default UserComponent;