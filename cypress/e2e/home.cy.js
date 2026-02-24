/* global describe, it, beforeEach, cy */

describe('Home page', () => {
  beforeEach(() => {
    cy.mockAppApis()
  })

  it('loads login page', () => {
    cy.visit('/login')
    cy.get('input[name="username"]').should('be.visible')
    cy.get('input[name="password"]').should('be.visible')
    cy.get('button[type="submit"]').should('be.visible')
  })

  it('loads dashboard when authenticated', () => {
    cy.visitAuthed('/dashboard')
    cy.contains('Admin dashboard').should('be.visible')
    cy.contains('a', 'Dashboard').should('be.visible')
  })
})