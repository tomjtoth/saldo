import { cleanup } from "./utils.cy";

it("The import section should be visible", () => {
  cleanup();
  cy.visit("/");
  cy.get("#import-btn", { timeout: 10000 }).should("exist");
});
