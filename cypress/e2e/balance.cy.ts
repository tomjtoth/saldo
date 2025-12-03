describe("balance", () => {
  describe("while logged in", () => {
    beforeEach(() => {
      cy.populateDb();
      cy.login({ page: "/balance" });
    });

    it("can be accessed", () => {
      cy.contains("group for users 1-3").should("exist");
    });

    itIsAccessibleViaViewSelector("/balance");
  });

  describe("while *NOT* logged in", () => {
    it("should redirect to login", () => {
      cy.visit("/balance");
      cy.loginShouldBeVisible();
    });
  });
});
