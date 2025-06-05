it("The import view should be accessible", () => {
  cy.visit("/");
  cy.get("#sidepanel-opener").click();
  cy.get("a[href='/import']").click();
  cy.get("#import-btn", { timeout: 10000 }).should("exist");
});
