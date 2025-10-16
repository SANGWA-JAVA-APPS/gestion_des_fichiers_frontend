# PermiConstruction Field Mapping Fix

## Issue
Error when creating construction permit:
```
400 Bad Request: Numero permis is required
```

## Root Cause

The backend entity `PermiConstruction` has TWO separate fields:
- `numeroPermis` - **REQUIRED** field (validated in controller)
- `refPermisConstuire` - Optional additional reference field

### Backend Entity (PermiConstruction.java)
```java
@Column(name = "numero_permis", length = 100)
private String numeroPermis;  // ← REQUIRED

// ... other fields ...

@Column(name = "ref_permis_constuire", length = 100)
private String refPermisConstuire;  // ← Optional
```

### Backend Validation (PermiConstructionController.java)
```java
// Validate required fields
if (permiConstruction.getNumeroPermis() == null || 
    permiConstruction.getNumeroPermis().trim().isEmpty()) {
    return ResponseUtil.badRequest("Numero permis is required");
}
```

### Frontend Issue
The frontend was only sending `refPermisConstuire` but NOT `numeroPermis`:

```javascript
// ❌ WRONG - Missing numeroPermis
const permiConstructionData = {
  referenceTitreFoncier: formData.referenceTitreFoncier,
  refPermisConstuire: formData.refPermisConstuire,  // Only sending this
  dateValidation: ...,
  dateEstimeeTravaux: ...,
  doneBy: { id: ... },
  sectionCategory: { id: ... },
  status: { id: ... }
};
```

## Solution

Map the frontend field `refPermisConstuire` to backend's **required** field `numeroPermis`:

```javascript
// ✅ CORRECT - Now includes numeroPermis
const permiConstructionData = {
  numeroPermis: formData.refPermisConstuire,  // Map frontend field to backend required field
  referenceTitreFoncier: formData.referenceTitreFoncier,
  dateValidation: formData.dateValidation ? new Date(formData.dateValidation).toISOString() : null,
  dateEstimeeTravaux: formData.dateEstimeeTravaux ? new Date(formData.dateEstimeeTravaux).toISOString() : null,
  doneBy: { id: parseInt(formData.doneBy.id) },
  sectionCategory: formData.sectionCategory.id ? { id: parseInt(formData.sectionCategory.id) } : null,
  status: formData.status.id ? { id: parseInt(formData.status.id) } : null
};
```

## File Modified
- `d:\Apache\DEV\REACTJS\gestion_des_fichier\src\components\document\PermiConstructionComponent.jsx`
  - Line ~154-163: Updated `permiConstructionData` object construction

## Field Mapping Summary

| Frontend Field | Backend Field | Required | Notes |
|---------------|---------------|----------|-------|
| `refPermisConstuire` | `numeroPermis` | ✅ Yes | Main permit number |
| `referenceTitreFoncier` | `referenceTitreFoncier` | ❌ No | Land title reference |
| `dateValidation` | `dateValidation` | ❌ No | Validation date |
| `dateEstimeeTravaux` | `dateEstimeeTravaux` | ❌ No | Estimated work date |
| `doneBy.id` | `doneBy` (Account) | ✅ Yes | Account who created record |
| `status.id` | `status` (DocStatus) | ✅ Yes | Document status |
| `sectionCategory.id` | `sectionCategory` | ❌ No | Category section |

## Note
The frontend form field is labeled as `refPermisConstuire` (Construction Permit Reference), but it maps to the backend's `numeroPermis` field. This is a semantic mapping where the frontend term "reference" corresponds to the backend's "numero" (number).

## Testing
After this fix:
1. ✅ Navigate to PermiConstruction component
2. ✅ Fill in required fields (refPermisConstuire, doneBy, status)
3. ✅ Select a file
4. ✅ Submit form
5. ✅ Verify record created successfully without "Numero permis is required" error

**Date Fixed:** October 15, 2025
