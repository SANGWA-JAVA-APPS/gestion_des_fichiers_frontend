import React, { useState, useEffect } from 'react';
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
} from 'react-bootstrap';

import { getAllAccounts, getAllAccountCategories } from '../../services/GetRequests';
import { createAccount } from '../../services/Inserts';
import { updateAccount, deleteAccount } from '../../services/UpdRequests';

const AccountComponent = () => {
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    fullName: '',
    phoneNumber: '',
    gender: '',
    categoryId: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [accountsRes, categoriesRes] = await Promise.all([
        getAllAccounts(),
        getAllAccountCategories()
      ]);
      console.log("the accountsRes ",accountsRes)
      setAccounts(accountsRes);
      setCategories(categoriesRes);
    } catch (err) {
      console.log("Failed to load data",err)
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (account = null) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        username: account.username,
        password: '',
        email: account.email,
        fullName: account.fullName,
        phoneNumber: account.phoneNumber,
        gender: account.gender || '',
        categoryId: account.accountCategory.id
      });
    } else {
      setEditingAccount(null);
      setFormData({
        username: '',
        password: '',
        email: '',
        fullName: '',
        phoneNumber: '',
        gender: '',
        categoryId: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAccount(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      username: formData.username,
      email: formData.email,
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber,
      gender: formData.gender,
      categoryId: Number(formData.categoryId)
    };

    if (!editingAccount) {
      payload.password = formData.password;
    }

    try {
      if (editingAccount) {
        await updateAccount(editingAccount.id, payload);
      } else {
        await createAccount(payload);
      }
      handleCloseModal();
      loadData();
    } catch (err) {
      console.log("Failed to save account",err)
      setError('Failed to save account');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this account?')) return;
    try {
      await deleteAccount(id);
      loadData();
    } catch (err) {
      console.log("Failed to delete account",err)
      setError('Failed to delete account');
    }
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h4>Account Management</h4>
          <p className="text-muted">Manage user accounts</p>
        </Col>
        <Col xs="auto">
          <Button onClick={() => handleShowModal()}>Add Account</Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Category</th>
                <th>Status</th>
                <th width="140">Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((acc) => (
                <tr key={acc.id}>
                  <td>{acc.fullName}</td>
                  <td>{acc.email}</td>
                  <td>{acc.phoneNumber}</td>
                  <td>
                    <span className="badge bg-info">
                      {acc.accountCategory?.name}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${acc.active ? 'bg-success' : 'bg-secondary'}`}>
                      {acc.active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td>
                    <Button size="sm" variant="outline-primary" onClick={() => handleShowModal(acc)}>
                      Edit
                    </Button>{' '}
                    <Button size="sm" variant="outline-danger" onClick={() => handleDelete(acc.id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editingAccount ? 'Edit Account' : 'Create Account'}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Form.Group className="mb-2">
              <Form.Label>Username</Form.Label>
              <Form.Control name="username" value={formData.username} onChange={handleChange} required />
            </Form.Group>

            {!editingAccount && (
              <Form.Group className="mb-2">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            )}

            <Form.Group className="mb-2">
              <Form.Label>Full Name</Form.Label>
              <Form.Control name="fullName" value={formData.fullName} onChange={handleChange} required />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Phone</Form.Label>
              <Form.Control name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Gender</Form.Label>
              <Form.Select name="gender" value={formData.gender} onChange={handleChange}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="not specified">Not specified</option>
              </Form.Select>
            </Form.Group>

            <Form.Group>
              <Form.Label>Category</Form.Label>
              <Form.Select name="categoryId" value={formData.categoryId} onChange={handleChange} required>
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit">Save</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default AccountComponent;
