"use server";

import { parseCSV, parseData, TDBData } from "./parsers";
import {
  Revision,
  User,
  Category,
  Receipt,
  Item,
  ItemShare,
  atomic,
  Group,
  Membership,
} from "@/lib/models";

export const alreadyInProd = async () => {
  const user = await User.findByPk(1);

  return !!user && user.email !== "user0@just.imported";
};

export async function importV3() {
  const read = await parseCSV(process.env.CSV_PATH || "data/saldo-v3.csv");
  const parsed = parseData(read);
  return await insertData(parsed);
}

export async function insertData(data: TDBData) {
  return await atomic("importing from V3", async (transaction) => {
    // drop ALL imported data
    await Revision.truncate({ transaction, cascade: true });

    // these 2 can be run in parallel
    const [revisions, users] = await Promise.all([
      Revision.bulkCreate(data.revisions, { transaction }),
      User.bulkCreate(data.users, { transaction }),
    ]);

    // the rest are to be inserted in strict order
    const groups = await Group.bulkCreate(data.groups, { transaction });
    const memberships = await Membership.bulkCreate(data.memberships, {
      transaction,
    });
    const categories = await Category.bulkCreate(data.categories, {
      transaction,
    });
    const receipts = await Receipt.bulkCreate(data.receipts, { transaction });
    const items = await Item.bulkCreate(data.items, { transaction });
    const itemShares = await ItemShare.bulkCreate(data.itemShares, {
      transaction,
    });

    return {
      revisions: revisions.length,
      users: users.length,
      groups: groups.length,
      memberships: memberships.length,
      categories: categories.length,
      receipts: receipts.length,
      items: items.length,
      itemShares: itemShares.length,
    };
  });
}
