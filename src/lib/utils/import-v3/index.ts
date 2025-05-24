"use server";

import { CSV_PATH } from "../config";
import { parseCSV, parseData, TCsvRow, TDBData } from "./parsers";
import {
  db,

  // types
  TRevision,
  TUser,
  TCategory,
  TReceipt,
  TItem,
  TItemShare,

  // tables
  Revision,
  User,
  Category,
  Receipt,
  Item,
  ItemShare,
} from "@/lib/models";

export async function importV3() {
  const read = await parseCSV(CSV_PATH);
  const parsed = await parseData(read);
  return await insertData(parsed);
}

async function insertData(data: TDBData) {
  return new Promise<void>(async (done, failed) => {
    // drop ALL imported data
    await Revision.truncate();

    const transaction = await db.transaction();

    try {
      await Revision.bulkCreate(data.revisions, { transaction });
      await User.bulkCreate(data.users, { transaction });
      await Category.bulkCreate(data.categories, { transaction });
      await Receipt.bulkCreate(data.receipts, { transaction });
      await Item.bulkCreate(data.items, { transaction });
      await ItemShare.bulkCreate(data.itemShares, { transaction });

      await transaction.commit();
      console.log("\n\tSUCCESSFULLY IMPORTED V3\n");
      done();
    } catch (err) {
      await transaction.rollback();
      console.error(err);
      failed(err);
    }
  });
}
