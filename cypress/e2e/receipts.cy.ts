describe("receipts", () => {
  describe("while logged in", () => {
    beforeEach(() => {
      cy.populateDb();
      cy.login({ page: "/receipts" });
      cy.toast().click();
      cy.toast().should("not.exist");
    });

    itIsAccessibleViaViewSelector("/receipts");

    it("can be added without referencing other users", () => {
      cy.contains("Add new...").click();
      cy.get("input[placeholder='cost']").type("123");
      cy.contains("Save & clear").click();

      cy.toast("Submitting new receipt succeeded!");

      cy.readDb().then(({ baseline, response }) => {
        // consumption for other users are the same accross all groups
        const u1g1cons = structuredClone(baseline[0].groups[0].consumption);
        (u1g1cons.find((x) => x.categoryId === 4) as any)[1]! += 123;

        expect(response[0].groups[0].consumption).to.deep.eq(u1g1cons);

        expect(response[2].groups[1].consumption).to.deep.eq(
          baseline[2].groups[1].consumption
        );
        expect(response[2].groups[2].consumption).to.deep.eq(
          baseline[2].groups[2].consumption
        );

        // balance is unaffected accross all 3 groups
        expect(response[2].groups[0].balance).to.deep.eq(
          baseline[2].groups[0].balance
        );
        expect(response[2].groups[1].balance).to.deep.eq(
          baseline[2].groups[1].balance
        );
        expect(response[2].groups[2].balance).to.deep.eq(
          baseline[2].groups[2].balance
        );
      });
    });

    it("can be added with items for others", () => {
      cy.contains("Add new...").click();
      cy.get("input[placeholder='cost']").type("123");
      cy.get("textarea[placeholder='Optional comments...'] + div").click();
      cy.get("input[placeholder='N+1']").then(($nodes) => {
        cy.wrap($nodes[1]).type("1");
        cy.clickCanceler(1);
      });

      cy.contains("Save & clear").click();

      cy.toast("Submitting new receipt succeeded!");

      cy.readDb().then(({ baseline, response }) => {
        // consumption for other users are the same accross all groups
        const u1g1cons = structuredClone(baseline[0].groups[0].consumption);
        u1g1cons.find((x) => x.categoryId === 4)![2]! += 123;
        expect(response[0].groups[0].consumption).to.deep.eq(u1g1cons);

        expect(response[2].groups[1].consumption).to.deep.eq(
          baseline[2].groups[1].consumption
        );
        expect(response[2].groups[2].consumption).to.deep.eq(
          baseline[2].groups[2].consumption
        );

        const u3g1bal = structuredClone(baseline[2].groups[0].balance);
        const { minMaxes } = response[2].groups[0].balance;

        const date = response[2].groups[0].balance.data.at(-1)!.date;

        (u3g1bal.data as any[]).push({
          date,
          "1 vs 2": (u3g1bal.data.at(-1)! as any)["1 vs 2"] + 123,
        });

        u3g1bal.minMaxes = response[2].groups[0].balance.minMaxes;
        expect(response[2].groups[0].balance).to.deep.eq(u3g1bal);

        //group 2 balance unchanged
        expect(response[2].groups[1].balance).to.deep.eq({
          ...baseline[2].groups[1].balance,
          minMaxes,
        });

        //groups 3 balance unchanged
        expect(response[2].groups[2].balance).to.deep.eq({
          ...baseline[2].groups[2].balance,
          minMaxes,
        });
      });
    });
  });

  describe("while *NOT* logged in", () => {
    it("should redirect to login", () => {
      cy.visit("/receipts");
      cy.loginShouldBeVisible();
    });
  });
});
