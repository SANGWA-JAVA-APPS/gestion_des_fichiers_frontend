/* global describe, it, beforeEach, cy, Cypress */

const BASE_PATH = '/ingenzi'

// --- Shared helpers ---

function openAddModal() {
  cy.get('button.btn-primary').filter(':contains("Add"), :contains("Ajouter"), :contains("Add Document")')
    .first()
    .click({ force: true })
  cy.get('.modal').should('be.visible')
}

function fillField(name, value, type = 'text') {
  if (type === 'select') {
    cy.get(`.modal select[name="${name}"]`).select(value)
  } else if (type === 'textarea') {
    cy.get(`.modal textarea[name="${name}"]`).clear().type(value)
  } else if (type === 'file') {
    cy.get('.modal input[type="file"]').selectFile('cypress/fixtures/test-upload.txt', { force: true })
  } else {
    cy.get(`.modal input[name="${name}"]`).clear().type(value)
  }
}

function fillFields(fields) {
  fields.forEach(({ name, value, type }) => {
    fillField(name, value, type)
  })
}

function screenshotFilledForm(label) {
  const clean = label.replace(/\//g, '_')
  cy.screenshot(`form-filled_${clean}`, { capture: 'viewport' })
}

function clickSave() {
  cy.get('.modal button[type="submit"].btn-primary').click({ force: true })
}

function screenshotAfterSave(label) {
  const clean = label.replace(/\//g, '_')
  // Wait for modal to close or response to appear
  cy.wait(500) // eslint-disable-line cypress/no-unnecessary-waiting
  cy.screenshot(`form-saved_${clean}`, { capture: 'viewport' })
}

function verifySaveRequest(alias) {
  cy.wait(alias).then((interception) => {
    expect(interception.response.statusCode).to.eq(201)
    expect(interception.request.method).to.eq('POST')
  })
}

// --- Form data definitions per route ---

const formRoutes = [
  {
    path: '/dashboard/locations/entities',
    aliases: ['@getEntities', '@getCountries'],
    saveAlias: '@saveEntity',
    label: 'Entity',
    fields: [
      { name: 'name', value: 'Kigali Branch', type: 'text' },
      { name: 'countryId', value: '1', type: 'select' },
      { name: 'entityType', value: 'CITY', type: 'select' },
      { name: 'code', value: 'KGL-001', type: 'text' },
      { name: 'postalCode', value: '10001', type: 'text' },
      { name: 'description', value: 'Main branch in Kigali', type: 'textarea' },
    ]
  },
  {
    path: '/dashboard/Account',
    aliases: ['@getAccounts'],
    saveAlias: '@saveAccount',
    label: 'Account',
    fields: [
      { name: 'username', value: 'testuser01', type: 'text' },
      { name: 'password', value: 'SecurePass123!', type: 'text' },
      { name: 'fullName', value: 'Jean Dupont', type: 'text' },
      { name: 'email', value: 'jean.dupont@example.com', type: 'text' },
      { name: 'phoneNumber', value: '+250788123456', type: 'text' },
      { name: 'gender', value: 'male', type: 'select' },
      { name: 'categoryId', value: '1', type: 'select' },
      { name: 'countryId', value: '1', type: 'select' },
      { name: 'locationEntityId', value: '1', type: 'select' },
    ]
  },
  {
    path: '/dashboard/NormeLoi',
    aliases: ['@getNormeLoi', '@getDocStatus'],
    saveAlias: '@saveNormeLoi',
    label: 'NormeLoi',
    fields: [
      { name: 'reference', value: 'NL-2026-001', type: 'text' },
      { name: 'dateVigueur', value: '2026-04-11', type: 'text' },
      { name: 'description', value: 'Environmental regulation compliance document', type: 'textarea' },
      { name: 'domaineApplication', value: 'Environmental Safety', type: 'text' },
      { name: null, value: null, type: 'file' },
      { name: 'status.id', value: '1', type: 'select' },
    ]
  },
  {
    path: '/dashboard/commAssetLand',
    aliases: ['@getCommAssetLand', '@getDocStatus', '@getSectionCategories'],
    saveAlias: '@saveCommAssetLand',
    label: 'CommAssetLand',
    fields: [
      { name: 'reference', value: 'CAL-2026-001', type: 'text' },
      { name: 'dateObtention', value: '2026-03-15', type: 'text' },
      { name: 'description', value: 'Commercial land title document for Zone A', type: 'textarea' },
      { name: 'emplacement', value: 'Zone Industrielle Kigali', type: 'text' },
      { name: 'coordonneesGps', value: '-1.9403, 29.8739', type: 'text' },
      { name: null, value: null, type: 'file' },
      { name: 'status.id', value: '1', type: 'select' },
      { name: 'section.id', value: '1', type: 'select' },
    ]
  },
  {
    path: '/dashboard/permiConstruction',
    aliases: ['@getPermiConstruction', '@getDocStatus', '@getSectionCategories'],
    saveAlias: '@savePermiConstruction',
    label: 'PermiConstruction',
    fields: [
      { name: 'projet', value: 'Warehouse Extension B2', type: 'text' },
      { name: 'autoriteDelivrance', value: 'City of Kigali', type: 'text' },
      { name: 'dateDelivrance', value: '2026-01-10', type: 'text' },
      { name: 'dateExpiration', value: '2027-01-10', type: 'text' },
      { name: 'referenceTitreFoncier', value: 'TF-KGL-2026-088', type: 'text' },
      { name: 'refPermisConstuire', value: 'PC-2026-042', type: 'text' },
      { name: 'dateValidation', value: '2026-02-01', type: 'text' },
      { name: 'dateEstimeeTravaux', value: '2026-06-01', type: 'text' },
      { name: null, value: null, type: 'file' },
      { name: 'status.id', value: '1', type: 'select' },
      { name: 'numeroPermis', value: 'NP-2026-042', type: 'text' },
      { name: 'sectionCategory.id', value: '1', type: 'select' },
    ]
  },
  {
    path: '/dashboard/accordConcession',
    aliases: ['@getAccordConcession', '@getDocStatus', '@getSectionCategories'],
    saveAlias: '@saveAccordConcession',
    label: 'AccordConcession',
    fields: [
      { name: 'numeroAccord', value: 'AC-2026-007', type: 'text' },
      { name: 'contratConcession', value: 'Mining rights contract Rutongo', type: 'text' },
      { name: 'objetConcession', value: 'Tin ore extraction rights', type: 'text' },
      { name: 'concessionnaire', value: 'Rwanda Mining Corp', type: 'text' },
      { name: 'dureeAnnees', value: '15', type: 'text' },
      { name: 'conditionsFinancieres', value: '5% royalty on gross revenue', type: 'text' },
      { name: 'emplacement', value: 'Rutongo Sector, Rulindo District', type: 'text' },
      { name: 'coordonneesGps', value: '-1.7896, 29.8345', type: 'text' },
      { name: 'rapportTransfertGestion', value: 'Transfer pending environmental review', type: 'textarea' },
      { name: 'dateDebutConcession', value: '2026-01-01T08:00', type: 'text' },
      { name: 'dateFinConcession', value: '2041-01-01T08:00', type: 'text' },
      { name: null, value: null, type: 'file' },
      { name: 'statusId', value: '1', type: 'select' },
      { name: 'sectionCategoryId', value: '1', type: 'select' },
    ]
  },
  {
    path: '/dashboard/estate',
    aliases: ['@getEstate', '@getDocStatus'],
    saveAlias: '@saveEstate',
    label: 'Estate',
    fields: [
      { name: 'reference', value: 'EST-2026-003', type: 'text' },
      { name: 'estateType', value: 'Warehouse', type: 'text' },
      { name: 'emplacement', value: 'Free Trade Zone, Kigali', type: 'text' },
      { name: 'coordonneesGps', value: '-1.9561, 30.0644', type: 'text' },
      { name: 'dateOfBuilding', value: '2020-06-15', type: 'text' },
      { name: 'comments', value: 'Main storage facility, 2500 sqm', type: 'textarea' },
      { name: null, value: null, type: 'file' },
      { name: 'status.id', value: '1', type: 'select' },
    ]
  },
  {
    path: '/dashboard/certLicenses',
    aliases: ['@getCertLicenses', '@getDocStatus'],
    saveAlias: '@saveCertLicenses',
    label: 'CertLicenses',
    fields: [
      { name: 'description', value: 'ISO 9001:2015 Quality Management Certification', type: 'textarea' },
      { name: 'agentCertifica', value: 'Bureau Veritas Rwanda', type: 'text' },
      { name: 'numeroAgent', value: 'BV-RW-2026-114', type: 'text' },
      { name: 'dateCertificate', value: '2026-03-01', type: 'text' },
      { name: 'dureeCertificat', value: '3 years', type: 'text' },
      { name: null, value: null, type: 'file' },
      { name: 'status.id', value: '1', type: 'select' },
    ]
  },
  {
    path: '/dashboard/cargoDamage',
    aliases: ['@getCargoDamage', '@getDocStatus'],
    saveAlias: '@saveCargoDamage',
    label: 'CargoDamage',
    fields: [
      { name: 'refeRequest', value: 'CD-REQ-2026-018', type: 'text' },
      { name: 'quotationContractNum', value: 'QCN-2026-450', type: 'text' },
      { name: 'description', value: 'Container MSCU7294510 damage during unloading at Magerwa', type: 'textarea' },
      { name: 'dateRequest', value: '2026-04-01', type: 'text' },
      { name: 'dateContract', value: '2026-04-05', type: 'text' },
      { name: null, value: null, type: 'file' },
      { name: 'status.id', value: '1', type: 'select' },
    ]
  },
  {
    path: '/dashboard/docstatus',
    aliases: ['@getDocStatus'],
    saveAlias: '@saveDocStatus',
    label: 'DocStatus',
    fields: [
      { name: 'name', value: 'Under Review', type: 'text' },
      { name: 'description', value: 'Document is being reviewed by the compliance team', type: 'textarea' },
    ]
  },
]

// --- CommonDocDetails routes (one sample) ---

const commonDocFormRoutes = [
  {
    path: '/dashboard/common-doc-details/ORG_FIN',
    aliases: ['@getSectionCategoryByCode', '@getCommonDocDetails', '@getDocStatus'],
    saveAlias: '@saveCommonDocDetails',
    label: 'CommonDocDetails-Financial',
    heading: 'Financial',
    fields: [
      { name: 'reference', value: 'FIN-DOC-2026-001', type: 'text' },
      { name: 'description', value: 'Annual financial audit report Q1 2026', type: 'textarea' },
      { name: 'statusId', value: '1', type: 'select' },
      { name: null, value: null, type: 'file' },
      { name: 'dateTime', value: '2026-04-01', type: 'text' },
      { name: 'expirationDate', value: '2027-04-01', type: 'text' },
    ]
  },
  {
    path: '/dashboard/common-doc-details/ORG_HR',
    aliases: ['@getSectionCategoryByCode', '@getCommonDocDetails', '@getDocStatus'],
    saveAlias: '@saveCommonDocDetails',
    label: 'CommonDocDetails-HR',
    heading: 'Human Resources',
    fields: [
      { name: 'reference', value: 'HR-POL-2026-005', type: 'text' },
      { name: 'description', value: 'Employee code of conduct policy update', type: 'textarea' },
      { name: 'statusId', value: '1', type: 'select' },
      { name: null, value: null, type: 'file' },
      { name: 'dateTime', value: '2026-03-15', type: 'text' },
      { name: 'expirationDate', value: '2027-03-15', type: 'text' },
    ]
  },
  {
    path: '/dashboard/common-doc-details/ORG_LEGAL',
    aliases: ['@getSectionCategoryByCode', '@getCommonDocDetails', '@getDocStatus'],
    saveAlias: '@saveCommonDocDetails',
    label: 'CommonDocDetails-Legal',
    heading: 'Legal',
    fields: [
      { name: 'reference', value: 'LEG-2026-012', type: 'text' },
      { name: 'description', value: 'NDA template for vendor agreements', type: 'textarea' },
      { name: 'statusId', value: '1', type: 'select' },
      { name: null, value: null, type: 'file' },
      { name: 'dateTime', value: '2026-02-20', type: 'text' },
      { name: 'expirationDate', value: '2028-02-20', type: 'text' },
    ]
  },
]

// --- CommThirdParty routes (one sample) ---

const thirdPartyFormRoutes = [
  {
    path: '/dashboard/common_third_party/ORG_SUPP',
    aliases: ['@getSectionCategoryByCode', '@getCommThirdParty', '@getDocStatus'],
    saveAlias: '@saveCommThirdParty',
    label: 'ThirdParty-Suppliers',
    heading: 'Suppliers',
    fields: [
      { name: 'name', value: 'Acme Industrial Supplies Ltd', type: 'text' },
      { name: 'location', value: 'Kigali, Rwanda', type: 'text' },
      { name: 'validity', value: '2027-12-31', type: 'text' },
      { name: 'activities', value: 'Industrial equipment and spare parts supplier', type: 'textarea' },
      { name: 'status.id', value: '1', type: 'select' },
      { name: null, value: null, type: 'file' },
    ]
  },
  {
    path: '/dashboard/common_third_party/ORG_CLIENT',
    aliases: ['@getSectionCategoryByCode', '@getCommThirdParty', '@getDocStatus'],
    saveAlias: '@saveCommThirdParty',
    label: 'ThirdParty-Clients',
    heading: 'Client Commercial',
    fields: [
      { name: 'name', value: 'Global Logistics Partners SA', type: 'text' },
      { name: 'location', value: 'Dar es Salaam, Tanzania', type: 'text' },
      { name: 'validity', value: '2027-06-30', type: 'text' },
      { name: 'activities', value: 'Freight forwarding and customs clearance services', type: 'textarea' },
      { name: 'status.id', value: '1', type: 'select' },
      { name: null, value: null, type: 'file' },
    ]
  },
]

const allFormRoutes = [
  ...formRoutes,
  ...commonDocFormRoutes,
  ...thirdPartyFormRoutes,
]

// --- Test suite ---

describe('Form submission: Add, fill, save, and verify', () => {
  beforeEach(() => {
    cy.mockAppApis()
    cy.mockSaveApis()
  })

  allFormRoutes.forEach(({ path, aliases, saveAlias, label, heading, fields }) => {
    it(`fills and saves the form on ${label} (${path})`, () => {
      cy.log(`**--- ${label} ---**`)

      // 1. Visit the page
      cy.visitAuthed(path)
      aliases.forEach((alias) => cy.wait(alias))
      cy.location('pathname', { timeout: 10000 }).should('eq', BASE_PATH + path)

      // Wait for heading if it's a shared-component page
      if (heading) {
        cy.get('.page-title-group h5, .page-title-group h6', { timeout: 10000 })
          .should(($el) => {
            const text = $el.map((_, el) => el.textContent).get().join(' ')
            expect(text).to.contain(heading)
          })
      }

      // 2. Open the Add modal
      openAddModal()
      cy.screenshot(`form-empty_${label}`, { capture: 'viewport' })

      // 3. Fill all form fields
      fillFields(fields)

      // 4. Screenshot the filled form
      screenshotFilledForm(label)

      // 5. Click Save
      clickSave()

      // 6. Verify the POST request was sent to the backend
      verifySaveRequest(saveAlias)

      // 7. Screenshot after save
      screenshotAfterSave(label)
    })
  })
})
