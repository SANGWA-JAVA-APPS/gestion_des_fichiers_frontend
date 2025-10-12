import { apiClient } from './apiConfig';
import { handleApiError, extractResponseData, isSuccessResponse } from './responseChecker';

// Get current user information
export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get('/auth/user');
    if (isSuccessResponse(response)) {
      return extractResponseData(response);
    }
    throw new Error(response.data?.message || 'Failed to get user info');
  } catch (error) {
    console.error('Get current user error:', error);
    handleApiError(error);
    throw error.response?.data || { message: 'Failed to get user info' };
  }
};

// Get all files with pagination
export const getAllFiles = async (page = 0, size = 20, sort = 'fileName', direction = 'asc') => {
  try {
    const response = await apiClient.get(`/files?page=${page}&size=${size}&sort=${sort}&direction=${direction}`);
    if (isSuccessResponse(response)) {
      return response.data; // Return full response including pagination
    }
    throw new Error(response.data?.message || 'Failed to get files');
  } catch (error) {
    console.error('Get files error:', error);
    handleApiError(error);
    throw error.response?.data || { message: 'Failed to get files' };
  }
};

// Get file by ID
export const getFileById = async (fileId) => {
  try {
    const response = await apiClient.get(`/files/${fileId}`);
    if (isSuccessResponse(response)) {
      return extractResponseData(response);
    }
    throw new Error(response.data?.message || 'Failed to get file');
  } catch (error) {
    console.error('Get file by ID error:', error);
    handleApiError(error);
    throw error.response?.data || { message: 'Failed to get file' };
  }
};

// Get all documents
export const getAllDocuments = async () => {
  try {
    const response = await apiClient.get('/documents');
    return response.data;
  } catch (error) {
    console.error('Get documents error:', error);
    throw error.response?.data || { message: 'Failed to get documents' };
  }
};

// Get document by ID
export const getDocumentById = async (documentId) => {
  try {
    const response = await apiClient.get(`/documents/${documentId}`);
    return response.data;
  } catch (error) {
    console.error('Get document by ID error:', error);
    throw error.response?.data || { message: 'Failed to get document' };
  }
};

// Get all locations
export const getAllLocations = async () => {
  try {
    const response = await apiClient.get('/locations');
    return response.data;
  } catch (error) {
    console.error('Get locations error:', error);
    throw error.response?.data || { message: 'Failed to get locations' };
  }
};

// Get location by ID
export const getLocationById = async (locationId) => {
  try {
    const response = await apiClient.get(`/locations/${locationId}`);
    return response.data;
  } catch (error) {
    console.error('Get location by ID error:', error);
    throw error.response?.data || { message: 'Failed to get location' };
  }
};

// Get all users (admin functionality)
export const getAllUsers = async () => {
  try {
    const response = await apiClient.get('/users');
    return response.data;
  } catch (error) {
    console.error('Get users error:', error);
    throw error.response?.data || { message: 'Failed to get users' };
  }
};

// Get user by ID
export const getUserById = async (userId) => {
  try {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Get user by ID error:', error);
    throw error.response?.data || { message: 'Failed to get user' };
  }
};

// Get all accounts
export const getAllAccounts = async () => {
  try {
    const response = await apiClient.get('/accounts');
    if (isSuccessResponse(response)) {
      return extractResponseData(response);
    }
    throw new Error(response.data?.message || 'Failed to get accounts');
  } catch (error) {
    console.error('Get accounts error:', error);
    handleApiError(error);
    throw error.response?.data || { message: 'Failed to get accounts' };
  }
};

// Get account by ID
export const getAccountById = async (accountId) => {
  try {
    const response = await apiClient.get(`/accounts/${accountId}`);
    return response.data;
  } catch (error) {
    console.error('Get account by ID error:', error);
    throw error.response?.data || { message: 'Failed to get account' };
  }
};

// Get all account categories
export const getAllAccountCategories = async () => {
  try {
    const response = await apiClient.get('/account-categories');
    if (isSuccessResponse(response)) {
      return extractResponseData(response);
    }
    throw new Error(response.data?.message || 'Failed to get account categories');
  } catch (error) {
    console.error('Get account categories error:', error);
    handleApiError(error);
    throw error.response?.data || { message: 'Failed to get account categories' };
  }
};

// Get all roles
export const getAllRoles = async () => {
  try {
    const response = await apiClient.get('/roles');
    if (isSuccessResponse(response)) {
      return extractResponseData(response);
    }
    throw new Error(response.data?.message || 'Failed to get roles');
  } catch (error) {
    console.error('Get roles error:', error);
    handleApiError(error);
    throw error.response?.data || { message: 'Failed to get roles' };
  }
};

// Get role by ID
export const getRoleById = async (roleId) => {
  try {
    const response = await apiClient.get(`/roles/${roleId}`);
    return response.data;
  } catch (error) {
    console.error('Get role by ID error:', error);
    throw error.response?.data || { message: 'Failed to get role' };
  }
};

// ======================
// LOCATION GET SERVICES
// ======================

// Get all countries
export const getAllCountries = async () => {
  try {
    const response = await apiClient.get('/location/countries');
    if (isSuccessResponse(response)) {
      return extractResponseData(response);
    }
    throw new Error(response.data?.message || 'Failed to get countries');
  } catch (error) {
    console.error('Get countries error:', error);
    handleApiError(error);
    throw error.response?.data || { message: 'Failed to get countries' };
  }
};

// Get country by ID
export const getCountryById = async (id) => {
  try {
    const response = await apiClient.get(`/location/countries/${id}`);
    if (isSuccessResponse(response)) {
      return extractResponseData(response);
    }
    throw new Error(response.data?.message || 'Failed to get country');
  } catch (error) {
    console.error('Get country by ID error:', error);
    handleApiError(error);
    throw error.response?.data || { message: 'Failed to get country' };
  }
};

// Get all location entities
export const getAllLocationEntities = async () => {
  try {
    const response = await apiClient.get('/location/entities');
    if (isSuccessResponse(response)) {
      return extractResponseData(response);
    }
    throw new Error(response.data?.message || 'Failed to get location entities');
  } catch (error) {
    console.error('Get location entities error:', error);
    handleApiError(error);
    throw error.response?.data || { message: 'Failed to get location entities' };
  }
};

// Get location entities by country
export const getLocationEntitiesByCountry = async (countryId) => {
  try {
    const response = await apiClient.get(`/location/entities/country/${countryId}`);
    return response.data;
  } catch (error) {
    console.error('Get entities by country error:', error);
    throw error.response?.data || { message: 'Failed to get entities by country' };
  }
};

// Get location entity by ID
export const getLocationEntityById = async (id) => {
  try {
    const response = await apiClient.get(`/location/entities/${id}`);
    return response.data;
  } catch (error) {
    console.error('Get location entity by ID error:', error);
    throw error.response?.data || { message: 'Failed to get location entity' };
  }
};

// Get all modules
export const getAllModules = async () => {
  try {
    const response = await apiClient.get('/location/modules');
    return response.data;
  } catch (error) {
    console.error('Get modules error:', error);
    throw error.response?.data || { message: 'Failed to get modules' };
  }
};

// Get modules by location entity
export const getModulesByLocationEntity = async (entityId) => {
  try {
    const response = await apiClient.get(`/location/modules/entity/${entityId}`);
    return response.data;
  } catch (error) {
    console.error('Get modules by entity error:', error);
    throw error.response?.data || { message: 'Failed to get modules by entity' };
  }
};

// Get module by ID
export const getModuleById = async (id) => {
  try {
    const response = await apiClient.get(`/location/modules/${id}`);
    return response.data;
  } catch (error) {
    console.error('Get module by ID error:', error);
    throw error.response?.data || { message: 'Failed to get module' };
  }
};

// Get all sections
export const getAllSections = async () => {
  try {
    const response = await apiClient.get('/location/sections');
    return response.data;
  } catch (error) {
    console.error('Get sections error:', error);
    throw error.response?.data || { message: 'Failed to get sections' };
  }
};

// Get sections by module
export const getSectionsByModule = async (moduleId) => {
  try {
    const response = await apiClient.get(`/location/sections/module/${moduleId}`);
    return response.data;
  } catch (error) {
    console.error('Get sections by module error:', error);
    throw error.response?.data || { message: 'Failed to get sections by module' };
  }
};

// Get section by ID
export const getSectionById = async (id) => {
  try {
    const response = await apiClient.get(`/location/sections/${id}`);
    return response.data;
  } catch (error) {
    console.error('Get section by ID error:', error);
    throw error.response?.data || { message: 'Failed to get section' };
  }
};

// Get location hierarchy
export const getLocationHierarchy = async () => {
  try {
    const [countries, entities, modules, sections] = await Promise.all([
      getAllCountries(),
      getAllLocationEntities(),
      getAllModules(),
      getAllSections()
    ]);
    
    return {
      countries,
      entities,
      modules,
      sections
    };
  } catch (error) {
    console.error('Get location hierarchy error:', error);
    throw error.response?.data || { message: 'Failed to get location hierarchy' };
  }
};

// Search locations
export const searchLocations = async (searchTerm) => {
  try {
    const response = await apiClient.get(`/location/search?q=${encodeURIComponent(searchTerm)}`);
    return response.data;
  } catch (error) {
    console.error('Search locations error:', error);
    throw error.response?.data || { message: 'Failed to search locations' };
  }
};

// ======================
// DOCUMENT GET SERVICES
// ======================

// Get all doc statuses
export const getAllDocStatuses = async () => {
  try {
    const response = await apiClient.get('/document/doc-status');
    if (isSuccessResponse(response)) {
      return extractResponseData(response);
    }
    throw new Error(response.data?.message || 'Failed to get doc statuses');
  } catch (error) {
    console.error('Get doc statuses error:', error);
    handleApiError(error);
    throw error.response?.data || { message: 'Failed to get doc statuses' };
  }
};

// Get all section categories
export const getAllSectionCategories = async () => {
  try {
    const response = await apiClient.get('/document/section-category');
    if (isSuccessResponse(response)) {
      return extractResponseData(response);
    }
    throw new Error(response.data?.message || 'Failed to get section categories');
  } catch (error) {
    console.error('Get section categories error:', error);
    handleApiError(error);
    throw error.response?.data || { message: 'Failed to get section categories' };
  }
};

// Get all norme loi
export const getAllNormeLoi = async (page = 0, size = 20, sort = 'reference', direction = 'asc') => {
  try {
    const response = await apiClient.get(`/document/norme-loi?page=${page}&size=${size}&sort=${sort}&direction=${direction}`);
    return response.data;
  } catch (error) {
    console.error('Get norme loi error:', error);
    throw error.response?.data || { message: 'Failed to get norme loi' };
  }
};

// Get all comm asset land
export const getAllCommAssetLand = async (page = 0, size = 20, sort = 'reference', direction = 'asc') => {
  try {
    const response = await apiClient.get(`/document/comm-asset-land?page=${page}&size=${size}&sort=${sort}&direction=${direction}`);
    return response.data;
  } catch (error) {
    console.error('Get comm asset land error:', error);
    throw error.response?.data || { message: 'Failed to get comm asset land' };
  }
};

// Get all permi construction
export const getAllPermiConstruction = async (page = 0, size = 20, sort = 'numeroPermis', direction = 'asc') => {
  try {
    const response = await apiClient.get(`/document/permi-construction?page=${page}&size=${size}&sort=${sort}&direction=${direction}`);
    return response.data;
  } catch (error) {
    console.error('Get permi construction error:', error);
    throw error.response?.data || { message: 'Failed to get permi construction' };
  }
};

// Get all accord concession
export const getAllAccordConcession = async (page = 0, size = 20, sort = 'numeroAccord', direction = 'asc') => {
  try {
    const response = await apiClient.get(`/document/accord-concession?page=${page}&size=${size}&sort=${sort}&direction=${direction}`);
    return response.data;
  } catch (error) {
    console.error('Get accord concession error:', error);
    throw error.response?.data || { message: 'Failed to get accord concession' };
  }
};

// Get all estate
export const getAllEstate = async (page = 0, size = 20, sort = 'reference', direction = 'asc') => {
  try {
    const response = await apiClient.get(`/document/estate?page=${page}&size=${size}&sort=${sort}&direction=${direction}`);
    return response.data;
  } catch (error) {
    console.error('Get estate error:', error);
    throw error.response?.data || { message: 'Failed to get estate' };
  }
};

// Get all equipment id
export const getAllEquipmentId = async (page = 0, size = 20, sort = 'serialNumber', direction = 'asc') => {
  try {
    const response = await apiClient.get(`/document/equipment-id?page=${page}&size=${size}&sort=${sort}&direction=${direction}`);
    return response.data;
  } catch (error) {
    console.error('Get equipment id error:', error);
    throw error.response?.data || { message: 'Failed to get equipment id' };
  }
};

// Get all cert licenses
export const getAllCertLicenses = async (page = 0, size = 20, sort = 'dateCertificate', direction = 'asc') => {
  try {
    const response = await apiClient.get(`/document/cert-licenses?page=${page}&size=${size}&sort=${sort}&direction=${direction}`);
    return response.data;
  } catch (error) {
    console.error('Get cert licenses error:', error);
    throw error.response?.data || { message: 'Failed to get cert licenses' };
  }
};

// Get all comm comp policies
export const getAllCommCompPolicies = async (page = 0, size = 20, sort = 'reference', direction = 'asc') => {
  try {
    const response = await apiClient.get(`/document/comm-comp-policies?page=${page}&size=${size}&sort=${sort}&direction=${direction}`);
    return response.data;
  } catch (error) {
    console.error('Get comm comp policies error:', error);
    throw error.response?.data || { message: 'Failed to get comm comp policies' };
  }
};

// Get all comm followup audit
export const getAllCommFollowupAudit = async (page = 0, size = 20, sort = 'reference', direction = 'asc') => {
  try {
    const response = await apiClient.get(`/document/comm-followup-audit?page=${page}&size=${size}&sort=${sort}&direction=${direction}`);
    return response.data;
  } catch (error) {
    console.error('Get comm followup audit error:', error);
    throw error.response?.data || { message: 'Failed to get comm followup audit' };
  }
};

// Get all due diligence
export const getAllDueDiligence = async (page = 0, size = 20, sort = 'reference', direction = 'asc') => {
  try {
    const response = await apiClient.get(`/document/due-diligence?page=${page}&size=${size}&sort=${sort}&direction=${direction}`);
    return response.data;
  } catch (error) {
    console.error('Get due diligence error:', error);
    throw error.response?.data || { message: 'Failed to get due diligence' };
  }
};

// Get all comm third party
export const getAllCommThirdParty = async (page = 0, size = 20, sort = 'name', direction = 'asc') => {
  try {
    const response = await apiClient.get(`/document/comm-third-party?page=${page}&size=${size}&sort=${sort}&direction=${direction}`);
    return response.data;
  } catch (error) {
    console.error('Get comm third party error:', error);
    throw error.response?.data || { message: 'Failed to get comm third party' };
  }
};

// Get all cargo damage
export const getAllCargoDamage = async (page = 0, size = 20, sort = 'refeRequest', direction = 'asc') => {
  try {
    const response = await apiClient.get(`/document/cargo-damage?page=${page}&size=${size}&sort=${sort}&direction=${direction}`);
    return response.data;
  } catch (error) {
    console.error('Get cargo damage error:', error);
    throw error.response?.data || { message: 'Failed to get cargo damage' };
  }
};

// Get all litigation followup
export const getAllLitigationFollowup = async (page = 0, size = 20, sort = 'concern', direction = 'asc') => {
  try {
    const response = await apiClient.get(`/document/litigation-followup?page=${page}&size=${size}&sort=${sort}&direction=${direction}`);
    return response.data;
  } catch (error) {
    console.error('Get litigation followup error:', error);
    throw error.response?.data || { message: 'Failed to get litigation followup' };
  }
};

// Get all insurance
export const getAllInsurance = async (page = 0, size = 20, sort = 'concerns', direction = 'asc') => {
  try {
    const response = await apiClient.get(`/document/insurance?page=${page}&size=${size}&sort=${sort}&direction=${direction}`);
    return response.data;
  } catch (error) {
    console.error('Get insurance error:', error);
    throw error.response?.data || { message: 'Failed to get insurance' };
  }
};

// Get all third party claims
export const getAllThirdPartyClaims = async (page = 0, size = 20, sort = 'reference', direction = 'asc') => {
  try {
    const response = await apiClient.get(`/document/third-party-claims?page=${page}&size=${size}&sort=${sort}&direction=${direction}`);
    return response.data;
  } catch (error) {
    console.error('Get third party claims error:', error);
    throw error.response?.data || { message: 'Failed to get third party claims' };
  }
};