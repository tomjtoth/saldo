import { login, loginShouldBeVisible, logout } from "./session.cy";
import {
  accessibleViaSidepanel,
  cleanup,
  entities as groups,
  toast,
} from "./utils.cy";

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
      login();
      cy.visit("/groups");
    });

    afterEach(cleanup);

    accessibleViaSidepanel("/groups");

    it("can be added", () => {
      groups.add(TEST_GROUP);
    });

    it("can be renamed", () => {
      groups.add(TEST_GROUP);

      groups.update(TEST_GROUP, { name: "-2" });

      toast(`Renaming "${TEST_GROUP}" succeeded!`);
      cy.contains(`${TEST_GROUP}-2`).should("exist");
    });

    it("can be toggled", () => {
      groups.add(TEST_GROUP);

      groups.update(TEST_GROUP, { toggle: true });

      toast(`Toggling "${TEST_GROUP}" succeeded!`);
      groups.toggler.should("have.class", "bg-red-500");
      groups.toggler.parent().parent().should("have.class", "border-red-500");
    });

    describe("can be set as favorit", () => {
      it("but not if they're already set favorit", () => {
        groups.add(TEST_GROUP);

        cy.contains(TEST_GROUP).find("svg").click();
        toast("Setting default group succeeded!");
        groups.shouldBeFavorit(TEST_GROUP);

        cy.contains(TEST_GROUP).find("svg").click();
        toast().should("not.exist");
        groups.shouldBeFavorit(TEST_GROUP);
      });
    });

    describe("invitation link", () => {
      it("can be genereated", () => {
        cy.contains("just you").click();

        invLink.copier.should("not.exist");
        invLink.remover.should("not.exist");

        invLink.generator.click();
        toast("Generating invitation link succeeded!");

        invLink.copier.should("exist");
        invLink.generator.should("exist");
        invLink.remover.should("exist");
      });

      it("can be removed", () => {
        groups.add(TEST_GROUP);

        cy.contains(TEST_GROUP)
          // .filter((_, el) => el.textContent === TEST_GROUP)
          .click();

        invLink.generator.click();
        toast().should("not.exist");

        invLink.remover.click();
        toast("Deleting invitation link succeeded!");
        invLink.remover.should("not.exist");
      });

      it("can be used to join a group", () => {
        const g1 = TEST_GROUP + "-1";
        const g2 = TEST_GROUP + "-2";

        groups.add(g1);
        groups.add(g2);

        // generate link for g1
        cy.contains(g1).click();
        invLink.generator.click();
        toast("Generating invitation link succeeded!");

        cy.contains("http://localhost")
          .invoke("text")
          .then((text) => {
            console.log(text);
            const link = text.replaceAll(
              /http:\/\/localhost:3000|\u200b/gu,
              ""
            );

            // close via Canceler
            cy.get("#updater").parent().parent().click(1, 1);

            logout();
            login("e2e2@tester.saldo");
            console.log(link);
            cy.visit(link);
            cy.location("pathname").should("eq", "/groups");
            cy.contains(g1).should("exist");
          });
      });
    });
  });

  describe("while not logged in", () => {
    it("should not be accessible", () => {
      cy.visit("/groups");
      loginShouldBeVisible();
    });
  });
});
