# AccordConcession Field Mapping Fix

## Issue
Error when creating concession agreement:
```
400 Bad Request: Numero accord is required
```

## Root Cause

The backend entity `AccordConcession` has TWO separate fields:
- `numeroAccord` - **REQUIRED** field (validated in controller)
- `contratConcession` - Additional field

### Backend Entity (AccordConcession.java)
```java
@Column(name = "contrat_concession", length = 100)
private String contratConcession;  // ← Additional field

@Column(name = "numero_accord", length = 100)
private String numeroAccord;  // ← REQUIRED field
```

### Backend Validation (AccordConcessionController.java)
```java
// Validate required fields
if (accordConcession.getNumeroAccord() == null || 
    accordConcession.getNumeroAccord().trim().isEmpty()) {
    return ResponseUtil.badRequest("Numero accord is required");
}
```

### Frontend Issue
The frontend was only sending `contratConcession` but NOT `numeroAccord`:

```javascript
// ❌ WRONG - Missing numeroAccord
const accordConcessionData = {
  contratConcession: formData.contratConcession,  // Only sending this
  emplacement: formData.emplacement || null,
  coordonneesGps: formData.coordonneesGps || null,
  rapportTransfertGestion: formData.rapportTransfertGestion || null,
  dateSignature: ...,
  dateExpiration: ...,
  doneBy: { id: ... },
  sectionCategory: { id: ... },
  status: { id: ... }
};
```

## Solution

Map the frontend field `contratConcession` to backend's **required** field `numeroAccord` (while keeping both fields):

```javascript
// ✅ CORRECT - Now includes numeroAccord
const accordConcessionData = {
  numeroAccord: formData.contratConcession,  // Map to backend required field
  contratConcession: formData.contratConcession,  // Also keep original field
  emplacement: formData.emplacement || null,
  coordonneesGps: formData.coordonneesGps || null,
  rapportTransfertGestion: formData.rapportTransfertGestion || null,
  dateSignature: formData.dateSignature ? new Date(formData.dateSignature).toISOString() : null,
  dateExpiration: formData.dateExpiration ? new Date(formData.dateExpiration).toISOString() : null,
  doneBy: { id: parseInt(formData.doneBy.id) },
  sectionCategory: formData.sectionCategory.id ? { id: parseInt(formData.sectionCategory.id) } : null,
  status: formData.status.id ? { id: parseInt(formData.status.id) } : null
};
```

## File Modified
- `d:\Apache\DEV\REACTJS\gestion_des_fichier\src\components\document\AccordConcessionComponent.jsx`
  - Line ~151-162: Updated `accordConcessionData` object construction
  - Added `numeroAccord` field mapping from `contratConcession`

## Field Mapping Summary

| Frontend Field | Backend Field | Required | Notes |
|---------------|---------------|----------|-------|
| `contratConcession` | `numeroAccord` | ✅ Yes | Main agreement number (validated) |
| `contratConcession` | `contratConcession` | ❌ No | Contract reference (also stored) |
| `emplacement` | `emplacement` | ❌ No | Location |
| `coordonneesGps` | `coordonneesGps` | ❌ No | GPS coordinates |
| `rapportTransfertGestion` | `rapportTransfertGestion` | ❌ No | Management transfer report |
| `dateSignature` | `dateSignature` | ❌ No | Signature date |
| `dateExpiration` | `dateExpiration` | ❌ No | Expiration date |
| `doneBy.id` | `doneBy` (Account) | ✅ Yes | Account who created record |
| `status.id` | `status` (DocStatus) | ✅ Yes | Document status |
| `sectionCategory.id` | `sectionCategory` | ❌ No | Category section |

## Note
The frontend form field is labeled as `contratConcession` (Concession Contract), but it maps to TWO backend fields:
1. `numeroAccord` (required) - The agreement number used for validation
2. `contratConcession` - Additional contract reference field

Both fields receive the same value from the frontend form.

## Related Issues
This is the same pattern as the PermiConstruction fix where:
- Frontend: `refPermisConstuire` → Backend: `numeroPermis` (required)
- Frontend: `contratConcession` → Backend: `numeroAccord` (required)

Both cases have a **semantic mismatch** where the frontend field name differs from the backend's validated field name.

## Testing
After this fix:
1. ✅ Navigate to AccordConcession component
2. ✅ Fill in required fields (contratConcession, doneBy, status)
3. ✅ Select a file
4. ✅ Submit form
5. ✅ Verify record created successfully without "Numero accord is required" error

**Date Fixed:** October 15, 2025
