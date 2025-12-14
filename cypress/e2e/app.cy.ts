import { TReadDb } from "../support/commands";

it("The import section should be visible", () => {
  cy.cleanup();
  cy.visit("/");
  cy.get("#import-btn", { timeout: 10000 }).should("exist");
});

describe("in a populated DB", () => {
  let { baseline, response }: TReadDb = { baseline: [], response: [] };
  const pick = (uIdx: number, gIdx: number) => response[uIdx].groups[gIdx];

  before(() => {
    cy.populateDb();
    cy.readDb().then((res) => ({ baseline, response } = res));
  });

  it("baseline JSON is up-to-date", () => {
    expect(baseline).to.deep.eq(response);
  });

  it("users see the correct groups and members", () => {
    expect(response[0].groups.map((g) => g.id)).to.deep.eq([1]);
    expect(response[1].groups.map((g) => g.id)).to.deep.eq([1, 2]);
    expect(response[2].groups.map((g) => g.id)).to.deep.eq([1, 2, 3]);
    expect(response[3].groups.map((g) => g.id)).to.deep.eq([4]);

    // user 3 sees 3 groups, but user4 is in none of them
    response[2].groups.forEach((g) => {
      expect(g.memberships.every((ms) => ms.userId !== 4)).to.be.true;
    });

    // user 4 is separated, cannot see anyone else
    response[3].groups.forEach((g) => {
      expect(g.memberships.every((ms) => ms.userId === 4)).to.be.true;
    });
  });

  describe("consumption", () => {
    it("categoryIds refer only to their related group", () => {
      const cats = pick(2, 0).categories;
      const ids = pick(2, 0).consumption.map((x) => x.categoryId);

      expect(ids.every((ccId) => cats.findIndex((c) => c.id === ccId) > -1)).to
        .be.true;
    });

    it("correct data is shown", () => {
      //users 1-3 see the same data for group1
      expect(pick(0, 0).consumption).to.deep.eq(pick(1, 0).consumption);
      expect(pick(0, 0).consumption).to.deep.eq(pick(2, 0).consumption);

      // users 2-3 see the same for group2
      expect(pick(1, 1).consumption).to.deep.eq(pick(2, 1).consumption);

      // user 4 has empty
      expect(pick(3, 0).consumption).to.deep.eq([]);
    });
  });

  it("correct balance data is shown", () => {
    // balance should look the same for each member except
    // user1 sees only group1, and balance.minMaxes is a buffer
    // that holds unified data of every single group a user has access to
    const u1g1withExtendedMinMaxes = {
      ...pick(0, 0).balance,
      minMaxes: pick(1, 0).balance.minMaxes,
    };

    expect(u1g1withExtendedMinMaxes).to.deep.eq(pick(1, 0).balance);
    expect(u1g1withExtendedMinMaxes).to.deep.eq(pick(2, 0).balance);
    expect(pick(1, 1).balance).to.deep.eq(pick(2, 1).balance);

    // user 4 sees empty
    expect(pick(3, 0).balance).to.deep.eq({
      minMaxes: {},
      data: [],
      relations: [],
    });
  });
});
