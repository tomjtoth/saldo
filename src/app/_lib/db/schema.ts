import {
  sqliteTable,
  integer,
  text,
  primaryKey,
  customType,
} from "drizzle-orm/sqlite-core";

import { VDate } from "../utils";

const floatToInt = customType<{ data: number; driverData: number }>({
  dataType: () => "INTEGER",
  toDriver: (val) => Math.round(val * 100),
  fromDriver: (val) => val / 100,
});

const hexColorAsInt = customType<{ data: string; driverData: number }>({
  dataType: () => "INTEGER",
  toDriver: (val) => parseInt(val.slice(1), 16),
  fromDriver: (val) => `#${val.toString(16).padStart(6, "0")}`,
});

const dateInt = customType<{ data: string; driverData: number; notNull: true }>(
  {
    dataType: () => "INTEGER",
    fromDriver: (value) => VDate.toStr(value),
    toDriver: (value) => VDate.toInt(value),
  }
);

const datetimeInt = customType<{
  data: string;
  driverData: number;
  notNull: true;
}>({
  dataType: () => "INTEGER",
  fromDriver: (value) => VDate.timeToStr(value),
  toDriver: (value) => VDate.timeToInt(value),
});

const id = integer().primaryKey();
const revisionId = integer()
  .notNull()
  .references(() => revisions.id, { onDelete: "cascade" });
const flags = integer().notNull().default(1);
const colFR = { flags, revisionId };
const colFRI = { ...colFR, id };

const userId = integer()
  .notNull()
  .references(() => users.id);
const gidCore = integer().references(() => groups.id);
const groupId = gidCore.notNull();

const categoryId = integer()
  .notNull()
  .references(() => categories.id);

export const metadata = sqliteTable("metadata", {
  id,

  info: text().notNull().unique(),

  data: text({ mode: "json" }),
});

export const archives = sqliteTable("archives", {
  id,

  revisionId,

  tableColumnId: integer().notNull(),

  entityPk1: integer().notNull(),

  entityPk2: integer().notNull(),

  // TODO: try this as jsonb somehow
  // https://github.com/drizzle-team/drizzle-orm/issues/1977
  data: text({ mode: "json" }),
});

export const revisions = sqliteTable("revisions", {
  id,

  createdAt: datetimeInt(),

  createdById: integer("created_by")
    .notNull()
    .references(() => users.id),
});

export const users = sqliteTable("users", {
  ...colFRI,

  email: text().notNull().unique(),

  name: text(),

  image: text(),

  defaultGroupId: integer().references(() => groups.id),
});

export const groups = sqliteTable("groups", {
  ...colFRI,

  name: text().notNull(),

  description: text(),

  uuid: text(),
});

export const memberships = sqliteTable(
  "memberships",
  {
    ...colFR,

    groupId,

    userId,

    defaultCategoryId: integer().references(() => categories.id),
  },
  (table) => [primaryKey({ columns: [table.groupId, table.userId] })]
);

export const chartColors = sqliteTable("chart_colors", {
  id,

  userId,

  groupId: gidCore,

  memberId: integer().references(() => users.id),

  color: hexColorAsInt().notNull(),
});

export const categories = sqliteTable("categories", {
  ...colFRI,

  groupId,

  name: text().notNull(),

  description: text(),
});

export const categoriesHiddenFromConsumption = sqliteTable(
  "categories_hidden_from_consumption",
  {
    userId,

    // would be defined redundantly, since
    // categories are available in a single group only
    // groupId,

    categoryId,
  },
  (t) => [primaryKey({ columns: [t.userId, t.categoryId] })]
);

export const receipts = sqliteTable("receipts", {
  ...colFRI,

  groupId,

  paidOn: dateInt().notNull(),

  paidById: integer("paid_by")
    .notNull()
    .references(() => users.id),
});

export const items = sqliteTable("items", {
  ...colFRI,

  receiptId: integer()
    .notNull()
    .references(() => receipts.id),

  categoryId,

  cost: floatToInt().notNull(),

  notes: text(),
});

export const itemShares = sqliteTable(
  "item_shares",
  {
    ...colFR,

    itemId: integer()
      .notNull()
      .references(() => items.id),

    userId,

    share: integer().notNull(),
  },
  (table) => [primaryKey({ columns: [table.itemId, table.userId] })]
);
