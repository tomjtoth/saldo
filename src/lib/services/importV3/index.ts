"use server";

import { db, migrator } from "@/lib/db";
import {
  Categories,
  Groups,
  Items,
  ItemShares,
  Memberships,
  Receipts,
  Users,
} from "@/lib/models";
import { parseCSV, parseData, TDBData } from "./parsers";
import { Revisions } from "@/lib/models/revision";

export async function alreadyInProd() {
  return !!Users.get(
    `SELECT 1 FROM users 
    WHERE id = 1 AND email != 'user0@just.imported'`,
    []
  );
}

export async function importV3() {
  const read = await parseCSV(process.env.CSV_PATH || "data/saldo-v3.csv");
  const parsed = parseData(read);
  return insertData(parsed);
}

export async function insertData(data: TDBData) {
  return db
    .transaction(() => {
      migrator.truncate();

      return {
        revisions: Revisions.insert(data.revisions).length,
        users: Users.insert(data.users).length,
        groups: Groups.insert(data.groups).length,
        memberships: Memberships.insert(data.memberships).length,
        categories: Categories.insert(data.categories).length,
        receipts: Receipts.insert(data.receipts).length,
        items: Items.insert(data.items).length,
        itemShares: ItemShares.insert(data.itemShares).length,
      };
    })
    .deferred();
}
