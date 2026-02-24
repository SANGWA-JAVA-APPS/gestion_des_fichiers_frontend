/* global describe, it, beforeEach, cy */

describe('Sidebar links coverage (route + axios retrieval)', () => {
  beforeEach(() => {
    cy.mockAppApis()
  })

  const sidebarRouteChecks = [
    { path: '/dashboard/locations/countries', aliases: ['@getCountries'] },
    { path: '/dashboard/locations/entities', aliases: ['@getEntities', '@getCountries'] },
    { path: '/dashboard/AccountCategories', aliases: ['@getRoles'] },
    { path: '/dashboard/Account', aliases: ['@getAccounts'] },

    { path: '/dashboard/NormeLoi', aliases: ['@getNormeLoi', '@getDocStatus'] },
    { path: '/dashboard/commAssetLand', aliases: ['@getCommAssetLand', '@getDocStatus', '@getSectionCategories'] },
    { path: '/dashboard/permiConstruction', aliases: ['@getPermiConstruction', '@getDocStatus', '@getSectionCategories'] },
    { path: '/dashboard/accordConcession', aliases: ['@getAccordConcession', '@getDocStatus', '@getSectionCategories'] },
    { path: '/dashboard/estate', aliases: ['@getEstate', '@getDocStatus'] },
    { path: '/dashboard/certLicenses', aliases: ['@getCertLicenses', '@getDocStatus'] },
    { path: '/dashboard/cargoDamage', aliases: ['@getCargoDamage', '@getDocStatus'] },

    { path: '/dashboard/common-doc-details/ORG_FIN', aliases: ['@getSectionCategoryByCode', '@getCommonDocDetails', '@getDocStatus'] },
    { path: '/dashboard/common-doc-details/ORG_PROC', aliases: ['@getSectionCategoryByCode', '@getCommonDocDetails', '@getDocStatus'] },
    { path: '/dashboard/common-doc-details/ORG_HR', aliases: ['@getSectionCategoryByCode', '@getCommonDocDetails', '@getDocStatus'] },
    { path: '/dashboard/common-doc-details/ORG_TECH', aliases: ['@getSectionCategoryByCode', '@getCommonDocDetails', '@getDocStatus'] },
    { path: '/dashboard/common-doc-details/ORG_IT', aliases: ['@getSectionCategoryByCode', '@getCommonDocDetails', '@getDocStatus'] },
    { path: '/dashboard/common-doc-details/ORG_RE', aliases: ['@getSectionCategoryByCode', '@getCommonDocDetails', '@getDocStatus'] },
    { path: '/dashboard/common-doc-details/ORG_SH', aliases: ['@getSectionCategoryByCode', '@getCommonDocDetails', '@getDocStatus'] },
    { path: '/dashboard/common-doc-details/ORG_LEGAL', aliases: ['@getSectionCategoryByCode', '@getCommonDocDetails', '@getDocStatus'] },
    { path: '/dashboard/common-doc-details/ORG_QUAL', aliases: ['@getSectionCategoryByCode', '@getCommonDocDetails', '@getDocStatus'] },
    { path: '/dashboard/common-doc-details/ORG_HSE', aliases: ['@getSectionCategoryByCode', '@getCommonDocDetails', '@getDocStatus'] },
    { path: '/dashboard/common-doc-details/ORG_EQUIP', aliases: ['@getSectionCategoryByCode', '@getCommonDocDetails', '@getDocStatus'] },
    { path: '/dashboard/common-doc-details/ORG_DA', aliases: ['@getSectionCategoryByCode', '@getCommonDocDetails', '@getDocStatus'] },
    { path: '/dashboard/common-doc-details/ORG_INC', aliases: ['@getSectionCategoryByCode', '@getCommonDocDetails', '@getDocStatus'] },
    { path: '/dashboard/common-doc-details/ORG_SOP', aliases: ['@getSectionCategoryByCode', '@getCommonDocDetails', '@getDocStatus'] },

    { path: '/dashboard/common_third_party/ORG_SUPP', aliases: ['@getSectionCategoryByCode', '@getCommThirdParty', '@getDocStatus'] },
    { path: '/dashboard/common-doc-details/ORG_RENT_CON', aliases: ['@getSectionCategoryByCode', '@getCommonDocDetails', '@getDocStatus'] },
    { path: '/dashboard/common_third_party/ORG_CLIENT', aliases: ['@getSectionCategoryByCode', '@getCommThirdParty', '@getDocStatus'] },
    { path: '/dashboard/common_third_party/ORG_RENT_ASSET', aliases: ['@getSectionCategoryByCode', '@getCommThirdParty', '@getDocStatus'] },

    { path: '/dashboard/docstatus', aliases: ['@getDocStatus'] }
  ]

  it('visits each sidebar linked page and verifies expected axios calls', () => {
    sidebarRouteChecks.forEach(({ path, aliases }) => {
      cy.visitAuthed(path)
      cy.location('pathname').should('eq', path)
      aliases.forEach((alias) => {
        cy.wait(alias)
      })
    })
  })
})
