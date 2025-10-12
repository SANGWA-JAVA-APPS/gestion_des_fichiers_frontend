/**
 * Response checker utility for handling standardized backend responses
 */

/**
 * Check and handle API response status
 * @param {Object} response - The response from API
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback (optional)
 * @returns {boolean} - True if success, false if error
 */
export const checkResponse = (response, onSuccess, onError) => {
  if (!response) {
    const errorMsg = 'No response from server';
    console.error(errorMsg);
    if (onError) onError(errorMsg);
    return false;
  }

  const status = response.status || response.data?.status;
  const message = response.message || response.data?.message || 'Unknown error';

  switch (status) {
    case 200:
      // Success
      if (onSuccess) onSuccess(response.data || response);
      return true;

    case 400:
      // Bad Request - Check inputs
      console.warn('Bad Request:', message);
      alert(message || 'Check inputs');
      if (onError) onError(message);
      return false;

    case 403:
      // Forbidden - Session expired
      console.warn('Session expired:', message);
      alert(message || 'Your session has expired, please login again');
      // Redirect to login page
      window.location.href = '/login';
      if (onError) onError(message);
      return false;

    case 404:
      // Not Found
      console.warn('Resource not found:', message);
      alert(message || 'Resource not found');
      if (onError) onError(message);
      return false;

    case 500:
      // Server Error
      console.error('Server error:', message);
      alert('Internal server error. Please try again later.');
      if (onError) onError(message);
      return false;

    default:
      // Unknown status
      console.error('Unknown response status:', status, message);
      alert(message || 'An unexpected error occurred');
      if (onError) onError(message);
      return false;
  }
};

/**
 * Handle API errors consistently
 * @param {Object} error - The error object from API
 * @param {Function} onError - Error callback (optional)
 */
export const handleApiError = (error, onError) => {
  console.error('API Error:', error);

  if (error.response) {
    // Response received but with error status
    const status = error.response.status;
    const message = error.response.data?.message || error.message || 'Request failed';

    switch (status) {
      case 400:
        alert(message || 'Check inputs');
        break;
      case 403:
        alert(message || 'Your session has expired, please login again');
        window.location.href = '/login';
        break;
      case 404:
        alert(message || 'Resource not found');
        break;
      case 500:
        alert('Internal server error. Please try again later.');
        break;
      default:
        alert(message || 'Request failed');
    }

    if (onError) onError(message);
  } else if (error.request) {
    // Request made but no response received
    const message = 'No response from server. Please check your connection.';
    alert(message);
    if (onError) onError(message);
  } else {
    // Error in request setup
    const message = error.message || 'Request setup error';
    alert(message);
    if (onError) onError(message);
  }
};

/**
 * Enhanced fetch wrapper with response checking
 * @param {Function} apiCall - The API call function
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback (optional)
 */
export const executeApiCall = async (apiCall, onSuccess, onError) => {
  try {
    const response = await apiCall();
    return checkResponse(response, onSuccess, onError);
  } catch (error) {
    handleApiError(error, onError);
    return false;
  }
};

/**
 * Check if response indicates success
 * @param {Object} response - The response object
 * @returns {boolean} - True if success
 */
export const isSuccessResponse = (response) => {
  const status = response?.status || response?.data?.status;
  return status === 200;
};

/**
 * Extract data from standardized response
 * @param {Object} response - The response object
 * @returns {any} - The data from response
 */
export const extractResponseData = (response) => {
  if (response?.data?.data) {
    return response.data.data;
  }
  if (response?.data) {
    return response.data;
  }
  return response;
};

/**
 * Extract pagination info from response
 * @param {Object} response - The response object
 * @returns {Object} - Pagination information
 */
export const extractPaginationInfo = (response) => {
  return response?.data?.pagination || {
    currentPage: 0,
    totalPages: 1,
    totalElements: 0,
    pageSize: 20,
    hasNext: false,
    hasPrevious: false
  };
};