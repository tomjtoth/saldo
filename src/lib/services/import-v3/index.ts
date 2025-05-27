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
} from "@/lib/models";

export async function importV3() {
  const read = await parseCSV(process.env.CSV_PATH || "data/saldo-v3.csv");
  const parsed = parseData(read);
  return await insertData(parsed);
}

async function insertData(data: TDBData) {
  await atomic("importing from V3", async (transaction) => {
    // drop ALL imported data
    await Revision.truncate({ transaction, cascade: true });

    // these 2 can be run in parallel
    await Promise.all([
      Revision.bulkCreate(data.revisions, { transaction }),
      User.bulkCreate(data.users, { transaction }),
    ]);

    // the rest are to be inserted in strict order
    await Category.bulkCreate(data.categories, { transaction });
    await Receipt.bulkCreate(data.receipts, { transaction });
    await Item.bulkCreate(data.items, { transaction });
    await ItemShare.bulkCreate(data.itemShares, { transaction });
  });
}
