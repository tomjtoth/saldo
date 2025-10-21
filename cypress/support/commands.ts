declare global {
  const accessibleViaSidepanel: typeof fnAccessibleViaSidepanel;

  namespace Cypress {
    type MappedCommands<AC = typeof allCommands> = {
      [K in keyof AC]: AC[K] extends (...args: infer A) => infer R
        ? (...args: A) => Chainable<R>
        : never;
    };

    // Declaration merging: this *adds* to the existing interface
    interface Chainable extends MappedCommands {}
  }
}

const fnAccessibleViaSidepanel = (url: string) =>
  it("are accessible via the sidepanel", () => {
    cy.wait(500);
    cy.get("#sidepanel-opener").click();
    cy.get(`a[href='${url}']`).click();
    cy.location("pathname").should("equal", url);
  });

(globalThis as any).accessibleViaSidepanel = fnAccessibleViaSidepanel;

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

function addEntity(name: string, description?: string) {
  // React re-render was dismissing my click event below
  cy.wait(500);
  cy.get("#entity-adder-button").click();

  if (name) cy.get("#entity-adder-form > input").type(name);
  if (description) cy.get("#entity-adder-form > textarea").type(description);
  cy.get("#entity-adder-form > button").click();

  toast(`Saving "${name}" to db succeeded!`);
}

const updateEntity = (
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
) => {
  cy.contains(text)
    .filter((_, el) => el.textContent?.trim() === text)
    .click();

  if (name) cy.get("#updater > input").type(name);
  if (description) cy.get("#updater > textarea").type(description);
  if (toggle) entityToggler().click();

  cy.get("#updater>button").click();
};

const entityToggler = () => cy.get("#updater > div").first();

function entityShouldBeFavorit(name: string) {
  cy.contains(name)
    .filter((_, el) => el.textContent?.trim() === name)
    .find("svg g[fill='#FB0']")
    .should("exist");
}

function cleanup() {
  cy.request("/api/e2e/cleanup");
}

const selectGroup = (group: string) => cy.get("#group-selector").select(group);

function login({
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

function loginShouldBeVisible() {
  cy.location("pathname").should("equal", "/api/auth/signin");
}

function logout() {
  cy.get("#sidepanel-opener").click();
  cy.get("#sign-out-button").click();
  cy.location("pathname", { timeout: 10000 }).should("eq", "/");
}

const allCommands = {
  toast,
  cleanup,
  addEntity,
  updateEntity,
  entityToggler,
  entityShouldBeFavorit,
  selectGroup,
  login,
  logout,
  loginShouldBeVisible,
};

Cypress.Commands.addAll(allCommands);

export {};
