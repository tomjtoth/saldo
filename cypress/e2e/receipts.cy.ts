import { login, loginShouldBeVisible, toast } from "./utils.cy";

describe("receipts", () => {
  describe("while logged in", () => {
    beforeEach(() => {
      cy.request("/api/e2e/receipts");
      login({ page: "/receipts" });
    });

    it("can be accessed", () => {
      cy.contains("receipt for group").should("exist");
    });

    it("can be added", () => {
      cy.contains("Add new...").click();
      cy.get("input[placeholder='cost']").type("123");
      cy.contains("Save & clear").click();

      toast("Submitting new receipt succeeded!");
    });
  });

  describe("while *NOT* logged in", () => {
    it("should redirect to login", () => {
      cy.visit("/receipts");
      loginShouldBeVisible();
    });
  });
});
