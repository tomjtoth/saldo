import { login } from "./session.cy";

describe("receipts", () => {
  describe("while logged in", () => {
    beforeEach(() => {
      login({ page: "/receipts" });
    });

    it("can be accessed", () => {
      cy.contains("receipt for group").should("exist");
    });
  });
});
