PRAGMA foreign_keys = OFF;
BEGIN DEFERRED TRANSACTION;



-------------------
-- create schema --
-------------------



CREATE TABLE IF NOT EXISTS "Meta" (
    "id" INTEGER PRIMARY KEY,
    "info" TEXT NOT NULL,
    "data" BLOB
);

CREATE TABLE "Archive" (
    "id" INTEGER PRIMARY KEY,
    "tableColumnId" INTEGER NOT NULL,
    "entityPk1" INTEGER NOT NULL,
    "entityPk2" INTEGER,
    "revisionId" INTEGER NOT NULL,
    "data" BLOB,
    CONSTRAINT "Archive_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "Revision" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "Revision" (
    "id" INTEGER PRIMARY KEY,
    "createdAt" INTEGER NOT NULL,
    "createdBy" INTEGER NOT NULL,
    CONSTRAINT "Revision_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON UPDATE CASCADE
);

CREATE TABLE "User" (
    "id" INTEGER PRIMARY KEY,
    "revisionId" INTEGER NOT NULL,
    "statusId" INTEGER NOT NULL DEFAULT 0,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "defaultGroupId" INTEGER,
    CONSTRAINT "User_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "Revision" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "User_defaultGroupId_fkey" FOREIGN KEY ("defaultGroupId") REFERENCES "Group" ("id") ON UPDATE CASCADE
);

CREATE TABLE "Group" (
    "id" INTEGER PRIMARY KEY,
    "revisionId" INTEGER NOT NULL,
    "statusId" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "uuid" TEXT,
    CONSTRAINT "Group_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "Revision" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "Membership" (
    "userId" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,
    "revisionId" INTEGER NOT NULL,
    "statusId" INTEGER NOT NULL DEFAULT 0,
    "defaultCategoryId" INTEGER,

    PRIMARY KEY ("userId", "groupId"),
    CONSTRAINT "Membership_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "Revision" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON UPDATE CASCADE,
    CONSTRAINT "Membership_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON UPDATE CASCADE,
    CONSTRAINT "Membership_defaultCategoryId_fkey" FOREIGN KEY ("defaultCategoryId") REFERENCES "Category" ("id") ON UPDATE CASCADE
);

CREATE TABLE "Category" (
    "id" INTEGER PRIMARY KEY,
    "revisionId" INTEGER NOT NULL,
    "statusId" INTEGER NOT NULL DEFAULT 0,
    "groupId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    CONSTRAINT "Category_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "Revision" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Category_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON UPDATE CASCADE
);

CREATE TABLE "Receipt" (
    "id" INTEGER PRIMARY KEY,
    "revisionId" INTEGER NOT NULL,
    "statusId" INTEGER NOT NULL DEFAULT 0,
    "groupId" INTEGER NOT NULL,
    "paidBy" INTEGER NOT NULL,
    "paidOn" INTEGER NOT NULL,
    CONSTRAINT "Receipt_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "Revision" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Receipt_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON UPDATE CASCADE,
    CONSTRAINT "Receipt_paidBy_fkey" FOREIGN KEY ("paidBy") REFERENCES "User" ("id") ON UPDATE CASCADE
);

CREATE TABLE "Item" (
    "id" INTEGER PRIMARY KEY,
    "revisionId" INTEGER NOT NULL,
    "statusId" INTEGER NOT NULL DEFAULT 0,
    "receiptId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "cost" INTEGER NOT NULL,
    "notes" TEXT,
    CONSTRAINT "Item_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "Revision" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Item_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "Receipt" ("id") ON UPDATE CASCADE,
    CONSTRAINT "Item_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON UPDATE CASCADE
);

CREATE TABLE "ItemShare" (
    "itemId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "revisionId" INTEGER NOT NULL,
    "statusId" INTEGER NOT NULL DEFAULT 0,
    "share" INTEGER NOT NULL,

    PRIMARY KEY ("itemId", "userId"),
    CONSTRAINT "ItemShare_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "Revision" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ItemShare_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON UPDATE CASCADE,
    CONSTRAINT "ItemShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Meta_info_key" ON "Meta"("info");



-------------------
-- transfer data --
-------------------



INSERT INTO "Meta" ("info", "data")
    SELECT 'datetime', json_object('anchor', '2020-01-01', 'timezone', 'Europe/Helsinki')
    UNION
    SELECT 'statuses',  json_array('ACTIVE', 'INACTIVE')
    UNION
    SELECT 'tableColumnId', json_array(
        'categories.name', 'categories.description', 'categories.status_id', 'categories.group_id',
        'groups.name', 'groups.description', 'groups.status_id', 'groups.uuid',
        'memberships.status_id', 'memberships.default_category_id'
    );

INSERT INTO Archive (entityPk1, entityPk2, revisionId, tableColumnId, data)
    SELECT id, NULL, rev_id, 2, status_id - 1 FROM categories_archive
    UNION
    SELECT id, NULL, rev_id, 3, group_id FROM categories_archive
    UNION
    SELECT id, NULL, rev_id, 0, name FROM categories_archive
    UNION
    SELECT id, NULL, rev_id, 1, description FROM categories_archive
    UNION
    SELECT id, NULL, rev_id, 6, status_id - 1 FROM groups_archive
    UNION
    SELECT id, NULL, rev_id, 4, name FROM groups_archive
    UNION
    SELECT id, NULL, rev_id, 5, description FROM groups_archive
    UNION
    SELECT id, NULL, rev_id, 7, uuid FROM groups_archive
    UNION
    SELECT group_id, user_id, rev_id, 8, status_id - 1 + 2 * admin FROM memberships_archive
    UNION
    SELECT group_id, user_id, rev_id, 9, default_cat_id FROM memberships_archive;


INSERT INTO "Revision" (id, createdAt, createdBy)
    SELECT id, rev_on, rev_by FROM revisions;

INSERT INTO "User"
    (id, revisionId, statusId, email, name, defaultGroupId)
    SELECT id, rev_id, status_id, email, name, default_group_id
    FROM users;

INSERT INTO "Group"
    (id, revisionId, statusId, name, description, uuid)
    SELECT id, rev_id, status_id, name, description, uuid
    FROM groups;

INSERT INTO "Membership" 
    (groupId, userId, revisionId, statusId, defaultCategoryId)
    SELECT group_id, user_id, rev_id, status_id + 2 * admin, default_cat_id
    FROM memberships;


INSERT INTO "Category" 
    (id, revisionId, statusId, groupId, name, description)
    SELECT id, rev_id, status_id, group_id, name, description
    FROM categories;

INSERT INTO "Receipt" 
    (id, revisionId, statusId, groupId, paidOn, paidBy)
    SELECT id, rev_id, status_id, group_id, paid_on, paid_by
    FROM receipts;

INSERT INTO "Item" 
    (id, revisionId, statusId, receiptId, categoryId, cost, notes)
    SELECT id, rev_id, status_id, rcpt_id, cat_id, cost, notes
    FROM items;

INSERT INTO "ItemShare" 
    (itemId, userId, revisionId, statusId, share)
    SELECT item_id, user_id, rev_id, status_id, share
    FROM item_shares;



-----------------------
-- delete old tables --
-----------------------



DROP TABLE IF EXISTS "migrations";

DROP TABLE "categories";
DROP TABLE "categories_archive";

DROP TABLE "groups";
DROP TABLE "groups_archive";

DROP TABLE "item_shares";
DROP TABLE "item_shares_archive";

DROP TABLE "items";
DROP TABLE "items_archive";

DROP TABLE "memberships";
DROP TABLE "memberships_archive";

DROP TABLE "receipts";
DROP TABLE "receipts_archive";

DROP TABLE "revisions";
DROP TABLE "statuses";

DROP TABLE "users";
DROP TABLE "users_archive";

DROP VIEW "consumption";


COMMIT TRANSACTION;
PRAGMA foreign_keys = ON;
VACUUM;
