it("The import section should be visible", () => {
  cy.cleanup();
  cy.visit("/");
  cy.get("#import-btn", { timeout: 10000 }).should("exist");
});
