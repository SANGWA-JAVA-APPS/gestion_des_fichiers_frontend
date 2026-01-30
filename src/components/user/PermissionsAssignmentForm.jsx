/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Form, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';

import { apiClient } from '../../services/apiConfig';
import { getAllAccounts } from '../../services/GetRequests';
import UserProfile from './UserProfile';

const PermissionsAssignmentForm = ({
  onPermissionsChange,
  selectedPermissions: selectedPermissionsProp,
  onSelectedPermissionsChange,
  selectedUserId,
  onSelectedUserChange,
  showUserSelect = true
}) => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [permissions, setPermissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedPermissionsState, setSelectedPermissionsState] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const isControlled = Array.isArray(selectedPermissionsProp);
  const selectedPermissions = isControlled ? selectedPermissionsProp : selectedPermissionsState;
  const setSelectedPermissions = isControlled ? onSelectedPermissionsChange : setSelectedPermissionsState;

  // Get userId from URL params or props
  const userIdFromParams = searchParams.get('userId');
  const resolvedSelectedUser = userIdFromParams || selectedUserId || selectedUser;
  const setResolvedSelectedUser = onSelectedUserChange || setSelectedUser;

  useEffect(() => {
    loadData();
  }, []);

  // Notify parent component when permissions count changes
  useEffect(() => {
    if (onPermissionsChange) {
      onPermissionsChange(selectedPermissions.length);
    }
  }, [selectedPermissions, onPermissionsChange]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch all permissions from correct endpoint
      const permissionsRes = await apiClient.get('/accounts/permissions');
      console.log('Permissions response:', permissionsRes.data);
      // Backend returns array directly, not paginated
      const permissionsData = Array.isArray(permissionsRes.data) ? permissionsRes.data : [];
      setPermissions(permissionsData);


      // Fetch all users (accounts) using existing service
      if (showUserSelect) {
        const usersData = await getAllAccounts();
        console.log('Users response:', usersData);
        // getAllAccounts already extracts the data, check if it's an array or needs further extraction
        const accountsList = Array.isArray(usersData) ? usersData : (usersData?.data || []);
        setUsers(accountsList);
      }

    } catch (err) {
      console.error('Error loading permissions/users:', err);
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.message || err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Remove auto-selection of login user permissions - start with empty permissions for new users

  const handlePermissionChange = (permissionId) => {
    if (!setSelectedPermissions) return;
    setSelectedPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  useEffect(() => {
    const fetchSelectedUserPermissions = async () => {
      if (!resolvedSelectedUser) return;
      try {
        console.log("prestating to fetch  the permions for the user  ",resolvedSelectedUser)
        const response = await apiClient.get(`/accounts/${resolvedSelectedUser}/permissions`);
        console.log("fetched the permions for the user  ", response.data)
        const permissionsData = Array.isArray(response.data) ? response.data : [];
        const ids = permissionsData.map(permission => permission.id).filter(Boolean);
        setSelectedPermissions(ids);
      } catch (err) {
        console.error('Failed to load selected user permissions:', err);
      }
    };

    fetchSelectedUserPermissions();
  }, [resolvedSelectedUser, setSelectedPermissions, searchParams]);

  const handleSelectAll = (e) => {
    if (!setSelectedPermissions) return;
    if (e.target.checked) {
      setSelectedPermissions(filteredPermissions.map(p => p.id));
    } else {
      setSelectedPermissions([]);
    }
  };

  // Filter permissions based on search term
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
      
      {/* User Profile Display */}
      {resolvedSelectedUser && (
        <div className="mb-4">
          <h6 className="text-muted mb-2">{t('permissions.managingPermissionsFor') || 'Managing permissions for'}:</h6>
          <UserProfile userId={resolvedSelectedUser} compact={true} />
        </div>
      )}
      
      <Form>
        <Row>
          {showUserSelect && (
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <strong>{t('accounts.selectUser') || 'Select User'}</strong>
                </Form.Label>
                <Form.Select 
                  value={resolvedSelectedUser} 
                  onChange={(e) => setResolvedSelectedUser(e.target.value)}
                  size="lg"
                  className="form-select-sm-font"
                >
                  <option value="">{t('common.select') || 'Select...'}</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.fullName} ({user.email})
                    </option>
                  ))}
                </Form.Select>
                <Form.Text className="text-muted">
                  {resolvedSelectedUser ? `${t('common.selected')}: ${users.find(u => u.id === parseInt(resolvedSelectedUser))?.fullName}` : t('accounts.noUserSelected') || 'No user selected'}
                </Form.Text>
              </Form.Group>
            </Col>
          )}

          {/* Right Column - Permissions Selection */}
          <Col md={showUserSelect ? 6 : 12}>
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Form.Label className="mb-0">
                  <strong>{t('permissions.assignPermissions') || 'Assign Permissions'}</strong>
                </Form.Label>
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
              
              {/* Search Input */}
              <Form.Group className="mb-2">
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
            </div>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default PermissionsAssignmentForm;