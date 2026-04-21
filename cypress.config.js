import { defineConfig } from "cypress";

export default defineConfig({
  projectId: "fjnfum",
  allowCypressEnv: false,
  viewportWidth: 1440,
  viewportHeight: 900,

  e2e: {
    baseUrl: "http://localhost:5173/ingenzi",
    specPattern: "cypress/e2e/*.cy.{js,jsx,ts,tsx}",
    excludeSpecPattern: [
      "cypress/e2e/1-getting-started/**",
      "cypress/e2e/2-advanced-examples/**",
    ],
    setupNodeEvents() {
      // implement node event listeners here
    },
  },
  reporter: 'mochawesome',
  reporterOptions: {
    reportDir: 'cypress/reports',
    overwrite: false,
    html: false,
    json: true
  },
});