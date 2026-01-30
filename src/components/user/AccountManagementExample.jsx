import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { AccountWithPermissionsForm } from './index';

const AccountManagementExample = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

  const handleCreateUser = () => {
    setEditingUserId(null);
    setShowModal(true);
  };

  const handleEditUser = (userId) => {
    setEditingUserId(userId);
    setShowModal(true);
  };

  const handleSuccess = () => {
    setShowModal(false);
    setEditingUserId(null);
    // Refresh your user list here
    console.log('User saved successfully!');
  };

  return (
    <div>
      <Button variant="primary" onClick={handleCreateUser}>
        Create New User
      </Button>
      
      <Button variant="secondary" onClick={() => handleEditUser(123)} className="ms-2">
        Edit User (ID: 123)
      </Button>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingUserId ? 'Edit User' : 'Create New User'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AccountWithPermissionsForm
            userId={editingUserId}
            onSuccess={handleSuccess}
            showModules={false}
            showSections={false}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AccountManagementExample;