describe("consumption", () => {
  describe("while logged in", () => {
    beforeEach(() => {
      cy.populateDb();
      cy.login({ page: "/consumption" });
    });

    itIsAccessibleViaViewSelector("/consumption");

    it("can be accessed", () => {
      cy.contains("no data to show").should("exist");
    });
  });

  describe("while *NOT* logged in", () => {
    it("should redirect to login", () => {
      cy.visit("/consumption");
      cy.loginShouldBeVisible();
    });
  });
});
