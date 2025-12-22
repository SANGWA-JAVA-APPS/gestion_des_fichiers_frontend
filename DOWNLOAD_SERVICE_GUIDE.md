# Download Service - Usage Guide

This document explains how to use the reusable download service across all document components.

## Overview

The download service (`src/services/downloadService.js`) provides reusable utilities for:
- Downloading files from the backend
- Opening files in new tabs
- Formatting file sizes
- Handling file extensions

## Installation

Import the functions you need from the download service:

```javascript
import { 
  downloadFile, 
  formatFileSize, 
  removeFileExtension,
  openFileInNewTab,
  getFileUrl 
} from '../../services/downloadService';
```

## Core Functions

### 1. `downloadFile(document)`

Downloads a file from the backend uploads directory.

**Parameters:**
- `document` (Object): Document object containing:
  - `filePath` (string): Backend file path (e.g., "uploads\\norme_loi\\file.pdf")
  - `originalFileName` (string): Original filename for download

**Returns:** Promise<boolean>

**Example:**
```javascript
const handleDownload = async () => {
  try {
    await downloadFile(document);
    console.log('Download successful');
  } catch (error) {
    console.error('Download failed:', error);
    alert('Failed to download file');
  }
};
```

### 2. `formatFileSize(bytes, decimals)`

Converts file size from bytes to human-readable format.

**Parameters:**
- `bytes` (number): File size in bytes
- `decimals` (number, optional): Number of decimal places (default: 2)

**Returns:** string (e.g., "1.5 MB", "234.56 KB")

**Example:**
```javascript
const fileSize = formatFileSize(1572864); // "1.5 MB"
const fileSizeWithDecimals = formatFileSize(1572864, 1); // "1.5 MB"
```

### 3. `removeFileExtension(filename)`

Removes the file extension from a filename.

**Parameters:**
- `filename` (string): Filename with extension

**Returns:** string (filename without extension)

**Example:**
```javascript
const name = removeFileExtension('document.pdf'); // "document"
const nameNoExt = removeFileExtension('report.2024.xlsx'); // "report.2024"
```

### 4. `openFileInNewTab(document)`

Opens a file in a new browser tab (useful for PDFs, images).

**Parameters:**
- `document` (Object): Document object containing `filePath`

**Returns:** Promise<boolean>

**Example:**
```javascript
const handleView = async () => {
  try {
    await openFileInNewTab(document);
  } catch (error) {
    console.error('Failed to open file:', error);
  }
};
```

### 5. `getFileUrl(filePath)`

Gets the direct URL for a file without downloading.

**Parameters:**
- `filePath` (string): Backend file path

**Returns:** string (direct URL to the file)

**Example:**
```javascript
const url = getFileUrl('uploads/norme_loi/file.pdf');
// Returns: "http://localhost:8104/uploads/norme_loi/file.pdf"
```

### 6. `downloadFileWithCustomName(filePath, customFileName)`

Downloads a file with a custom filename.

**Parameters:**
- `filePath` (string): Backend file path
- `customFileName` (string): Custom filename for download

**Returns:** Promise<boolean>

**Example:**
```javascript
await downloadFileWithCustomName(
  'uploads/norme_loi/uuid-file.pdf',
  'my-custom-name.pdf'
);
```

### 7. `getFileExtension(filename)`

Extracts the file extension from a filename.

**Parameters:**
- `filename` (string): Filename with extension

**Returns:** string (file extension in lowercase, e.g., "pdf", "xlsx")

**Example:**
```javascript
const ext = getFileExtension('document.PDF'); // "pdf"
const ext2 = getFileExtension('report.xlsx'); // "xlsx"
```

## Complete Implementation Example

Here's a complete example of implementing download functionality in a document component:

```javascript
import React, { useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import DownloadConfirmationModal from './DownloadConfirmationModal';
import { 
  downloadFile, 
  formatFileSize, 
  removeFileExtension 
} from '../../services/downloadService';

const MyDocumentComponent = () => {
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [fileToDownload, setFileToDownload] = useState(null);
  const [language] = useState('fr');

  // Handle title click to show download confirmation
  const handleTitleClick = (item) => {
    if (item.document && item.document.filePath) {
      setFileToDownload(item);
      setShowDownloadModal(true);
    } else {
      alert(language === 'fr' ? 'Aucun fichier disponible' : 'No file available');
    }
  };

  // Handle download confirmation
  const handleConfirmDownload = async () => {
    if (!fileToDownload || !fileToDownload.document) return;

    try {
      await downloadFile(fileToDownload.document);
      setShowDownloadModal(false);
      setFileToDownload(null);
    } catch (err) {
      console.error('Download error:', err);
      alert(language === 'fr' 
        ? `Erreur lors du téléchargement: ${err.message}` 
        : `Download error: ${err.message}`);
    }
  };

  // Handle download cancellation
  const handleCancelDownload = () => {
    setShowDownloadModal(false);
    setFileToDownload(null);
  };

  return (
    <div>
      {/* Your card component */}
      <Card>
        <Card.Body>
          <Card.Title 
            onClick={() => handleTitleClick(item)}
            style={{ cursor: 'pointer' }}
          >
            {removeFileExtension(item.document?.originalFileName)}
          </Card.Title>
        </Card.Body>
      </Card>

      {/* Download Confirmation Modal */}
      <DownloadConfirmationModal
        show={showDownloadModal}
        onHide={handleCancelDownload}
        onConfirm={handleConfirmDownload}
        fileName={fileToDownload?.document?.originalFileName || ''}
        fileSize={fileToDownload?.document?.fileSize 
          ? formatFileSize(fileToDownload.document.fileSize) 
          : null}
        language={language}
      />
    </div>
  );
};

export default MyDocumentComponent;
```

## Components to Use

### DownloadConfirmationModal

The reusable download confirmation modal is located at:
`src/components/document/DownloadConfirmationModal.jsx`

**Props:**
- `show` (boolean): Controls modal visibility
- `onHide` (function): Callback when modal is closed
- `onConfirm` (function): Callback when download is confirmed
- `fileName` (string): Name of the file to download
- `fileSize` (string): Formatted file size (optional)
- `language` (string): Language code ('fr' or 'en')

## Best Practices

1. **Always use try-catch**: Download operations can fail, so always wrap them in try-catch
2. **Show confirmation**: Use the DownloadConfirmationModal for better UX
3. **Format file sizes**: Use `formatFileSize()` for consistent display
4. **Clean filenames**: Use `removeFileExtension()` for display, keep extension in tooltips
5. **Error handling**: Provide user-friendly error messages in both languages

## Migration Guide

To migrate existing components to use the download service:

1. Import the download service functions
2. Replace manual download logic with `downloadFile()`
3. Replace file size calculations with `formatFileSize()`
4. Replace extension removal logic with `removeFileExtension()`
5. Add the DownloadConfirmationModal component

## Troubleshooting

### Download URL includes `/api`
**Solution:** The service automatically removes `/api` from the URL. Make sure you're using the service and not constructing URLs manually.

### Files not downloading
**Check:**
- Backend `UploadedImagesAccess.java` is configured for `/uploads/**`
- File path uses forward slashes in URL (service handles this automatically)
- Backend server is running on correct port

### Excel files won't open after download
**Check:**
- File size matches original (not corrupted during upload)
- File extension is correct
- MIME type is properly set in backend

## Future Enhancements

Potential features to add:
- Progress tracking for large files
- Batch download support
- Download resume capability
- File preview before download
- Download history tracking
