// THIS FILE GETS OVERWRITTEN, DO NOT EDIT it
// invoke ./prisma/generate.sh upon schema changes

import {
  Archive,
  Revision,
  User,
  Group,
  Membership,
  Category,
  Receipt,
  Item,
  ItemShare,
} from "@prisma/client";

export type {
  Archive,
  Revision,
  User,
  Group,
  Membership,
  Category,
  Receipt,
  Item,
  ItemShare,
};

export interface TRevision {
  createdOn?: string;
}
export interface TReceipt {
  paidOn?: string;
}
export interface TMembership {
  admin?: boolean;
}

export interface TArchive extends Partial<Archive> {
  revision?: TRevision;
}

export interface TRevision extends Partial<Revision> {
  createdBy?: TUser;
  users?: TUser[];
  groups?: TGroup[];
  memberships?: TMembership[];
  categories?: TCategory[];
  receipts?: TReceipt[];
  items?: TItem[];
  itemShares?: TItemShare[];
  archives?: TArchive[];
}

export interface TUser extends Partial<User> {
  revision?: TRevision;
  createdRevisions?: TRevision[];
  memberships?: TMembership[];
  defaultGroup?: TGroup;
  itemShares?: TItemShare[];
  receipts?: TReceipt[];
}

export interface TGroup extends Partial<Group> {
  revision?: TRevision;
  memberships?: TMembership[];
  categories?: TCategory[];
  receipts?: TReceipt[];
  defaultingUsers?: TUser[];
}

export interface TMembership extends Partial<Membership> {
  revision?: TRevision;
  user?: TUser;
  group?: TGroup;
  defaultCategory?: TCategory;
}

export interface TCategory extends Partial<Category> {
  revision?: TRevision;
  group?: TGroup;
  defaultingMemberships?: TMembership[];
  items?: TItem[];
}

export interface TReceipt extends Partial<Receipt> {
  revision?: TRevision;
  group?: TGroup;
  items?: TItem[];
  paidBy?: TUser;
}

export interface TItem extends Partial<Item> {
  revision?: TRevision;
  receipt?: TReceipt;
  category?: TCategory;
  itemShares?: TItemShare[];
}

export interface TItemShare extends Partial<ItemShare> {
  revision?: TRevision;
  item?: TItem;
  user?: TUser;
}
