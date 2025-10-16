# NormeLoi Component 500 Error Fix

## Problem Identified
`org.springframework.web.HttpRequestMethodNotSupportedException: Request method 'POST' is not supported`

## Root Causes

### 1. ❌ **Incorrect URL in Frontend**
**Frontend (WRONG):**
```javascript
await apiClient.post('/document/norme-loi/upload', formData, ...)
```

**Backend (ACTUAL):**
```java
@PostMapping(consumes = {"multipart/form-data"})
@RequestMapping("/api/document/norme-loi")
```

**Issue:** Frontend was calling `/upload` endpoint that doesn't exist

---

### 2. ❌ **Incorrect FormData Structure**
**Frontend (WRONG):**
```javascript
formDataToSend.append('reference', formData.reference);
formDataToSend.append('description', formData.description);
formDataToSend.append('doneById', parseInt(formData.doneBy.id));
// ... flat fields
```

**Backend (EXPECTED):**
```java
public ResponseEntity<Map<String, Object>> createNormeLoi(
    @RequestPart("normeLoi") NormeLoi normeLoi,  // JSON object
    @RequestPart("file") MultipartFile file)      // File
```

**Issue:** Backend expects `@RequestPart("normeLoi")` as a JSON blob, not flat fields

---

## Fixes Applied

### ✅ Fix 1: Corrected API URL
**File:** `src/services/Inserts.jsx`

```javascript
// BEFORE ❌
export const createNormeLoiWithFile = async (formData) => {
  const response = await apiClient.post('/document/norme-loi/upload', formData, ...);
};

// AFTER ✅
export const createNormeLoiWithFile = async (formData) => {
  const response = await apiClient.post('/document/norme-loi', formData, ...);
};
```

---

### ✅ Fix 2: Corrected FormData Structure
**File:** `src/components/document/NormeLoiComponent.jsx`

```javascript
// BEFORE ❌
formDataToSend.append('reference', formData.reference);
formDataToSend.append('description', formData.description);
formDataToSend.append('doneById', parseInt(formData.doneBy.id));

// AFTER ✅
const normeLoiData = {
  reference: formData.reference,
  description: formData.description || null,
  dateVigueur: formData.dateVigueur ? new Date(formData.dateVigueur).toISOString() : null,
  domaineApplication: formData.domaineApplication || null,
  doneBy: { id: parseInt(formData.doneBy.id) },
  status: formData.status.id ? { id: parseInt(formData.status.id) } : null
};

// Add normeLoi as JSON blob
formDataToSend.append('normeLoi', new Blob([JSON.stringify(normeLoiData)], {
  type: 'application/json'
}));

// Add file
formDataToSend.append('file', selectedFile);
```

---

### ✅ Fix 3: Simplified Update Logic
**File:** `src/components/document/NormeLoiComponent.jsx`

```javascript
// CREATE (with file) ✅
if (!editingItem && selectedFile) {
  const formDataToSend = new FormData();
  formDataToSend.append('file', selectedFile);
  formDataToSend.append('normeLoi', new Blob([JSON.stringify(normeLoiData)], {
    type: 'application/json'
  }));
  await createNormeLoiWithFile(formDataToSend);
}

// UPDATE (without file - backend doesn't support file update yet) ✅
else if (editingItem) {
  const dataToSubmit = { ...formData, ... };
  await updateNormeLoi(editingItem.id, dataToSubmit);
}
```

---

## Backend-Frontend Mapping

| Aspect | Backend | Frontend |
|--------|---------|----------|
| **URL** | `/api/document/norme-loi` | `/document/norme-loi` ✅ |
| **Method** | `POST` | `POST` ✅ |
| **Content-Type** | `multipart/form-data` | `multipart/form-data` ✅ |
| **Entity Part** | `@RequestPart("normeLoi")` | `formData.append('normeLoi', JSON Blob)` ✅ |
| **File Part** | `@RequestPart("file")` | `formData.append('file', selectedFile)` ✅ |

---

## Testing Checklist

### ✅ Test CREATE
1. Click "Ajouter" button
2. Fill in all required fields:
   - Reference: `NL-2024-001`
   - Done By: Select an account
   - Status: Select a status
   - File: Upload a PDF
3. Click "Enregistrer"
4. **Expected:** Success message, modal closes, data refreshes

### ✅ Test UPDATE
1. Click edit (pencil icon) on existing record
2. Modify fields (reference, description, etc.)
3. Click "Enregistrer"
4. **Expected:** Success message, changes saved

### ✅ Test Validation
1. Click "Ajouter"
2. Leave file empty
3. Click "Enregistrer"
4. **Expected:** Error "Veuillez sélectionner un fichier"

---

## Files Modified

1. ✅ `src/services/Inserts.jsx` - Fixed URL
2. ✅ `src/components/document/NormeLoiComponent.jsx` - Fixed FormData structure
3. ✅ Removed unused import `updateNormeLoiWithFile`

---

## Notes

⚠️ **Update with File Upload Not Supported Yet**
- Backend PUT endpoint uses `@RequestBody`, not `@RequestPart`
- File updates during edit are currently ignored
- Only CREATE supports file upload
- Future enhancement needed for UPDATE with file

---

## Success Criteria

✅ **CREATE** works with file upload  
✅ **UPDATE** works without file change  
✅ No more 500 errors  
✅ No more "POST method not supported"  
✅ FormData matches backend expectations  

---

**Status:** RESOLVED ✅  
**Date:** October 15, 2025
