import { login, loginShouldBeVisible } from "./session.cy";
import {
  accessibleViaSidepanel,
  cleanup,
  methodsOf,
  selectGroup,
  successfulToastShouldNotExist,
  successfulToastShwon,
} from "./utils.cy";

const cats = methodsOf("category");
const groups = methodsOf("group");

const TEST_CATEGORY = `category-${Date.now()}`;

describe("categories", () => {
  describe("while logged in", () => {
    beforeEach(() => {
      login();
      cy.visit("/categories");
    });

    afterEach(cleanup);

    accessibleViaSidepanel("/categories");

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

        cy.contains(TEST_CATEGORY).find("svg").click();
        successfulToastShwon("Setting default category succeeded!");
        cats.shouldBeFavorit(TEST_CATEGORY);

        cy.contains(TEST_CATEGORY).find("svg").click();
        successfulToastShouldNotExist();
        cats.shouldBeFavorit(TEST_CATEGORY);
      });

      it("on a per-group basis", () => {
        const catA = TEST_CATEGORY + "-A";
        const catB = TEST_CATEGORY + "-B";

        cats.add(catA);
        cats.add(catB);

        cy.contains(catA).find("svg").click();
        successfulToastShwon("Setting default category succeeded!");
        cats.shouldBeFavorit(catA);

        cy.visit("/groups");
        groups.add("group2");

        cy.visit("/categories");
        selectGroup("group2");

        cats.add(catA);
        cats.add(catB);

        cy.contains(catB).find("svg").click();
        successfulToastShwon("Setting default category succeeded!");
        cats.shouldBeFavorit(catB);

        selectGroup("just you");
        cats.shouldBeFavorit(catA);
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
