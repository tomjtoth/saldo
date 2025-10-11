import { loginAs, loginShouldBeVisible } from "./session.cy";
import {
  methodsOf,
  successfulToastShouldNotExist,
  successfulToastShwon,
} from "./utils.cy";

const cats = methodsOf("category");

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
      cy.wait(500);
      cy.get("#sidepanel-opener").click();
      cy.get("a[href='/categories']").click();
      cy.get("#category-adder-opener").click();
    });

    it("can be added", () => {
      cats.add(TEST_CATEGORY);
    });

    it("can be renamed", () => {
      cats.add(TEST_CATEGORY);

      cats.update({ name: "-2" });

      successfulToastShwon(`Renaming "${TEST_CATEGORY}" succeeded!`);
    });

    it("can be toggled", () => {
      cats.add(TEST_CATEGORY);

      cats.update({ toggle: true });

      successfulToastShwon(`Toggling "${TEST_CATEGORY}" succeeded!`);
      cats.toggler.should("have.class", "bg-red-500");
      cats.toggler.parent().should("have.class", "border-red-500");
    });

    describe("can be set as favorit", () => {
      it("but not if they're already set favorit", () => {
        cats.add(TEST_CATEGORY);

        cy.contains(TEST_CATEGORY).children().first().click();
        successfulToastShwon("Setting default category succeeded!");

        cy.contains(TEST_CATEGORY).children().first().click();
        successfulToastShouldNotExist();
      });

      it("on a per group basis", () => {
        cats.add(TEST_CATEGORY);

        cats.update({ toggle: true });

        successfulToastShwon(`Toggling "${TEST_CATEGORY}" succeeded!`);
        cats.toggler.should("have.class", "bg-red-500");
        cats.toggler.parent().should("have.class", "border-red-500");
      });
    });
  });

  describe("while not logged in", () => {
    it("should not be accessible", () => {
      cy.visit("/categories");
      loginShouldBeVisible();
    });
  });
});
