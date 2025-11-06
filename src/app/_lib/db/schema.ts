import { relations } from "drizzle-orm";
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

const userId = integer()
  .notNull()
  .references(() => users.id);
const gidCore = integer().references(() => groups.id);
const groupId = gidCore.notNull();
const colSR = {
  flags,
  revisionId,
  // active,
};

const colSRI = { ...colSR, id };

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

export const chartColors = sqliteTable("chart_colors", {
  id,

  userId,

  groupId: gidCore,

  memberId: integer().references(() => users.id),

  color: hexColorAsInt().notNull(),
});

export const chartColorsRel = relations(chartColors, ({ one }) => ({
  user: one(users, {
    fields: [chartColors.userId],
    references: [users.id],
  }),

  group: one(groups, {
    fields: [chartColors.groupId],
    references: [groups.id],
  }),

  member: one(users, {
    fields: [chartColors.memberId],
    references: [users.id],
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

  paidById: integer("paid_by")
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
    fields: [receipts.paidById],
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
