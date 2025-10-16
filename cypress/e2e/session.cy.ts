export function login({
  page = "/",
  email = "user1@e2e.tests",
  passwd = "TEST_PASSWD",
}: {
  email?: string;
  passwd?: string;
  page?: string;
} = {}) {
  cy.visit(page);

  if (page === "/") cy.get("#sign-in-button").click();

  cy.get("#email", { timeout: 10000 }).type(email);
  cy.get("#passwd").type(passwd);
  cy.get("#submitButton").click();
}

export function loginShouldBeVisible() {
  cy.location("pathname").should("equal", "/api/auth/signin");
}

export function logout() {
  cy.get("#sidepanel-opener").click();
  cy.get("#sign-out-button").click();
  cy.location("pathname", { timeout: 10000 }).should("eq", "/");
}

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
    cy.get("#sign-in-button").should("exist");
    cy.get("#sidepanel-opener svg").should("not.exist");
  });
});
