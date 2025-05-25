"use server";

import { CSV_PATH } from "../config";
import { parseCSV, parseData, TCsvRow, TDBData } from "./parsers";
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
  const read = await parseCSV(CSV_PATH);
  const parsed = parseData(read);
  return await insertData(parsed);
}

async function insertData(data: TDBData) {
  // drop ALL imported data
  await Revision.truncate();

  const res = await atomic("Importing V3", async (transaction) => {
    return Promise.all([
      Revision.bulkCreate(data.revisions, { transaction }),
      User.bulkCreate(data.users, { transaction }),
      Category.bulkCreate(data.categories, { transaction }),
      Receipt.bulkCreate(data.receipts, { transaction }),
      Item.bulkCreate(data.items, { transaction }),
      ItemShare.bulkCreate(data.itemShares, { transaction }),
    ]);
  });

  console.log(res);
}
