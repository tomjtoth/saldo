it("The import section should be visible", () => {
  cy.cleanup();
  cy.visit("/");
  cy.get("#import-btn", { timeout: 10000 }).should("exist");
});

it("populating DB works as expected", () => {
  cy.populateDb();
  cy.readDb().then(({ baseline, response }) => {
    expect(baseline).to.deep.eq(response);
  });
});
