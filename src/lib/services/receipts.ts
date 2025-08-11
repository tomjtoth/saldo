import { atomic, db, getArchivePopulator, TGroup, TReceipt } from "@/lib/db";
import { TCliReceipt } from "../reducers";
import { dateToInt, sortByName } from "../utils";

export type TReceiptInput = TCliReceipt & { groupId: number };

export async function addReceipt(addedBy: number, data: TReceiptInput) {
  return await atomic(
    { operation: "Adding receipt", revisedBy: addedBy },
    async (tx, rev) => {
      const rcpt = await tx.receipt.create({
        select: {
          id: true,
          groupId: true,
          revision: {
            select: {
              createdAtInt: true,
              createdBy: { select: { name: true } },
            },
          },
          items: { include: { itemShares: true } },
          paidOnInt: true,
          paidBy: { select: { name: true } },
        },
        data: {
          groupId: data.groupId,
          revisionId: rev.id!,
          paidOnInt: dateToInt(data.paidOn),
          paidById: data.paidBy,
          items: {
            createMany: {
              data: data.items.map((i) => ({
                revisionId: rev.id!,
                categoryId: i.catId,

                cost: Math.round(parseFloat(i.cost) * 100),

                notes: i.notes == "" ? null : i.notes,
              })),
            },
          },
        },
      });

      const itemShares = await tx.itemShare.createManyAndReturn({
        select: { itemId: true, userId: true, share: true },
        data: data.items.flatMap((i, idx) =>
          Object.entries(i.shares)
            .filter(([, share]) => share !== 0)
            .map(([uidStr, share]) => ({
              itemId: rcpt.items[idx].id,
              userId: Number(uidStr),
              revisionId: rev.id!,
              share,
            }))
        ),
      });

      (rcpt as TReceipt).items!.forEach(
        (i) => (i.itemShares = itemShares.filter((sh) => sh.itemId === i.id))
      );

      (rcpt as TReceipt).archives = [];

      return rcpt;
    }
  );
}

export async function getReceipts(userId: number, knownIds: number[] = []) {
  const groups = await db.group.findMany({
    select: {
      id: true,
      name: true,
      memberships: {
        select: {
          defaultCategoryId: true,
          user: { select: { id: true, name: true, image: true, email: true } },
        },
        where: { statusId: { in: [0, 2] } },
      },
      categories: { select: { id: true, name: true }, where: { statusId: 0 } },
      receipts: {
        select: {
          id: true,
          revision: {
            select: {
              createdAtInt: true,
              createdBy: { select: { name: true } },
            },
          },
          items: true,
          paidBy: { select: { name: true } },
          paidOnInt: true,
        },
        orderBy: { paidOnInt: "desc" },
      },
    },
    where: {
      memberships: { some: { userId } },
    },
  });

  const populateArchives = await getArchivePopulator<TReceipt>("Receipt", "id");

  groups.sort(sortByName);
  groups.forEach((g) => {
    g.categories.sort(sortByName);

    // the production-ready Prisma blindly creates parameterized SQLs (unlike Sequelize)
    // and with 2500 receipts we already hit that wall
    // so I need to pick the 50 first uknown receipts via post-processing
    (g as TGroup).receipts = g.receipts.reduce((prev, curr) => {
      if (prev.length <= 50 && !knownIds.includes(curr.id)) prev.push(curr);

      return prev;
    }, [] as TReceipt[]);
    populateArchives(g.receipts);
  });

  return groups;
}
