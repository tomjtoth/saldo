export const toast = (
  text?: string,
  {
    cls = "success",
    autoClose = true,
  }: { cls?: "success" | ""; autoClose?: boolean } = {}
) => {
  let selector = "div.Toastify__toast";
  if (cls) selector += "--" + cls;

  const getter = () => cy.get(selector, { timeout: 10000 });

  return text !== undefined
    ? getter()
        .filter((_, el) => el.textContent === text)
        .then(($node) => {
          if (autoClose) {
            $node.trigger("click");
            cy.wrap($node).should("not.exist");
          }

          return cy.wrap($node);
        })
    : getter();
};

export const entities = {
  add(name: string, description?: string) {
    // React re-render was dismissing my click event below
    cy.wait(500);
    cy.get("#entity-adder-button").click();

    if (name) cy.get("#entity-adder-form > input").type(name);
    if (description) cy.get("#entity-adder-form > textarea").type(description);
    cy.get("#entity-adder-form > button").click();

    toast(`Saving "${name}" to db succeeded!`);
  },

  update(
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
    if (toggle) this.toggler.click();

    cy.get("#updater>button").click();
  },

  get toggler() {
    return cy.get("#updater > div").first();
  },

  shouldBeFavorit(name: string) {
    cy.contains(name)
      .filter((_, el) => el.textContent?.trim() === name)
      .find("svg g[fill='#FB0']")
      .should("exist");
  },
};

export const cleanup = () => cy.request("/api/e2e/cleanup");

export const accessibleViaSidepanel = (url: string) =>
  it("are accessible via the sidepanel", () => {
    cy.wait(500);
    cy.get("#sidepanel-opener").click();
    cy.get(`a[href='${url}']`).click();
    cy.location("pathname").should("equal", url);
  });

export const selectGroup = (group: string) =>
  cy.get("#group-selector").select(group);
