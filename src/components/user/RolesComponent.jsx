import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { getAllRoles } from '../../services/GetRequests';
import { createRole } from '../../services/Inserts';
import { updateRole, deleteRole } from '../../services/UpdRequests';

const RolesComponent = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: '',
    level: 1,
    isSystemRole: false,
    status: 'ACTIVE'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const rolesData = await getAllRoles();
      setRoles(rolesData);
    } catch (err) {
      setError('Failed to load roles: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (role = null) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name || '',
        description: role.description || '',
        permissions: role.permissions || '',
        level: role.level || 1,
        isSystemRole: role.isSystemRole || false,
        status: role.status || 'ACTIVE'
      });
    } else {
      setEditingRole(null);
      setFormData({
        name: '',
        description: '',
        permissions: '',
        level: 1,
        isSystemRole: false,
        status: 'ACTIVE'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRole(null);
    setFormData({
      name: '',
      description: '',
      permissions: '',
      level: 1,
      isSystemRole: false,
      status: 'ACTIVE'
    });
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRole) {
        await updateRole(editingRole.id, formData);
      } else {
        await createRole(formData);
      }
      handleCloseModal();
      loadData();
    } catch (err) {
      setError('Failed to save role: ' + err.message);
    }
  };

  const handleDelete = async (roleId, isSystemRole) => {
    if (isSystemRole) {
      setError('Cannot delete system roles');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await deleteRole(roleId);
        loadData();
      } catch (err) {
        setError('Failed to delete role: ' + err.message);
      }
    }
  };

  const getPermissionBadges = (permissions) => {
    if (!permissions) return <span className="text-muted">No permissions</span>;
    
    const permArray = permissions.split(',').map(p => p.trim());
    return permArray.map((perm, index) => (
      <Badge key={index} bg="secondary" className="me-1">
        {perm}
      </Badge>
    ));
  };

  const getLevelBadge = (level) => {
    const levelColors = {
      1: 'danger',    // Admin
      2: 'warning',   // Manager
      3: 'info',      // User
      4: 'secondary', // Guest
    };
    
    const levelNames = {
      1: 'Admin',
      2: 'Manager', 
      3: 'User',
      4: 'Guest'
    };
    
    return (
      <Badge bg={levelColors[level] || 'secondary'}>
        Level {level} - {levelNames[level] || 'Custom'}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Container>
        <Row>
          <Col xs={12} className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h4>Role Management</h4>
          <p className="text-muted">Manage user roles and permissions</p>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => handleShowModal()}>
            <i className="fas fa-plus me-2"></i>
            Add New Role
          </Button>
        </Col>
      </Row>

      {error && (
        <Row className="mb-3">
          <Col xs={12}>
            <Alert variant="danger" dismissible onClose={() => setError('')}>
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      <Row>
        <Col xs={12}>
          <Card>
            <Card.Body>
              {roles.length === 0 ? (
                <Row>
                  <Col xs={12} className="text-center py-4">
                    <p className="text-muted">No roles found. Add your first role!</p>
                  </Col>
                </Row>
              ) : (
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>Role Name</th>
                      <th>Level</th>
                      <th>Status</th>
                      <th>Type</th>
                      <th>Permissions</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roles.sort((a, b) => (a.level || 0) - (b.level || 0)).map((role) => (
                      <tr key={role.id}>
                        <td>
                          <strong>{role.name}</strong>
                        </td>
                        <td>
                          {getLevelBadge(role.level)}
                        </td>
                        <td>
                          <span className={`badge ${role.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'}`}>
                            {role.status}
                          </span>
                        </td>
                        <td>
                          {role.isSystemRole ? (
                            <Badge bg="primary">System</Badge>
                          ) : (
                            <Badge bg="light" text="dark">Custom</Badge>
                          )}
                        </td>
                        <td>
                          {getPermissionBadges(role.permissions)}
                        </td>
                        <td>
                          <small className="text-muted">{role.description}</small>
                        </td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => handleShowModal(role)}
                            disabled={role.isSystemRole}
                          >
                            <i className="fas fa-edit"></i> Edit
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(role.id, role.isSystemRole)}
                            disabled={role.isSystemRole}
                          >
                            <i className="fas fa-trash"></i> Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal for Add/Edit Role */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingRole ? 'Edit Role' : 'Add New Role'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Container>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Role Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Enter role name"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Access Level</Form.Label>
                    <Form.Select
                      name="level"
                      value={formData.level}
                      onChange={handleChange}
                      required
                    >
                      <option value={1}>Level 1 - Admin</option>
                      <option value={2}>Level 2 - Manager</option>
                      <option value={3}>Level 3 - User</option>
                      <option value={4}>Level 4 - Guest</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="DEPRECATED">Deprecated</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3 d-flex align-items-center">
                    <Form.Check
                      type="checkbox"
                      name="isSystemRole"
                      checked={formData.isSystemRole}
                      onChange={handleChange}
                      label="System Role"
                      className="mt-4"
                    />
                    <Form.Text className="text-muted ms-2">
                      System roles cannot be deleted
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col xs={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Permissions</Form.Label>
                    <Form.Control
                      type="text"
                      name="permissions"
                      value={formData.permissions}
                      onChange={handleChange}
                      placeholder="e.g., READ, WRITE, DELETE, ADMIN (comma-separated)"
                    />
                    <Form.Text className="text-muted">
                      Enter permissions separated by commas (READ, WRITE, DELETE, ADMIN, etc.)
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col xs={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Enter role description and responsibilities"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Container>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingRole ? 'Update' : 'Create'} Role
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default RolesComponent;