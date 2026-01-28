import React, { useState, useEffect } from 'react';
import { Form, Button, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { useLanguage } from '../../i18n/LanguageContext';
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

const AccountForm = ({
  userId = null,
  showModules = false,
  showSections = false,
  showActions = true,
  formId = 'account-form',
  permissionIds = [],
  onSuccess
}) => {
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
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

  // Internal storage for select options
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

  // Load base data + user data if editing
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Fetch categories + countries + entities in parallel
        const [catRes, countryRes, entitiesRes] = await Promise.all([
          getAllAccountCategories(),
          getAllCountries({ page: 0, size: 200 }),
          getAllLocationEntities(),
        ]);
        setCategories(catRes);
        setCountries(countryRes.data || countryRes);
        setLocationEntities(normalizeList(entitiesRes));

        // If editing, fetch user details
        if (userId) {
          const userRes = await getAccountById(userId);
          const userData = userRes.data;

          // Prefill form
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
            moduleId: '', // if needed, can map from sectionCategories
            sectionId: '',
          });

          // Entities are already loaded above, no need to reload
          if (userData.locationEntityId && showModules) {
            const mods = await getModulesByLocationEntity(userData.locationEntityId);
            setModules(mods);
          }
          if (showSections && userData.moduleId) {
            const secs = await getSectionsByModule(userData.moduleId);
            setSections(secs);
          }
        }
      } catch (err) {
        console.error(err);
        setError(t('accounts.errorLoading'));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId, showModules, showSections]); // Removed t from dependencies

  // Reload location entities when country changes (filter by country when possible)
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

  useEffect(() => {
    const loadModules = async () => {
      if (!formData.locationEntityId) return setModules([]);
      const res = await getModulesByLocationEntity(formData.locationEntityId);
      setModules(res);
    };
    loadModules();
  }, [formData.locationEntityId]);

  useEffect(() => {
    const loadSections = async () => {
      if (!formData.moduleId) return setSections([]);
      const res = await getSectionsByModule(formData.moduleId);
      setSections(res);
    };
    loadSections();
  }, [formData.moduleId]);

  // Internal handleChange
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('handleChange:', name, '=', value);
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear dependent fields
    if (name === 'countryId') {
      console.log('Country changed, clearing location entity');
      setFormData(prev => ({ ...prev, locationEntityId: '' }));
    }
    if (name === 'locationEntityId') setFormData(prev => ({ ...prev, moduleId: '', sectionId: '' }));
    if (name === 'moduleId') setFormData(prev => ({ ...prev, sectionId: '' }));
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        username: formData.username,
        email: formData.email,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        gender: formData.gender,
        categoryId: Number(formData.categoryId),
        countryId: Number(formData.countryId),
        locationEntityId: Number(formData.locationEntityId),
      };
      if (Array.isArray(permissionIds) && permissionIds.length > 0) {
        payload.permissionIds = permissionIds;
      }
      if (!userId) payload.password = formData.password;

      if (userId) {
        await updateAccount(userId, payload);
        if (Array.isArray(permissionIds) && permissionIds.length > 0) {
          await updateAccountPermissions(userId, permissionIds);
        }
      } else {
        await createAccount(payload);
      }

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      setError(t('accounts.errorSaving'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form id={formId} onSubmit={handleSubmit}>
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
              {/* Debug info */}
              <small className="text-muted d-block mt-1">
                Debug:  countries={countries.length}, selected={formData.countryId || 'none'}
              </small>
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
          {/* Debug info */}
           
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

        {showActions && (
          <Button type="submit" disabled={saving}>
            {saving ? <Spinner animation="border" size="sm" /> : t('common.save')}
          </Button>
        )}
      </Form>
    </>
  );
};

export default AccountForm;
