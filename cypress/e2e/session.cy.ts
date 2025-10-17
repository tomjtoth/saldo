import { login, logout } from "./utils.cy";

describe("Signing in", () => {
  it("works without image on the OAuth profile", () => {
    login();
    cy.get("#sidepanel-opener svg").should("exist");
  });

  it("works with image on the OAuth profile", () => {
    login({ email: "withImage@dev.dev" });
    cy.get("#sidepanel-opener img[src='/globe.svg']").should("exist");
  });
});

describe("Signing out", () => {
  it("works", () => {
    login();
    logout();
    cy.get("#sign-in-button", { timeout: 10000 }).should("exist");
    cy.get("#sidepanel-opener svg").should("not.exist");
  });
});
