import { BASE_URL } from './apiConfig';

/**
 * Downloads a file from the backend via API
 * 
 * @param {Object} documentObj - Document object containing id and originalFileName
 * @param {number} documentObj.id - Document ID
 * @param {string} documentObj.originalFileName - Original filename for download
 * @returns {Promise<boolean>} - Returns true if download was successful
 */
export const downloadFile = async (documentObj) => {
  try {
    if (!documentObj || !documentObj.id) {
      throw new Error('Document or ID is missing');
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    // Fetch the file with auth headers
    const response = await fetch(`${BASE_URL}/documents/download/${documentObj.id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    }

    // Get the blob
    const blob = await response.blob();
    
    // Create a blob URL
    const blobUrl = window.URL.createObjectURL(blob);
    
    // Create a temporary link and trigger download
    const link = window.document.createElement('a');
    link.href = blobUrl;
    link.download = documentObj.originalFileName || 'download';
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    
    // Clean up the blob URL
    window.URL.revokeObjectURL(blobUrl);

    return true;
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
};

/**
 * Downloads a file with custom filename
 * 
 * @param {string} filePath - Backend file path
 * @param {string} customFileName - Custom filename for download
 * @returns {Promise<boolean>} - Returns true if download was successful
 */
export const downloadFileWithCustomName = async (filePath, customFileName) => {
  try {
    if (!filePath) {
      throw new Error('File path is missing');
    }

    // Convert Windows backslashes to forward slashes for URL
    const normalizedPath = filePath.replace(/\\/g, '/');
    
    // Construct the download URL without /api
    const baseUrl = BASE_URL.replace('/api', '');
    const downloadUrl = `${baseUrl}/${normalizedPath}`;
    
    console.log('Downloading from:', downloadUrl);
    
    // Create a temporary link and trigger download
    const link = window.document.createElement('a');
    link.href = downloadUrl;
    link.download = customFileName || 'download';
    link.target = '_blank';
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);

    return true;
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
};

/**
 * Opens a file in a new browser tab instead of downloading
 * Useful for viewing PDFs, images, etc. in the browser
 * 
 * @param {Object} documentObj - Document object containing filePath
 * @param {string} documentObj.filePath - Backend file path
 * @returns {Promise<boolean>} - Returns true if file was opened successfully
 */
export const openFileInNewTab = async (documentObj) => {
  try {
    if (!documentObj || !documentObj.filePath) {
      throw new Error('Document or file path is missing');
    }

    // Convert Windows backslashes to forward slashes for URL
    const filePath = documentObj.filePath.replace(/\\/g, '/');
    
    // Construct the URL without /api
    const baseUrl = BASE_URL.replace('/api', '');
    const fileUrl = `${baseUrl}/${filePath}`;
    
    console.log('Opening file from:', fileUrl);
    
    // Open in new tab
    window.open(fileUrl, '_blank');

    return true;
  } catch (error) {
    console.error('Open file error:', error);
    throw error;
  }
};

/**
 * Gets the direct URL for a file
 * 
 * @param {string} filePath - Backend file path
 * @returns {string} - Direct URL to the file
 */
export const getFileUrl = (filePath) => {
  if (!filePath) return '';
  
  // Convert Windows backslashes to forward slashes for URL
  const normalizedPath = filePath.replace(/\\/g, '/');
  
  // Construct the URL without /api
  const baseUrl = BASE_URL.replace('/api', '');
  return `${baseUrl}/${normalizedPath}`;
};

/**
 * Format file size from bytes to human-readable format
 * 
 * @param {number} bytes - File size in bytes
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} - Formatted file size (e.g., "1.5 MB")
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (!bytes || bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Extract file extension from filename
 * 
 * @param {string} filename - Filename with extension
 * @returns {string} - File extension (e.g., "pdf", "xlsx")
 */
export const getFileExtension = (filename) => {
  if (!filename) return '';
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1) return '';
  return filename.substring(lastDotIndex + 1).toLowerCase();
};

/**
 * Remove file extension from filename
 * 
 * @param {string} filename - Filename with extension
 * @returns {string} - Filename without extension
 */
export const removeFileExtension = (filename) => {
  if (!filename) return '';
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1) return filename;
  return filename.substring(0, lastDotIndex);
};
