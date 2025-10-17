import { login, loginShouldBeVisible } from "./session.cy";
import {
  accessibleViaSidepanel,
  cleanup,
  entities,
  selectGroup,
  toast,
} from "./utils.cy";

const TEST_CATEGORY = `category-${Date.now()}`;

describe("categories", () => {
  describe("while logged in", () => {
    beforeEach(() => {
      login({ page: "/categories" });
    });

    afterEach(cleanup);

    accessibleViaSidepanel("/categories");

    it("can be added", () => {
      entities.add(TEST_CATEGORY);
    });

    it("can be renamed", () => {
      entities.add(TEST_CATEGORY);

      entities.update(TEST_CATEGORY, { name: "-2" });

      toast(`Renaming "${TEST_CATEGORY}" succeeded!`);
    });

    it("can be toggled", () => {
      entities.add(TEST_CATEGORY);

      entities.update(TEST_CATEGORY, { toggle: true });

      toast(`Toggling "${TEST_CATEGORY}" succeeded!`);
      entities.toggler.should("have.class", "bg-red-500");
      entities.toggler.parent().should("have.class", "border-red-500");
    });

    describe("can be set as favorit", () => {
      it("but not if they're already set favorit", () => {
        entities.add(TEST_CATEGORY);

        cy.contains(TEST_CATEGORY).find("svg").click();
        toast("Setting default category succeeded!");
        entities.shouldBeFavorit(TEST_CATEGORY);

        cy.contains(TEST_CATEGORY).find("svg").click();
        toast().should("not.exist");
        entities.shouldBeFavorit(TEST_CATEGORY);
      });

      it("on a per-group basis", () => {
        const catA = TEST_CATEGORY + "-A";
        const catB = TEST_CATEGORY + "-B";

        entities.add(catA);
        entities.add(catB);

        cy.contains(catA).find("svg").click();
        toast("Setting default category succeeded!");
        entities.shouldBeFavorit(catA);

        cy.visit("/groups");
        entities.add("group2");

        cy.visit("/categories");
        selectGroup("group2");

        entities.add(catA);
        entities.add(catB);

        cy.contains(catB).find("svg").click();
        toast("Setting default category succeeded!");
        entities.shouldBeFavorit(catB);

        selectGroup("just you");
        entities.shouldBeFavorit(catA);
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
