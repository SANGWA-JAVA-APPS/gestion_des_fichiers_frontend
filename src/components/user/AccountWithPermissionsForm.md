# AccountWithPermissionsForm Component

## Overview
The `AccountWithPermissionsForm` is an integrated component that combines user account management and permissions assignment in a single form. This component automatically handles user permissions based on the selected user ID and provides a seamless experience for both creating and editing users.

## Features

### ✅ Integrated Account & Permissions Management
- Single component handles both account details and permissions
- Automatic permission loading when editing existing users
- Smart permission defaults for new users based on current user's permissions

### ✅ Automatic Permission Handling
- **Create Mode**: Auto-selects permissions matching the current logged-in user
- **Edit Mode**: Automatically loads and displays the selected user's current permissions
- **Real-time Updates**: Changes are reflected immediately in the UI

### ✅ Smart Form Behavior
- Cascading dropdowns (Country → Location Entity → Module → Section)
- Form validation and error handling
- Loading states and user feedback

## Usage

### Basic Usage
```jsx
import { AccountWithPermissionsForm } from '../components/user';

// Create new user
<AccountWithPermissionsForm
  onSuccess={() => console.log('User created!')}
/>

// Edit existing user
<AccountWithPermissionsForm
  userId={123}
  onSuccess={() => console.log('User updated!')}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `userId` | `number` | `null` | User ID for editing. If null, creates new user |
| `showModules` | `boolean` | `false` | Show module selection field |
| `showSections` | `boolean` | `false` | Show section selection field |
| `showActions` | `boolean` | `true` | Show save/submit button |
| `formId` | `string` | `'account-permissions-form'` | HTML form ID |
| `onSuccess` | `function` | - | Callback when form is successfully submitted |

## Backend Integration

The component works with these backend endpoints:

### Account Management
- `GET /api/accounts/{id}` - Get user details
- `POST /api/accounts` - Create new user
- `PUT /api/accounts/{id}` - Update user

### Permissions Management
- `GET /api/accounts/permissions` - Get all available permissions
- `GET /api/accounts/{id}/permissions` - Get user's current permissions
- `PUT /api/accounts/{id}/permissions` - Update user's permissions

### Supporting Data
- `GET /api/account-categories` - Account categories
- `GET /api/countries` - Countries list
- `GET /api/location-entities` - Location entities

## Key Benefits

### 🎯 **Seamless User Experience**
- No need to switch between different forms or components
- Everything the user needs is in one place
- Automatic data loading and synchronization

### 🔄 **Automatic Permission Sync**
- When editing a user, their permissions are automatically loaded
- When creating a user, sensible defaults are applied
- No manual permission selection required unless desired

### 🛡️ **Data Consistency**
- Single source of truth for user data and permissions
- Atomic updates ensure data integrity
- Proper error handling and rollback

### 💡 **Smart Defaults**
- New users inherit permissions from the current user
- Reduces setup time and potential errors
- Maintains security best practices

## Example Implementation

```jsx
import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { AccountWithPermissionsForm } from '../components/user';

const UserManagement = () => {
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
    // Refresh user list
    loadUsers();
  };

  return (
    <div>
      <Button onClick={handleCreateUser}>Create User</Button>
      
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingUserId ? 'Edit User' : 'Create User'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AccountWithPermissionsForm
            userId={editingUserId}
            onSuccess={handleSuccess}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
};
```

## Migration from Separate Components

If you're currently using `AccountForm` and `PermissionsAssignmentForm` separately:

### Before
```jsx
// Old approach - separate components
<AccountForm userId={userId} onSuccess={handleAccountSuccess} />
<PermissionsAssignmentForm 
  selectedUserId={userId}
  onSelectedPermissionsChange={setPermissions}
/>
```

### After
```jsx
// New approach - integrated component
<AccountWithPermissionsForm 
  userId={userId} 
  onSuccess={handleSuccess} 
/>
```

## Component Structure

The component is organized into two main sections:

1. **Account Information Card**
   - Username, password, email, full name
   - Phone, gender, category, country
   - Location entity, modules, sections

2. **Permissions Assignment Card**
   - Search and filter permissions
   - Select all/none functionality
   - Real-time permission count
   - Scrollable permission list

## Error Handling

The component includes comprehensive error handling:
- Network request failures
- Validation errors
- Data loading errors
- Permission update failures

All errors are displayed to the user with clear, actionable messages.