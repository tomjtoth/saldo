it("The import section should be visible", () => {
  cy.cleanup();
  cy.visit("/");
  cy.get("#import-btn", { timeout: 10000 }).should("exist");
});

it.only("populating DB works as expected", () => {
  cy.populateDb();
  cy.readDb().then(({ baseline, response }) => {
    for (const iUser in baseline) {
      const key = iUser as keyof typeof baseline;

      baseline[key].forEach((bGroup, iGroup) => {
        const rGroup = response[key][iGroup];

        bGroup.memberships.forEach((bMs, iMs) => {
          const rMs = rGroup.memberships[iMs];

          bMs.revision.createdAt = rMs.revision.createdAt;
          bMs.user.color = rMs.user.color;
        });

        bGroup.categories.forEach((bCat, iCat) => {
          const rCat = rGroup.categories[iCat];

          bCat.revision.createdAt = rCat.revision.createdAt;
          bCat.archives.forEach((bCatArchive, iCatArchive) => {
            bCatArchive.revision.createdAt =
              rCat.archives[iCatArchive].revision.createdAt;
          });
        });

        bGroup.receipts.forEach((bRec, iRec) => {
          const rRec = rGroup.receipts[iRec];

          bRec.paidOn = rRec.paidOn;
          bRec.revision.createdAt = rRec.revision.createdAt;
        });
      });
    }

    expect(baseline).to.deep.eq(response);
  });
});
