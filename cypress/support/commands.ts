import baseline from "../fixtures/baselineDb.json";

declare global {
  const itIsAccessibleViaViewSelector: typeof fnAccessibleViaViewSelector;

  namespace Cypress {
    // unwrap if the command implementation already returns a Cypress.Chainable<T>
    type UnwrapChainableReturn<R> = R extends Cypress.Chainable<infer U>
      ? U
      : R;

    type MappedCommands<AC = typeof commands> = {
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

const commands = {
  toast(
    text?: string,
    options: { cls?: "success" | ""; autoClose?: boolean } = {}
  ) {
    const { cls = "success", autoClose = true } = options;
    let selector = "div.Toastify__toast";
    if (cls) selector += "--" + cls;

    const getter = () => cy.get(selector, { timeout: 10000 });

    if (text !== undefined) {
      return getter().then(($nodes) => {
        const $node = $nodes.filter((_, el) => el.textContent === text);
        const wrapped = cy.wrap($node);

        if (autoClose) {
          $node.trigger("click");
          wrapped.should("not.exist");
        }

        return wrapped;
      });
    }

    return getter();
  },

  cleanup() {
    cy.request("/api/e2e/db/truncate");
  },

  clickCanceler(idx = 0) {
    cy.get("div.absolute.top-0.left-0").then(($nodes) =>
      cy.wrap($nodes[idx]).click(1, 1)
    );
  },

  populateDb() {
    cy.request("/api/e2e/db/populate");
  },

  readDb() {
    return cy.request("/api/e2e/db").then(($res) => {
      const response: typeof baseline = $res.body;

      // syncing random values, like users' color and
      // revisions' createdAt timestamps,
      // looking up by IDs
      baseline.forEach(({ user: bUser, groups: bGroups }) => {
        const { user: rUser } = response.find((r) => r.user.id === bUser.id)!;
        bUser.color = rUser.color;

        bGroups.forEach((bGroup) => {
          const { groups: rGroups } = response.find(
            (res) => res.user.id === bUser.id
          )!;

          const rGroup = rGroups.find((g) => g.id === bGroup.id);
          if (!rGroup) return;

          bGroup.memberships.forEach((bMs) => {
            const rMs = rGroup.memberships.find(
              (ms) => ms.userId === bMs.userId
            );
            if (!rMs) return;

            bMs.revision.createdAt = rMs.revision.createdAt;
            bMs.user.color = rMs.user.color;
          });

          bGroup.categories.forEach((bCat) => {
            const rCat = rGroup.categories.find((c) => c.id === bCat.id)!;

            bCat.revision.createdAt = rCat.revision.createdAt;
            bCat.archives.forEach((bCatArchive, iCatArchive) => {
              bCatArchive.revision.createdAt =
                rCat.archives[iCatArchive].revision.createdAt;
            });
          });

          bGroup.receipts.forEach((bRec) => {
            const rRec = rGroup.receipts.find((r) => r.id === bRec.id)!;

            bRec.paidOn = rRec.paidOn;
            bRec.revision.createdAt = rRec.revision.createdAt;
          });
        });
      });

      return cy.wrap({
        baseline,
        response,
      });
    });
  },

  addEntity(name: string, description?: string) {
    // React re-render was dismissing my click event below
    cy.wait(500);
    cy.get("#entity-adder-button").click();

    if (name) cy.get("#entity-adder-form > input").type(name);
    if (description) cy.get("#entity-adder-form > textarea").type(description);
    cy.get("#entity-adder-form > button").click();

    commands.toast(`Saving "${name}" to db succeeded!`);
  },

  modEntity(
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
    if (toggle) commands.entityToggler().click();

    cy.get("#updater>button").click();
  },

  entityToggler() {
    return cy.get("#updater > div > div").first();
  },

  updaterForm() {
    return cy.get("#updater");
  },

  entityShouldBeFavorit(name: string) {
    cy.contains(name)
      .filter((_, el) => el.textContent?.trim() === name)
      .find("svg g[fill='#FB0']")
      .should("exist");
  },

  selectGroup(group: string) {
    cy.wait(500);
    cy.get("#usermenu-opener + span").then(($span) => {
      if ($span.text() !== group) {
        $span.trigger("click");
        cy.get("#groups-listing").contains(group).click();
      }
    });
  },

  login({
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
  },

  logout() {
    cy.get("#usermenu-opener").click();

    Cypress.once("uncaught:exception", (err) => {
      if (err.message.includes("NEXT_REDIRECT")) {
        return false; // prevent Cypress from failing the test
      }
    });

    cy.get("#sign-out-button").click();
    cy.location("pathname", { timeout: 10000 }).should("eq", "/");
  },

  loginShouldBeVisible() {
    cy.location("pathname").should("equal", "/api/auth/signin");
  },
};

Cypress.Commands.addAll(commands);

type Unchain<T> = T extends Cypress.Chainable<infer U> ? U : never;
export type TReadDb = Unchain<ReturnType<typeof cy.readDb>>;

export {};
