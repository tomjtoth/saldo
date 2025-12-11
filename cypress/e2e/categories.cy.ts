const TEST_CATEGORY = `category-${Date.now()}`;

describe("categories", () => {
  describe("while logged in", () => {
    beforeEach(() => {
      cy.populateDb();
      cy.login({ page: "/categories" });
    });

    itIsAccessibleViaViewSelector("/categories");

    it("can be added and is visible only to its group", () => {
      cy.addEntity(TEST_CATEGORY);

      cy.readDb().then(({ response }) => {
        expect(
          //user #3 has access to 3 groups
          response[3]
            .filter((g) => g.id !== 1)
            .every((g) => g.categories.every((c) => c.name !== TEST_CATEGORY))
        ).to.be.true;
      });
    });

    it("can be renamed", () => {
      cy.addEntity(TEST_CATEGORY);

      cy.modEntity(TEST_CATEGORY, { name: "-2" });

      cy.toast(`Renaming "${TEST_CATEGORY}" succeeded!`);
    });

    it("can be toggled", () => {
      cy.addEntity(TEST_CATEGORY);

      cy.modEntity(TEST_CATEGORY, { toggle: true });

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
    });
  });

  describe("while not logged in", () => {
    it("should not be accessible", () => {
      cy.visit("/categories");
      cy.loginShouldBeVisible();
    });
  });
});
