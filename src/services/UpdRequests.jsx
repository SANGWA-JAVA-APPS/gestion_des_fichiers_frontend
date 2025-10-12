import { apiClient } from './apiConfig';

// Update user profile
export const updateUserProfile = async (userId, userData) => {
  try {
    const response = await apiClient.put(`/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error('Update user profile error:', error);
    throw error.response?.data || { message: 'Failed to update user profile' };
  }
};

// Update file information
export const updateFile = async (fileId, fileData) => {
  try {
    const response = await apiClient.put(`/files/${fileId}`, fileData);
    return response.data;
  } catch (error) {
    console.error('Update file error:', error);
    throw error.response?.data || { message: 'Failed to update file' };
  }
};

// Update document
export const updateDocument = async (documentId, documentData) => {
  try {
    const response = await apiClient.put(`/documents/${documentId}`, documentData);
    return response.data;
  } catch (error) {
    console.error('Update document error:', error);
    throw error.response?.data || { message: 'Failed to update document' };
  }
};

// Update location
export const updateLocation = async (locationId, locationData) => {
  try {
    const response = await apiClient.put(`/locations/${locationId}`, locationData);
    return response.data;
  } catch (error) {
    console.error('Update location error:', error);
    throw error.response?.data || { message: 'Failed to update location' };
  }
};

// Update user password
export const updateUserPassword = async (passwordData) => {
  try {
    const response = await apiClient.put('/auth/change-password', passwordData);
    return response.data;
  } catch (error) {
    console.error('Update password error:', error);
    throw error.response?.data || { message: 'Failed to update password' };
  }
};

// Logout user (clear tokens)
export const logoutUser = async () => {
  try {
    // Call backend logout endpoint if needed
    await apiClient.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userInfo');
  }
};

// Delete file
export const deleteFile = async (fileId) => {
  try {
    const response = await apiClient.delete(`/files/${fileId}`);
    return response.data;
  } catch (error) {
    console.error('Delete file error:', error);
    throw error.response?.data || { message: 'Failed to delete file' };
  }
};

// Delete document
export const deleteDocument = async (documentId) => {
  try {
    const response = await apiClient.delete(`/documents/${documentId}`);
    return response.data;
  } catch (error) {
    console.error('Delete document error:', error);
    throw error.response?.data || { message: 'Failed to delete document' };
  }
};

// Delete location
export const deleteLocation = async (locationId) => {
  try {
    const response = await apiClient.delete(`/locations/${locationId}`);
    return response.data;
  } catch (error) {
    console.error('Delete location error:', error);
    throw error.response?.data || { message: 'Failed to delete location' };
  }
};

// Update account
export const updateAccount = async (accountId, accountData) => {
  try {
    const response = await apiClient.put(`/accounts/${accountId}`, accountData);
    return response.data;
  } catch (error) {
    console.error('Update account error:', error);
    throw error.response?.data || { message: 'Failed to update account' };
  }
};

// Delete account
export const deleteAccount = async (accountId) => {
  try {
    const response = await apiClient.delete(`/accounts/${accountId}`);
    return response.data;
  } catch (error) {
    console.error('Delete account error:', error);
    throw error.response?.data || { message: 'Failed to delete account' };
  }
};

// Update role
export const updateRole = async (roleId, roleData) => {
  try {
    const response = await apiClient.put(`/roles/${roleId}`, roleData);
    return response.data;
  } catch (error) {
    console.error('Update role error:', error);
    throw error.response?.data || { message: 'Failed to update role' };
  }
};

// Delete role
export const deleteRole = async (roleId) => {
  try {
    const response = await apiClient.delete(`/roles/${roleId}`);
    return response.data;
  } catch (error) {
    console.error('Delete role error:', error);
    throw error.response?.data || { message: 'Failed to delete role' };
  }
};

// ======================
// LOCATION UPDATE/DELETE SERVICES
// ======================

// Update country
export const updateCountry = async (id, countryData) => {
  try {
    const response = await apiClient.put(`/location/countries/${id}`, countryData);
    return response.data;
  } catch (error) {
    console.error('Update country error:', error);
    throw error.response?.data || { message: 'Failed to update country' };
  }
};

// Delete country
export const deleteCountry = async (id) => {
  try {
    const response = await apiClient.delete(`/location/countries/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete country error:', error);
    throw error.response?.data || { message: 'Failed to delete country' };
  }
};

// Update location entity
export const updateLocationEntity = async (id, entityData) => {
  try {
    const response = await apiClient.put(`/location/entities/${id}`, entityData);
    return response.data;
  } catch (error) {
    console.error('Update location entity error:', error);
    throw error.response?.data || { message: 'Failed to update location entity' };
  }
};

// Delete location entity
export const deleteLocationEntity = async (id) => {
  try {
    const response = await apiClient.delete(`/location/entities/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete location entity error:', error);
    throw error.response?.data || { message: 'Failed to delete location entity' };
  }
};

// Update module
export const updateModule = async (id, moduleData) => {
  try {
    const response = await apiClient.put(`/location/modules/${id}`, moduleData);
    return response.data;
  } catch (error) {
    console.error('Update module error:', error);
    throw error.response?.data || { message: 'Failed to update module' };
  }
};

// Delete module
export const deleteModule = async (id) => {
  try {
    const response = await apiClient.delete(`/location/modules/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete module error:', error);
    throw error.response?.data || { message: 'Failed to delete module' };
  }
};

// Update section
export const updateSection = async (id, sectionData) => {
  try {
    const response = await apiClient.put(`/location/sections/${id}`, sectionData);
    return response.data;
  } catch (error) {
    console.error('Update section error:', error);
    throw error.response?.data || { message: 'Failed to update section' };
  }
};

// Delete section
export const deleteSection = async (id) => {
  try {
    const response = await apiClient.delete(`/location/sections/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete section error:', error);
    throw error.response?.data || { message: 'Failed to delete section' };
  }
};

// ======================
// DOCUMENT UPDATE/DELETE SERVICES
// ======================

// Update/Delete doc status
export const updateDocStatus = async (id, data) => {
  try {
    const response = await apiClient.put(`/document/doc-status/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Update doc status error:', error);
    throw error.response?.data || { message: 'Failed to update doc status' };
  }
};

export const deleteDocStatus = async (id) => {
  try {
    const response = await apiClient.delete(`/document/doc-status/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete doc status error:', error);
    throw error.response?.data || { message: 'Failed to delete doc status' };
  }
};

// Update/Delete section category
export const updateSectionCategory = async (id, data) => {
  try {
    const response = await apiClient.put(`/document/section-category/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Update section category error:', error);
    throw error.response?.data || { message: 'Failed to update section category' };
  }
};

export const deleteSectionCategory = async (id) => {
  try {
    const response = await apiClient.delete(`/document/section-category/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete section category error:', error);
    throw error.response?.data || { message: 'Failed to delete section category' };
  }
};

// Update/Delete norme loi
export const updateNormeLoi = async (id, data) => {
  try {
    const response = await apiClient.put(`/document/norme-loi/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Update norme loi error:', error);
    throw error.response?.data || { message: 'Failed to update norme loi' };
  }
};

export const deleteNormeLoi = async (id) => {
  try {
    const response = await apiClient.delete(`/document/norme-loi/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete norme loi error:', error);
    throw error.response?.data || { message: 'Failed to delete norme loi' };
  }
};

// Update/Delete comm asset land
export const updateCommAssetLand = async (id, data) => {
  try {
    const response = await apiClient.put(`/document/comm-asset-land/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Update comm asset land error:', error);
    throw error.response?.data || { message: 'Failed to update comm asset land' };
  }
};

export const deleteCommAssetLand = async (id) => {
  try {
    const response = await apiClient.delete(`/document/comm-asset-land/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete comm asset land error:', error);
    throw error.response?.data || { message: 'Failed to delete comm asset land' };
  }
};

// Update/Delete permi construction
export const updatePermiConstruction = async (id, data) => {
  try {
    const response = await apiClient.put(`/document/permi-construction/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Update permi construction error:', error);
    throw error.response?.data || { message: 'Failed to update permi construction' };
  }
};

export const deletePermiConstruction = async (id) => {
  try {
    const response = await apiClient.delete(`/document/permi-construction/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete permi construction error:', error);
    throw error.response?.data || { message: 'Failed to delete permi construction' };
  }
};

// Update/Delete accord concession
export const updateAccordConcession = async (id, data) => {
  try {
    const response = await apiClient.put(`/document/accord-concession/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Update accord concession error:', error);
    throw error.response?.data || { message: 'Failed to update accord concession' };
  }
};

export const deleteAccordConcession = async (id) => {
  try {
    const response = await apiClient.delete(`/document/accord-concession/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete accord concession error:', error);
    throw error.response?.data || { message: 'Failed to delete accord concession' };
  }
};

// Update/Delete estate
export const updateEstate = async (id, data) => {
  try {
    const response = await apiClient.put(`/document/estate/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Update estate error:', error);
    throw error.response?.data || { message: 'Failed to update estate' };
  }
};

export const deleteEstate = async (id) => {
  try {
    const response = await apiClient.delete(`/document/estate/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete estate error:', error);
    throw error.response?.data || { message: 'Failed to delete estate' };
  }
};

// Update/Delete equipment id
export const updateEquipmentId = async (id, data) => {
  try {
    const response = await apiClient.put(`/document/equipment-id/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Update equipment id error:', error);
    throw error.response?.data || { message: 'Failed to update equipment id' };
  }
};

export const deleteEquipmentId = async (id) => {
  try {
    const response = await apiClient.delete(`/document/equipment-id/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete equipment id error:', error);
    throw error.response?.data || { message: 'Failed to delete equipment id' };
  }
};

// Update/Delete cert licenses
export const updateCertLicenses = async (id, data) => {
  try {
    const response = await apiClient.put(`/document/cert-licenses/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Update cert licenses error:', error);
    throw error.response?.data || { message: 'Failed to update cert licenses' };
  }
};

export const deleteCertLicenses = async (id) => {
  try {
    const response = await apiClient.delete(`/document/cert-licenses/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete cert licenses error:', error);
    throw error.response?.data || { message: 'Failed to delete cert licenses' };
  }
};

// Update/Delete comm comp policies
export const updateCommCompPolicies = async (id, data) => {
  try {
    const response = await apiClient.put(`/document/comm-comp-policies/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Update comm comp policies error:', error);
    throw error.response?.data || { message: 'Failed to update comm comp policies' };
  }
};

export const deleteCommCompPolicies = async (id) => {
  try {
    const response = await apiClient.delete(`/document/comm-comp-policies/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete comm comp policies error:', error);
    throw error.response?.data || { message: 'Failed to delete comm comp policies' };
  }
};

// Update/Delete comm followup audit
export const updateCommFollowupAudit = async (id, data) => {
  try {
    const response = await apiClient.put(`/document/comm-followup-audit/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Update comm followup audit error:', error);
    throw error.response?.data || { message: 'Failed to update comm followup audit' };
  }
};

export const deleteCommFollowupAudit = async (id) => {
  try {
    const response = await apiClient.delete(`/document/comm-followup-audit/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete comm followup audit error:', error);
    throw error.response?.data || { message: 'Failed to delete comm followup audit' };
  }
};

// Update/Delete due diligence
export const updateDueDiligence = async (id, data) => {
  try {
    const response = await apiClient.put(`/document/due-diligence/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Update due diligence error:', error);
    throw error.response?.data || { message: 'Failed to update due diligence' };
  }
};

export const deleteDueDiligence = async (id) => {
  try {
    const response = await apiClient.delete(`/document/due-diligence/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete due diligence error:', error);
    throw error.response?.data || { message: 'Failed to delete due diligence' };
  }
};

// Update/Delete comm third party
export const updateCommThirdParty = async (id, data) => {
  try {
    const response = await apiClient.put(`/document/comm-third-party/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Update comm third party error:', error);
    throw error.response?.data || { message: 'Failed to update comm third party' };
  }
};

export const deleteCommThirdParty = async (id) => {
  try {
    const response = await apiClient.delete(`/document/comm-third-party/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete comm third party error:', error);
    throw error.response?.data || { message: 'Failed to delete comm third party' };
  }
};

// Update/Delete cargo damage
export const updateCargoDamage = async (id, data) => {
  try {
    const response = await apiClient.put(`/document/cargo-damage/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Update cargo damage error:', error);
    throw error.response?.data || { message: 'Failed to update cargo damage' };
  }
};

export const deleteCargoDamage = async (id) => {
  try {
    const response = await apiClient.delete(`/document/cargo-damage/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete cargo damage error:', error);
    throw error.response?.data || { message: 'Failed to delete cargo damage' };
  }
};

// Update/Delete litigation followup
export const updateLitigationFollowup = async (id, data) => {
  try {
    const response = await apiClient.put(`/document/litigation-followup/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Update litigation followup error:', error);
    throw error.response?.data || { message: 'Failed to update litigation followup' };
  }
};

export const deleteLitigationFollowup = async (id) => {
  try {
    const response = await apiClient.delete(`/document/litigation-followup/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete litigation followup error:', error);
    throw error.response?.data || { message: 'Failed to delete litigation followup' };
  }
};

// Update/Delete insurance
export const updateInsurance = async (id, data) => {
  try {
    const response = await apiClient.put(`/document/insurance/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Update insurance error:', error);
    throw error.response?.data || { message: 'Failed to update insurance' };
  }
};

export const deleteInsurance = async (id) => {
  try {
    const response = await apiClient.delete(`/document/insurance/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete insurance error:', error);
    throw error.response?.data || { message: 'Failed to delete insurance' };
  }
};

// Update/Delete third party claims
export const updateThirdPartyClaims = async (id, data) => {
  try {
    const response = await apiClient.put(`/document/third-party-claims/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Update third party claims error:', error);
    throw error.response?.data || { message: 'Failed to update third party claims' };
  }
};

export const deleteThirdPartyClaims = async (id) => {
  try {
    const response = await apiClient.delete(`/document/third-party-claims/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete third party claims error:', error);
    throw error.response?.data || { message: 'Failed to delete third party claims' };
  }
};