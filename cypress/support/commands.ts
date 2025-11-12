import baseline from "../fixtures/baselineDb.json";

declare global {
  const itIsAccessibleViaViewSelector: typeof fnAccessibleViaViewSelector;

  namespace Cypress {
    // unwrap if the command implementation already returns a Cypress.Chainable<T>
    type UnwrapChainableReturn<R> = R extends Cypress.Chainable<infer U>
      ? U
      : R;

    type MappedCommands<AC = typeof allCommands> = {
      [K in keyof AC]: AC[K] extends (...args: infer A) => infer R
        ? (...args: A) => Cypress.Chainable<UnwrapChainableReturn<R>>
        : never;
    };

    // Declaration merging: this *adds* to the existing interface
    interface Chainable extends MappedCommands {}
  }
}

const fnAccessibleViaViewSelector = (url: string, openUserMenu?: true) =>
  it("are accessible via the view selector", () => {
    cy.visit("/");
    cy.wait(500);
    cy.get(`#usermenu-opener${openUserMenu ? "" : " + span"}`).click();
    cy.get(`a[href='${url}']`).click();
    cy.location("pathname", { timeout: 10000 }).should("equal", url);
  });

(globalThis as any).itIsAccessibleViaViewSelector = fnAccessibleViaViewSelector;

function toast(
  text?: string,
  options: { cls?: "success" | ""; autoClose?: boolean } = {}
) {
  const { cls = "success", autoClose = true } = options;
  let selector = "div.Toastify__toast";
  if (cls) selector += "--" + cls;

  const getter = () => cy.get(selector, { timeout: 10000 });

  if (text !== undefined) {
    return getter()
      .filter((_, el) => el.textContent === text)
      .then(($node) => {
        if (autoClose) {
          $node.trigger("click");
          cy.wrap($node).should("not.exist");
        }
        return cy.wrap($node);
      });
  }

  return getter();
}

function cleanup() {
  cy.request("/api/e2e/db/truncate");
}

function populateDb() {
  cy.request("/api/e2e/populate-db");
}

function addEntity(name: string, description?: string) {
  // React re-render was dismissing my click event below
  cy.wait(500);
  cy.get("#entity-adder-button").click();

  if (name) cy.get("#entity-adder-form > input").type(name);
  if (description) cy.get("#entity-adder-form > textarea").type(description);
  cy.get("#entity-adder-form > button").click();

  toast(`Saving "${name}" to db succeeded!`);
}

function modEntity(
  text: string,
  {
    name,
    description,
    toggle,
  }: {
    name?: string;
    description?: string;
    toggle?: true;
  }
) {
  cy.contains(text)
    .filter((_, el) => el.textContent?.trim() === text)
    .click();

  if (name) cy.get("#updater > input").type(name);
  if (description) cy.get("#updater > textarea").type(description);
  if (toggle) entityToggler().click();

  cy.get("#updater>button").click();
}

function entityToggler() {
  return cy.get("#updater > div").first();
}

function entityShouldBeFavorit(name: string) {
  cy.contains(name)
    .filter((_, el) => el.textContent?.trim() === name)
    .find("svg g[fill='#FB0']")
    .should("exist");
}

function selectGroup(group: string) {
  cy.get("#usermenu-opener + span").then(($span) => {
    if ($span.text() !== group) {
      $span.trigger("click");
      cy.contains(group).click();
    }
  });
}

function login({
  page = "/",
  email = "user1@e2e.tests",
  passwd = "TEST_PASSWD",
}: {
  email?: string;
  passwd?: string;
  page?: string;
} = {}) {
  cy.session([email, passwd], () => {
    cy.visit("/api/auth/signin");

    cy.get("#email", { timeout: 10000 }).type(email);
    cy.get("#passwd").type(passwd);
    cy.get("#submitButton").click();
    cy.location("pathname").should("eq", "/");
  });

  cy.visit(page);
}

function loginShouldBeVisible() {
  cy.location("pathname").should("equal", "/api/auth/signin");
}

function logout() {
  cy.get("#usermenu-opener").click();

  Cypress.once("uncaught:exception", (err) => {
    if (err.message.includes("NEXT_REDIRECT")) {
      return false; // prevent Cypress from failing the test
    }
  });

  cy.get("#sign-out-button").click();
  cy.location("pathname", { timeout: 10000 }).should("eq", "/");
}

type DbShape = typeof baseline;

function readDb() {
  return cy.request("/api/e2e/db").then(($res) => {
    const response: DbShape = $res.body;

    baseline.revisions.forEach(
      (rev, idx) => (rev.createdAt = response.revisions[idx].createdAt)
    );

    for (const mdName of ["migrations", "table_column_ids"]) {
      const mdR = response.metadata.find((md) => md.name === mdName)!;
      const mdB = baseline.metadata.find((md) => md.name === mdName)!;
      mdB.payload = mdR.payload;
    }

    return cy.wrap({
      baseline,
      response,
    });
  });
}

const allCommands = {
  toast,
  cleanup,
  populateDb,
  readDb,
  addEntity,
  modEntity,
  entityToggler,
  entityShouldBeFavorit,
  selectGroup,
  login,
  logout,
  loginShouldBeVisible,
};

Cypress.Commands.addAll(allCommands);

export {};
