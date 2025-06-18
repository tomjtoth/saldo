import { loginAs } from "./session.cy";

function addCategory(name: string, description?: string) {
  // React re-render was dismissing my click event belo
  cy.wait(500);
  cy.get("#category-adder-opener").click();

  cy.get("#category-adder-form > input").type(name);
  if (description) cy.get("#category-adder-form > textarea").type(description);
  cy.get("#category-adder-form > button").click();

  successfulToastShwon(`Saving "${name}" to db succeeded!`);
}

const updaterToggler = () => cy.get("#category-updater-form > div").first();
const openUpdater = () => cy.get(`#category-adder-opener + div`).click();

function updateCategory({
  name,
  descr,
  toggle,
}: {
  name?: string;
  descr?: string;
  toggle?: true;
}) {
  if (name) cy.get("#category-updater-form > input").type(name);
  if (descr) cy.get("#category-updater-form > textarea").type(descr);
  if (toggle) updaterToggler().click();

  cy.get("#category-updater-form > button").click();
}

function successfulToastShwon(msg: string) {
  const toast = "div.Toastify__toast--success";
  cy.get(toast, { timeout: 10000 }).then(($toast) => {
    expect($toast.text()).to.eq(msg);
    $toast.trigger("click");
  });

  cy.get(toast).should("not.exist");
}

function loginShouldBeVisible() {
  cy.location("pathname").should("equal", "/api/auth/signin");
}

const TEST_CATEGORY = `test-cat-${Date.now()}`;

describe("categories", () => {
  describe("while logged in", () => {
    beforeEach(() => {
      loginAs("dev@dev.dev", "TEST_PASSWD");
      cy.visit("/categories");
    });

    afterEach(async () => {
      await new Promise((proceed) => {
        cy.request("/api/cleanup/categories").then(proceed);
      });
    });

    it("are accessible via the sidepanel", () => {
      cy.get("#sidepanel-opener").click();
      cy.get("a[href='/categories']").click();
      cy.get("#categories-adder-opener").click();
    });

    it("can be added", () => {
      addCategory(TEST_CATEGORY);
    });

    it("can be renamed", () => {
      addCategory(TEST_CATEGORY);

      openUpdater();
      updateCategory({ name: "-2" });

      successfulToastShwon(`Updating "${TEST_CATEGORY}-2" succeeded!`);
    });

    it("can be toggled to INACTIVE", () => {
      addCategory(TEST_CATEGORY);

      openUpdater();
      updateCategory({ toggle: true });

      successfulToastShwon(`Updating "${TEST_CATEGORY}" succeeded!`);
      updaterToggler().should("have.class", "bg-red-500");
      updaterToggler().parent().should("have.class", "border-red-500");
    });
  });

  describe("while not logged in", () => {
    it("should not be accessible", () => {
      cy.visit("/categories");
      loginShouldBeVisible();
    });
  });
});
