import { defineRelations } from "drizzle-orm";

import * as schema from "@/app/_lib/db/schema";

export const relations = defineRelations(schema, (r) => ({
  archives: {
    revision: r.one.revisions({
      from: r.archives.revisionId,
      to: r.revisions.id,
    }),
  },

  revisions: {
    createdBy: r.one.users({
      from: r.revisions.createdById,
      to: r.users.id,
      alias: "createdByUser",
    }),

    users: r.many.users(),

    groups: r.many.groups(),

    memberships: r.many.memberships(),

    categories: r.many.categories(),

    receipts: r.many.receipts(),

    items: r.many.items(),

    itemShares: r.many.itemShares(),

    archives: r.many.archives(),
  },

  users: {
    revision: r.one.revisions({
      from: r.users.revisionId,
      to: r.revisions.id,
    }),

    createdRevisions: r.many.revisions({ alias: "createdByUser" }),

    memberships: r.many.memberships(),

    defaultGroup: r.one.groups({
      from: r.users.defaultGroupId,
      to: r.groups.id,
    }),

    itemShares: r.many.itemShares(),

    receipts: r.many.receipts(),
  },

  groups: {
    revision: r.one.revisions({
      from: r.groups.revisionId,
      to: r.revisions.id,
    }),

    memberships: r.many.memberships(),

    categories: r.many.categories(),

    itemShares: r.many.itemShares(),

    receipts: r.many.receipts(),

    defaultingUsers: r.many.users(),
  },

  memberships: {
    revision: r.one.revisions({
      from: r.memberships.revisionId,
      to: r.revisions.id,
    }),

    user: r.one.users({
      from: r.memberships.userId,
      to: r.users.id,
    }),

    group: r.one.groups({
      from: r.memberships.groupId,
      to: r.groups.id,
    }),

    defaultCategory: r.one.categories({
      from: r.memberships.defaultCategoryId,
      to: r.categories.id,
    }),
  },

  chartColors: {
    user: r.one.users({
      from: r.chartColors.userId,
      to: r.users.id,
    }),

    group: r.one.groups({
      from: r.chartColors.groupId,
      to: r.groups.id,
    }),

    member: r.one.users({
      from: r.chartColors.memberId,
      to: r.users.id,
    }),
  },

  categories: {
    revision: r.one.revisions({
      from: r.categories.revisionId,
      to: r.revisions.id,
    }),

    group: r.one.groups({
      from: r.categories.groupId,
      to: r.groups.id,
    }),

    defaultingMemberships: r.many.memberships(),

    items: r.many.items(),
  },

  receipts: {
    revision: r.one.revisions({
      from: r.receipts.revisionId,
      to: r.revisions.id,
    }),

    group: r.one.groups({
      from: r.receipts.groupId,
      to: r.groups.id,
    }),

    items: r.many.items(),

    paidBy: r.one.users({
      from: r.receipts.paidById,
      to: r.users.id,
    }),
  },

  items: {
    revision: r.one.revisions({
      from: r.items.revisionId,
      to: r.revisions.id,
    }),

    receipt: r.one.receipts({
      from: r.items.receiptId,
      to: r.receipts.id,
    }),

    category: r.one.categories({
      from: r.items.categoryId,
      to: r.categories.id,
    }),

    itemShares: r.many.itemShares(),
  },

  itemShares: {
    revision: r.one.revisions({
      from: r.itemShares.revisionId,
      to: r.revisions.id,
    }),

    user: r.one.users({
      from: r.itemShares.userId,
      to: r.users.id,
    }),

    item: r.one.items({
      from: r.itemShares.itemId,
      to: r.items.id,
    }),
  },
}));
