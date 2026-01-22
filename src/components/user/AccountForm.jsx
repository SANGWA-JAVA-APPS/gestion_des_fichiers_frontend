import React, { useState, useEffect } from 'react';
import { Form, Button, Spinner, Alert } from 'react-bootstrap';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  getAccountById,
  getAllAccountCategories,
  getAllCountries,
  getLocationEntitiesByCountry,
  getModulesByLocationEntity,
  getSectionsByModule,
} from '../../services/GetRequests';
import { createAccount } from '../../services/Inserts';
import { updateAccount } from '../../services/UpdRequests';

const AccountForm = ({ userId = null, showModules = false, showSections = false, onSuccess }) => {
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

  // Load base data + user data if editing
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Fetch categories + countries in parallel
        const [catRes, countryRes] = await Promise.all([
          getAllAccountCategories(),
          getAllCountries({ page: 0, size: 200 }),
        ]);
        setCategories(catRes);
        setCountries(countryRes.data || countryRes);

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

          // Load dependent selects automatically
          if (userData.countryId) {
            const entities = await getLocationEntitiesByCountry(userData.countryId);
            setLocationEntities(entities);
          }
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
  }, [userId, showModules, showSections, t]);

  // Dependent selects on change
  useEffect(() => {
    const loadEntities = async () => {
      if (!formData.countryId) return setLocationEntities([]);
      const res = await getLocationEntitiesByCountry(formData.countryId);
      setLocationEntities(res);
    };
    loadEntities();
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
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear dependent fields
    if (name === 'countryId') setFormData(prev => ({ ...prev, locationEntityId: '', moduleId: '', sectionId: '' }));
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
      if (!userId) payload.password = formData.password;

      if (userId) {
        await updateAccount(userId, payload);
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
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-2">
          <Form.Label>{t('accounts.username')}</Form.Label>
          <Form.Control name="username" value={formData.username} onChange={handleChange} required />
        </Form.Group>

        {!userId && (
          <Form.Group className="mb-2">
            <Form.Label>{t('accounts.password')}</Form.Label>
            <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} required />
          </Form.Group>
        )}

        <Form.Group className="mb-2">
          <Form.Label>{t('accounts.fullName')}</Form.Label>
          <Form.Control name="fullName" value={formData.fullName} onChange={handleChange} required />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>{t('accounts.email')}</Form.Label>
          <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>{t('accounts.phone')}</Form.Label>
          <Form.Control name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
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

        <Form.Group className="mb-2">
          <Form.Label>{t('accounts.category')}</Form.Label>
          <Form.Select name="categoryId" value={formData.categoryId} onChange={handleChange} required>
            <option value="">{t('accounts.selectCategory')}</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>{t('accounts.country')}</Form.Label>
          <Form.Select name="countryId" value={formData.countryId} onChange={handleChange} required>
            <option value="">{t('common.select')}</option>
            {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
            {locationEntities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </Form.Select>
        </Form.Group>

        {showModules && (
          <Form.Group className="mb-2">
            <Form.Label>{t('accounts.module')}</Form.Label>
            <Form.Select name="moduleId" value={formData.moduleId} onChange={handleChange} disabled={!modules.length}>
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

        <Button type="submit" disabled={saving}>
          {saving ? <Spinner animation="border" size="sm" /> : t('common.save')}
        </Button>
      </Form>
    </>
  );
};

export default AccountForm;
