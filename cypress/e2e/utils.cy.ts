const TOAST_SUCCESS = "div.Toastify__toast--success";

export function successfulToastShwon(msg: string) {
  cy.get(TOAST_SUCCESS, { timeout: 10000 }).then(($toast) => {
    expect($toast.text()).to.eq(msg);
    $toast.trigger("click");
  });

  successfulToastShouldNotExist();
}

export function successfulToastShouldNotExist() {
  cy.get(TOAST_SUCCESS).should("not.exist");
}

/**
 * @param entity `"category"` | `"group"`
 * @returns an object with methods to add/update/open entities
 */
export const methodsOf = (entity: "category" | "group") => ({
  add(name: string, description?: string) {
    // React re-render was dismissing my click event below
    cy.wait(500);
    cy.get(`#${entity}-adder-opener`).click();

    cy.get(`#${entity}-adder-form > input`).type(name);

    if (description)
      cy.get(`#${entity}-adder-form > textarea`).type(description);
    cy.get(`#${entity}-adder-form > button`).click();

    successfulToastShwon(`Saving "${name}" to db succeeded!`);
  },

  update({
    name,
    description,
    toggle,
  }: {
    name?: string;
    description?: string;
    toggle?: true;
  }) {
    cy.get(`div.${entity}`).click();

    if (name) cy.get(`#${entity}-updater-form > input`).type(name);
    if (description)
      cy.get(`#${entity}-updater-form > textarea`).type(description);
    if (toggle) this.toggler.click();

    cy.get(`#${entity}-updater-form > button`).click();
  },

  get toggler() {
    return cy.get(`#${entity}-updater-form > div`).first();
  },
});

export const cleanup = () => cy.request("/api/cleanup");

export const accessibleViaSidepanel = (url: string) =>
  it("are accessible via the sidepanel", () => {
    cy.wait(500);
    cy.get("#sidepanel-opener").click();
    cy.get(`a[href='${url}']`).click();
    cy.location("pathname").should("equal", url);
  });
