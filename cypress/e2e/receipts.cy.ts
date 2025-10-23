describe("receipts", () => {
  describe("while logged in", () => {
    beforeEach(() => {
      cy.populateDb();
      cy.login({ page: "/receipts" });
    });

    it("can be accessed", () => {
      cy.contains("receipt for group").should("exist");
    });

    itIsAccessibleViaSidepanel("/receipts");

    it("can be added", () => {
      cy.contains("Add new...").click();
      cy.get("input[placeholder='cost']").type("123");
      cy.contains("Save & clear").click();

      cy.toast("Submitting new receipt succeeded!");
    });
  });

  describe("while *NOT* logged in", () => {
    it("should redirect to login", () => {
      cy.visit("/receipts");
      cy.loginShouldBeVisible();
    });
  });
});
