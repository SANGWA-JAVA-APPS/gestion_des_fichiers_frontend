import { apiClient } from './apiConfig';

// User Authentication - Login
export const loginUser = async (credentials) => {
  try {
    const response = await apiClient.post('/auth/login', credentials);
    
    if (response.data.success) {
      // Store tokens and user info in localStorage
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('userInfo', JSON.stringify({
        username: response.data.username,
        fullName: response.data.fullName,
        role: response.data.role
      }));
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error.response?.data || { message: 'Login failed' };
  }
};

// User Registration (if needed later)
export const registerUser = async (userData) => {
  try {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error.response?.data || { message: 'Registration failed' };
  }
};

// Create new file (example insert operation)
export const createFile = async (fileData) => {
  try {
    const response = await apiClient.post('/files', fileData);
    return response.data;
  } catch (error) {
    console.error('File creation error:', error);
    throw error.response?.data || { message: 'File creation failed' };
  }
};

// Create new document
export const createDocument = async (documentData) => {
  try {
    const response = await apiClient.post('/documents', documentData);
    return response.data;
  } catch (error) {
    console.error('Document creation error:', error);
    throw error.response?.data || { message: 'Document creation failed' };
  }
};

// Create new location
export const createLocation = async (locationData) => {
  try {
    const response = await apiClient.post('/locations', locationData);
    return response.data;
  } catch (error) {
    console.error('Location creation error:', error);
    throw error.response?.data || { message: 'Location creation failed' };
  }
};

// Create new account
export const createAccount = async (accountData) => {
  try {
    const response = await apiClient.post('/accounts', accountData);
    return response.data;
  } catch (error) {
    console.error('Account creation error:', error);
    throw error.response?.data || { message: 'Account creation failed' };
  }
};

// Create new role
export const createRole = async (roleData) => {
  try {
    const response = await apiClient.post('/roles', roleData);
    return response.data;
  } catch (error) {
    console.error('Role creation error:', error);
    throw error.response?.data || { message: 'Role creation failed' };
  }
};

// ======================
// LOCATION INSERT SERVICES
// ======================

// Create new country
export const createCountry = async (countryData) => {
  try {
    const response = await apiClient.post('/location/countries', countryData);
    return response.data;
  } catch (error) {
    console.error('Create country error:', error);
    throw error.response?.data || { message: 'Failed to create country' };
  }
};

// Create new location entity
export const createLocationEntity = async (entityData) => {
  try {
    const response = await apiClient.post('/location/entities', entityData);
    return response.data;
  } catch (error) {
    console.error('Create location entity error:', error);
    throw error.response?.data || { message: 'Failed to create location entity' };
  }
};

// Create new module
export const createModule = async (moduleData) => {
  try {
    const response = await apiClient.post('/location/modules', moduleData);
    return response.data;
  } catch (error) {
    console.error('Create module error:', error);
    throw error.response?.data || { message: 'Failed to create module' };
  }
};

// Create new section
export const createSection = async (sectionData) => {
  try {
    const response = await apiClient.post('/location/sections', sectionData);
    return response.data;
  } catch (error) {
    console.error('Create section error:', error);
    throw error.response?.data || { message: 'Failed to create section' };
  }
};

// ======================
// DOCUMENT INSERT SERVICES
// ======================

// Create doc status
export const createDocStatus = async (data) => {
  try {
    const response = await apiClient.post('/document/doc-status', data);
    return response.data;
  } catch (error) {
    console.error('Create doc status error:', error);
    throw error.response?.data || { message: 'Failed to create doc status' };
  }
};

// Create section category
export const createSectionCategory = async (data) => {
  try {
    const response = await apiClient.post('/document/section-category', data);
    return response.data;
  } catch (error) {
    console.error('Create section category error:', error);
    throw error.response?.data || { message: 'Failed to create section category' };
  }
};

// Create norme loi
export const createNormeLoi = async (data) => {
  try {
    const response = await apiClient.post('/document/norme-loi', data);
    return response.data;
  } catch (error) {
    console.error('Create norme loi error:', error);
    throw error.response?.data || { message: 'Failed to create norme loi' };
  }
};

// Create comm asset land
export const createCommAssetLand = async (data) => {
  try {
    const response = await apiClient.post('/document/comm-asset-land', data);
    return response.data;
  } catch (error) {
    console.error('Create comm asset land error:', error);
    throw error.response?.data || { message: 'Failed to create comm asset land' };
  }
};

// Create permi construction
export const createPermiConstruction = async (data) => {
  try {
    const response = await apiClient.post('/document/permi-construction', data);
    return response.data;
  } catch (error) {
    console.error('Create permi construction error:', error);
    throw error.response?.data || { message: 'Failed to create permi construction' };
  }
};

// Create accord concession
export const createAccordConcession = async (data) => {
  try {
    const response = await apiClient.post('/document/accord-concession', data);
    return response.data;
  } catch (error) {
    console.error('Create accord concession error:', error);
    throw error.response?.data || { message: 'Failed to create accord concession' };
  }
};

// Create estate
export const createEstate = async (data) => {
  try {
    const response = await apiClient.post('/document/estate', data);
    return response.data;
  } catch (error) {
    console.error('Create estate error:', error);
    throw error.response?.data || { message: 'Failed to create estate' };
  }
};

// Create equipment id
export const createEquipmentId = async (data) => {
  try {
    const response = await apiClient.post('/document/equipment-id', data);
    return response.data;
  } catch (error) {
    console.error('Create equipment id error:', error);
    throw error.response?.data || { message: 'Failed to create equipment id' };
  }
};

// Create cert licenses
export const createCertLicenses = async (data) => {
  try {
    const response = await apiClient.post('/document/cert-licenses', data);
    return response.data;
  } catch (error) {
    console.error('Create cert licenses error:', error);
    throw error.response?.data || { message: 'Failed to create cert licenses' };
  }
};

// Create comm comp policies
export const createCommCompPolicies = async (data) => {
  try {
    const response = await apiClient.post('/document/comm-comp-policies', data);
    return response.data;
  } catch (error) {
    console.error('Create comm comp policies error:', error);
    throw error.response?.data || { message: 'Failed to create comm comp policies' };
  }
};

// Create comm followup audit
export const createCommFollowupAudit = async (data) => {
  try {
    const response = await apiClient.post('/document/comm-followup-audit', data);
    return response.data;
  } catch (error) {
    console.error('Create comm followup audit error:', error);
    throw error.response?.data || { message: 'Failed to create comm followup audit' };
  }
};

// Create due diligence
export const createDueDiligence = async (data) => {
  try {
    const response = await apiClient.post('/document/due-diligence', data);
    return response.data;
  } catch (error) {
    console.error('Create due diligence error:', error);
    throw error.response?.data || { message: 'Failed to create due diligence' };
  }
};

// Create comm third party
export const createCommThirdParty = async (data) => {
  try {
    const response = await apiClient.post('/document/comm-third-party', data);
    return response.data;
  } catch (error) {
    console.error('Create comm third party error:', error);
    throw error.response?.data || { message: 'Failed to create comm third party' };
  }
};

// Create cargo damage
export const createCargoDamage = async (data) => {
  try {
    const response = await apiClient.post('/document/cargo-damage', data);
    return response.data;
  } catch (error) {
    console.error('Create cargo damage error:', error);
    throw error.response?.data || { message: 'Failed to create cargo damage' };
  }
};

// Create litigation followup
export const createLitigationFollowup = async (data) => {
  try {
    const response = await apiClient.post('/document/litigation-followup', data);
    return response.data;
  } catch (error) {
    console.error('Create litigation followup error:', error);
    throw error.response?.data || { message: 'Failed to create litigation followup' };
  }
};

// Create insurance
export const createInsurance = async (data) => {
  try {
    const response = await apiClient.post('/document/insurance', data);
    return response.data;
  } catch (error) {
    console.error('Create insurance error:', error);
    throw error.response?.data || { message: 'Failed to create insurance' };
  }
};

// Create third party claims
export const createThirdPartyClaims = async (data) => {
  try {
    const response = await apiClient.post('/document/third-party-claims', data);
    return response.data;
  } catch (error) {
    console.error('Create third party claims error:', error);
    throw error.response?.data || { message: 'Failed to create third party claims' };
  }
};