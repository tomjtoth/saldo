describe("balance", () => {
  describe("while logged in", () => {
    beforeEach(() => {
      cy.login({ page: "/balance" });
    });

    it("can be accessed", () => {
      cy.contains("There is no data to show with those filters").should(
        "exist"
      );
    });
  });

  describe("while *NOT* logged in", () => {
    it("should redirect to login", () => {
      cy.visit("/balance");
      cy.loginShouldBeVisible();
    });
  });
});
