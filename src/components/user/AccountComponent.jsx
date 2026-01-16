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


import { getAllAccounts, getAllAccountCategories, getAllCountries, getLocationEntitiesByCountry, getModulesByLocationEntity, getSectionsByModule } from '../../services/GetRequests';
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
  const [countries, setCountries] = useState([]);
const [locationEntities, setLocationEntities] = useState([]);
const [modules, setModules] = useState([]);
const [sections, setSections] = useState([]);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    fullName: '',
    phoneNumber: '',
    gender: '',
    categoryId: '',
      countryId: '',        // NEW
  locationEntityId: '', // NEW
  moduleId: '',         // NEW
  sectionId: '' 
  });

  useEffect(() => {
  const loadCountries = async () => {
    try {
      const res = await getAllCountries({ page: 0, size: 200 }); // adjust size/page
      setCountries(res.data || res); // handle pageable response
    } catch (err) {
      console.error('Failed to load countries', err);
    }
  };
  loadCountries();
  }, []);
  
  
  // When country changes → load entities
useEffect(() => {
  if (!formData.countryId) {
    setLocationEntities([]);
    setFormData(prev => ({ ...prev, locationEntityId: '', moduleId: '', sectionId: '' }));
    return;
  }
  const loadEntities = async () => {
    try {
      const res = await getLocationEntitiesByCountry(formData.countryId);
      setLocationEntities(res);
    } catch (err) {
      console.error(err);
    }
  };
  loadEntities();
}, [formData.countryId]);

// When entity changes → load modules
useEffect(() => {
  if (!formData.locationEntityId) {
    setModules([]);
    setFormData(prev => ({ ...prev, moduleId: '', sectionId: '' }));
    return;
  }
  const loadModules = async () => {
    try {
      const res = await getModulesByLocationEntity
        (formData.locationEntityId);
      setModules(res);
    } catch (err) {
      console.error(err);
    }
  };
  loadModules();
}, [formData.locationEntityId]);

// When module changes → load sections
useEffect(() => {
  if (!formData.moduleId) {
    setSections([]);
    setFormData(prev => ({ ...prev, sectionId: '' }));
    return;
  }
  const loadSections = async () => {
    try {
      const res = await getSectionsByModule(formData.moduleId);
      setSections(res);
    } catch (err) {
      console.error(err);
    }
  };
  loadSections();
}, [formData.moduleId]);


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
    setAccounts(accountsRes|| []);

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
      username: account.username ?? '',
      password: '',
      email: account.email ?? '',
      fullName: account.fullName ?? '',
      phoneNumber: account.phoneNumber ?? '',
      gender: account.gender ?? '',
      categoryId: account.categoryId ?? '',
      countryId: account.countryId ?? '',
      locationEntityId: account.locationEntityId ?? '',
      moduleId: '',
      sectionId: ''
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
      categoryId: '',
      countryId: '',
      locationEntityId: '',
      moduleId: '',
      sectionId: ''
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
      categoryId: Number(formData.categoryId),
        countryId: Number(formData.countryId),            // NEW
  locationEntityId: Number(formData.locationEntityId),
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
                <th>{t('accounts.country')}</th> 
                    <th>{t('accounts.locationEntity')}</th>
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
                {acc.categoryName}
                    </span>
                  </td>
                  
                   <td>
        <span className="badge bg-secondary">
          {acc.countryName || '-'}
        </span>
                  </td>
                  
                  
      <td>
        <span className="badge bg-warning text-dark">
          {acc.locationEntityName || '-'}
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
            
            <Form.Group className="mb-2">
  <Form.Label>{t('accounts.country')}</Form.Label>
  <Form.Select
    name="countryId"
    value={formData.countryId}
    onChange={handleChange}
    required
  >
    <option value="">{t('common.select')}</option>
    {countries.map(c => (
      <option key={c.id} value={c.id}>{c.name}</option>
    ))}
  </Form.Select>
</Form.Group>

<Form.Group className="mb-2">
  <Form.Label>{t('accounts.locationEntity')}</Form.Label>
  <Form.Select
    name="locationEntityId"
    value={formData.locationEntityId}
    onChange={handleChange}
    required
    disabled={!locationEntities.length}
  >
    <option value="">{t('common.select')}</option>
    {locationEntities.map(e => (
      <option key={e.id} value={e.id}>{e.name}</option>
    ))}
  </Form.Select>
</Form.Group>

{/* <Form.Group className="mb-2">
  <Form.Label>{t('accounts.module')}</Form.Label>
  <Form.Select
    name="moduleId"
    value={formData.moduleId}
    onChange={handleChange}
    disabled={!modules.length}
  >
    <option value="">{t('common.select')}</option>
    {modules.map(m => (
      <option key={m.id} value={m.id}>{m.name}</option>
    ))}
  </Form.Select>
</Form.Group> */}

{/* <Form.Group className="mb-2">
  <Form.Label>{t('accounts.section')}</Form.Label>
  <Form.Select
    name="sectionId"
    value={formData.sectionId}
    onChange={handleChange}
    disabled={!sections.length}
  >
    <option value="">{t('common.select')}</option>
    {sections.map(s => (
      <option key={s.id} value={s.id}>{s.name}</option>
    ))}
  </Form.Select>
</Form.Group> */}

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