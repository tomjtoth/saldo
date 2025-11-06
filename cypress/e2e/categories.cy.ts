const TEST_CATEGORY = `category-${Date.now()}`;

describe("categories", () => {
  describe("while logged in", () => {
    beforeEach(() => {
      cy.cleanup();
      cy.login({ page: "/categories" });
    });

    itIsAccessibleViaViewSelector("/categories");

    it("can be added", () => {
      cy.addEntity(TEST_CATEGORY);
    });

    it("can be renamed", () => {
      cy.addEntity(TEST_CATEGORY);

      cy.updateEntity(TEST_CATEGORY, { name: "-2" });

      cy.toast(`Renaming "${TEST_CATEGORY}" succeeded!`);
    });

    it("can be toggled", () => {
      cy.addEntity(TEST_CATEGORY);

      cy.updateEntity(TEST_CATEGORY, { toggle: true });

      cy.toast(`Toggling "${TEST_CATEGORY}" succeeded!`);
      cy.entityToggler().should("have.class", "bg-red-500");
      cy.entityToggler().parent().should("have.class", "border-red-500");
    });

    describe("can be set as favorit", () => {
      it("but not if they're already set favorit", () => {
        cy.addEntity(TEST_CATEGORY);

        cy.contains(TEST_CATEGORY).find("svg").click();
        cy.toast("Setting default category succeeded!");
        cy.entityShouldBeFavorit(TEST_CATEGORY);

        cy.contains(TEST_CATEGORY).find("svg").click();
        cy.toast().should("not.exist");
        cy.entityShouldBeFavorit(TEST_CATEGORY);
      });

      it("on a per-group basis", () => {
        const catA = TEST_CATEGORY + "-A";
        const catB = TEST_CATEGORY + "-B";

        cy.addEntity(catA);
        cy.addEntity(catB);

        cy.contains(catA).find("svg").click();
        cy.toast("Setting default category succeeded!");
        cy.entityShouldBeFavorit(catA);

        cy.visit("/groups");
        cy.addEntity("group2");

        cy.visit("/categories");
        cy.selectGroup("group2");

        cy.addEntity(catA);
        cy.addEntity(catB);

        cy.contains(catB).find("svg").click();
        cy.toast("Setting default category succeeded!");
        cy.entityShouldBeFavorit(catB);

        cy.selectGroup("just you");
        cy.entityShouldBeFavorit(catA);
      });
    });
  });

  describe("while not logged in", () => {
    it("should not be accessible", () => {
      cy.visit("/categories");
      cy.loginShouldBeVisible();
    });
  });
});
