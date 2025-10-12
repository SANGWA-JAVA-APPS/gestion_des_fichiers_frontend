import { apiClient } from './apiConfig';

// ======================
// COUNTRY API SERVICES
// ======================

export const getAllCountries = async () => {
  try {
    const response = await apiClient.get('/api/location/countries');
    return response.data;
  } catch (error) {
    console.error('Get countries error:', error);
    throw error.response?.data || { message: 'Failed to get countries' };
  }
};

export const getCountryById = async (id) => {
  try {
    const response = await apiClient.get(`/api/location/countries/${id}`);
    return response.data;
  } catch (error) {
    console.error('Get country by ID error:', error);
    throw error.response?.data || { message: 'Failed to get country' };
  }
};

export const createCountry = async (countryData) => {
  try {
    const response = await apiClient.post('/api/location/countries', countryData);
    return response.data;
  } catch (error) {
    console.error('Create country error:', error);
    throw error.response?.data || { message: 'Failed to create country' };
  }
};

export const updateCountry = async (id, countryData) => {
  try {
    const response = await apiClient.put(`/api/location/countries/${id}`, countryData);
    return response.data;
  } catch (error) {
    console.error('Update country error:', error);
    throw error.response?.data || { message: 'Failed to update country' };
  }
};

export const deleteCountry = async (id) => {
  try {
    const response = await apiClient.delete(`/api/location/countries/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete country error:', error);
    throw error.response?.data || { message: 'Failed to delete country' };
  }
};

// ======================
// LOCATION ENTITY API SERVICES
// ======================

export const getAllLocationEntities = async () => {
  try {
    const response = await apiClient.get('/api/location/entities');
    return response.data;
  } catch (error) {
    console.error('Get location entities error:', error);
    throw error.response?.data || { message: 'Failed to get location entities' };
  }
};

export const getLocationEntitiesByCountry = async (countryId) => {
  try {
    const response = await apiClient.get(`/api/location/entities/country/${countryId}`);
    return response.data;
  } catch (error) {
    console.error('Get entities by country error:', error);
    throw error.response?.data || { message: 'Failed to get entities by country' };
  }
};

export const getLocationEntityById = async (id) => {
  try {
    const response = await apiClient.get(`/api/location/entities/${id}`);
    return response.data;
  } catch (error) {
    console.error('Get location entity by ID error:', error);
    throw error.response?.data || { message: 'Failed to get location entity' };
  }
};

export const createLocationEntity = async (entityData) => {
  try {
    const response = await apiClient.post('/api/location/entities', entityData);
    return response.data;
  } catch (error) {
    console.error('Create location entity error:', error);
    throw error.response?.data || { message: 'Failed to create location entity' };
  }
};

export const updateLocationEntity = async (id, entityData) => {
  try {
    const response = await apiClient.put(`/api/location/entities/${id}`, entityData);
    return response.data;
  } catch (error) {
    console.error('Update location entity error:', error);
    throw error.response?.data || { message: 'Failed to update location entity' };
  }
};

export const deleteLocationEntity = async (id) => {
  try {
    const response = await apiClient.delete(`/api/location/entities/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete location entity error:', error);
    throw error.response?.data || { message: 'Failed to delete location entity' };
  }
};

// ======================
// MODULE API SERVICES  
// ======================

export const getAllModules = async () => {
  try {
    const response = await apiClient.get('/api/location/modules');
    return response.data;
  } catch (error) {
    console.error('Get modules error:', error);
    throw error.response?.data || { message: 'Failed to get modules' };
  }
};

export const getModulesByLocationEntity = async (entityId) => {
  try {
    const response = await apiClient.get(`/api/location/modules/entity/${entityId}`);
    return response.data;
  } catch (error) {
    console.error('Get modules by entity error:', error);
    throw error.response?.data || { message: 'Failed to get modules by entity' };
  }
};

export const getModuleById = async (id) => {
  try {
    const response = await apiClient.get(`/api/location/modules/${id}`);
    return response.data;
  } catch (error) {
    console.error('Get module by ID error:', error);
    throw error.response?.data || { message: 'Failed to get module' };
  }
};

export const createModule = async (moduleData) => {
  try {
    const response = await apiClient.post('/api/location/modules', moduleData);
    return response.data;
  } catch (error) {
    console.error('Create module error:', error);
    throw error.response?.data || { message: 'Failed to create module' };
  }
};

export const updateModule = async (id, moduleData) => {
  try {
    const response = await apiClient.put(`/api/location/modules/${id}`, moduleData);
    return response.data;
  } catch (error) {
    console.error('Update module error:', error);
    throw error.response?.data || { message: 'Failed to update module' };
  }
};

export const deleteModule = async (id) => {
  try {
    const response = await apiClient.delete(`/api/location/modules/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete module error:', error);
    throw error.response?.data || { message: 'Failed to delete module' };
  }
};

// ======================
// SECTION API SERVICES
// ======================

export const getAllSections = async () => {
  try {
    const response = await apiClient.get('/api/location/sections');
    return response.data;
  } catch (error) {
    console.error('Get sections error:', error);
    throw error.response?.data || { message: 'Failed to get sections' };
  }
};

export const getSectionsByModule = async (moduleId) => {
  try {
    const response = await apiClient.get(`/api/location/sections/module/${moduleId}`);
    return response.data;
  } catch (error) {
    console.error('Get sections by module error:', error);
    throw error.response?.data || { message: 'Failed to get sections by module' };
  }
};

export const getSectionById = async (id) => {
  try {
    const response = await apiClient.get(`/api/location/sections/${id}`);
    return response.data;
  } catch (error) {
    console.error('Get section by ID error:', error);
    throw error.response?.data || { message: 'Failed to get section' };
  }
};

export const createSection = async (sectionData) => {
  try {
    const response = await apiClient.post('/api/location/sections', sectionData);
    return response.data;
  } catch (error) {
    console.error('Create section error:', error);
    throw error.response?.data || { message: 'Failed to create section' };
  }
};

export const updateSection = async (id, sectionData) => {
  try {
    const response = await apiClient.put(`/api/location/sections/${id}`, sectionData);
    return response.data;
  } catch (error) {
    console.error('Update section error:', error);
    throw error.response?.data || { message: 'Failed to update section' };
  }
};

export const deleteSection = async (id) => {
  try {
    const response = await apiClient.delete(`/api/location/sections/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete section error:', error);
    throw error.response?.data || { message: 'Failed to delete section' };
  }
};

// ======================
// UTILITY FUNCTIONS
// ======================

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

export const searchLocations = async (searchTerm) => {
  try {
    const response = await apiClient.get(`/api/location/search?q=${encodeURIComponent(searchTerm)}`);
    return response.data;
  } catch (error) {
    console.error('Search locations error:', error);
    throw error.response?.data || { message: 'Failed to search locations' };
  }
};