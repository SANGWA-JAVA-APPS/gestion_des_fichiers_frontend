import React, { useState, useEffect } from 'react';
import { Form, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { useLanguage } from '../../i18n/LanguageContext';
import { apiClient } from '../../services/apiConfig';
import { getAllAccounts } from '../../services/GetRequests';

const PermissionsAssignmentForm = ({ onPermissionsChange }) => {
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [permissions, setPermissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

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
      const usersData = await getAllAccounts();
      console.log('Users response:', usersData);
      // getAllAccounts already extracts the data, check if it's an array or needs further extraction
      const accountsList = Array.isArray(usersData) ? usersData : (usersData?.data || []);
      setUsers(accountsList);

    } catch (err) {
      console.error('Error loading permissions/users:', err);
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.message || err.message || 'Failed to load data');
    } finally {
      setLoading(false);
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
      
      <Form>
        {/* User Selection */}
        <Form.Group className="mb-3">
          <Form.Label>
            <strong>{t('accounts.selectUser') || 'Select User'}</strong>
          </Form.Label>
          <Form.Select 
            value={selectedUser} 
            onChange={(e) => setSelectedUser(e.target.value)}
            size="lg"
          >
            <option value="">{t('common.select') || 'Select...'}</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.fullName} ({user.email})
              </option>
            ))}
          </Form.Select>
          <Form.Text className="text-muted">
            {selectedUser ? `${t('common.selected')}: ${users.find(u => u.id === parseInt(selectedUser))?.fullName}` : t('accounts.noUserSelected') || 'No user selected'}
          </Form.Text>
        </Form.Group>

        <hr />

        {/* Permissions Selection */}
        <Row>
          <Col md={6}>
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Form.Label className="mb-0">
                  <strong>{t('permissions.assignPermissions') || 'Assign Permissions'}</strong>
                </Form.Label>
                <Form.Check
                  type="checkbox"
                  label={t('common.selectAll') || 'Select All'}
                  checked={selectedPermissions.length === filteredPermissions.length && filteredPermissions.length > 0}
                  onChange={handleSelectAll}
                />
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
                <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '4px', padding: '10px' }}>
                  {filteredPermissions.map((permission) => (
                    <div key={permission.id} className="mb-2">
                    <Form.Check
                      type="checkbox"
                      id={`permission-${permission.id}`}
                      label={
                        <div>
                          <strong>{permission.name}</strong>
                          {permission.code && (
                            <span className="text-muted ms-2">
                              <code>{permission.code}</code>
                            </span>
                          )}
                          {permission.description && (
                            <div className="small text-muted">
                              {permission.description}
                            </div>
                          )}
                        </div>
                      }
                      checked={selectedPermissions.includes(permission.id)}
                      onChange={() => handlePermissionChange(permission.id)}
                    />
                  </div>
                  ))}
                </div>
              )}
            </div>
          </Col>
        </Row>

        {/* Debug Info */}
        <small className="text-muted d-block mt-3">
          Debug: user={selectedUser || 'none'}, permissions={selectedPermissions.length} selected
        </small>
      </Form>
    </>
  );
};

export default PermissionsAssignmentForm;
