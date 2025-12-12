const TEST_GROUP = `group-${Date.now()}`;

const invLink = {
  get copier() {
    return cy.contains("Copy 🔗");
  },
  get generator() {
    return cy.contains("Generate 🔁");
  },
  get remover() {
    return cy.contains("Remove 🚫");
  },
};

describe("groups", () => {
  describe("while logged in", () => {
    beforeEach(() => {
      cy.populateDb();
      cy.login({ page: "/groups" });
    });

    itIsAccessibleViaViewSelector("/groups");

    it("can be added", () => {
      cy.addEntity(TEST_GROUP);
    });

    it("can be renamed", () => {
      cy.addEntity(TEST_GROUP);

      cy.modEntity(TEST_GROUP, { name: "-2" });

      cy.toast(`Renaming "${TEST_GROUP}" succeeded!`);
      cy.contains(`${TEST_GROUP}-2`).should("exist");
    });

    it("can be toggled", () => {
      cy.addEntity(TEST_GROUP);

      cy.modEntity(TEST_GROUP, { toggle: true });

      cy.toast(`Toggling "${TEST_GROUP}" succeeded!`);
      cy.entityToggler().should("have.class", "bg-red-500");
      cy.entityToggler()
        .parent()
        .parent()
        .should("have.class", "border-red-500");
    });

    describe("can be set as favorit", () => {
      it("but not if they're already set favorit", () => {
        cy.addEntity(TEST_GROUP);

        cy.contains(TEST_GROUP).find("svg").click();
        cy.toast("Setting default group succeeded!");
        cy.entityShouldBeFavorit(TEST_GROUP);

        cy.contains(TEST_GROUP).find("svg").click();
        cy.toast().should("not.exist");
        cy.entityShouldBeFavorit(TEST_GROUP);
      });
    });

    describe("invitation link", () => {
      it("can be genereated", () => {
        cy.contains("group for users 1-3").click();

        invLink.copier.should("not.exist");
        invLink.remover.should("not.exist");

        invLink.generator.click();
        cy.toast("Generating invitation link succeeded!");

        invLink.copier.should("exist");
        invLink.generator.should("exist");
        invLink.remover.should("exist");
      });

      it("can be removed", () => {
        cy.addEntity(TEST_GROUP);

        cy.contains(TEST_GROUP).click();

        invLink.generator.click();
        cy.toast().should("not.exist");

        invLink.remover.click();
        cy.toast("Deleting invitation link succeeded!");
        invLink.remover.should("not.exist");
      });

      it("can be used to join a group", () => {
        cy.request(
          "/api/e2e/groups/invitation-link/can-be-used-to-join-a-group"
        );
        cy.visit("/join/some-uuid");
        cy.location("pathname").should("eq", "/groups");
        cy.contains("you and me").should("exist");
      });
    });

    it("members can be banned", () => {
      const group = "group for users 1-3";
      cy.contains(group).click();

      cy.contains("user2").children().first().click();
      cy.toast('Banning "user2" succeeded!');

      cy.contains("user2")
        .children()
        .first()
        .should("have.class", "bg-red-500");

      cy.readDb().then(({ response }) => {
        // user1 is unaffected
        expect(response[0].groups[0].name === group).to.be.true;
        expect(response[0].groups.length).to.eq(1);

        // user2 had 2, but we banned them during the test
        expect(response[1].groups.every((g) => g.name !== group)).to.be.true;
        expect(response[1].groups.length).to.eq(1);

        // user3 had 3 groups and is unaffected
        expect(response[2].groups.some((g) => g.name === group));
        expect(response[2].groups.length).to.eq(3);
      });
    });
  });

  describe("while not logged in", () => {
    it("should not be accessible", () => {
      cy.visit("/groups");
      cy.loginShouldBeVisible();
    });
  });
});
