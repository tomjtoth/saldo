import { loginAs } from "./session.cy";

function addCategory(description: string) {
  cy.get("#category-adder").type(description + "\n");
}

function successfulToastShwon(msg: string) {
  cy.get("div.Toastify__toast--success", { timeout: 10000 })
    .last()
    .should("have.text", msg);

  cy.get("div.Toastify__toast--success", { timeout: 10000 }).should(
    "not.exist"
  );
}

function loginShouldBeVisible() {
  cy.location("pathname").should("equal", "/api/auth/signin");
}

const TEST_CATEGORY = `test-cat-${Date.now()}`;

describe("categories", () => {
  describe("while logged in", () => {
    beforeEach(() => {
      loginAs("dev@dev.dev", "TEST_PASSWD");
      cy.visit("/categories");
    });

    afterEach(async () => {
      await new Promise((proceed) => {
        cy.request("/api/cleanup/categories").then(proceed);
      });
    });

    it("are accessible via the sidepanel", () => {
      cy.get("#sidepanel-opener").click();
      cy.get("a[href='/categories']").click();
      cy.get("#category-adder", { timeout: 10000 }).should("exist");
    });

    it("can be added", () => {
      addCategory(TEST_CATEGORY + 1);
      successfulToastShwon(`Saving "${TEST_CATEGORY + 1}" to db succeeded!`);
    });

    it("can be renamed", () => {
      addCategory(TEST_CATEGORY + 2);
      cy.get(`form.category-row > input[value='${TEST_CATEGORY + 2}']`).type(
        "-2\n"
      );
      successfulToastShwon(
        `Renaming "${TEST_CATEGORY + 2}" to "${TEST_CATEGORY + 2}-2" succeeded!`
      );
    });

    it("can be toggled to INACTIVE", () => {
      addCategory(TEST_CATEGORY + 3);
      cy.get(`form.category-row input[value='${TEST_CATEGORY + 3}']`)
        .parent()
        .next()
        .select("INACTIVE");

      successfulToastShwon(
        `Setting "${TEST_CATEGORY + 3}" to "INACTIVE" succeeded!`
      );
    });
  });

  describe("while not logged in", () => {
    it("should not be accessible", () => {
      cy.visit("/categories");
      loginShouldBeVisible();
    });
  });
});
