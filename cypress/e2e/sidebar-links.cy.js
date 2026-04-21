/* global describe, it, beforeEach, cy */

const BASE_PATH = '/ingenzi'

// --- Route builders (reduce repetition) ---

const docAliases = ['@getSectionCategoryByCode', '@getCommonDocDetails', '@getDocStatus']
const thirdPartyAliases = ['@getSectionCategoryByCode', '@getCommThirdParty', '@getDocStatus']

function docRoute(code, heading) {
  return { path: `/dashboard/common-doc-details/${code}`, aliases: docAliases, heading }
}

function thirdPartyRoute(code, heading) {
  return { path: `/dashboard/common_third_party/${code}`, aliases: thirdPartyAliases, heading }
}

function route(path, aliases) {
  return { path, aliases }
}

// --- Route definitions ---

const adminRoutes = [
  route('/dashboard/locations/countries', ['@getCountries']),
  route('/dashboard/locations/entities', ['@getEntities', '@getCountries']),
  route('/dashboard/AccountCategories', ['@getRoles']),
  route('/dashboard/Account', ['@getAccounts']),
]

const standaloneDocRoutes = [
  route('/dashboard/NormeLoi', ['@getNormeLoi', '@getDocStatus']),
  route('/dashboard/commAssetLand', ['@getCommAssetLand', '@getDocStatus', '@getSectionCategories']),
  route('/dashboard/permiConstruction', ['@getPermiConstruction', '@getDocStatus', '@getSectionCategories']),
  route('/dashboard/accordConcession', ['@getAccordConcession', '@getDocStatus', '@getSectionCategories']),
  route('/dashboard/estate', ['@getEstate', '@getDocStatus']),
  route('/dashboard/certLicenses', ['@getCertLicenses', '@getDocStatus']),
  route('/dashboard/cargoDamage', ['@getCargoDamage', '@getDocStatus']),
]

const commonDocRoutes = [
  docRoute('ORG_FIN', 'Financial'),
  docRoute('ORG_PROC', 'Procurement'),
  docRoute('ORG_HR', 'Human Resources'),
  docRoute('ORG_TECH', 'Technical'),
  docRoute('ORG_IT', 'IT'),
  docRoute('ORG_RE', 'Real Estate'),
  docRoute('ORG_SH', 'Shareholders'),
  docRoute('ORG_LEGAL', 'Legal'),
  docRoute('ORG_QUAL', 'Quality'),
  docRoute('ORG_HSE', 'HSE'),
  docRoute('ORG_EQUIP', 'Equipment'),
  docRoute('ORG_DA', 'Drug & Alcohol'),
  docRoute('ORG_INC', 'Incident Reports'),
  docRoute('ORG_SOP', 'SOP'),
  docRoute('ORG_RENT_CON', 'Rental Contracts'),
]

const thirdPartyDocRoutes = [
  thirdPartyRoute('ORG_SUPP', 'Suppliers'),
  thirdPartyRoute('ORG_CLIENT', 'Client Commercial'),
  thirdPartyRoute('ORG_RENT_ASSET', 'Rental Assets'),
]

const otherRoutes = [
  route('/dashboard/docstatus', ['@getDocStatus']),
]

const allRoutes = [
  ...adminRoutes,
  ...standaloneDocRoutes,
  ...commonDocRoutes,
  ...thirdPartyDocRoutes,
  ...otherRoutes,
]

// --- Test helpers ---

function waitForApis(aliases) {
  aliases.forEach((alias) => cy.wait(alias))
}

function waitForContent(heading) {
  if (heading) {
    cy.get('.page-title-group h5, .page-title-group h6', { timeout: 10000 })
      .should(($el) => {
        const text = $el.map((_, el) => el.textContent).get().join(' ')
        expect(text).to.contain(heading)
      })
  } else {
    cy.get('h1, h2, table, .page-title, .card')
      .should('be.visible')
  }
}

function scrollActiveMenuIntoView() {
  const activeSelector = '.sidebar-menu-child.bg-primary, .sidebar-menu-grandchild.bg-primary, .sidebar-standalone-item.bg-primary'
  cy.get('body').then(($body) => {
    if ($body.find(activeSelector).length) {
      cy.get(activeSelector).first().then(($el) => {
        // Use native scrollIntoView with 'center' to handle position:fixed containers
        $el[0].scrollIntoView({ block: 'center', inline: 'nearest' })
      })
      // Wait for the browser to repaint after scroll
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(300)
    }
  })
}

function takeScreenshot(path) {
  const cleanPath = path.replace(/\//g, '_')
  cy.screenshot(`sidebar${cleanPath}`, { capture: 'viewport' })
}

// --- Test suite ---

describe('Sidebar links coverage (route + axios retrieval)', () => {
  beforeEach(() => {
    cy.mockAppApis()
  })

  it('visits each sidebar linked page and verifies expected axios calls + screenshots', () => {
    cy.wrap(allRoutes).each(({ path, aliases, heading }) => {
      cy.log(`Testing route: ${path}`)
      cy.visitAuthed(path)
      waitForApis(aliases)
      cy.location('pathname', { timeout: 10000 }).should('eq', BASE_PATH + path)
      waitForContent(heading)
      scrollActiveMenuIntoView()
      takeScreenshot(path)
    })
  })
})