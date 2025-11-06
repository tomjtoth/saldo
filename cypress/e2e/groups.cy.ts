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
      cy.cleanup();
      cy.login({ page: "/groups" });
    });

    itIsAccessibleViaViewSelector("/groups");

    it("can be added", () => {
      cy.addEntity(TEST_GROUP);
    });

    it("can be renamed", () => {
      cy.addEntity(TEST_GROUP);

      cy.updateEntity(TEST_GROUP, { name: "-2" });

      cy.toast(`Renaming "${TEST_GROUP}" succeeded!`);
      cy.contains(`${TEST_GROUP}-2`).should("exist");
    });

    it("can be toggled", () => {
      cy.addEntity(TEST_GROUP);

      cy.updateEntity(TEST_GROUP, { toggle: true });

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
        cy.contains("just you").click();

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

        cy.contains(TEST_GROUP)
          // .filter((_, el) => el.textContent === TEST_GROUP)
          .click();

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
      cy.request("/api/e2e/groups/member-status-can-be-modified");
      cy.reload();
      cy.contains("just you").click();

      cy.contains("user2").children().first().click();
      cy.toast('Banning "user2" succeeded!');

      cy.contains("user2")
        .children()
        .first()
        .should("have.class", "bg-red-500");
      cy.get("#updater").parent().parent().click(1, 1);
      cy.logout();

      cy.login({ email: "user2@e2e.tests" });
      cy.visit("/groups");

      cy.contains("you and me").should("not.exist");
    });
  });

  describe("while not logged in", () => {
    it("should not be accessible", () => {
      cy.visit("/groups");
      cy.loginShouldBeVisible();
    });
  });
});
