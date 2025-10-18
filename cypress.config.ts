import { defineConfig } from "cypress";
import codeCoverage from "@cypress/code-coverage/task";

export default defineConfig({
  env: {
    codeCoverage: {
      url: "http://localhost:3000/api/e2e/coverage",
    },
  },
  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents(on, config) {
      codeCoverage(on, config);
      return config;
    },
  },
});
