describe('App navigation and actions', () => {
  beforeEach(() => {
    cy.mockAppApis()
  })

  it('logs in through UI and redirects to dashboard', () => {
    cy.loginThroughUi()
    cy.url().should('include', '/dashboard')

    cy.window().then((win) => {
      expect(win.localStorage.getItem('authToken')).to.exist
      expect(win.localStorage.getItem('userInfo')).to.contain('mamadou')
    })
  })

  it('navigates dashboard cards and triggers axios list pages', () => {
    cy.visitAuthed('/dashboard')
    cy.contains('Admin dashboard').should('be.visible')

    cy.contains('.dashboard-home-card', 'Accounts').click()
    cy.location('pathname').should('match', /\/dashboard\/account$/i)
    cy.wait('@getAccounts')
    cy.get('table tbody tr').should('have.length.at.least', 1)

    cy.contains('a', 'Dashboard').click()
    cy.contains('Countries').click()
    cy.url().should('include', '/dashboard/locations/countries')
    cy.wait('@getCountries')
    cy.get('table tbody tr').should('have.length.at.least', 1)

    cy.contains('a', 'Dashboard').click()
    cy.contains('Disk usage').click()
    cy.url().should('include', '/dashboard/storage')
    cy.wait('@getDashboardStorage')
    cy.wait('@getTypeSizes')
    cy.contains('Storage').should('be.visible')
  })

  it('opens reporting and validates axios reporting requests', () => {
    cy.visitAuthed('/dashboard/reporting')
    cy.wait('@getReportingSummary')
    cy.wait('@getDocumentTypes')
    cy.wait('@getFileStatuses')

    cy.contains('Reporting').should('be.visible')
    cy.contains('Document Volume by Type').should('be.visible')
    cy.contains('File Status').should('be.visible')
  })

  it('navigates top bar pages and opens key buttons/actions', () => {
    cy.visitAuthed('/dashboard/Account')
    cy.wait('@getAccounts')

    cy.get('button').contains(/Add|Ajouter/i).should('be.visible')

    cy.get('table tbody tr').first().find('button').first().click({ force: true })
    cy.get('.modal').should('be.visible')
    cy.get('.modal .btn-close').click({ force: true })

    cy.contains('a', 'Users').click()
    cy.url().should('include', '/dashboard/users')

    cy.contains('a', 'Reporting').click()
    cy.url().should('include', '/dashboard/reporting')
  })
})
