function loginAs(email: string, passwd: string) {
  cy.visit("/");
  cy.get("#sign-in-button").click();
  cy.get("#email", { timeout: 10000 }).type(email);
  cy.get("#passwd").type(passwd);
  cy.get("#submitButton").click();
}

function logout() {
  cy.get("#user-avatar-container").click();
  cy.get("#sign-out-button").click();
}

describe("Signing in", () => {
  it("works without image on the OAuth profile", () => {
    loginAs("dev@dev.dev", "TEST_PASSWD");
    cy.get("#user-avatar-container svg").should("exist");
  });

  it("works with image on the OAuth profile", () => {
    loginAs("withImage@dev.dev", "TEST_PASSWD");
    cy.get(
      "#user-avatar-container img[src='https://avatar.iran.liara.run/public']"
    ).should("exist");
  });
});

describe("Signing out", () => {
  it("works", () => {
    loginAs("dev@dev.dev", "TEST_PASSWD");
    logout();
    cy.get("#sign-in-button").should("exist");
    cy.get("#user-avatar-container svg").should("not.exist");
  });
});
