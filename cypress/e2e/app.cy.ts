it("The import view should be accessible", () => {
  cy.visit("/");
  cy.get("a").click();
  cy.get("button").should("have.text", "re-import V3");
});
