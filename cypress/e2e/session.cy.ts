describe("Signing in", () => {
  it("works without image on the OAuth profile", () => {
    cy.login();
    cy.get("#sidepanel-opener svg").should("exist");
  });

  it("works with image on the OAuth profile", () => {
    cy.login({ email: "withImage@dev.dev" });
    cy.get("#sidepanel-opener img[src='/globe.svg']").should("exist");
  });
});

describe("Signing out", () => {
  it("works", () => {
    cy.login();
    cy.logout();
    cy.get("#sign-in-button", { timeout: 10000 }).should("exist");
    cy.get("#sidepanel-opener svg").should("not.exist");
  });
});
