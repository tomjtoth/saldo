export function loginAs(email: string, passwd: string, fromPage = "/") {
  cy.visit(fromPage);
  cy.get("#sign-in-button").click();
  cy.get("#email", { timeout: 10000 }).type(email);
  cy.get("#passwd").type(passwd);
  cy.get("#submitButton").click();
}

function logout() {
  cy.get("#sidepanel-opener").click();
  cy.get("#sign-out-button").click();
}

describe("Signing in", () => {
  it("works without image on the OAuth profile", () => {
    loginAs("dev@dev.dev", "TEST_PASSWD");
    cy.get("#sidepanel-opener svg").should("exist");
  });

  it("works with image on the OAuth profile", () => {
    loginAs("withImage@dev.dev", "TEST_PASSWD");
    cy.get("#sidepanel-opener img[src='/globe.svg']").should("exist");
  });
});

describe("Signing out", () => {
  it("works", () => {
    loginAs("dev@dev.dev", "TEST_PASSWD");
    logout();
    cy.get("#sign-in-button").should("exist");
    cy.get("#sidepanel-opener svg").should("not.exist");
  });
});
