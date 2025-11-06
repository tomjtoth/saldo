describe("Signing in", () => {
  it("works without image on the OAuth profile", () => {
    cy.login();
    cy.get("svg#usermenu-opener").should("exist");
  });

  it("works with image on the OAuth profile", () => {
    cy.login({ email: "withImage@dev.dev" });
    cy.get("img[src='/globe.svg']#usermenu-opener").should("exist");
  });
});

describe("Signing out", () => {
  it("works", () => {
    cy.login();
    cy.logout();
    cy.get("#sign-in-button", { timeout: 10000 }).should("exist");
    cy.get("#usermenu-opener svg").should("not.exist");
  });
});
