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
import { useLanguage } from '../../i18n/LanguageContext';

const AccountComponent = () => {
  const { t, language } = useLanguage(); // Get translation function and current language
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
      console.log("the accountsRes ", accountsRes);
      setAccounts(accountsRes);
      setCategories(categoriesRes);
    } catch (err) {
      console.log("Failed to load data", err);
      setError(t('accounts.errorLoading'));
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
      console.log("Failed to save account", err);
      setError(t('accounts.errorSaving'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('accounts.deleteConfirm'))) return;
    try {
      await deleteAccount(id);
      loadData();
    } catch (err) {
      console.log("Failed to delete account", err);
      setError(t('accounts.errorDeleting'));
    }
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" />
        <p className="mt-2">{t('common.loading')}</p>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h4>{t('accounts.management')}</h4>
          <p className="text-muted">{t('accounts.subtitle')}</p>
        </Col>
        <Col xs="auto">
          <Button onClick={() => handleShowModal()}>{t('accounts.addAccount')}</Button>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>{t('accounts.fullName')}</th>
                <th>{t('accounts.email')}</th>
                <th>{t('accounts.phone')}</th>
                <th>{t('accounts.category')}</th>
                <th>{t('common.status')}</th>
                <th width="140">{t('accounts.actions')}</th>
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
                      {acc.active ? t('common.active') : t('common.inactive')}
                    </span>
                  </td>
                  <td>
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() => handleShowModal(acc)}
                      className="me-1"
                    >
                      {t('common.edit')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleDelete(acc.id)}
                    >
                      {t('common.delete')}
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
              {editingAccount ? t('accounts.editAccount') : t('accounts.createAccount')}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Form.Group className="mb-2">
              <Form.Label>{t('accounts.username')}</Form.Label>
              <Form.Control
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder={language === 'fr' ? "Entrez le nom d'utilisateur" : "Enter username"}
              />
            </Form.Group>

            {!editingAccount && (
              <Form.Group className="mb-2">
                <Form.Label>{t('accounts.password')}</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder={language === 'fr' ? "Entrez le mot de passe" : "Enter password"}
                />
              </Form.Group>
            )}

            <Form.Group className="mb-2">
              <Form.Label>{t('accounts.fullName')}</Form.Label>
              <Form.Control
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder={language === 'fr' ? "Entrez le nom complet" : "Enter full name"}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>{t('accounts.email')}</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder={language === 'fr' ? "Entrez l'adresse email" : "Enter email address"}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>{t('accounts.phone')}</Form.Label>
              <Form.Control
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder={language === 'fr' ? "Entrez le numéro de téléphone" : "Enter phone number"}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>{t('accounts.gender')}</Form.Label>
              <Form.Select name="gender" value={formData.gender} onChange={handleChange}>
                <option value="">{t('common.select')}</option>
                <option value="male">{t('accounts.male')}</option>
                <option value="female">{t('accounts.female')}</option>
                <option value="not specified">{t('accounts.notSpecified')}</option>
              </Form.Select>
            </Form.Group>

            <Form.Group>
              <Form.Label>{t('accounts.category')}</Form.Label>
              <Form.Select name="categoryId" value={formData.categoryId} onChange={handleChange} required>
                <option value="">{t('accounts.selectCategory')}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              {t('common.cancel')}
            </Button>
            <Button type="submit">
              {t('common.save')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default AccountComponent;