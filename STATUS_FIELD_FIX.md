# Status Field Fix - Required for Creation

## Issue
After implementing the JSON blob structure for file uploads, received validation error:
```
Validation failed: Status is required on POST /api/document/cargo-damage
```

## Root Cause
In the initial fix, the status field was conditionally sent only during edit operations:
```javascript
// ❌ WRONG - Only sends status during edit
status: (editingItem && formData.status.id) ? { id: parseInt(formData.status.id) } : null
```

This caused `status: null` to be sent during **creation**, but the backend requires status for both create and update operations.

## Solution
Changed the condition to always send status when it's provided, regardless of create/edit mode:
```javascript
// ✅ CORRECT - Sends status for both create and edit
status: formData.status.id ? { id: parseInt(formData.status.id) } : null
```

## Components Fixed

### ✅ 1. CargoDamageComponent
**Line 149 - Fixed**
```javascript
const cargoDamageData = {
  refeRequest: formData.refeRequest || null,
  description: formData.description || null,
  quotationContractNum: formData.quotationContractNum || null,
  dateRequest: formData.dateRequest ? new Date(formData.dateRequest).toISOString() : null,
  dateContract: formData.dateContract ? new Date(formData.dateContract).toISOString() : null,
  doneBy: { id: parseInt(formData.doneBy.id) },
  status: formData.status.id ? { id: parseInt(formData.status.id) } : null  // ✅ Fixed
};
```

### ✅ 2. AccordConcessionComponent
**Line 160 - Fixed**
```javascript
const accordConcessionData = {
  contratConcession: formData.contratConcession,
  emplacement: formData.emplacement || null,
  coordonneesGps: formData.coordonneesGps || null,
  rapportTransfertGestion: formData.rapportTransfertGestion || null,
  dateSignature: formData.dateSignature ? new Date(formData.dateSignature).toISOString() : null,
  dateExpiration: formData.dateExpiration ? new Date(formData.dateExpiration).toISOString() : null,
  doneBy: { id: parseInt(formData.doneBy.id) },
  sectionCategory: formData.sectionCategory.id ? { id: parseInt(formData.sectionCategory.id) } : null,
  status: formData.status.id ? { id: parseInt(formData.status.id) } : null  // ✅ Fixed
};
```

### ✅ 3. EstateComponent
**Line 153 - Fixed**
```javascript
const estateData = {
  reference: formData.reference,
  estateType: formData.estateType || null,
  emplacement: formData.emplacement || null,
  coordonneesGps: formData.coordonneesGps || null,
  dateOfBuilding: formData.dateOfBuilding ? new Date(formData.dateOfBuilding).toISOString() : null,
  comments: formData.comments || null,
  doneBy: { id: parseInt(formData.doneBy.id) },
  status: formData.status.id ? { id: parseInt(formData.status.id) } : null  // ✅ Fixed
};
```

### ✅ 4. CertLicensesComponent
**Line 149 - Fixed**
```javascript
const certLicenseData = {
  description: formData.description || null,
  agentCertifica: formData.agentCertifica || null,
  numeroAgent: formData.numeroAgent || null,
  dateCertificate: formData.dateCertificate ? new Date(formData.dateCertificate).toISOString() : null,
  dureeCertificat: formData.dureeCertificat || null,
  doneBy: { id: parseInt(formData.doneBy.id) },
  status: formData.status.id ? { id: parseInt(formData.status.id) } : null  // ✅ Fixed
};
```

### ✅ 5. PermiConstructionComponent
**Line 162 - Fixed**
```javascript
const permiConstructionData = {
  referenceTitreFoncier: formData.referenceTitreFoncier,
  refPermisConstuire: formData.refPermisConstuire,
  dateValidation: formData.dateValidation ? new Date(formData.dateValidation).toISOString() : null,
  dateEstimeeTravaux: formData.dateEstimeeTravaux ? new Date(formData.dateEstimeeTravaux).toISOString() : null,
  doneBy: { id: parseInt(formData.doneBy.id) },
  sectionCategory: formData.sectionCategory.id ? { id: parseInt(formData.sectionCategory.id) } : null,
  status: formData.status.id ? { id: parseInt(formData.status.id) } : null  // ✅ Fixed
};
```

## Components Already Correct

### ✅ NormeLoiComponent
Already had the correct implementation - status sent for both create and edit.

### ✅ CommAssetLandComponent
Already had the correct implementation - status sent for both create and edit.

## Backend Validation Requirements

All document controllers validate that `status` is required during creation:

```java
if (cargoDamage.getStatus() == null) {
    log.warn("Validation failed: Status is required");
    return ResponseUtil.badRequest("Status is required");
}
```

This validation is present in:
- ✅ CargoDamageController
- ✅ AccordConcessionController (likely)
- ✅ EstateController (likely)
- ✅ CertLicensesController (likely)
- ✅ PermiConstructionController (likely)

## Testing Checklist

After this fix, test creation with status field:

- [x] CargoDamageComponent - Create with file and status ✅
- [ ] AccordConcessionComponent - Create with file and status
- [ ] EstateComponent - Create with file and status
- [ ] CertLicensesComponent - Create with file and status
- [ ] PermiConstructionComponent - Create with file and status
- [x] NormeLoiComponent - Already working ✅
- [x] CommAssetLandComponent - Already working ✅

## Summary

**Issue:** Status field not sent during creation (only during edit)  
**Impact:** All 5 components would fail validation during creation  
**Fix:** Changed condition from `(editingItem && formData.status.id)` to `formData.status.id`  
**Result:** Status now properly sent for both create and edit operations

**Date Fixed:** October 15, 2025
