# Download Service - Quick Reference

## Import
```javascript
import { downloadFile, formatFileSize, removeFileExtension } from '../../services/downloadService';
import DownloadConfirmationModal from './DownloadConfirmationModal';
```

## State Setup
```javascript
const [showDownloadModal, setShowDownloadModal] = useState(false);
const [fileToDownload, setFileToDownload] = useState(null);
```

## Handlers
```javascript
// Show confirmation modal
const handleTitleClick = (item) => {
  if (item.document?.filePath) {
    setFileToDownload(item);
    setShowDownloadModal(true);
  }
};

// Confirm and download
const handleConfirmDownload = async () => {
  try {
    await downloadFile(fileToDownload.document);
    setShowDownloadModal(false);
    setFileToDownload(null);
  } catch (err) {
    alert(`Download error: ${err.message}`);
  }
};

// Cancel download
const handleCancelDownload = () => {
  setShowDownloadModal(false);
  setFileToDownload(null);
};
```

## UI Implementation
```javascript
// Clickable title
<Card.Title 
  onClick={() => handleTitleClick(item)}
  style={{ cursor: 'pointer' }}
  title={item.document?.originalFileName}
>
  {removeFileExtension(item.document?.originalFileName)}
</Card.Title>

// Confirmation modal
<DownloadConfirmationModal
  show={showDownloadModal}
  onHide={handleCancelDownload}
  onConfirm={handleConfirmDownload}
  fileName={fileToDownload?.document?.originalFileName || ''}
  fileSize={formatFileSize(fileToDownload?.document?.fileSize)}
  language={language}
/>
```

## Available Functions
- `downloadFile(document)` - Download a file
- `formatFileSize(bytes)` - Format bytes to "1.5 MB"
- `removeFileExtension(filename)` - Remove ".pdf" from "file.pdf"
- `openFileInNewTab(document)` - Open in browser tab
- `getFileUrl(filePath)` - Get direct URL
- `getFileExtension(filename)` - Get extension only
