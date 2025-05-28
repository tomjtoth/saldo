it("The import view should be accessible", () => {
  cy.visit("/");
  cy.get("a[href='/import']").click();
  cy.get("#import-btn").should("exist");
});
