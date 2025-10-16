import { login } from "./session.cy";

describe("receipts", () => {
  describe("while logged in", () => {
    beforeEach(() => {
      login({ page: "/receipts" });
    });

    it.only("can be accessed", () => {
      cy.visit("/receipts");
      cy.contains("receipt for group").should("exist");
    });
  });
});
