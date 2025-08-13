import { relations } from "drizzle-orm";
import {
  sqliteTable,
  integer,
  text,
  primaryKey,
  customType,
} from "drizzle-orm/sqlite-core";

import { dateFromInt, datetimeFromInt, dateToInt } from "../utils";

const floatToInt = customType<{ data: number; driverData: number }>({
  dataType: () => "INTEGER",
  toDriver: (val) => Math.round(val * 100),
  fromDriver: (val) => val / 100,
});

const dateInt = customType<{ data: string; driverData: number; notNull: true }>(
  {
    dataType: () => "INTEGER",
    fromDriver: (value) => dateFromInt(value),
    toDriver: (value) => dateToInt(value),
  }
);

const datetimeInt = customType<{
  data: string;
  driverData: number;
  notNull: true;
}>({
  dataType: () => "INTEGER",
  fromDriver: (value) => datetimeFromInt(value)!,
  // toDriver: (value) => datetimeToInt(value),
});

const bool = customType<{ data: boolean; driverData: number }>({
  dataType: () => "INTEGER",
  fromDriver: (val) => val == 1,
  toDriver: (val) => (val ? 1 : 0),
});

const active = bool().generatedAlwaysAs(sql`("status_id" & 1) = 0`, {
  mode: "virtual",
});

const id = integer().primaryKey();
const revisionId = integer()
  .notNull()
  .references(() => revisions.id, { onDelete: "cascade" });
const statusId = integer().notNull().default(0);

const userId = integer()
  .notNull()
  .references(() => users.id);

const groupId = integer()
  .notNull()
  .references(() => groups.id);

const colSR = {
  statusId,
  revisionId,
  // active,
};

const colSRI = { ...colSR, id };

export const meta = sqliteTable("metadata", {
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

  data: text({ mode: "json" }),
});

export const archivesRel = relations(archives, ({ one }) => ({
  revision: one(revisions, {
    fields: [archives.revisionId],
    references: [revisions.id],
  }),
}));

export const revisions = sqliteTable("revisions", {
  id,

  createdAt: datetimeInt(),
  createdById: integer("created_by")
    .notNull()
    .references(() => users.id),
});

export const revisionsRel = relations(revisions, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [revisions.createdById],
    references: [users.id],
    relationName: "createdByUser",
  }),

  users: many(users),

  groups: many(groups),

  memberships: many(memberships),

  categories: many(categories),

  receipts: many(receipts),

  items: many(items),

  itemShares: many(itemShares),

  archives: many(archives),
}));

export const users = sqliteTable("users", {
  ...colSRI,

  email: text().notNull().unique(),

  name: text(),

  image: text(),

  defaultGroupId: integer().references(() => groups.id),
});

export const usersRel = relations(users, ({ one, many }) => ({
  revision: one(revisions, {
    fields: [users.revisionId],
    references: [revisions.id],
  }),

  createdRevisions: many(revisions, { relationName: "createdByUser" }),

  memberships: many(memberships),

  defaultGroup: one(groups, {
    fields: [users.defaultGroupId],
    references: [groups.id],
  }),

  itemShares: many(itemShares),

  receipts: many(receipts),
}));

export const groups = sqliteTable("groups", {
  ...colSRI,

  name: text().notNull(),

  description: text(),

  uuid: text(),
});

export const groupsRel = relations(groups, ({ one, many }) => ({
  revision: one(revisions, {
    fields: [groups.revisionId],
    references: [revisions.id],
  }),

  memberships: many(memberships),

  categories: many(categories),

  itemShares: many(itemShares),

  receipts: many(receipts),

  defaultingUsers: many(users),
}));

export const memberships = sqliteTable(
  "memberships",
  {
    ...colSR,

    groupId,

    userId,

    defaultCategoryId: integer().references(() => categories.id),
  },
  (table) => [primaryKey({ columns: [table.groupId, table.userId] })]
);

export const membershipsRel = relations(memberships, ({ one }) => ({
  revision: one(revisions, {
    fields: [memberships.revisionId],
    references: [revisions.id],
  }),

  user: one(users, {
    fields: [memberships.userId],
    references: [users.id],
  }),

  group: one(groups, {
    fields: [memberships.groupId],
    references: [groups.id],
  }),

  defaultCategory: one(categories, {
    fields: [memberships.defaultCategoryId],
    references: [categories.id],
  }),
}));

export const categories = sqliteTable("categories", {
  ...colSRI,

  groupId,

  name: text().notNull(),

  description: text(),
});

export const categoriesRel = relations(categories, ({ one, many }) => ({
  revision: one(revisions, {
    fields: [categories.revisionId],
    references: [revisions.id],
  }),

  group: one(groups, {
    fields: [categories.groupId],
    references: [groups.id],
  }),

  defaultingMemberships: many(memberships),

  items: many(items),
}));

export const receipts = sqliteTable("receipts", {
  ...colSRI,

  groupId,

  paidOn: dateInt().notNull(),
  paidbyId: integer("paid_by")
    .notNull()
    .references(() => users.id),
});

export const receiptsRel = relations(receipts, ({ one, many }) => ({
  revision: one(revisions, {
    fields: [receipts.revisionId],
    references: [revisions.id],
  }),

  group: one(groups, {
    fields: [receipts.groupId],
    references: [groups.id],
  }),

  items: many(items),

  paidBy: one(users, {
    fields: [receipts.paidbyId],
    references: [users.id],
  }),
}));

export const items = sqliteTable("items", {
  ...colSRI,

  receiptId: integer()
    .notNull()
    .references(() => receipts.id),

  categoryId: integer()
    .notNull()
    .references(() => categories.id),

  cost: floatToInt().notNull(),

  notes: text(),
});

export const itemsRel = relations(items, ({ one, many }) => ({
  revision: one(revisions, {
    fields: [items.revisionId],
    references: [revisions.id],
  }),

  receipt: one(receipts, {
    fields: [items.receiptId],
    references: [receipts.id],
  }),

  category: one(categories, {
    fields: [items.categoryId],
    references: [categories.id],
  }),

  itemShares: many(itemShares),
}));

export const itemShares = sqliteTable(
  "item_shares",
  {
    ...colSR,

    itemId: integer()
      .notNull()
      .references(() => items.id),

    userId,

    share: integer().notNull(),
  },
  (table) => [primaryKey({ columns: [table.itemId, table.userId] })]
);

export const itemShareRel = relations(itemShares, ({ one }) => ({
  revision: one(revisions, {
    fields: [itemShares.revisionId],
    references: [revisions.id],
  }),

  user: one(users, {
    fields: [itemShares.userId],
    references: [users.id],
  }),

  item: one(items, {
    fields: [itemShares.itemId],
    references: [items.id],
  }),
}));
