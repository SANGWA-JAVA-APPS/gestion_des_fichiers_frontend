import { defineConfig } from "cypress";

export default defineConfig({
  projectId: "fjnfum",
  allowCypressEnv: false,
  viewportWidth: 1440,
  viewportHeight: 900,

  e2e: {
    baseUrl: "http://localhost:5173",
    setupNodeEvents() {
      // implement node event listeners here
    },
  },
});