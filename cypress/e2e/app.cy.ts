it("The import section should be visible", () => {
  cy.cleanup();
  cy.visit("/");
  cy.get("#import-btn", { timeout: 10000 }).should("exist");
});

it("populating DB works as expected", () => {
  cy.populateDb();
  cy.readDb().then(({ baseline, response }) => {
    expect(baseline).to.deep.eq(response);

    // consumption should look the same for each member
    expect(baseline[1][0].consumption).to.deep.eq(baseline[2][0].consumption);
    expect(baseline[1][0].consumption).to.deep.eq(baseline[3][0].consumption);
    expect(baseline[2][1].consumption).to.deep.eq(baseline[3][1].consumption);

    // balance should look the same for each member except
    // user1 sees only group1, and balance.minMaxes is a buffer
    // that holds unified data of every single group a user has access to
    const u1g1withExtendedMinMaxes = {
      ...baseline[1][0].balance,
      minMaxes: baseline[2][0].balance.minMaxes,
    };

    expect(u1g1withExtendedMinMaxes).to.deep.eq(baseline[2][0].balance);
    expect(u1g1withExtendedMinMaxes).to.deep.eq(baseline[3][0].balance);
    expect(baseline[2][1].balance).to.deep.eq(baseline[3][1].balance);
  });
});
