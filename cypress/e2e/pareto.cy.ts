describe("pareto", () => {
  describe("while logged in", () => {
    beforeEach(() => {
      cy.populateDb();
      cy.login({ page: "/pareto" });
    });

    itIsAccessibleViaViewSelector("/pareto");

    it("can be accessed", () => {
      cy.contains("no data to show").should("exist");
    });
  });

  describe("while *NOT* logged in", () => {
    it("should redirect to login", () => {
      cy.visit("/pareto");
      cy.loginShouldBeVisible();
    });
  });
});
