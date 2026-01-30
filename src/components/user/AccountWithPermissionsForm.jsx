import React, { useState, useEffect } from 'react';
import { Form, Button, Spinner, Alert, Row, Col, Card } from 'react-bootstrap';
import { useLanguage } from '../../i18n/LanguageContext';
import { getUserInfo } from '../../services/authUtils';
import { apiClient } from '../../services/apiConfig';
import {
  getAccountById,
  getAllAccountCategories,
  getAllCountries,
  getModulesByLocationEntity,
  getSectionsByModule,
} from '../../services/GetRequests';
import { getAllLocationEntities, getLocationEntitiesByCountry } from '../../services/locationServices';
import { createAccount, updateAccountPermissions } from '../../services/Inserts';
import { updateAccount } from '../../services/UpdRequests';

const AccountWithPermissionsForm = ({
  userId = null,
  showModules = false,
  showSections = false,
  showActions = true,
  formId = 'account-permissions-form',
  onSuccess
}) => {
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  // Account form data
  const [formData, setFormData] = useState({
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
    sectionId: '',
  });

  // Permissions data
  const [permissions, setPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loginPermissionCodes, setLoginPermissionCodes] = useState([]);

  // Select options
  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);
  const [locationEntities, setLocationEntities] = useState([]);
  const [modules, setModules] = useState([]);
  const [sections, setSections] = useState([]);

  const normalizeList = (res) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.content)) return res.content;
    if (Array.isArray(res.data?.content)) return res.data.content;
    return [];
  };

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');

        // Load all required data in parallel
        const [catRes, countryRes, entitiesRes, permissionsRes] = await Promise.all([
          getAllAccountCategories(),
          getAllCountries({ page: 0, size: 200 }),
          getAllLocationEntities(),
          apiClient.get('/accounts/permissions')
        ]);

        setCategories(catRes);
        setCountries(countryRes.data || countryRes);
        setLocationEntities(normalizeList(entitiesRes));
        setPermissions(Array.isArray(permissionsRes.data) ? permissionsRes.data : []);

        // If editing, load user data and permissions
        if (userId) {
          const [userRes, userPermissionsRes] = await Promise.all([
            getAccountById(userId),
            apiClient.get(`/accounts/${userId}/permissions`)
          ]);

          const userData = userRes.data;
          setFormData({
            username: userData.username || '',
            password: '',
            email: userData.email || '',
            fullName: userData.fullName || '',
            phoneNumber: userData.phoneNumber || '',
            gender: userData.gender || '',
            categoryId: userData.categoryId || '',
            countryId: userData.countryId || '',
            locationEntityId: userData.locationEntityId || '',
            moduleId: '',
            sectionId: '',
          });

          // Set user permissions
          const userPermissions = Array.isArray(userPermissionsRes.data) ? userPermissionsRes.data : [];
          const permissionIds = userPermissions.map(p => p.id).filter(Boolean);
          setSelectedPermissions(permissionIds);

          // Load modules if needed
          if (userData.locationEntityId && showModules) {
            const mods = await getModulesByLocationEntity(userData.locationEntityId);
            setModules(mods);
          }
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId, showModules, showSections]);

  // Get login user permissions for default selection on create
  useEffect(() => {
    const userInfo = getUserInfo();
    const permissions = Array.isArray(userInfo?.permissions) ? userInfo.permissions : [];
    const codes = permissions.map(permission => permission?.code).filter(Boolean);
    setLoginPermissionCodes(codes);
  }, []);

  // Auto-select login user permissions for new accounts only (not when editing)
  useEffect(() => {
    if (!permissions.length || userId) return; // Don't auto-select if editing existing user
    if (selectedPermissions.length > 0) return; // Don't override existing selections

    // For new users, start with empty permissions - no auto-selection
    // This ensures clean slate for new account creation
  }, [permissions, selectedPermissions, userId]);

  // Handle location entities by country
  useEffect(() => {
    const loadEntitiesByCountry = async () => {
      if (!formData.countryId) {
        const allEntities = await getAllLocationEntities();
        setLocationEntities(normalizeList(allEntities));
        return;
      }
      const entities = await getLocationEntitiesByCountry(formData.countryId);
      setLocationEntities(normalizeList(entities));
    };

    loadEntitiesByCountry().catch(err => {
      console.error(err);
      setLocationEntities([]);
    });
  }, [formData.countryId]);

  // Handle modules by location entity
  useEffect(() => {
    const loadModules = async () => {
      if (!formData.locationEntityId) return setModules([]);
      const res = await getModulesByLocationEntity(formData.locationEntityId);
      setModules(res);
    };
    loadModules();
  }, [formData.locationEntityId]);

  // Handle sections by module
  useEffect(() => {
    const loadSections = async () => {
      if (!formData.moduleId) return setSections([]);
      const res = await getSectionsByModule(formData.moduleId);
      setSections(res);
    };
    loadSections();
  }, [formData.moduleId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear dependent fields
    if (name === 'countryId') {
      setFormData(prev => ({ ...prev, locationEntityId: '' }));
    }
    if (name === 'locationEntityId') {
      setFormData(prev => ({ ...prev, moduleId: '', sectionId: '' }));
    }
    if (name === 'moduleId') {
      setFormData(prev => ({ ...prev, sectionId: '' }));
    }
  };

  const handlePermissionChange = (permissionId) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedPermissions(filteredPermissions.map(p => p.id));
    } else {
      setSelectedPermissions([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');

      const payload = {
        username: formData.username,
        email: formData.email,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        gender: formData.gender,
        categoryId: Number(formData.categoryId),
        countryId: Number(formData.countryId),
        locationEntityId: Number(formData.locationEntityId),
        permissionIds: selectedPermissions
      };

      if (!userId) payload.password = formData.password;

      if (userId) {
        // Update account and permissions separately
        await updateAccount(userId, payload);
        await updateAccountPermissions(userId, selectedPermissions);
      } else {
        // Create account with permissions
        await createAccount(payload);
      }

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Error saving:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save account');
    } finally {
      setSaving(false);
    }
  };

  // Filter permissions based on search
  const filteredPermissions = permissions.filter(permission => {
    const search = searchTerm.toLowerCase();
    return (
      permission.name?.toLowerCase().includes(search) ||
      permission.code?.toLowerCase().includes(search) ||
      permission.description?.toLowerCase().includes(search)
    );
  });

  if (loading) return <Spinner animation="border" />;

  return (
    <>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form id={formId} onSubmit={handleSubmit}>
        {/* Account Information Section */}
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">{t('accounts.accountInformation') || 'Account Information'}</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-2">
                  <Form.Label>{t('accounts.username')}</Form.Label>
                  <Form.Control name="username" value={formData.username} onChange={handleChange} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                {!userId && (
                  <Form.Group className="mb-2">
                    <Form.Label>{t('accounts.password')}</Form.Label>
                    <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} required />
                  </Form.Group>
                )}
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-2">
                  <Form.Label>{t('accounts.fullName')}</Form.Label>
                  <Form.Control name="fullName" value={formData.fullName} onChange={handleChange} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-2">
                  <Form.Label>{t('accounts.email')}</Form.Label>
                  <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-2">
                  <Form.Label>{t('accounts.phone')}</Form.Label>
                  <Form.Control name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-2">
                  <Form.Label>{t('accounts.gender')}</Form.Label>
                  <Form.Select name="gender" value={formData.gender} onChange={handleChange}>
                    <option value="">{t('common.select')}</option>
                    <option value="male">{t('accounts.male')}</option>
                    <option value="female">{t('accounts.female')}</option>
                    <option value="not specified">{t('accounts.notSpecified')}</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-2">
                  <Form.Label>{t('accounts.category')}</Form.Label>
                  <Form.Select name="categoryId" value={formData.categoryId} onChange={handleChange} required>
                    <option value="">{t('accounts.selectCategory')}</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-2">
                  <Form.Label>{t('accounts.country')}</Form.Label>
                  <Form.Select name="countryId" value={formData.countryId} onChange={handleChange} required>
                    <option value="">{t('common.select')}</option>
                    {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

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
                {locationEntities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </Form.Select>
            </Form.Group>

            {showModules && (
              <Form.Group className="mb-2">
                <Form.Label>{t('accounts.module')}</Form.Label>
                <Form.Select name="moduleId" value={formData.moduleId} onChange={handleChange}>
                  <option value="">{t('common.select')}</option>
                  {modules.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </Form.Select>
              </Form.Group>
            )}

            {showSections && (
              <Form.Group className="mb-2">
                <Form.Label>{t('accounts.section')}</Form.Label>
                <Form.Select name="sectionId" value={formData.sectionId} onChange={handleChange} disabled={!sections.length}>
                  <option value="">{t('common.select')}</option>
                  {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </Form.Select>
              </Form.Group>
            )}
          </Card.Body>
        </Card>

        {/* Permissions Section */}
        <Card className="mb-4">
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">{t('permissions.assignPermissions') || 'Assign Permissions'}</h5>
              <div className="d-flex align-items-center gap-2">
                <Form.Check
                  type="checkbox"
                  id="select-all-permissions"
                  checked={selectedPermissions.length === filteredPermissions.length && filteredPermissions.length > 0}
                  onChange={handleSelectAll}
                />
                <label htmlFor="select-all-permissions" style={{ cursor: 'pointer', marginBottom: 0 }}>
                  {t('common.selectAll') || 'Select All'}
                </label>
              </div>
            </div>
          </Card.Header>
          <Card.Body>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                placeholder={t('common.search') || 'Search permissions...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Form.Group>
            
            <small className="text-muted d-block mb-3">
              {t('permissions.selected') || 'Selected'}: {selectedPermissions.length} / {filteredPermissions.length}
              {searchTerm && ` (${t('common.filtered') || 'filtered from'} ${permissions.length})`}
            </small>

            {filteredPermissions.length === 0 ? (
              <Alert variant="info">
                {searchTerm 
                  ? (t('common.noResults') || 'No permissions match your search')
                  : (t('permissions.noPermissions') || 'No permissions available')
                }
              </Alert>
            ) : (
              <div style={{ height: '200px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '4px', padding: '10px' }}>
                {filteredPermissions.map(permission => (
                  <Form.Check
                    key={permission.id}
                    type="checkbox"
                    id={`permission-${permission.id}`}
                    label={`${permission.name} (${permission.code})`}
                    checked={selectedPermissions.includes(permission.id)}
                    onChange={() => handlePermissionChange(permission.id)}
                    className="mb-2"
                  />
                ))}
              </div>
            )}
          </Card.Body>
        </Card>

        {showActions && (
          <div className="d-flex justify-content-end">
            <Button type="submit" disabled={saving} variant="primary">
              {saving ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  {t('common.saving') || 'Saving...'}
                </>
              ) : (
                userId ? (t('common.update') || 'Update') : (t('common.create') || 'Create')
              )}
            </Button>
          </div>
        )}
      </Form>
    </>
  );
};

export default AccountWithPermissionsForm;