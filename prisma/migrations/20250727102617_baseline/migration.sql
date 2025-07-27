PRAGMA foreign_keys = OFF;
BEGIN DEFERRED TRANSACTION;


-- create new schema


CREATE TABLE "Meta" (
    "id" INTEGER NOT NULL PRIMARY KEY,
    "info" TEXT NOT NULL,
    "data" JSONB NOT NULL
);

CREATE TABLE "Archive" (
    "id" INTEGER NOT NULL PRIMARY KEY,
    "tableId" INTEGER NOT NULL,
    "entityPk1" INTEGER NOT NULL,
    "entityPk2" INTEGER,
    "revisionId" INTEGER NOT NULL,
    "payload" JSONB NOT NULL,
    CONSTRAINT "Archive_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "Revision" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "Revision" (
    "id" INTEGER NOT NULL PRIMARY KEY,
    "createdOn" INTEGER NOT NULL,
    "createdById" INTEGER NOT NULL,
    CONSTRAINT "Revision_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON UPDATE CASCADE
);

CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY,
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
    "id" INTEGER NOT NULL PRIMARY KEY,
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
    "id" INTEGER NOT NULL PRIMARY KEY,
    "revisionId" INTEGER NOT NULL,
    "statusId" INTEGER NOT NULL DEFAULT 0,
    "groupId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    CONSTRAINT "Category_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "Revision" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Category_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON UPDATE CASCADE
);

CREATE TABLE "Receipt" (
    "id" INTEGER NOT NULL PRIMARY KEY,
    "revisionId" INTEGER NOT NULL,
    "statusId" INTEGER NOT NULL DEFAULT 0,
    "groupId" INTEGER NOT NULL,
    "paidById" INTEGER NOT NULL,
    "paidOn" INTEGER NOT NULL,
    CONSTRAINT "Receipt_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "Revision" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Receipt_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON UPDATE CASCADE,
    CONSTRAINT "Receipt_paidById_fkey" FOREIGN KEY ("paidById") REFERENCES "User" ("id") ON UPDATE CASCADE
);

CREATE TABLE "Item" (
    "id" INTEGER NOT NULL PRIMARY KEY,
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

CREATE INDEX "Archive_tableId_entityPk1_entityPk2_idx" ON "Archive"("tableId", "entityPk1", "entityPk2");


-- transfer data from old schema to new


INSERT INTO Meta (info, data)
    SELECT 'datetime', jsonb_object('anchor', '2020-01-01', 'timezone', 'Europe/Helsinki')
    UNION
    SELECT 'statuses',  jsonb_array('ACTIVE', 'INACTIVE')
    UNION
    SELECT 'tableNames', jsonb_array('Group', 'Category', 'Membership');

INSERT INTO "Revision" (id, createdOn, createdById)
    SELECT id, rev_on, rev_by FROM REVISIONS;

INSERT INTO "User"
    (id, revisionId, statusId, email, name, defaultGroupId)
    SELECT id, rev_id, status_id, email, name, default_group_id
    FROM USERS;

INSERT INTO "Group"
    (id, revisionId, statusId, name, description, uuid)
    SELECT id, rev_id, status_id, name, description, uuid
    FROM GROUPS;

INSERT INTO "Archive" (tableId, entityPk1, revisionId, payload)
    SELECT 0, id, rev_id, jsonb_object(
        'statusId', status_id, 
        'name', name, 
        'description', description, 
        'uuid', uuid
    )
    FROM groups_archive;

INSERT INTO "Membership" 
    (groupId, userId, revisionId, statusId, defaultCategoryId)
    SELECT group_id, user_id, rev_id, status_id + 2 * admin, default_cat_id
    FROM MEMBERSHIPS;

INSERT INTO "Archive" (tableId, entityPk1, entityPk2, revisionId, payload)
    SELECT 2, group_id, user_id, rev_id, jsonb_object(
        'statusId', status_id + 2* admin,
        'defaultCategoryId', default_cat_id
    )
    FROM memberships_archive;

INSERT INTO "Category" 
    (id, revisionId, statusId, groupId, name, description)
    SELECT id, rev_id, status_id, group_id, name, description
    FROM CATEGORIES;
    
INSERT INTO "Archive" (tableId, entityPk1, revisionId, payload)
    SELECT 1, id, rev_id, jsonb_object(
        'status_id', status_id,
        'group_id', group_id,
        'name', name,
        'description', description
    )
    FROM categories_archive;

INSERT INTO "Receipt" 
    (id, revisionId, statusId, groupId, paidOn, paidById)
    SELECT id, rev_id, status_id, group_id, paid_on, paid_by
    FROM RECEIPTS;

INSERT INTO "Item" 
    (id, revisionId, statusId, receiptId, categoryId, cost, notes)
    SELECT id, rev_id, status_id, rcpt_id, cat_id, cost, notes
    FROM ITEMS;

INSERT INTO "ItemShare" 
    (itemId, userId, revisionId, statusId, share)
    SELECT item_id, user_id, rev_id, status_id, share
    FROM ITEM_SHARES;


-- delete old tables


DROP TABLE "migrations";

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

DROP VIEW consumption;


COMMIT TRANSACTION;
PRAGMA foreign_keys = ON;
VACUUM;
