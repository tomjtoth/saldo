import { loginAs } from "./session.cy";

function addCategory(description: string) {
  cy.get("#category-adder").type(description + "\n");
}

function successfulToastShwon(msg: string) {
  cy.get("div.Toastify__toast--success", { timeout: 10000 })
    .last()
    .should("have.text", msg);
}

function loginShouldBeVisible() {
  cy.get("#email").should("exist");
  cy.get("#passwd").should("exist");
  cy.get("#submitButton").should("exist");
}

const TEST_CATEGORY = `test-cat-${Date.now()}`;

describe("categories", () => {
  it("are accessible via the sidepanel", () => {
    cy.visit("/");
    cy.get("#sidepanel-opener").click();
    cy.get("a[href='/categories']").click();
    cy.get("#category-adder", { timeout: 10000 }).should("exist");
  });

  describe("while logged in", () => {
    beforeEach(() => {
      loginAs("dev@dev.dev", "TEST_PASSWD", "/categories");
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
    beforeEach(() => {
      cy.visit("/categories");
    });

    it("cannot be added", () => {
      addCategory(TEST_CATEGORY);
      loginShouldBeVisible();
    });
  });
});
