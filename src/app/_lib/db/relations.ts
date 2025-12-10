import { defineRelations } from "drizzle-orm";

import * as schema from "@/app/_lib/db/schema";

export { schema };

export const relations = defineRelations(schema, (r) => ({
  archives: {
    revision: r.one.revisions({
      from: r.archives.revisionId,
      to: r.revisions.id,
      optional: false,
    }),
  },

  revisions: {
    createdBy: r.one.users({
      from: r.revisions.createdById,
      to: r.users.id,
      alias: "createdByUser",
      optional: false,
    }),

    users: r.many.users({
      from: r.revisions.id,
      to: r.users.revisionId,
    }),

    groups: r.many.groups({
      from: r.revisions.id,
      to: r.groups.revisionId,
    }),

    memberships: r.many.memberships({
      from: r.revisions.id,
      to: r.memberships.revisionId,
    }),

    categories: r.many.categories({
      from: r.revisions.id,
      to: r.categories.revisionId,
    }),

    receipts: r.many.receipts({
      from: r.revisions.id,
      to: r.receipts.revisionId,
    }),

    items: r.many.items({
      from: r.revisions.id,
      to: r.items.revisionId,
    }),

    itemShares: r.many.itemShares({
      from: r.revisions.id,
      to: r.itemShares.revisionId,
    }),

    archives: r.many.archives({
      from: r.revisions.id,
      to: r.archives.revisionId,
    }),
  },

  users: {
    revision: r.one.revisions({
      from: r.users.revisionId,
      to: r.revisions.id,
      optional: false,
    }),

    createdRevisions: r.many.revisions({
      from: r.users.id,
      to: r.revisions.createdById,
      alias: "createdByUser",
    }),

    memberships: r.many.memberships({
      from: r.users.id,
      to: r.memberships.userId,
    }),

    defaultGroup: r.one.groups({
      from: r.users.defaultGroupId,
      to: r.groups.id,
      optional: false,
    }),

    itemShares: r.many.itemShares({
      from: r.users.id,
      to: r.itemShares.userId,
    }),

    receipts: r.many.receipts({
      from: r.users.id,
      to: r.receipts.paidById,
    }),
  },

  groups: {
    revision: r.one.revisions({
      from: r.groups.revisionId,
      to: r.revisions.id,
      optional: false,
    }),

    memberships: r.many.memberships({
      from: r.groups.id,
      to: r.memberships.groupId,
    }),

    categories: r.many.categories({
      from: r.groups.id,
      to: r.categories.groupId,
    }),

    receipts: r.many.receipts({
      from: r.groups.id,
      to: r.receipts.groupId,
    }),

    defaultingUsers: r.many.users({
      from: r.groups.id,
      to: r.users.defaultGroupId,
    }),
  },

  memberships: {
    revision: r.one.revisions({
      from: r.memberships.revisionId,
      to: r.revisions.id,
      optional: false,
    }),

    user: r.one.users({
      from: r.memberships.userId,
      to: r.users.id,
      optional: false,
    }),

    group: r.one.groups({
      from: r.memberships.groupId,
      to: r.groups.id,
      optional: false,
    }),

    defaultCategory: r.one.categories({
      from: r.memberships.defaultCategoryId,
      to: r.categories.id,
      optional: false,
    }),
  },

  chartColors: {
    user: r.one.users({
      from: r.chartColors.userId,
      to: r.users.id,
      optional: false,
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
      optional: false,
    }),

    group: r.one.groups({
      from: r.categories.groupId,
      to: r.groups.id,
      optional: false,
    }),

    defaultingMemberships: r.many.memberships(),

    items: r.many.items({
      from: r.categories.id,
      to: r.items.categoryId,
    }),
  },

  receipts: {
    revision: r.one.revisions({
      from: r.receipts.revisionId,
      to: r.revisions.id,
      optional: false,
    }),

    group: r.one.groups({
      from: r.receipts.groupId,
      to: r.groups.id,
      optional: false,
    }),

    items: r.many.items({
      from: r.receipts.id,
      to: r.items.receiptId,
    }),

    paidBy: r.one.users({
      from: r.receipts.paidById,
      to: r.users.id,
      optional: false,
    }),
  },

  items: {
    revision: r.one.revisions({
      from: r.items.revisionId,
      to: r.revisions.id,
      optional: false,
    }),

    receipt: r.one.receipts({
      from: r.items.receiptId,
      to: r.receipts.id,
      optional: false,
    }),

    category: r.one.categories({
      from: r.items.categoryId,
      to: r.categories.id,
      optional: false,
    }),

    itemShares: r.many.itemShares({
      from: r.items.id,
      to: r.itemShares.itemId,
    }),
  },

  itemShares: {
    revision: r.one.revisions({
      from: r.itemShares.revisionId,
      to: r.revisions.id,
      optional: false,
    }),

    user: r.one.users({
      from: r.itemShares.userId,
      to: r.users.id,
      optional: false,
    }),

    item: r.one.items({
      from: r.itemShares.itemId,
      to: r.items.id,
      optional: false,
    }),
  },
}));
